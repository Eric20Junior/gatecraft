# planning/

Plans, milestones, and task breakdowns — the output of
[../WORKFLOW.md#6](../WORKFLOW.md#6-planning-workflow), and the artifact an agent
reads before it writes any code.

A plan here is the contract for a piece of work: what will be true when it is done,
in what order, and what would make it stop.

---

## What belongs here

| File | Contents |
| --- | --- |
| `YYYY-MM-DD-<name>.md` | An implementation plan, per [../TEMPLATES.md#4](../TEMPLATES.md#4-implementation-plan). |
| `roadmap.md` | The sequence of what is coming, at milestone granularity. One file, continuously edited. |
| `prd/<name>.md` | Product requirements, per [../TEMPLATES.md#1](../TEMPLATES.md#1-product-requirements-document-prd). |
| `releases/<version>.md` | Release plans, per [../TEMPLATES.md#9](../TEMPLATES.md#9-release-plan). |

## What does not belong here

- **The task tracker.** Whatever issue system you use is the source of truth for
  day-to-day status. This directory holds the *thinking* — the decomposition, the
  sequencing, the risks — not the ticket states. Duplicating a tracker into Markdown
  produces a second source of truth that is wrong within a week.
- **Completed work.** Once shipped, the record goes in
  [../memory/completed-work.md](../memory/completed-work.md) with the actuals. The
  plan stays here as the artifact the actuals are compared against — that comparison
  is the only thing that improves estimation.
- **Wishes.** Unscheduled ideas go to
  [../memory/future-ideas.md](../memory/future-ideas.md), with a trigger.

---

## Naming convention

Dated and named for the outcome, not the component:
`2026-04-02-tenant-level-rate-limiting.md`. A plan named `backend-work.md` cannot be
found six months later and will be rewritten from scratch by someone who did not
know it existed.

---

## What every plan MUST contain

Beyond the template, these are the fields that determine whether a plan is worth
having:

**Acceptance criteria, written before the work.** Observable and testable. If you
cannot state how you would check it, you cannot state that it is done — per
[../SYSTEM.md#14](../SYSTEM.md#14-completion-criteria).

**Non-goals.** The single highest-leverage section. Scope grows silently in the
absence of a written boundary, and every argument about "was that in scope" is an
argument that a non-goals list would have ended in ten seconds.

**Sequencing and the critical path.** Not a list of tasks — a list of *dependencies*.
Which task must finish before which, and what the whole plan is waiting on.

**A rollback plan.** For anything touching data, deployment, or an external contract.
Written before the change ships, because the moment you need it is the moment nobody
is capable of designing it calmly.

**Risks, each with a trigger and a response.** A risk register with no triggers is a
list of things people are vaguely worried about, and it will be read once.

---

## Plans go stale

**A plan is a hypothesis, not a commitment.** Update it when reality diverges — do
not quietly work off-plan while the document says something else, because the
document is what the next agent reads and it will confidently do the wrong thing.

Mark divergence explicitly:

```markdown
> **Revised YYYY-MM-DD:** [what changed and why. Keep the original text; strike it
> or move it to a "superseded" note. The delta between plan and reality is the
> calibration data for the next plan — deleting it discards the lesson.]
```

At close, record the estimate-versus-actual in
[../memory/completed-work.md](../memory/completed-work.md) and, if the gap has a
transferable cause, in
[../memory/lessons-learned.md](../memory/lessons-learned.md#estimate-calibration).

---

## Related

- [../WORKFLOW.md#6](../WORKFLOW.md#6-planning-workflow) — the workflow
- [../CHECKLISTS.md#20](../CHECKLISTS.md#20-planning-checklist) — the gate
- [../PROMPTS.md#1](../PROMPTS.md#1-planning) — prompts for producing a plan
