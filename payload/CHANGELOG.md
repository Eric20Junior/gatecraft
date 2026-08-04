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
