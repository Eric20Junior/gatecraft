# DECISIONS.md — Architecture Decision Records

This file is the memory of *why*. Code records what the system does; this records
why it does it that way and what was rejected.

**An ADR here outranks general guidance.** [KNOWLEDGE.md](KNOWLEDGE.md) says what
patterns are; [STANDARDS.md](STANDARDS.md) says what you MUST do; this file says
what *this project already decided*. If an ADR conflicts with either, the ADR wins
until it is superseded — and if you believe an ADR is wrong, write a superseding
ADR. Do not quietly deviate. Silent deviation is how a codebase acquires two
architectures.

Keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are used per RFC 2119.

Contents:

1. [When an ADR is required](#1-when-an-adr-is-required)
2. [ADR lifecycle](#2-adr-lifecycle)
3. [The ADR template](#3-the-adr-template)
4. [How to write one that is worth reading](#4-how-to-write-one-that-is-worth-reading)
5. [Superseding an ADR](#5-superseding-an-adr)
6. [Index](#6-index)
7. [Worked example](#7-worked-example)

---

## 1. When an ADR is required

An ADR is **required** when a decision is:

- **Expensive to reverse** — a data model, a service boundary, a persistence
  technology, an authentication model, a public API contract, a deployment topology.
- **Cross-cutting** — it constrains code that other people will write, in places
  they will not think to look.
- **Contested** — reasonable engineers disagreed, or you expect them to later.
- **Surprising** — the choice is not what a competent engineer would guess. Without
  an ADR, the next person will "fix" it. See Chesterton's Fence in
  [KNOWLEDGE.md](KNOWLEDGE.md#chestertons-fence).
- **An accepted risk** — a security exception, a known scaling limit, a deliberate
  piece of debt. An accepted risk with no written accepter is an unaccepted risk.
- **A rejection** — you evaluated something obvious and said no. Rejections save
  more time than acceptances, because otherwise the same option is re-proposed every
  six months by someone who does not know it was considered.

An ADR is **not required** for:

- Reversible, local choices — a variable name, a helper's location, a loop form.
- Anything the standards already mandate. Do not write an ADR restating
  [STANDARDS.md](STANDARDS.md); write one only where you deviate from it.
- Decisions with a single viable option and no trade-off. If there was no choice,
  there is no decision — but be honest about whether there truly was none.

The test: **would a competent engineer arriving in a year ask "why is it like
this?"** If yes, write the ADR now, while you still remember the reason. You will
not remember it in a year; nobody does.

---

## 2. ADR lifecycle

An ADR has exactly one status at a time:

| Status | Meaning |
| --- | --- |
| **Proposed** | Written, under discussion, not yet binding. |
| **Accepted** | Binding. Code MUST conform, or an exception MUST be recorded. |
| **Rejected** | Considered and declined. Kept forever — the reasoning is the value. |
| **Superseded** | Replaced by a later ADR. Kept forever, with a link forward. |
| **Deprecated** | No longer applies because the context vanished (the system it governed was removed). Kept, with a note. |

**ADRs are immutable once accepted.** You do not edit an accepted ADR to reflect a
new decision; you write a new one that supersedes it. The value of this file is the
trail, and editing history away destroys it. The only permitted edits to an accepted
ADR are: fixing a typo, adding a link to a superseding ADR, and appending to a
clearly-marked "Outcome" section once the consequences are known.

Numbering is sequential and never reused. `ADR-0007` refers to one decision forever,
even if that decision was rejected.

---

## 3. The ADR template

Copy this for each new record. Keep it in this file for small projects, or as
`architecture/adr/NNNN-short-title.md` with an index entry here once the count
passes roughly twenty.

```markdown
## ADR-NNNN: [Short imperative title — the decision, not the topic]

- **Status:** Proposed | Accepted | Rejected | Superseded by ADR-NNNN | Deprecated
- **Date:** YYYY-MM-DD
- **Deciders:** [names or roles who own this decision]
- **Consulted:** [who was asked]
- **Supersedes:** [ADR-NNNN, or none]

### Context

What is true that forces a decision now? State the constraint, the measurement, or
the requirement — not the solution. Include the numbers: current load, expected
growth, team size, deadline, budget, regulatory requirement.

Anyone reading this in two years must be able to tell whether the context still
holds. If it no longer does, the decision is a candidate for supersession, and that
judgement is only possible if the context was written down concretely.

### Decision

What we will do, stated as a decision in active voice: "We will use X for Y."

State the scope precisely: what this applies to, and what it does not.

### Options considered

At least three, including do-nothing. For each:

**Option A — [name]**
- How it works, in two sentences.
- Pros, specific to our context.
- Cons, specific to our context.
- Cost: build, run, and reverse.

**Option B — [name]**
...

**Option C — [name]**
...

### Rationale

Why the chosen option, in terms of the forces in *this* system. Name the specific
constraint that decides it. "It is a best practice" is not a rationale; "reads are
200× writes and the read shapes are five denormalized views" is.

State the single strongest argument against this choice and why we are proceeding
anyway. An ADR with no counter-argument was not a real decision.

### Consequences

**Accepted costs.** What becomes harder, slower, or more expensive. Be specific and
honest; this is the section future readers will check against reality.

**What this constrains.** What future decisions this forecloses or biases.

**What we must now do.** Follow-on work this creates, with owners.

**How we would reverse it.** The migration path, its estimated cost, and the point
past which reversal becomes impractical. If there is no reversal path, say so
explicitly — that raises the bar for accepting the ADR at all.

### Revisit triggers

The conditions under which this decision should be reconsidered. Be concrete:
"when write throughput exceeds 5,000/s", "when the team passes 15 engineers",
"when the vendor's price changes", "by 2027-01-01 regardless".

An ADR with no revisit trigger becomes permanent by inertia.

### Outcome

*(Appended later, once the consequences are observable.)* What actually happened.
Was the rationale correct? Did the accepted costs match the prediction? This section
is what turns a decision log into a source of calibration.
```

---

## 4. How to write one that is worth reading

**Write the context before you know the answer.** An ADR written after the fact
tends to be a justification rather than a decision, and it will omit the options you
never seriously considered — which are exactly the ones a future reader needs to
know were considered.

**Three options minimum, and one of them is do-nothing.** Two options is usually a
preference dressed as a comparison. Do-nothing is a real option with a real cost and
it is astonishingly often the right one; excluding it is how systems acquire
components nobody needed.

**Quantify the context.** "High traffic" tells a future reader nothing. "4,200 rps
peak, growing 8% monthly, p99 budget 200ms" lets them determine, in two years,
whether the decision still holds.

**Name the accepted cost.** Every decision has one. An ADR that lists only benefits
is marketing, and it will be quoted back at you when the cost arrives unannounced.

**State the counter-argument.** If you cannot construct a good argument against your
own choice, you have not understood the alternatives well enough to reject them.

**Keep it short.** One to two pages. Length is not rigour. If it needs more, the
supporting analysis belongs in [research/](research/) with a link from here.

**Link it from the code.** An ADR nobody finds is an ADR nobody follows. A comment
at the surprising line — `// See .ai/DECISIONS.md ADR-0007` — is what makes the
record load-bearing.

**Do not write one per commit.** A file of forty trivial ADRs is as useless as no
ADRs, because the important ones are no longer findable.

---

## 5. Superseding an ADR

When a decision changes:

1. Write a **new** ADR with the next number. Its Context section MUST state what
   changed since the original — a new measurement, a new requirement, a failed
   assumption, a vanished constraint. "We changed our minds" is not a context.
2. Reference the original in **Supersedes**.
3. Edit the original's **Status** to `Superseded by ADR-NNNN` and add nothing else.
4. State the migration in the new ADR's Consequences: is the old decision being
   unwound, or does it remain in place for existing code while new code follows the
   new rule? Two live rules with no boundary is worse than either rule.
5. Update the [index](#6-index).

If the original ADR's prediction was wrong, say so in its **Outcome** section. That
is the most valuable sentence in this entire file, and the hardest to write.

---

## 6. Index

Maintain this table as ADRs are added. It is the entry point; nobody reads the file
top to bottom.

| ID | Title | Status | Date | Supersedes | Superseded by |
| --- | --- | --- | --- | --- | --- |
| [ADR-0001](#adr-0001-adopt-the-ai-engineering-operating-system) | Adopt the AI Engineering Operating System | Accepted | — | — | — |

*Add a row for every ADR. An ADR not in the index does not exist in practice.*

---

## 7. Worked example

The framework's own adoption, recorded as an ADR so the format has a live instance
rather than a hypothetical one.

### ADR-0001: Adopt the AI Engineering Operating System

- **Status:** Accepted
- **Date:** *(fill in on adoption)*
- **Deciders:** *(engineering owner)*
- **Consulted:** *(the team)*
- **Supersedes:** none

#### Context

Work in this repository is done by a mix of humans and AI agents. Agents produce
plausible output quickly, which is precisely the failure mode that matters: plausible
and wrong is more expensive than obviously wrong, because it passes casual review and
reaches production.

Three concrete symptoms motivated this:

- Agents stop at the first solution that appears to work, with no comparison of
  alternatives and no record of what was not considered.
- Quality is asserted rather than demonstrated. "Tests pass" is claimed without the
  output; "it is secure" is claimed without a threat model.
- Knowledge does not accumulate. The same defect class, the same architectural
  argument, and the same operational surprise recur because nothing was written down
  in a place the next agent would read.

The constraint: any fix MUST work without modifying the agent runtime, MUST be
portable across tools and models, and MUST NOT require a human to be in the loop for
routine work — otherwise it would replace one bottleneck with another.

#### Decision

We will adopt a repository-local `.ai/` directory containing a technology-agnostic
engineering operating system: a kernel of reasoning rules
([SYSTEM.md](SYSTEM.md)), role definitions ([AGENTS.md](AGENTS.md)), lifecycle
workflows ([WORKFLOW.md](WORKFLOW.md)), a binary standards bar
([STANDARDS.md](STANDARDS.md)), verification checklists
([CHECKLISTS.md](CHECKLISTS.md)), operational playbooks
([PLAYBOOKS.md](PLAYBOOKS.md)), and persistent memory
([memory/](memory/)).

Every agent working in this repository reads [README.md](README.md) first and
follows the reading order it specifies. Scope: all engineering work in this
repository, human or agent.

#### Options considered

**Option A — Do nothing; rely on prompt quality per task.**
- How it works: each engineer writes a good prompt each time.
- Pros: zero setup cost; no artifact to maintain.
- Cons: quality varies per person and per day; nothing accumulates; the same
  mistakes recur; context must be re-established every session. The symptoms above
  are exactly the output of this option, so it is already measured.
- Cost: zero to build, high and recurring to run, zero to reverse.

**Option B — Tool-specific configuration (a single rules file for one agent tool).**
- How it works: encode the rules in whatever config file the current tool reads.
- Pros: minimal, directly consumed by the tool, no indirection.
- Cons: locked to one vendor; the file has a practical length limit well below what
  this content needs; it cannot hold per-project memory, playbooks, or artifacts;
  switching or adding tools means rewriting it.
- Cost: low to build, low to run, moderate to reverse (rewrite per tool).

**Option C — A portable `.ai/` directory (chosen).**
- How it works: a version-controlled directory of Markdown, referenced by a short
  pointer from whatever config file the current tool reads.
- Pros: tool-agnostic; version-controlled and reviewable like code; holds
  accumulated memory and artifacts, not only rules; a human can read it; it
  survives a change of model or vendor.
- Cons: substantial content to write and, more importantly, to maintain; risk of
  drift between the documents and the codebase; agents must actually read it, which
  costs context budget.
- Cost: high to build once, low to run, low to reverse (delete the directory).

#### Rationale

The deciding force is **accumulation**. Options A and B both lose what is learned:
A keeps it in people's heads, B keeps it in a file too small and too vendor-specific
to hold project memory. The recurring cost in the context above is not that any
single piece of work is bad — it is that the same correction is made repeatedly and
never sticks. Only C provides a durable place for a lesson to live where the next
agent will read it.

Portability is the secondary force: the agent tooling in use will change within the
horizon of this codebase, and a decision that has to be redone at every vendor change
is not a decision worth making once.

**The strongest argument against:** this is a large body of documentation, and
documentation rots. A `.ai/` directory that describes a system as it was eighteen
months ago is worse than none, because agents will follow it confidently. We accept
this because the cost is mitigated rather than eliminated: the framework's own
maintenance rules require every retrospective and postmortem to name the artifact it
changes, which converts drift correction into a routine step rather than a project.

#### Consequences

**Accepted costs.** Every agent session spends context budget reading the core
documents. Framework updates require review like code. There is a maintenance
obligation: a document that contradicts the codebase MUST be fixed in the same change
as the code, and this will occasionally slow a change down.

**What this constrains.** Standards in [STANDARDS.md](STANDARDS.md) become binding.
Work that would previously have shipped now blocks at a gate. This is the intent,
and it will feel like friction before it feels like quality.

**What we must now do.**
- Fill in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) with this repository's actual
  facts. The framework is inert without it.
- Initialize [memory/project-memory.md](memory/project-memory.md).
- Add the pointer from the repository's root agent-instruction file.
- Record every subsequent significant decision here.

**How we would reverse it.** Delete `.ai/` and remove the pointer. There is no data
migration and no code dependency. Reversal cost is minutes; the loss is the
accumulated memory, which is why it is version-controlled.

#### Revisit triggers

- The documents are observed to contradict the codebase more than once in a quarter —
  the maintenance model is not working.
- An agent runtime provides equivalent durable, portable project memory natively.
- Six months after adoption, review whether defect classes are actually recurring
  less. If they are not, this framework is overhead and should be cut down to what
  is demonstrably used.

#### Outcome

*(To be appended after the first review. Record whether recurrence actually dropped,
whether the documents drifted, and which sections were never read.)*
