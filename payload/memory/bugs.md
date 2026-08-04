# Bug Memory

Bugs recorded **by root-cause class**, not by instance. One null-check bug is a
ticket; "the repository layer returns null on a missing row and callers keep
forgetting to check" is a class, and only the class-level record stops the third
occurrence.

**Write an entry when:** a bug reaches an environment where it costs someone time,
or when a bug is the second of its kind. Do not record every defect caught in
review — that is the process working, and recording it here dilutes the file.

Read this before fixing a bug. There is a reasonable chance the class already has
an entry, and the entry names the fix that actually works.

Related: [lessons-learned.md](lessons-learned.md) for process failures,
[technical-debt.md](technical-debt.md) when the class is structural,
[../PLAYBOOKS.md#4](../PLAYBOOKS.md#4-fixing-a-production-bug) for the fix
procedure.

---

## Entry format

```markdown
### BUG-NNNN: [Class name — the mechanism, not the symptom]

- **First seen:** YYYY-MM-DD
- **Occurrences:** N (dates)
- **Severity when it occurs:** [critical / high / medium / low]
- **Status:** [open / mitigated / class eliminated]

**Symptom.** What it looks like from outside — what a user or an alert sees. This
is what someone will search for.

**Mechanism.** Why it actually happens. The specific code path, data condition, or
timing. If two occurrences had different mechanisms, they are different classes;
split them.

**Why it was not caught.** The test, review, type, or gate that should have caught
this and did not. This is the highest-value field and the one most often left
blank.

**Fix applied.** What was done for the instance, and whether it addressed the
class.

**Class elimination.** What would make this category impossible — a type, a lint
rule, an invariant at a boundary, a schema constraint, a removed API. If nothing
has been done, say so; an open class is a prediction of the next occurrence.

**Detection.** How we would know if it happened again, and how fast.

**Related.** Sibling call sites, similar classes, the ADR if the fix changed a
decision.
```

---

## Open classes

Bug classes that can still occur. Each is a prediction; the count of occurrences is
the evidence.

| ID | Class | Occurrences | Last seen | Eliminated by |
| --- | --- | --- | --- | --- |
| `{{BUG-0001}}` | `{{}}` | `{{}}` | `{{}}` | `{{what would close it, and who owns that}}` |

---

## Eliminated classes

Kept permanently. These are the entries that prove the process works, and they stop
someone reintroducing the pattern that caused them.

| ID | Class | Eliminated by | Date |
| --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{the structural change}}` | `{{}}` |

---

## Entries

*(Add entries below, newest first.)*

---

## The escalation rule

**A class with three occurrences is not a bug, it is a design problem.** At the
third instance, stop fixing instances: open a
[technical-debt.md](technical-debt.md) entry with the measured interest, and treat
elimination as work with an owner and a date. Per
[../PLAYBOOKS.md#14](../PLAYBOOKS.md#14-paying-down-technical-debt).

The counting matters. Teams routinely fix the same class six times over two years
without noticing, because each fix is individually cheap and no one is holding the
tally. This file is the tally.
