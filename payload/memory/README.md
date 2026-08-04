# memory/ — Persistent Project Memory

This directory is the agent's long-term state. Everything else in `.ai/` is
knowledge that applies to any project; this is what *this* project has learned,
paid for, and must not forget.

**Why this exists.** An agent starts every session with no memory. Without a
written record, the same architectural argument is had four times, the same bug
class recurs, and the same lesson is learned at the same cost. This directory is
the only mechanism in the framework that makes learning cumulative.

## Files

| File | Holds | Written by |
| --- | --- | --- |
| [project-memory.md](project-memory.md) | The current state of the system and its non-obvious facts. Read first, every session. | Anyone, continuously |
| [decisions.md](decisions.md) | Small decisions that did not warrant an ADR, and the running index of ones that did | Anyone, at decision time |
| [bugs.md](bugs.md) | Bugs by root-cause *class*, not by instance | Whoever fixed it |
| [lessons-learned.md](lessons-learned.md) | What we got wrong and what changed as a result | Retrospectives and postmortems |
| [completed-work.md](completed-work.md) | What shipped, when, and how the estimate compared to reality | At release |
| [technical-debt.md](technical-debt.md) | Debt with measured interest, not a list of things that are ugly | Anyone, on discovery |
| [future-ideas.md](future-ideas.md) | Deliberately deferred work, with the trigger that would start it | Anyone |

## Rules

- **Absolute dates.** `2026-03-14`, never "last month". Relative dates rot the
  moment they are written and every reader afterwards has to guess the epoch.
- **One fact per entry.** An entry covering three things is found by nobody
  searching for any of them.
- **Write the reason, not just the outcome.** "We use Postgres" is in the code.
  "We rejected DynamoDB because our access patterns need ad-hoc joins for the
  reporting path" is memory.
- **Delete what is wrong.** A stale memory entry is worse than none, because
  agents trust this directory. Correct it or remove it — do not leave both
  versions and let the reader arbitrate.
- **Record the class, not just the instance.** One null-pointer bug is an
  instance; "our repository layer returns null instead of raising on a missing
  row, and three call sites have forgotten to check" is the class, and fixing the
  class is what stops the recurrence.
- **This is not a diary.** Nothing goes here that the code, the git history, or
  [DECISIONS.md](../DECISIONS.md) already records. Duplication here means two
  sources of truth, and this one will lose.

## When to write

At minimum: at every retrospective
([CHECKLISTS.md#17](../CHECKLISTS.md#17-postmortem-checklist) and
[TEMPLATES.md#18](../TEMPLATES.md#18-retrospective)), after every incident, when a
non-obvious decision is made, and whenever an agent is surprised by something in
this codebase. A surprise is a gap in the written model, and it is cheapest to fix
in the moment it happens.

## When to read

[project-memory.md](project-memory.md) at the start of every session, per the
reading order in [README.md](../README.md). The others when relevant:
[bugs.md](bugs.md) before fixing a bug, [decisions.md](decisions.md) before
proposing a change to something that looks wrong,
[technical-debt.md](technical-debt.md) before planning.
