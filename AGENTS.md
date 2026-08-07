# AGENTS.md

Instructions for AI coding agents working in this repository.

<!-- >>> gatecraft >>> -->
## Engineering operating system

This repository runs the **AI Engineering Operating System v1.1.1**. The full
framework is installed at `.ai/` — hidden and git-ignored, but present. Read it.

Stack: JavaScript. Confirm against `.ai/PROJECT_CONTEXT.md` before relying on it.

### Before you write any code

1. `.ai/SYSTEM.md` — how to think, loop, decide, self-critique, and score. The kernel.
2. `.ai/PROJECT_CONTEXT.md` — what *this* repository is and what constrains it.
3. `.ai/memory/` — what has already been decided, built, broken, and learned here.
4. `.ai/WORKFLOW.md` — find the workflow matching your task and follow its gates.
5. `.ai/AGENTS.md` — adopt the specialist roles that workflow calls for.
6. `.ai/STANDARDS.md` + `.ai/CHECKLISTS.md` — the bar the work has to clear.

If `.ai/` is missing, the framework is not installed. Say so rather than
improvising, and run `npx gatecraft init`.

### Read one section, not the whole document

`STANDARDS.md`, `CHECKLISTS.md`, and `PROMPTS.md` are reference works. Pull the
section you need instead of reading the file and searching it:

```sh
gatecraft standard security --md     # one of 25 sections
gatecraft checklist release --md     # one of 20 gates
gatecraft prompt write-an-adr --md   # one of 62 prompts
```

Run any of the three with no argument to see what exists. If `gatecraft` is not on
PATH, use `npx gatecraft`, or read the file — but read only the section.

### The loop is not optional

Every non-trivial task runs the **Universal Engineering Loop** in
`.ai/SYSTEM.md#3-the-universal-engineering-loop`:

> Understand → Research → Plan → Design → Implement → Review → Critique →
> Improve → Validate → Test → Document → Evaluate

Version 1 is never the final version. Produce it, then attack it, then improve it.
Skipping straight to Implement is the failure mode this framework exists to prevent.

### Non-negotiable

- **Never optimize for speed over quality.** Never stop at the first solution.
- **State assumptions explicitly.** If requirements are ambiguous, ask — do not guess
  and do not silently pick.
- **Never invent facts about this codebase.** Read the file. If you have not read it,
  say you have not read it.
- **Ship at ≥ 90/100** on the Production Readiness Score in
  `.ai/SYSTEM.md#14-completion-criteria`. Any dimension below 7 blocks. Security
  below 9 blocks anything touching auth, payments, or personal data.
- **Security review has veto power** and it is not overridable by a deadline.
- **Record what you learn.** Decisions to `.ai/DECISIONS.md`, defect classes and
  lessons to `.ai/memory/`. Work that teaches nobody anything gets repeated.

### Customizing

Never edit the framework documents — they are replaced wholesale on upgrade. Put
project rules in `.ai/standards/`, project workflows in `.ai/workflows/`, project
prompts in `.ai/prompts/`, and any deliberate exception in
`.ai/PROJECT_CONTEXT.md#12-overrides-and-exceptions` with an owner and a reason.

<sub>Managed by [gatecraft](https://github.com/Eric20Junior/gatecraft) v1.1.1. Edits inside this
block are overwritten on upgrade — write yours outside it.</sub>
<!-- <<< gatecraft <<< -->
