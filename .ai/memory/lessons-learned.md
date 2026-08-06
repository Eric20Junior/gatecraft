# Lessons Learned

What this project got wrong, what it cost, and **what changed as a result**.

The last clause is the whole point. A lesson with no artifact change is not a
lesson, it is a memory of being annoyed. Every entry here MUST name the file that
changed — a standard, a checklist item, a playbook step, a template field, a lint
rule, a test — or state explicitly that nothing changed and why that was the right
call.

Sources: retrospectives
([../TEMPLATES.md#18](../TEMPLATES.md#18-retrospective)), postmortems
([../TEMPLATES.md#11](../TEMPLATES.md#11-postmortem)), and any moment where
somebody says "we should have known that."

Related: [bugs.md](bugs.md) for defect classes,
[decisions.md](decisions.md) for choices, this file for **process and judgement**
failures.

---

## Entry format

```markdown
### YYYY-MM-DD — [The lesson, stated as a rule, not as a story]

- **Source:** [retrospective / postmortem / incident / near-miss]
- **Cost:** [hours, incidents, users affected, money — quantified if at all possible]

**What we believed.** The assumption or habit that turned out to be wrong. State it
in the form we actually held it, not in the form that makes it obviously wrong in
hindsight.

**What happened.** Briefly. The detail lives in the postmortem; link it.

**Why we believed it.** This is what makes the lesson transferable. A belief that
was reasonable given what we knew will recur in a different guise; a belief that was
carelessness will not.

**What changed.** The specific artifact and the specific change. `STANDARDS.md#12
now requires X`. `CHECKLISTS.md#11 gained an item about Y`. `A lint rule now blocks
Z`. If nothing changed, say so and say why — sometimes the correct response to a
one-off is nothing, and recording that judgement stops it being re-argued.

**How we will know it worked.** The signal that the change is effective. Without
this, an artifact change is just as unverified as the belief it replaced.
```

---

## Entries

*(Newest first.)*

`{{No entries yet. The first one usually arrives within a month of adopting the
framework, from the first retrospective that asks "where were our estimates
wrong?"}}`

---

## Recurring themes

When three lessons rhyme, the theme is the real finding and the individual lessons
were symptoms. Review this section at every quarterly retrospective.

| Theme | Instances | What it suggests | Action |
| --- | --- | --- | --- |
| `{{e.g. "We consistently underestimate work that crosses a team boundary"}}` | `{{dates}}` | `{{}}` | `{{}}` |

---

## Estimate calibration

The single most useful thing this file can hold, because it improves every future
plan rather than preventing one past failure.

| Work | Estimated | Actual | Ratio | Why the gap |
| --- | --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{}}` | `{{}}` | `{{}}` |

**Current correction factor:** `{{The median ratio. If your median is 2.1×, then a
"two-day" estimate is a four-day estimate, and saying so out loud is more honest
than the alternative — which is being surprised in the same direction every time.}}`

Systematic error is correctable and worth tracking. Random error is not, and if the
ratios scatter without a bias, stop tracking this and spend the effort on
decomposing work into smaller pieces instead — small estimates are wrong by less in
absolute terms.

---

## Lessons we keep failing to apply

The uncomfortable section. A lesson recorded twice was not learned the first time,
and the reason is almost never that people forgot — it is that the artifact change
was too weak to enforce it.

| Lesson | Recorded on | Recurred on | Why the fix did not hold |
| --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{}}` | `{{e.g. "the change was a documentation note; nobody reads it at the moment of the decision"}}` |

A lesson in this table needs a **stronger control**, not a repeat of the same one.
The escalation ladder, weakest to strongest: a note in documentation, a checklist
item, a review requirement, an automated check, a type or schema constraint that
makes the mistake impossible. Move up one rung.
