# Decision Memory

Two things live here:

1. **The index of formal ADRs** — a pointer into [../DECISIONS.md](../DECISIONS.md)
   so an agent reading memory does not have to open another file to know what has
   already been decided.
2. **Small decisions that did not warrant an ADR** — the ones below the threshold in
   [../DECISIONS.md#1](../DECISIONS.md#1-when-an-adr-is-required) but above the
   threshold of "nobody will ever ask why".

The second category is the reason this file exists. Most projects have an ADR
process for the ten big decisions and nothing at all for the two hundred small ones,
which is where the recurring arguments actually come from.

---

## 1. Formal ADR index

Mirror of the index in [../DECISIONS.md#6](../DECISIONS.md#6-index). If they
disagree, `DECISIONS.md` is correct and this is stale.

| ID | Decision | Status | Date |
| --- | --- | --- | --- |
| [ADR-0001](../DECISIONS.md#adr-0001-adopt-the-ai-engineering-operating-system) | Adopt the AI Engineering Operating System | Accepted | `{{}}` |

---

## 2. Small decisions

Below the ADR bar, above the noise floor. The test for inclusion: **would someone
plausibly propose the opposite in six months, and would answering them take more
than thirty seconds?**

### Entry format

```markdown
### YYYY-MM-DD — [The decision, stated as a decision]

- **Decided by:** [who]
- **Applies to:** [scope — a module, a layer, the whole project]

**Why.** The force in this system that decided it. One or two sentences.

**Rejected.** What we chose against, and the one-line reason.

**Revisit if.** The condition that would change this. Omit only if genuinely
permanent.
```

### Entries

*(Newest first.)*

`{{No entries yet. Add the first one the next time someone asks "why do we do it
this way?" and the answer is not written down anywhere.}}`

---

## 3. Decisions we keep re-litigating

The recurrence register. When the same question comes back a third time, it goes
here with a permanent answer — or an honest note that the answer is genuinely
unsettled, which is also useful.

| Question | Settled answer | Settled on | Reopen only if |
| --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{date}}` | `{{}}` |

A question that lands here more than once without being settled is a signal that
the underlying trade-off is real and the project has never made the call. Making it
explicitly — even choosing "we accept both patterns in these specific places" — is
cheaper than the recurring debate.

---

## 4. Decisions made under pressure

Choices made during an incident, a deadline, or with incomplete information. These
are legitimate; what is not legitimate is letting them quietly become permanent
architecture without anyone revisiting them.

| Date | Decision | Made under | Revisited? |
| --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{incident / deadline / missing information}}` | `{{date, or "no — owner: X, by: date"}}` |

Every row with "no" in the last column is a piece of the system that nobody has
deliberately chosen. Review this table at every retrospective.

---

## Maintenance

- Add an entry at the moment of the decision. A decision recorded a week later is a
  justification.
- When a small decision grows into something expensive to reverse, promote it to a
  formal ADR in [../DECISIONS.md](../DECISIONS.md) and leave a pointer here.
- Delete nothing. Unlike [project-memory.md](project-memory.md), this file is a
  trail — a superseded decision is edited only to note what superseded it.
