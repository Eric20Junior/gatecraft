# Changelog

History of the `gatecraft` CLI — the tool that installs, upgrades, and removes the
framework. The framework's own history, covering the documents that land in `.ai/`,
is in [payload/CHANGELOG.md](payload/CHANGELOG.md); the two are versioned together
but describe different things.

Format follows [Keep a Changelog](https://keepachangelog.com/). Versioning follows
[semver](https://semver.org/). Dates are absolute, `YYYY-MM-DD`.

---

## [Unreleased]

Nothing yet.

---

## [1.1.1] — 2026-08-07

Two fixes found by running gatecraft on gatecraft. The framework documents are
untouched, so an upgrade costs nothing.

### Added

- Test coverage for `gatecraft eject`: refusal without `--yes`, that every document
  survives, that only the manifest and the managed `.gitignore` block are removed,
  `--dir` targeting, and re-adoption with `init --force`.

### Fixed

- `gatecraft uninstall` deleted `.ai/` and `AGENTS.md` on a project that had been
  ejected. `eject` removes the install manifest and tells you that `uninstall` will
  no longer work — but uninstall only bailed out when there was *neither* a manifest
  *nor* an `.ai/` directory, so an ejected tree fell through to the delete. Anyone
  who ejected to keep heavily customized documents and later ran `uninstall` lost
  them, with no manifest left to restore from. Uninstall now refuses on any `.ai/`
  it has no manifest for, whether that came from `eject` or was written by hand.

- `status` and `doctor` reported one unfilled placeholder on a fully filled
  `PROJECT_CONTEXT.md`, attributed to no section — so there was nothing you could
  edit to clear it. The preamble explains what a `{{placeholder}}` is and contains
  one as an example; it was being counted. Only placeholders inside a numbered
  section count now.

### Changed

- The README workflow diagram is an SVG rather than a fenced ASCII block, so it
  survives GitHub's mobile rendering instead of wrapping into noise.

---

## [1.1.0] — 2026-08-06

Section retrieval. An agent that needed one prompt had to read all 62.

### Added

- `gatecraft standard <topic>` prints one section of `STANDARDS.md`; bare, it lists
  all 25. `gatecraft prompt <name>` prints one prompt from `PROMPTS.md`; bare, it
  lists all 62 grouped by category, and `--category <name>` lists one category.
- `--md` on both emits raw markdown with no terminal formatting, for piping into a
  prompt.
- A shared resolver behind `checklist`, `standard`, and `prompt`, so all three
  address sections identically: by number, exact slug, unique prefix, then
  substring. An ambiguous query lists the matches and exits non-zero rather than
  guessing which of four security standards you meant.
- Both commands read the installed `.ai/` copy before the packaged payload, so local
  edits to a standard are what comes back.
- `src/lib/sections.js` — one parser for the two heading shapes the payload uses
  (`## N. Title` and `### Name` under a category), skipping fenced code so a `##`
  inside a sample block is not mistaken for a heading.

### Changed

- The `AGENTS.md` bootstrap gained a "Read one section, not the whole document"
  section naming all three retrieval commands, with a fallback for agents that
  cannot run shell commands. Previously none were mentioned.

---

## [1.0.1] — 2026-08-05

Share-mode fixes, found by installing gatecraft into gatecraft.

### Fixed

- `gatecraft doctor` treated a `--share` install as if it were hidden: it reported
  every shared project file as accidentally committed and advised
  `git rm -r --cached .ai`, which untracks precisely the files `--share` exists to
  share. `doctor` now distinguishes project-owned from framework-owned files and
  names genuinely leaked files individually rather than by wildcard.
- `gatecraft init --share` reported `project memory shared` whether or not it
  worked. Git will not re-include a file inside an excluded directory, so a
  pre-existing `.ai/` rule makes every negation the installer writes inert. `init`
  now detects the conflicting rule, reports its line number and text, and says
  plainly that project memory is not shared.

### Changed

- Share-mode tests assert what `git` would actually commit rather than that
  `.gitignore` contains a negation — the previous test passed against both bugs.
- The release workflow's publish step is idempotent, so re-running a partially
  failed release does not abort on an already-published version.

### Infrastructure

- CI runs the full matrix cleanly: `node --test` is invoked through
  `scripts/run-tests.js`, which discovers test files and passes them explicitly,
  because no single invocation form works across Node 18/20/22 and cmd.exe.
- `.gitattributes` pins the payload to LF. A Windows checkout converts text files
  to CRLF, which made every heading regex silently match nothing; the parsers now
  tolerate CRLF regardless, and a dedicated CI job converts the tree to CRLF on
  Linux so the whole class is reproducible in seconds.
- The `install.sh` job serves a packed tarball from a Node HTTP server with a
  readiness check instead of `python3` with a fixed sleep, which assumed an image
  detail and raced on a loaded runner.

---

## [1.0.0] — 2026-08-04

Initial release. Zero runtime dependencies, and there never will be any.

### Added

- `gatecraft init` installs the framework into `.ai/`, detects the project's stack
  to pre-fill `PROJECT_CONTEXT.md`, writes an `AGENTS.md` bootstrap, and gitignores
  the payload so it stays invisible to the repository. `--share` commits project
  knowledge while keeping the framework kernel out of git; `--track` ignores
  nothing; `--all-agents` writes tool-specific pointers.
- `gatecraft upgrade` replaces framework documents while preserving anything you
  edited, never touches project-owned files, and leaves user-deleted files deleted.
  `--force` overrides the first of those; `--dry-run` reports without writing.
- `gatecraft uninstall` removes exactly what was added and nothing else, backing up
  `.ai/memory/` first when it holds real content.
- `gatecraft eject` removes the manifest and the managed `.gitignore` block, leaving
  `.ai/` as ordinary files you own outright.
- `gatecraft status` and `gatecraft doctor` report what is installed, what drifted
  from the shipped version, and what leaked into git.
- `gatecraft checklist` prints one checklist instead of the whole document.
- A SHA-256 manifest recording every installed file, so upgrade can tell a
  pristine file from one you edited, and uninstall can remove only what it wrote.
- `install.sh` for installing without Node, and a manifest it writes in the same
  format so the Node CLI adopts an install.sh install rather than reporting the
  whole framework as user-created.
