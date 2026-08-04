# Technical Debt

**Debt is only debt if it charges interest.** Code that is ugly, unfashionable, or
not how you would have written it is not debt — it is a preference, and paying it
costs real capacity that a genuine debt needed.

Every entry in this register MUST state the **interest**: what it costs *per month*,
measured, not asserted. An entry without measured interest is a complaint, and it
will be prioritized against real work and lose, correctly.

Acceptable evidence of interest:

- Defect density in the area — bugs per change, compared with elsewhere
- Time to make a typical change here versus in comparable code
- Incidents traced to it, with dates
- Engineers who decline to touch it, and what that reroutes
- Onboarding time attributable to it
- Direct cost — infrastructure, licence, or model spend the debt causes

Related: [../PROMPTS.md#assess-and-prioritize-technical-debt](../PROMPTS.md#assess-and-prioritize-technical-debt)
for the assessment procedure,
[../PLAYBOOKS.md#14](../PLAYBOOKS.md#14-paying-down-technical-debt) for paying it
down, [bugs.md](bugs.md) when a bug class turns out to be structural.

---

## Entry format

```markdown
### DEBT-NNNN: [What it is, specifically]

- **Recorded:** YYYY-MM-DD
- **Taken deliberately?** [yes — to make date X / no — accumulated]
- **Location:** [paths or modules]
- **Classification:** [pay now / pay soon / monitor / accept permanently]

**Interest.** What it costs per month, with the evidence. Numbers.

**Principal.** What paying it off would cost — engineer-days, with a confidence
range.

**Risk if unpaid.** What could go wrong, not just what is slow. Some debt is merely
expensive; some is an incident waiting for a trigger.

**Growth.** Is the interest rising, flat, or falling? Debt in a module nobody touches
is falling; debt in the module every feature crosses is compounding.

**Trigger to reclassify.** The condition that would move this from "monitor" to "pay
soon". Without one, monitored debt is ignored debt.

**Owner.** Who decides, not who fixes.
```

---

## Register

| ID | What | Interest / month | Principal | Class | Owner | Trigger |
| --- | --- | --- | --- | --- | --- | --- |
| `{{DEBT-0001}}` | `{{}}` | `{{}}` | `{{}}` | `{{}}` | `{{}}` | `{{}}` |

---

## Entries

*(Newest first.)*

`{{No entries yet. The first is usually recorded at the first release where
something was cut to make a date — see completed-work.md, "Debt taken".}}`

---

## Accepted permanently

Debt we have decided not to pay, ever, with the reason. This section prevents the
same items being re-proposed each quarter by someone who does not know the call was
already made.

| What | Why we accept it | Decided | Reopen only if |
| --- | --- | --- | --- |
| `{{}}` | `{{e.g. "stable, rarely touched, and the rewrite is 20 days against near-zero interest"}}` | `{{date}}` | `{{}}` |

**Ugly and stable is not debt.** A module nobody has changed in two years, that has
caused no incidents, charges no interest regardless of how it reads. Put it here and
stop re-litigating it.

---

## Paid off

Kept as a record of what the repayment actually cost versus the estimate — the same
calibration value as
[lessons-learned.md](lessons-learned.md#estimate-calibration), for a category of work
that is estimated especially badly.

| ID | What | Principal estimated | Actual | Interest actually eliminated |
| --- | --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{}}` | `{{}}` | `{{did the predicted saving materialize? If not, that is the finding.}}` |

The last column is the honest one. Debt repayment is frequently justified with a
predicted saving that nobody checks afterwards, and a project that never verifies it
cannot tell productive repayment from expensive tidying.

---

## Review

Review this register:

- At every planning cycle — the "pay now" items should be bundled into work that
  already touches the area, which is when repayment is cheapest.
- After every incident — an incident often reveals that monitored debt was
  underpriced.
- At every retrospective — check whether any "monitor" item has hit its trigger, and
  whether the interest figures are still current.

An unreviewed register decays into a wish list within two quarters.
