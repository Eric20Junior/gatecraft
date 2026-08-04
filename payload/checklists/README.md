# checklists/

Individual checklist files, extracted for **gate runs** — the moment where someone
works through a list item by item and records the result.

[../CHECKLISTS.md](../CHECKLISTS.md) holds all 20 framework checklists in one
document. This directory holds them as separate files, plus this project's own, plus
the **completed runs**.

---

## What belongs here

| File | Contents |
| --- | --- |
| `<name>.md` | A blank checklist, ready to copy for a run. |
| `runs/YYYY-MM-DD-<name>-<subject>.md` | A completed run, with evidence. |
| `<project-specific>.md` | Checklists the framework does not provide — your compliance list, your platform's launch requirements. |

## What does not belong here

- **Checklists nobody runs.** An unrun checklist is a document that makes people
  feel covered, which is worse than being visibly uncovered. Delete it or wire it
  into a workflow in [../WORKFLOW.md](../WORKFLOW.md).
- **Items that cannot be answered yes or no.** "Is the code well designed?" is not a
  checklist item, it is a review. Checklist items are binary and verifiable; that
  property is the entire reason checklists work.

---

## Naming convention

Blank checklists match the framework's names: `architecture.md`, `backend.md`,
`frontend.md`, `mobile.md`, `ai.md`, `database.md`, `infrastructure.md`, `api.md`,
`security.md`, `performance.md`, `deployment.md`, `release.md`, `documentation.md`,
`accessibility.md`, `scalability.md`, `production-readiness.md`, `postmortem.md`,
`incident-response.md`, `research.md`, `planning.md`.

Runs are dated and named for what was checked:
`runs/2026-03-14-security-payments-api.md`.

---

## How a run is recorded

```markdown
# [Checklist name] — [subject]

- **Date:** YYYY-MM-DD
- **Run by:** [who]
- **Subject:** [what was checked — a commit, a release, a component]
- **Result:** PASS / FAIL

| # | Item | Result | Evidence |
| --- | --- | --- | --- |
| 1 | [item] | pass / fail / n/a | [link, output, or one line of why] |

## Failures

Each failure, and what happens next: fixed before proceeding, or accepted with an
owner and a date in [../PROJECT_CONTEXT.md#12](../PROJECT_CONTEXT.md#12-overrides-and-exceptions).

## Not applicable

Each `n/a`, with the reason. This column is where dishonest runs hide.
```

---

## Three rules that make the difference

**1. Evidence, not assertion.** "Yes" is not a result. A link, a command output, a
test name, or a one-line statement of what was observed is a result. A checklist run
without evidence is a memory of good intentions, and it will not survive contact
with the incident review that asks how this shipped.

**2. `n/a` needs a reason.** It is the easiest way to pass a checklist without
doing the work, and it is always the item that mattered. Per
[../SYSTEM.md#10](../SYSTEM.md#10-quality-gates), an unjustified `n/a` counts as a
failure.

**3. A gate is binary.** "Mostly passed" is failed. The value of a gate is entirely
in the fact that it can stop things; a gate that has never stopped anything is not
being run honestly.

---

## Keeping checklists alive

Add an item when an incident reveals a gap — that is the escalation ladder in
[../memory/lessons-learned.md](../memory/lessons-learned.md), one rung up from a
documentation note.

Remove an item when it has passed on every run for a year **and** the failure it
guards against is now impossible by construction — a type, a schema constraint, an
automated check. That is one rung *up*, not a relaxation.

Checklists that only ever grow become checklists that are skimmed. Skimming is
indistinguishable from not running them, except that it produces a record claiming
otherwise.
