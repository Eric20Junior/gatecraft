#!/bin/sh
# gatecraft installer — for projects without Node, or without a Node you want to use.
#
#   curl -fsSL https://gatecraft.dev/install.sh | sh
#   curl -fsSL https://gatecraft.dev/install.sh | sh -s -- --version 1.2.0
#
# What this does: downloads the gatecraft release tarball, extracts the framework
# payload into ./.ai, adds `.ai/` to .gitignore, and writes an AGENTS.md bootstrap
# file so your coding agent finds it. It writes nothing outside the current
# directory and installs no global binaries.
#
# POSIX sh on purpose: this has to run on Alpine, on a slim Debian CI image, and
# on macOS, none of which agree on what `bash` is or whether it exists.

set -eu

VERSION="latest"
TARGET="."
DIR=".ai"
BOOTSTRAP="AGENTS.md"
DO_GITIGNORE=1
DO_BOOTSTRAP=1
FORCE=0
QUIET=0

# Overridable so this works behind a private npm mirror, and so the test suite can
# point it at a locally packed tarball instead of the network.
REGISTRY="${GATECRAFT_REGISTRY:-https://registry.npmjs.org}"

# ---------------------------------------------------------------- output ----

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  B="$(printf '\033[1m')"; DIM="$(printf '\033[2m')"; R="$(printf '\033[0m')"
  GREEN="$(printf '\033[32m')"; YELLOW="$(printf '\033[33m')"; RED="$(printf '\033[31m')"
  CYAN="$(printf '\033[36m')"
else
  B=''; DIM=''; R=''; GREEN=''; YELLOW=''; RED=''; CYAN=''
fi

say()  { [ "$QUIET" -eq 1 ] || printf '%s\n' "$*"; }
ok()   { [ "$QUIET" -eq 1 ] || printf '%s+%s %s\n' "$GREEN" "$R" "$*"; }
warn() { printf '%s!%s %s\n' "$YELLOW" "$R" "$*" >&2; }
die()  { printf '%sx%s %s\n' "$RED" "$R" "$*" >&2; exit 1; }

usage() {
  cat <<EOF
${B}gatecraft${R} — install the AI Engineering Operating System into this project

${B}USAGE${R}
  curl -fsSL https://gatecraft.dev/install.sh | sh
  curl -fsSL https://gatecraft.dev/install.sh | sh -s -- [options]

${B}OPTIONS${R}
  --version <v>    Install a specific version (default: latest)
  --dir <path>     Install into <path> instead of the current directory
  --no-gitignore   Do not add .ai/ to .gitignore
  --no-bootstrap   Do not write AGENTS.md
  --force          Overwrite an existing .ai/ directory
  --quiet          Only print errors
  --help           This text

${B}NOTES${R}
  ${DIM}If you have Node 18+, prefer ${CYAN}npx gatecraft init${R}${DIM} — it detects your stack and${R}
  ${DIM}pre-fills PROJECT_CONTEXT.md, and gives you upgrade/doctor/status commands.${R}
  ${DIM}This script installs the same framework without needing Node at all.${R}
EOF
}

# ------------------------------------------------------------------ args ----

while [ $# -gt 0 ]; do
  case "$1" in
    --version) [ $# -ge 2 ] || die "--version needs a value"; VERSION="$2"; shift 2 ;;
    --version=*) VERSION="${1#*=}"; shift ;;
    --dir)     [ $# -ge 2 ] || die "--dir needs a value"; TARGET="$2"; shift 2 ;;
    --dir=*)   TARGET="${1#*=}"; shift ;;
    --no-gitignore) DO_GITIGNORE=0; shift ;;
    --no-bootstrap) DO_BOOTSTRAP=0; shift ;;
    --force|-f) FORCE=1; shift ;;
    --quiet|-q) QUIET=1; shift ;;
    --help|-h) usage; exit 0 ;;
    *) die "unknown option: $1  (try --help)" ;;
  esac
done

# --------------------------------------------------------------- prereqs ----

if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL "$1" -o "$2"; }
  fetch_stdout() { curl -fsSL "$1"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -qO "$2" "$1"; }
  fetch_stdout() { wget -qO- "$1"; }
else
  die "neither curl nor wget is available — install one and try again"
fi

