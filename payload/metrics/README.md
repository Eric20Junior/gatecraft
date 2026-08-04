# metrics/

Measured numbers about this system and this team. **Measured** — not targets, not
estimates, not what the dashboard showed once.

The purpose of this directory is to make claims falsifiable. "It's fast enough",
"the tests are good", "we ship regularly" are all unfalsifiable until someone writes
down a number and a date.

---

## What belongs here

| File | Contents |
| --- | --- |
| `baselines.md` | Current measured values for every metric that has a standard attached — the number every future change is compared against. |
| `budgets.md` | The limits. Latency, bundle size, cost per request, error rate. Each with what happens when it is breached. |
| `YYYY-MM-DD-<subject>.md` | A specific measurement run: load test, profiling session, cost analysis. |
| `delivery.md` | Delivery metrics — lead time, deployment frequency, change failure rate, time to restore. |

## What does not belong here

- **Vanity numbers.** A metric that nobody would act on differently at any value is
  decoration. Before adding one, state the decision it would change.
- **Live dashboards.** Link to them; do not transcribe them. A copied number is
  stale on arrival and cannot be distinguished from a current one.
- **Targets without measurements.** A target on its own is a wish. Record the
  measurement next to it or the target will drift into folklore.

---

## Naming convention

Standing files keep stable names (`baselines.md`, `budgets.md`, `delivery.md`) and
are edited in place. One-off measurement runs are dated:
`2026-05-20-load-test-checkout.md`.

---

## Every number MUST carry its conditions

A number without conditions is not a measurement, it is an anecdote.

```markdown
| Metric | Value | Measured | Conditions | Source |
| --- | --- | --- | --- | --- |
| p99 checkout latency | 340 ms | 2026-05-20 | prod, 1.2k rps, warm cache, EU region | [link to run] |
```

**Conditions** is the column that determines whether the number means anything.
Latency measured against an empty database, throughput measured without concurrent
load, and cost measured during a quiet week are all real numbers that describe a
system nobody is running.

Always record the **percentile, not the average.** An average latency hides the
experience of everyone who had a bad time, and those are the users who leave. Per
[../STANDARDS.md](../STANDARDS.md#11-performance-standards), performance budgets are
stated at p95 or p99.

---

## Budgets need consequences

```markdown
| Budget | Limit | Current | On breach |
| --- | --- | --- | --- |
| Bundle size (initial) | 250 KB gzipped | 218 KB | CI fails the build |
| p99 API latency | 500 ms | 340 ms | Alert; blocks release per CHECKLISTS.md#12 |
```

**A budget with no consequence is a suggestion, and it will be exceeded within two
quarters.** The "on breach" column is what makes it a budget: a failing build, a
blocked release, a page. If you cannot name a consequence you are willing to accept,
you do not have a budget — you have a preference, and you should say so rather than
pretending otherwise.

---

## Re-measure, and keep the old numbers

Baselines go stale silently. Re-measure at every release, and **keep the history** —
a single current number tells you where you are; a series tells you which direction
you are moving, which is the actionable part.

A metric that has not been re-measured in six months should be marked stale rather
than quietly trusted. The same rule as [../architecture/](../architecture/): an
unverified number that looks current is more dangerous than a missing one.

---

## Related

- [../STANDARDS.md#11](../STANDARDS.md#11-performance-standards) — performance
  standards
- [../STANDARDS.md#23](../STANDARDS.md#23-scalability-standards) — scalability
- [../CHECKLISTS.md#10](../CHECKLISTS.md#10-performance-checklist) — the gate
- [../memory/completed-work.md](../memory/completed-work.md) — delivery actuals
- [../evaluation/](../evaluation/) — quality measurement for AI behaviour
