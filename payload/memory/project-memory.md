# Project Memory

**Read this at the start of every session, after [SYSTEM.md](../SYSTEM.md) and
[PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md).**

This is the current, working state of the system: what is true right now, what is
non-obvious, and what an agent will get wrong without being told. It is a *living*
document — entries are edited and deleted as reality changes, not appended to
forever. The historical trail lives in [lessons-learned.md](lessons-learned.md),
[completed-work.md](completed-work.md), and [../DECISIONS.md](../DECISIONS.md).

- **Last updated:** `{{YYYY-MM-DD}}`
- **Updated by:** `{{who}}`

---

## 1. Where the system is right now

`{{Two or three sentences. What is the current state of the work — what shipped
most recently, what is in flight, what is blocked. An agent should be able to read
this and know whether they are joining a stable system or one mid-migration.}}`

**In flight right now:**

| Work | Owner | State | Notes |
| --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{}}` | `{{}}` |

**Mid-migration, do not assume consistency:** `{{Anything half-done — two schemas
live, two auth paths, an old and a new client. This is the single most valuable
line in this file when it applies, because half-migrated systems are where agents
do the most damage by assuming uniformity.}}`

---

## 2. Non-obvious facts about this codebase

Things that are true, surprising, and not discoverable by reading the code in the
time an agent has.

| Fact | Why it matters | Evidence / where |
| --- | --- | --- |
| `{{e.g. "The `orders` table is append-only; updates go through `order_revisions`."}}` | `{{what breaks if you assume otherwise}}` | `{{file, ADR, or incident}}` |

---

## 3. Things that look wrong and are not

The Chesterton's Fence register. Every entry here has saved someone from a
confident, well-intentioned regression.

| What looks wrong | Why it is that way | Do not change without |
| --- | --- | --- |
| `{{}}` | `{{}}` | `{{who to ask / which ADR / what test to run first}}` |

---

## 4. Things that look right and are not

The inverse, and the more dangerous list. Code that reads as correct, passes
review, and is subtly wrong or unsafe to extend.

| What | The actual problem | Status |
| --- | --- | --- |
| `{{}}` | `{{}}` | `{{tracked / accepted / being fixed by whom}}` |

---

## 5. Where the sharp edges are

Areas where changes break things unexpectedly. An agent should slow down here.

| Area | Why it is fragile | What to do before changing it |
| --- | --- | --- |
| `{{module or path}}` | `{{no tests / high coupling / nobody understands it / performance-critical}}` | `{{write characterization tests / ask X / run the load test}}` |

---

## 6. Assumptions currently in force

Things we are proceeding on that have not been verified. Each is a bet, and each
should have a way to find out it was wrong.

| Assumption | Made when | How we would find out it is false | Owner |
| --- | --- | --- | --- |
| `{{}}` | `{{date}}` | `{{}}` | `{{}}` |

---

## 7. Open questions

Things nobody currently knows, that block or bias decisions.

| Question | Blocks | Owner | Asked on |
| --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{}}` | `{{date}}` |

An open question with no owner is not open, it is abandoned. Assign one or delete
the row.

---

## 8. People and ownership

Who to ask, for what. Roles, not just names, so the entry survives a departure.

| Area | Who | Role |
| --- | --- | --- |
| `{{}}` | `{{}}` | `{{}}` |

**Bus factor of one:** `{{Areas where exactly one person holds the knowledge.
Naming them is the first step to fixing them.}}`

---

## 9. External dependencies and their behaviour

Not the list of packages — the *behaviour* of things we depend on that surprised
us.

| Dependency | Behaviour worth knowing | Learned when |
| --- | --- | --- |
| `{{e.g. payment provider}}` | `{{e.g. "returns 200 with a failure body; the status code is not the outcome"}}` | `{{date / incident}}` |

---

## 10. Recent changes worth knowing about

A short rolling window — roughly the last month or two. Older entries move to
[completed-work.md](completed-work.md).

| Date | Change | Consequence for anyone working here now |
| --- | --- | --- |
| `{{YYYY-MM-DD}}` | `{{}}` | `{{}}` |

---

## Maintenance

Update this file when:

- Something surprises you. The surprise is the signal; write it down before you
  normalize it.
- A migration starts or finishes.
- An assumption is confirmed or falsified — move it out of section 6 either way.
- An open question is answered — record the answer and delete the row.
- An entry becomes wrong. **Delete it.** Do not annotate it as outdated; an agent
  scanning for facts will read the fact, not the annotation.

Prune at every retrospective. This file is useful in proportion to how much of it
is currently true, and a long file that is half stale is read carelessly, which is
worse than a short one read closely.
