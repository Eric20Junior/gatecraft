# Contributing to Gatecraft

Thanks for considering it. This document covers what the project is trying to be,
which makes it much easier to tell a good change from a plausible one.

## What Gatecraft is

A framework of Markdown documents that an AI coding agent reads before it does
engineering work, plus a small zero-dependency CLI that installs, upgrades, and
verifies those documents inside any project.

**The documents are the product.** The CLI exists to get them into a repository
safely and keep them current. Roughly 16,000 of the ~18,000 lines here are prose,
and that ratio is intentional.

## What Gatecraft is not

- **Not a runtime.** Nothing in `payload/` executes. If a change requires the
  framework to run code in the user's project, it does not belong here.
- **Not tied to a stack.** The framework must read correctly in a Rust service, a
  Django monolith, and a Swift app. Anything that only makes sense for one
  ecosystem goes in `payload/standards/` as an override users opt into.
- **Not tied to one agent.** Claude Code, Cursor, Codex, Copilot, Windsurf, Aider,
  and Gemini CLI all read `AGENTS.md`. Vendor-specific behaviour lives behind a
  flag, never in the framework text.
- **Not a dependency.** Zero runtime dependencies, permanently. If a change needs
  a package, it needs a different design.

## Getting set up

```sh
git clone https://github.com/Eric20Junior/gatecraft
cd gatecraft
npm test              # node:test, no install step — there is nothing to install
npm run lint          # node --check across every source file
npm run verify:payload # the release gate for the framework documents
```

Node 18 or newer. There is no build step and no transpiler; `src/` is the code
that ships.

To try your changes against a real project:

```sh
node bin/gatecraft.js init --dir /path/to/some/project
```

## Changing the framework documents

This is where most contributions belong, and where review is strictest — a
weak paragraph in `STANDARDS.md` gets followed by thousands of agents.

**Every normative statement uses RFC 2119 keywords.** MUST, MUST NOT, SHOULD,
SHOULD NOT, MAY. A rule stated as "it's a good idea to…" is not a rule and will
be read as optional, because it is.

**Every MUST needs a reason in the same breath.** An agent that knows *why* a rule
exists can apply it to the case you did not anticipate. An agent given a bare
prohibition either over-applies it or routes around it.

**Prefer the specific failure to the general principle.** "Validate input" is
advice nobody has ever acted on. "Reject the request before it reaches the ORM,
because a validation error surfacing as a 500 tells an attacker your stack" is
something an agent can execute.

**No placeholders in framework documents.** `{{...}}` is legal only in
project-owned files — `PROJECT_CONTEXT.md`, `memory/`, `templates/`,
`architecture/`, and prompt bodies in `PROMPTS.md`. `npm run verify:payload`
enforces this; it is not a style preference, it is the difference between a
document a team fills in and a document that shipped unfinished.

**Cross-references must resolve.** The framework is a hypertext and a dead link
is a dead end an agent will silently route around rather than report. The
verifier checks all ~1,150 of them.

**If you add a document,** add it to `REQUIRED_DOCS` or `REQUIRED_DIRS` in
`scripts/verify-payload.js`, give any new directory a `README.md` explaining what
belongs in it, and link it from `payload/README.md`.

## Changing the CLI

**Never lose a user's work.** The manifest records a hash of every file as
installed. Matching hash means untouched and safe to replace; differing hash means
the user edited it and it is theirs; absent-but-previously-known means the user
deleted it and it stays deleted. Project-owned files are never overwritten on
upgrade, not even with `--force`. If you change `src/lib/payload.js`, re-read
those rules first — they are the load-bearing part of this codebase.

**Every write to a file we did not create is a marker block.** `.gitignore` and
`AGENTS.md` get `>>> gatecraft >>>` / `<<< gatecraft <<<` fences so that install is
idempotent, upgrade refreshes only our block, and uninstall removes exactly what
we added and nothing else.

**Errors tell the user what to do next.** `throw new Error("ENOENT")` is a bug
report addressed to us. Every error in `src/` names the problem and the command
that fixes it.

**Style:** CommonJS, no semicolonless style, no classes where a function will do.
Comments explain why, not what. Match the surrounding code.

## Tests

`node:test`, in `test/`. Run with `npm test`.

Changes to install, upgrade, uninstall, or the manifest need a test that
demonstrates the file-preservation property they affect — those paths touch user
data in someone's repository, and "it worked when I tried it" is not a regression
guard.

## Commits and pull requests

Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
The `feat:` / `fix:` distinction drives the release notes.

In the PR description, say what changes for the user. For framework changes, quote
the before and after text — reviewers need to read the words, not a diff summary.

Before opening: `npm run lint && npm test && npm run verify:payload`. CI runs the
same three on Linux, macOS, and Windows across Node 18, 20, and 22.

## Reporting bugs

Include the output of `npx gatecraft doctor` and `npx gatecraft status`. Between them they
report the install version, which files differ from pristine, and whether every
link resolves, which is most of a diagnosis.

For anything security-related, do not open an issue — see [SECURITY.md](SECURITY.md).

## Releasing

Maintainers only:

1. Bump `version` in `package.json`, `**Current version:**` in
   `payload/VERSION.md`, and add the `## [x.y.z]` section to
   `payload/CHANGELOG.md`. The verifier fails if these three disagree.
2. Document breaking changes and the migration in `payload/VERSION.md`.
3. `npm run verify:payload && npm test`
4. Tag `vx.y.z` and push. The release workflow publishes to npm with provenance.

## Code of conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Licence

Gatecraft is [MIT](LICENSE). Copyright © 2026 Gatecraft. Use it, fork it, modify it,
redistribute it, sell what you build with it.

**What this means for contributing:** anything you deliberately submit for inclusion
is contributed under MIT, unless you say otherwise in writing. There is no CLA to
sign and no copyright to assign — you keep ownership of your work, and it ships
under the terms everyone else already has.

Two things we ask, neither of which the licence enforces:

- **Only submit work you have the right to submit.** Your own writing, or
  something you hold the rights to. Do not paste in text from a book, a
  proprietary internal handbook, or a document under an incompatible licence.
- **Say so if a contribution is on behalf of your employer** and they hold the
  copyright. It changes nothing about how we review it; it just means the record
  is accurate.

**The name is a separate matter from the code.** MIT covers copyright; it says
nothing about trademarks. Forks need their own name — see [TRADEMARK.md](TRADEMARK.md).
This has no bearing on contributing here, and forking to prepare a pull request
needs no permission from anyone.