command -v tar >/dev/null 2>&1 || die "tar is required and was not found"

[ -d "$TARGET" ] || die "no such directory: $TARGET"
cd "$TARGET"
ROOT="$(pwd)"

# --------------------------------------------------------------- version ----

if [ "$VERSION" = "latest" ]; then
  # Ask the registry rather than GitHub: npm's endpoint is unauthenticated and
  # not rate-limited the way the GitHub API is, which matters for a script people
  # pipe into sh from CI.
  RESOLVED="$(fetch_stdout "$REGISTRY/gatecraft/latest" 2>/dev/null \
    | sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)"
  [ -n "$RESOLVED" ] || die "could not determine the latest version — pass --version explicitly"
  VERSION="$RESOLVED"
fi

VERSION="${VERSION#v}"
TARBALL="$REGISTRY/gatecraft/-/gatecraft-${VERSION}.tgz"

# --------------------------------------------------------------- install ----

say ""
say "${B}Installing gatecraft v${VERSION}${R}"
say "  ${DIM}into${R}  $ROOT/$DIR"
say ""

if [ -e "$DIR" ] && [ "$FORCE" -eq 0 ]; then
  if [ -f "$DIR/.gatecraft-manifest.json" ]; then
    die "gatecraft is already installed here.
  Upgrade with: curl -fsSL https://gatecraft.dev/install.sh | sh -s -- --force
  Or, with Node: npx gatecraft upgrade"
  fi
  die "$DIR/ already exists and was not created by gatecraft.
  Move it aside, or install elsewhere with --dir, or overwrite with --force."
fi

TMP="$(mktemp -d 2>/dev/null || mktemp -d -t gatecraft)" || die "could not create a temp directory"
# shellcheck disable=SC2064
trap "rm -rf '$TMP'" EXIT INT TERM HUP

say "  downloading ${DIM}${TARBALL}${R}"
fetch "$TARBALL" "$TMP/gatecraft.tgz" || die "download failed — is version $VERSION published?"

tar -xzf "$TMP/gatecraft.tgz" -C "$TMP" || die "the downloaded archive could not be extracted"
[ -d "$TMP/package/payload" ] || die "the archive has no payload/ directory — this is a packaging bug, please report it"

# Replace atomically-ish: stage the new tree beside the old one, then swap. A
# half-extracted .ai/ that an agent then reads as authoritative is worse than no
# .ai/ at all.
STAGE="$DIR.gatecraft-new.$$"
rm -rf "$STAGE"
mkdir -p "$STAGE"
(cd "$TMP/package/payload" && tar -cf - .) | (cd "$STAGE" && tar -xf -) \
  || { rm -rf "$STAGE"; die "could not copy the framework into place"; }

if [ -d "$DIR" ]; then
  # Preserve the one thing that is genuinely irreplaceable.
  if [ -d "$DIR/memory" ]; then
    rm -rf "$STAGE/memory"
    cp -R "$DIR/memory" "$STAGE/memory" 2>/dev/null || true
    ok "existing .ai/memory/ preserved"
  fi
  for keep in PROJECT_CONTEXT.md DECISIONS.md; do
    if [ -f "$DIR/$keep" ]; then
      cp "$DIR/$keep" "$STAGE/$keep" 2>/dev/null || true
    fi
  done
  for keep in standards workflows prompts architecture research planning reviews metrics evaluation; do
    if [ -d "$DIR/$keep" ]; then
      cp -R "$DIR/$keep/." "$STAGE/$keep/" 2>/dev/null || true
    fi
  done
  rm -rf "$DIR.gatecraft-old.$$"
  mv "$DIR" "$DIR.gatecraft-old.$$"
fi

mv "$STAGE" "$DIR" || die "could not move the new framework into place"
rm -rf "$DIR.gatecraft-old.$$"

FILES="$(find "$DIR" -name '*.md' -type f | wc -l | tr -d ' ')"
ok "$FILES documents installed into $DIR/"

