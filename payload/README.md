# AI Engineering Operating System (Gatecraft)

Version 1.1.1 — see [VERSION.md](VERSION.md) and [CHANGELOG.md](CHANGELOG.md).

The Gatecraft is a technology-agnostic operating system for AI coding agents and the
humans who work with them. Copy the `.ai/` folder into any repository and agents
have an immediate, complete definition of how work is planned, built, reviewed,
tested, documented, and shipped.

It works for SaaS, web, mobile, desktop, APIs, AI products, agents, trading
systems, robotics, embedded, DevTools, enterprise, open source, research
platforms, blockchain, and ML systems. Nothing in it assumes a language, a
framework, a cloud, or a company.

---

## The one rule

**Never optimize for speed over quality. Never stop at the first solution.**

Every deliverable passes through the [Universal Engineering Loop](SYSTEM.md#3-the-universal-engineering-loop)
and every [Quality Gate](SYSTEM.md#10-quality-gates) that applies to it, until
the [Production Readiness Score](SYSTEM.md#14-completion-criteria) reaches 90/100
or an external constraint is documented in writing.

---

## Start here

If you are an AI agent picking up a task in this repository, read in this order:

1. **[SYSTEM.md](SYSTEM.md)** — how to think, plan, loop, decide, self-critique,
   score, and know when you are done. This is the kernel.
2. **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** — what *this specific* repository
   is, who it serves, and what constrains it. Fill it in once per project.
3. **[memory/](memory/)** — what has already been decided, built, broken, and
   learned here. Read before proposing anything.
4. **[WORKFLOW.md](WORKFLOW.md)** — find the workflow matching your task type and
   follow its entry conditions, gates, and exit conditions.
5. **[AGENTS.md](AGENTS.md)** — adopt the roles the workflow calls for.
6. **[STANDARDS.md](STANDARDS.md)** and **[CHECKLISTS.md](CHECKLISTS.md)** — the
   bar the work must clear.

If you are a human onboarding to a repository that uses the Gatecraft, read
[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), then [memory/project-memory.md](memory/project-memory.md),
then [DECISIONS.md](DECISIONS.md).

---

## How to use it, if you are the human

**Nothing to learn. Prompt normally.**

There is no syntax, no command prefix, no template. Your repository has an
`AGENTS.md` at its root, your agent reads it automatically, and it points here. So
an ordinary sentence is a complete instruction:

> Add rate limiting to the login endpoint.

Your agent routes that to the matching workflow in
[WORKFLOW.md](WORKFLOW.md#choosing-a-workflow), adopts the roles it calls for from
[AGENTS.md](AGENTS.md), and runs the [loop](SYSTEM.md#3-the-universal-engineering-loop)
to its gates. What changes is not how you ask — it is that review, tests,
security, and a written decision are no longer optional parts of the answer.

**Two things are worth asking for explicitly** until they become habit:

| Say | Because |
| --- | --- |
| "Update `.ai/memory/` before you finish." | Memory is what makes the next session smarter than this one. An agent that finishes without writing it has thrown away the lesson. |
| "This is trivial — skip the loop." | The framework is deliberately strict. You are allowed to say when it is overkill, and saying so is not a fight with it. |

Everything else engages on its own. If you want a specific part of the system,
name it — "follow the bug fix workflow", "review this as the Security Engineer",
"run the production readiness checklist", "score this out of 100", "write an ADR".
Those are shortcuts, not requirements.

**The one setup step that matters** is filling in
[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). A generic framework with no project
facts still leaves an agent guessing about your database, your auth model, and
your constraints — and those guesses are where bad code comes from.

---

## Map of the system

### Core documents

| File | Purpose |
| --- | --- |
| [SYSTEM.md](SYSTEM.md) | The kernel: philosophy, reasoning, loop, decision framework, quality gates, scoring, completion criteria |
| [AGENTS.md](AGENTS.md) | Every engineering role — mission, authority, inputs, outputs, review process, escalation, metrics |
| [WORKFLOW.md](WORKFLOW.md) | 16 end-to-end workflows with entry/exit conditions, deliverables, and gates |
| [STANDARDS.md](STANDARDS.md) | The engineering bar across 25 domains |
| [CHECKLISTS.md](CHECKLISTS.md) | 20 reusable verification checklists |
| [DECISIONS.md](DECISIONS.md) | The Architecture Decision Record system and its index |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Per-project master context template |
| [PROMPTS.md](PROMPTS.md) | Reusable prompts for every phase of engineering |
| [PLAYBOOKS.md](PLAYBOOKS.md) | Step-by-step runbooks for recurring situations |
| [TEMPLATES.md](TEMPLATES.md) | Document templates (PRD, RFC, ADR, API spec, postmortem, …) |
| [KNOWLEDGE.md](KNOWLEDGE.md) | Engineering principles and patterns, with guidance on when *not* to use them |
| [GLOSSARY.md](GLOSSARY.md) | Every term used in the framework |
| [CHANGELOG.md](CHANGELOG.md) | History of the Gatecraft itself |
| [VERSION.md](VERSION.md) | Versioning policy and compatibility |

### Working directories

| Directory | Holds |
| --- | --- |
| [architecture/](architecture/) | Living architecture of this system |
| [workflows/](workflows/) | Project-specific workflow overrides |
| [standards/](standards/) | Project-specific standards overrides |
| [templates/](templates/) | Ready-to-copy document templates |
| [checklists/](checklists/) | Individual checklist files for gate runs |
| [prompts/](prompts/) | Project-specific prompt library |
| [memory/](memory/) | Persistent project memory — the agent's long-term state |
| [research/](research/) | Research findings and spikes |
| [planning/](planning/) | Plans, milestones, and task breakdowns |
| [reviews/](reviews/) | Completed review records |
| [metrics/](metrics/) | Measured system and delivery metrics |
| [evaluation/](evaluation/) | Evaluation suites, especially for AI behaviour |

---

## Installing the Gatecraft in a repository

1. Copy `.ai/` into the repository root.
2. Fill in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). This is the only file that
   *must* be edited before the framework is useful. Everything else works as-is.
3. Initialize [memory/project-memory.md](memory/project-memory.md) with the
   current state of the system.
4. Add a pointer from the repository's root agent-instructions file (`AGENTS.md`,
   `CLAUDE.md`, `.cursorrules`, or equivalent):

   ```markdown
   This repository uses the AI Engineering Operating System.
   Read `.ai/SYSTEM.md` before starting any task, and `.ai/PROJECT_CONTEXT.md`
   for project specifics. Follow the workflow in `.ai/WORKFLOW.md` that matches
   your task type. Update `.ai/memory/` when work completes.
   ```

5. Record any deviation from the defaults in [standards/](standards/) or
   [workflows/](workflows/) as an override, and log an ADR in
   [DECISIONS.md](DECISIONS.md) explaining why.

---

## Customizing without forking

The Gatecraft is designed to be overridden, not edited:

- **Project-specific standards** go in [standards/](standards/) as new files.
  They win over [STANDARDS.md](STANDARDS.md) where they conflict.
- **Project-specific workflows** go in [workflows/](workflows/). They win over
  [WORKFLOW.md](WORKFLOW.md).
- **Project-specific prompts** go in [prompts/](prompts/).
- **Everything else** — the loop, the gates, the scoring — is the kernel. Change
  it only with an ADR, and bump the version in [VERSION.md](VERSION.md).

This keeps the core upgradeable: you can drop in a newer Gatecraft version and keep
your overrides.

---

## Conventions used throughout

- **MUST / SHOULD / MAY** carry their RFC 2119 meanings. MUST is a gate; SHOULD
  is a default you may override with a written reason; MAY is discretionary.
- **Scores are out of 10** per dimension and **100 overall**. Below 90 means keep
  iterating.
- **Every gate is falsifiable.** If you cannot state what evidence would fail a
  check, the check is not written well — fix the check.
- **Absolute dates**, never "recently" or "last week", in memory and decisions.
- **Cross-links are relative** so the folder stays portable.

---

## Licence

Gatecraft is licensed under MIT. Copyright (c) 2026 Gatecraft.

Use it freely, including commercially, on unlimited projects. Edit these
documents, add your own standards and context, and commit the result to your own
repository — that is what this folder is for. Redistribute or sell what you build
with it.

The full licence text ships alongside these documents, at [`LICENSE`](LICENSE) in
this folder. If you redistribute the framework itself, keep that file and the
attribution with it.

The **name** "Gatecraft" is a trademark and is not covered by the licence grant. Fork
the documents freely; give the result its own name.
