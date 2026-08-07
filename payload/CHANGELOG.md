# CHANGELOG.md — History of the Gatecraft

This is the history of the framework itself — the `.ai/` directory — not of the
project that hosts it. Your project keeps its own changelog at its own root.

Format follows [Keep a Changelog](https://keepachangelog.com/) conventions.
Versioning follows [VERSION.md](VERSION.md). Dates are absolute, `YYYY-MM-DD`, never
relative.

**Every entry states what a consumer must do.** A changelog that lists what changed
without stating the consequence for the reader has recorded activity rather than
communicated a change. For a MAJOR entry, the migration steps are mandatory.

---

## [Unreleased]

Nothing yet. Add entries here as changes are made, under the headings below, and move
them into a version section when the version is cut.

### Added
### Changed
### Deprecated
### Removed
### Fixed

---

## [1.1.1] — 2026-08-07

No change to any framework document. This release exists for two CLI fixes, one of
which could destroy an ejected `.ai/` tree; see the
[CLI changelog](https://github.com/Eric20Junior/gatecraft/blob/main/CHANGELOG.md) for
those.

**What you must do.** Nothing to the documents. If you have ever run
`gatecraft eject`, upgrade the CLI before running `uninstall` again —
`npx gatecraft@latest` is enough, since the tool is not installed into your project.

---

## [1.1.0] — 2026-08-06

Two retrieval commands, so an agent can pull one section instead of reading a whole
document. `PROMPTS.md` is 114 KB and `STANDARDS.md` is 46 KB; an agent that needed one
prompt had to load all 62 and search, which wastes context on small-window models and
risks truncation on any of them. `gatecraft checklist` already solved this for
checklists — this extends the same pattern to standards and prompts.

**What you must do.** Nothing is required; both commands are additive and no document,
section number, or anchor changed. To let your agent use them, run
`npx gatecraft@latest upgrade` to pick up the new `AGENTS.md` bootstrap section that
names them. If you customized `AGENTS.md` outside the managed marker block, your edits
are preserved.

### Added

- `gatecraft standard <topic>` prints one section of `STANDARDS.md`. Run it bare to
  list the 25 topics. `--md` emits raw markdown for piping into a prompt.
- `gatecraft prompt <name>` prints one prompt from `PROMPTS.md`. Run it bare to list
  all 62 grouped by category, or `--category <name>` to list one category.
- Both resolve a query by section number, exact slug, unique prefix, then substring,
  and read your installed `.ai/` copy before the packaged defaults — so local edits to
  a standard are what you get back. An ambiguous query lists the matches and exits
  non-zero rather than guessing.
- `AGENTS.md` gained a "Read one section, not the whole document" section listing all
  three retrieval commands, with a fallback for agents that cannot run shell commands.
  Previously none of them were mentioned in the bootstrap at all.

---

## [1.0.1] — 2026-08-05

Two fixes to `--share` mode, the option that lets a team commit project knowledge
while keeping the framework kernel out of git. Both were found by installing
gatecraft into gatecraft.

**What you must do.** If you installed with `--share` on 1.0.0, run
`npx gatecraft@latest doctor` and check what it now says. If your `.gitignore`
already excluded `.ai/` before you installed, your project memory was never
actually being committed — the install said it was. Remove that rule and commit
`.ai/PROJECT_CONTEXT.md`, `.ai/DECISIONS.md`, and `.ai/memory/` to start sharing
them for real. If you followed the earlier `git rm -r --cached .ai` advice from
`doctor`, check whether that commit removed shared files your teammates needed.

### Fixed

- `gatecraft doctor` treated a `--share` install as if it were hidden. It reported
  every shared project file as accidentally committed and advised
  `git rm -r --cached .ai` — a command that untracks precisely the files `--share`
  exists to share, deleting them for every teammate on the next commit. The advice
  was the defect. `doctor` now distinguishes project-owned files from
  framework-owned ones and reports only genuinely leaked framework files, naming
  them individually rather than by wildcard.

- `gatecraft init --share` reported `project memory shared` whether or not the
  share worked. Git will not re-include a file inside an excluded directory, so a
  pre-existing `.ai/` or `/.ai/` rule in `.gitignore` makes every negation the
  installer writes inert. The install would claim success while committing nothing,
  and a team could discover months later that no context had ever been shared.
  `init` now detects the conflicting rule, reports its line number and text, and
  states plainly that project memory is not shared.

### Changed

- Share-mode tests now assert what `git` would actually commit rather than that the
  `.gitignore` contains a negation. The previous test passed against both bugs.

---

## [1.0.0] — 2026-08-04

Initial release. The complete AI Engineering Operating System: 15 top-level documents
and 12 working directories, technology-agnostic, with no dependency on any model,
vendor, or agent runtime.

### Added

**The kernel**

- [SYSTEM.md](SYSTEM.md) — the reasoning core. Eighteen sections covering the
  operating philosophy, reasoning rules, the twelve-stage
  [Universal Engineering Loop](SYSTEM.md#3-the-universal-engineering-loop), the
  [decision framework](SYSTEM.md#7-decision-framework) requiring three compared
  options, binary [quality gates](SYSTEM.md#10-quality-gates), the ten-dimension
  production readiness score with a 90/100 threshold and per-dimension floors in
  [completion criteria](SYSTEM.md#14-completion-criteria),
  [escalation](SYSTEM.md#16-escalation), and the
  [AI behaviour contract](SYSTEM.md#18-ai-behaviour-contract).

**Roles and process**

- [AGENTS.md](AGENTS.md) — 25+ specialist roles, each with mission, responsibilities,
  authority, inputs, outputs, review criteria, escalation path, communication
  expectations, metrics, and a completion rule. The Security Engineer role holds veto
  power over release.
- [WORKFLOW.md](WORKFLOW.md) — 16 end-to-end workflows with entry conditions, stages,
  deliverables, gates, exit conditions, and approval requirements.

**The bar**

- [STANDARDS.md](STANDARDS.md) — 25 domains, each with explicit MUST and SHOULD
  blocks: code, architecture, version control, testing, security, performance,
  database, API design, logging, monitoring, observability, accessibility (WCAG 2.2
  AA), UX, AI systems, cloud, infrastructure, deployment, scalability,
  maintainability, and configuration.
- [CHECKLISTS.md](CHECKLISTS.md) — 20 binary, falsifiable verification checklists,
  from [architecture](CHECKLISTS.md#1-architecture-checklist) through
  [production readiness](CHECKLISTS.md#16-production-readiness-checklist) and
  [planning](CHECKLISTS.md#20-planning-checklist). A partial pass is a fail.

**Operating material**

- [PLAYBOOKS.md](PLAYBOOKS.md) — 22 concrete runbooks for recurring situations, each
  with trigger, owner, prerequisites, numbered steps, verification, rollback,
  aftercare, and common mistakes. Written to be followed at 3am by someone who did
  not build the system.
- [PROMPTS.md](PROMPTS.md) — 20 sections of reusable prompts covering planning,
  architecture, backend, frontend, mobile, database, AI engineering, debugging,
  testing, code review, refactoring, optimization, security, deployment and
  operations, documentation, product and design, research, unfamiliar codebases,
  self-critique, and meta-prompts.
- [TEMPLATES.md](TEMPLATES.md) — 18 document templates including
  [PRD](TEMPLATES.md#1-product-requirements-document-prd),
  [architecture document](TEMPLATES.md#13-architecture-document),
  [threat model](TEMPLATES.md#16-threat-model),
  [postmortem](TEMPLATES.md#11-postmortem),
  [runbook](TEMPLATES.md#17-runbook), and
  [retrospective](TEMPLATES.md#18-retrospective).

**Reference**

- [KNOWLEDGE.md](KNOWLEDGE.md) — engineering principles, design patterns,
  architectural patterns, DDD, distributed systems, the Twelve-Factor App, OWASP Top
  10, testing, performance, data, and AI engineering. Every entry states when the item
  is *wrong*, and the citation rule forbids naming a pattern without naming the force
  in this system that motivates it.
- [GLOSSARY.md](GLOSSARY.md) — every term used in the framework, defined.
- [VERSION.md](VERSION.md) — the versioning scheme for the framework and the policy
  for versioning your project.

**Project-local**

- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — the master per-project context template,
  and the only file that MUST be filled in before the framework is useful. Includes
  the [overrides mechanism](PROJECT_CONTEXT.md#12-overrides-and-exceptions) for
  deviating from defaults without forking.
- [DECISIONS.md](DECISIONS.md) — the ADR system: when a record is required, the
  lifecycle, the template, the supersession rules, the index, and a worked example
  ([ADR-0001](DECISIONS.md#adr-0001-adopt-the-ai-engineering-operating-system)).
- [README.md](README.md) — the entry point, the reading order for agents, the
  installation procedure, and the customization model.

**Working directories** — [architecture/](architecture/),
[workflows/](workflows/), [standards/](standards/), [templates/](templates/),
[checklists/](checklists/), [prompts/](prompts/), [memory/](memory/),
[research/](research/), [planning/](planning/), [reviews/](reviews/),
[metrics/](metrics/), [evaluation/](evaluation/) — each seeded with a README
explaining what belongs there, what does not, and the naming convention.

### Migration from no framework

1. Copy `.ai/` into the repository root.
2. Fill in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). Every remaining
   `{{placeholder}}` is a defect; an explicit `N/A` with a reason is not.
3. Initialize [memory/project-memory.md](memory/project-memory.md) with the current
   state of the system.
4. Add the pointer from the repository's root agent-instruction file, per
   [README.md](README.md#installing-the-gatecraft-in-a-repository).
5. Record the adoption as an ADR. [ADR-0001](DECISIONS.md#7-worked-example) is
   provided as a working example you can adapt rather than write from scratch.

Expect friction before you see quality. The gates will block work that previously
shipped; that is the mechanism, not a misconfiguration. If a gate is wrong for your
project, record an override with a reason rather than ignoring it — an undocumented
deviation is a violation, and a documented one is a decision.

---

## How to maintain this file

- **Add the entry in the same change as the content.** A changelog written at release
  time from a commit log is a list of commit subjects, not a changelog.
- **Write for the reader who must act.** State the consequence, not the activity.
  "Renumbered STANDARDS.md sections 11–25" is activity; "every link to
  `STANDARDS.md#14` now resolves to different content — update your overrides" is a
  changelog entry.
- **Never delete a historical entry.** Correct it with a note if it was wrong. The
  trail is the value.
- **Keep `[Unreleased]` honest.** An empty Unreleased section with three merged
  changes behind it means the discipline has lapsed.
- **The version here, in [VERSION.md](VERSION.md), and in
  [README.md](README.md) MUST agree.** A disagreement is the signal that an upgrade
  was applied halfway.