# A minimal manifest so `gatecraft status` / `upgrade` work later if Node shows up.
# It records no hashes: this installer cannot compute sha256 portably, and a
# manifest with wrong hashes would make upgrade think every file was edited.
cat > "$DIR/.gatecraft-manifest.json" <<EOF
{
  "schema": 1,
  "name": "gatecraft",
  "version": "$VERSION",
  "installedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "installedBy": "install.sh",
  "files": {},
  "modified": [],
  "gitignore": { "managed": $([ "$DO_GITIGNORE" -eq 1 ] && echo true || echo false) },
  "bootstrap": { "managed": $([ "$DO_BOOTSTRAP" -eq 1 ] && echo true || echo false), "hash": null }
}
EOF

# ------------------------------------------------------------- gitignore ----

BEGIN='# >>> gatecraft >>>'
END='# <<< gatecraft <<<'

if [ "$DO_GITIGNORE" -eq 1 ]; then
  if [ -f .gitignore ] && grep -qF "$BEGIN" .gitignore 2>/dev/null; then
    ok ".gitignore already has the gatecraft block"
  else
    [ -f .gitignore ] && [ -s .gitignore ] && printf '\n' >> .gitignore
    {
      printf '%s\n' "$BEGIN"
      printf '%s\n' "# Managed by gatecraft. Remove with: gatecraft uninstall"
      printf '%s\n' ".ai/"
      printf '%s\n' "$END"
    } >> .gitignore
    ok ".ai/ added to .gitignore — invisible in git status and diffs"
  fi
fi

# ------------------------------------------------------------- bootstrap ----

MBEGIN='<!-- >>> gatecraft >>> -->'
MEND='<!-- <<< gatecraft <<< -->'

if [ "$DO_BOOTSTRAP" -eq 1 ]; then
  if [ -f "$BOOTSTRAP" ] && grep -qF "$MBEGIN" "$BOOTSTRAP" 2>/dev/null; then
    ok "$BOOTSTRAP already points at .ai/"
  else
    if [ -f "$BOOTSTRAP" ]; then
      printf '\n' >> "$BOOTSTRAP"
      warn "$BOOTSTRAP already exists — appending the gatecraft block, your content is kept"
    else
      printf '# %s\n\nInstructions for AI coding agents working in this repository.\n\n' \
        "$(basename "$ROOT")" > "$BOOTSTRAP"
    fi
    cat >> "$BOOTSTRAP" <<EOF
$MBEGIN
## Engineering operating system

This repository uses **Gatecraft v$VERSION**. Before doing any engineering work here,
read \`.ai/README.md\` — it is present in the working tree but git-ignored, so it
will not appear in \`git status\`.

**Start here, in order:**

1. \`.ai/PROJECT_CONTEXT.md\` — what this project is. Facts about it outrank
   everything else, including your own assumptions about the stack.
2. \`.ai/SYSTEM.md\` — the operating rules, the quality gates, and the
   Production Readiness Score you are held to.
3. \`.ai/WORKFLOW.md\` — the loop to run: Understand, Research, Plan, Design,
   Implement, Review, Critique, Improve, Validate, Test, Document, Evaluate.
4. \`.ai/STANDARDS.md\` — the MUST rules. \`.ai/standards/\` overrides them where
   this project has decided differently.

**Non-negotiable:** finish the loop. Code that is written but not reviewed,
tested, and documented is not done, and reporting it as done is the specific
failure this system exists to prevent.

Run \`npx gatecraft checklist\` to list the quality gates, or read
\`.ai/CHECKLISTS.md\` directly.
$MEND
EOF
    ok "$BOOTSTRAP written — agents will find .ai/ automatically"
  fi
fi

# ---------------------------------------------------------------- finish ----

say ""
say "${B}Done.${R}"
say ""
say "  ${B}1.${R} Fill in ${CYAN}.ai/PROJECT_CONTEXT.md${R} ${DIM}— it is the first thing an agent reads,${R}"
say "     ${DIM}and every blank in it is a fact the agent will guess at instead.${R}"
say "  ${B}2.${R} Commit ${CYAN}$BOOTSTRAP${R} ${DIM}so your team's agents pick this up too.${R}"
say "  ${B}3.${R} Tell your agent: ${CYAN}\"Read .ai/README.md and follow it.\"${R}"
say ""
if command -v node >/dev/null 2>&1; then
  say "  ${DIM}You have Node — ${R}${CYAN}npx gatecraft status${R}${DIM} works here, and gives you${R}"
  say "  ${DIM}stack detection, safe upgrades, and a link/health check.${R}"
  say ""
fi
