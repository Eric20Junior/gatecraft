# Future Ideas

Work that is **deliberately not being done yet**, with the condition that would start
it.

This file exists to distinguish *"not yet"* from *"never"*, which are different
answers to the same request and are routinely confused. An idea recorded here with a
trigger is a decision; an idea living in someone's head is a recurring conversation.

**Every entry MUST have a trigger.** Without one, this file becomes a graveyard of
good intentions that nobody reads and nobody deletes — which is what a backlog
already is. The trigger is what makes it actionable: a measurement, a threshold, a
date, or an event that would change the answer.

Related: [technical-debt.md](technical-debt.md) for work that is costing money now,
[decisions.md](decisions.md) when the deferral is itself a decision worth recording,
[../PROJECT_CONTEXT.md#3](../PROJECT_CONTEXT.md#3-scope-and-non-goals) for what is
permanently out of scope.

---

## Entry format

```markdown
### [The idea, in one line]

- **Recorded:** YYYY-MM-DD by [who]
- **Category:** [capability / performance / architecture / operations / developer
  experience]

**What.** What it would do, briefly.

**Why not now.** The honest reason. "Not enough evidence it matters", "the cheaper
version is sufficient at current scale", "blocked on X", "we do not have the skills
in-house". Vagueness here is what turns this file into a wish list.

**Trigger.** The specific condition that would make this worth doing. A number, a
date, or an event.

**Estimated size.** Rough order of magnitude — days, weeks, months. Enough to know
whether it fits somewhere.

**Decays if.** What would make this idea obsolete rather than pending. Some ideas
should be deleted rather than done, and saying so in advance is easier than saying it
later.
```

---

## Register

| Idea | Trigger | Size | Recorded | Category |
| --- | --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{}}` | `{{}}` | `{{}}` |

---

## Entries

*(Newest first.)*

`{{No entries yet. The first usually arrives from the first release's "cut from
scope" — see completed-work.md.}}`

---

## Triggered — now live work

Ideas whose trigger has fired. Move them here when it happens, then out of this file
entirely once they are planned. A triggered idea that sits here for two months means
nobody is watching the triggers.

| Idea | Trigger fired | Noticed | Status |
| --- | --- | --- | --- |
| `{{}}` | `{{what happened}}` | `{{date}}` | `{{planned / in flight / re-deferred with a new trigger}}` |

---

## Retired

Ideas we are explicitly not doing, ever. Kept so they are not re-proposed.

| Idea | Why retired | Date |
| --- | --- | --- |
| `{{}}` | `{{the context changed / it was solved another way / the evidence never materialized}}` | `{{}}` |

---

## Maintenance

**Review at every planning cycle.** Two questions per entry:

1. Has the trigger fired? If yes, move it to the triggered section and plan it.
2. Has it decayed? If yes, retire it. **Deleting ideas is the discipline that keeps
   this file worth reading.**

An entry that survives four review cycles untouched, with a trigger that has not
moved closer, is usually not deferred work — it is a preference nobody has been
willing to reject out loud. Retire it. If it matters, it will come back, and it will
come back with evidence.
