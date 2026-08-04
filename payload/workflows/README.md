# workflows/

Project-specific **workflow overrides and additions**. This is half of the
customization mechanism described in [../README.md](../README.md) — the half that
lets you change *how work moves* without forking [../WORKFLOW.md](../WORKFLOW.md).

---

## The rule

[../WORKFLOW.md](../WORKFLOW.md) is the framework's version and **is not edited**.
When you upgrade the Gatecraft, it is replaced wholesale. Anything you wrote into it is
lost, and — worse — anything you *deleted* from it silently returns.

So: leave it alone, and put your changes here.

| Situation | What to do |
| --- | --- |
| You need an extra step in an existing workflow | Add a file here that names the workflow and states the addition |
| You need a workflow the framework does not have | Add it here as a new file |
| A framework workflow does not apply to this project | Record it in [../PROJECT_CONTEXT.md#12](../PROJECT_CONTEXT.md#12-overrides-and-exceptions), not here — a deletion is an exception, not a workflow |

---

## What belongs here

- `<name>.md` — a complete workflow the framework does not provide. Follow the shape
  used in [../WORKFLOW.md](../WORKFLOW.md): trigger, participants, numbered steps,
  gate, output artifact.
- `<framework-workflow-name>-overrides.md` — additions or modifications to a
  framework workflow. State the base workflow, then only the delta.
- Anything genuinely specific to this project's tooling, compliance regime, or
  release process.

## What does not belong here

- **Copies of framework workflows with small edits.** The copy will not be updated
  when the original changes, and you will end up running a two-year-old process
  believing it is current. Write the delta.
- **Tool documentation.** How to use your CI system belongs in your engineering
  handbook, not in a workflow. A workflow says *what must happen and in what order*;
  it is not a manual.
- **One-off runbooks.** Those follow [../TEMPLATES.md#17](../TEMPLATES.md#17-runbook)
  and live with your operational documentation.

---

## Naming convention

Lowercase, hyphenated, named for the work — `hotfix-release.md`,
`data-migration.md`, `soc2-evidence-collection.md`. Override files carry the
`-overrides` suffix so the relationship is visible in a directory listing.

---

## Override file format

```markdown
# [Framework workflow name] — overrides

**Base:** [../WORKFLOW.md#N](../WORKFLOW.md#N-slug)
**Reason:** Why this project needs something different. One or two sentences.
**Recorded:** YYYY-MM-DD

## Added steps

Where they insert, and what they require.

## Modified steps

The original, then what replaces it, then why.

## Removed steps

Each with the reason, and — this is the part that matters — **what covers the risk
the removed step was managing**. A step removed with no compensating control is a
gate that was quietly lowered, and it belongs in
[../PROJECT_CONTEXT.md#12](../PROJECT_CONTEXT.md#12-overrides-and-exceptions) as an
accepted risk with an owner.
```

---

## Precedence

Files here **override** [../WORKFLOW.md](../WORKFLOW.md) for this project, and are
themselves overridden by
[../PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md#12-overrides-and-exceptions). What
they cannot override is [../SYSTEM.md#10](../SYSTEM.md#10-quality-gates) — a local
workflow may add gates, never remove one.

---

## Review

Review this directory at every Gatecraft upgrade. An override written against a
framework workflow that has since changed is worse than no override, because it will
be applied without anyone noticing the base moved underneath it. If the framework
has absorbed your change, delete your file.
