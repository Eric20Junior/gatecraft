# Completed Work

The delivery record. What shipped, when, what it actually cost, and whether the plan
resembled reality.

**This is not a changelog.** [CHANGELOG.md](../CHANGELOG.md) and your project's own
changelog tell consumers what changed. This tells the *team* what the work was like:
where the estimate broke, what was cut, what debt was taken to make the date. That
information is what makes the next plan better, and it exists nowhere else once the
tickets are closed.

Entries are written at release, while the memory of the work is intact. A record
written a month later contains the outcome and none of the friction, which is the
part worth keeping.

Related: [lessons-learned.md](lessons-learned.md) for the transferable rule,
[technical-debt.md](technical-debt.md) for anything deliberately deferred,
[../TEMPLATES.md#18](../TEMPLATES.md#18-retrospective) for the full retrospective.

---

## Entry format

```markdown
### YYYY-MM-DD — [What shipped, in outcome terms]

- **Version:** [per VERSION.md]
- **Duration:** [start date → ship date]
- **Estimated:** [original estimate] → **Actual:** [actual] → **Ratio:** [N×]
- **Readiness score at ship:** [NN/100, with the lowest dimension named]

**Delivered.** What users can now do that they could not before.

**Cut from scope.** What was planned and did not ship, and whether it was cut
deliberately or ran out of time. Anything cut goes to
[future-ideas.md](future-ideas.md) with a trigger, or it is silently forgotten —
which is the usual outcome and the reason this field exists.

**Debt taken.** Shortcuts accepted to make the date, each with an entry in
[technical-debt.md](technical-debt.md). "None" is a valid and rare answer; be
honest.

**Where the estimate broke.** The specific thing that took longer than expected.
Not "it was complicated" — the actual mechanism: an unknown dependency, a migration
that needed three phases, a review cycle nobody planned for.

**What we would do differently.** One or two sentences. The full analysis belongs in
the retrospective; this is the pointer.
```

---

## Entries

*(Newest first.)*

`{{No entries yet. Write the first at the next release, before closing the
tickets.}}`

---

## Delivery summary

A running table, so trends are visible without reading every entry.

| Date | What | Est. | Actual | Ratio | Score | Debt taken |
| --- | --- | --- | --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{}}` | `{{}}` | `{{}}` | `{{}}` | `{{Y/N}}` |

**What to watch in this table:**

- **A ratio that is consistently above 1** is a calibration problem, and the fix is
  arithmetic: apply the median ratio to the next estimate. Record it in
  [lessons-learned.md](lessons-learned.md#estimate-calibration).
- **A readiness score that drifts downward** across releases is the most important
  signal in this file. It means the bar is being lowered incrementally, which is how
  every project that lost quality control lost it. Per
  [../PLAYBOOKS.md#22](../PLAYBOOKS.md#22-recovering-a-project-that-has-lost-quality-control).
- **`Debt taken: Y` on consecutive rows** means the team is borrowing every cycle and
  has not scheduled a repayment. Check that
  [technical-debt.md](technical-debt.md) shows the interest, and plan against it per
  [../PLAYBOOKS.md#14](../PLAYBOOKS.md#14-paying-down-technical-debt).
- **A dimension that is always the lowest** is a structural weakness, not a series of
  coincidences. Name it and fix the cause.
