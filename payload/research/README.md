# research/

Findings from spikes, investigations, and comparisons — the work done to **unblock a
decision**.

Research that unblocks nothing is a hobby. Every document here names the decision it
exists to inform, and closes with a recommendation, per
[../TEMPLATES.md#12](../TEMPLATES.md#12-research-document).

---

## What belongs here

- **Answered questions.** "Can our current database sustain the projected write
  volume?" with the measurement that answers it.
- **Option comparisons.** Three candidates, evaluated against criteria written down
  *before* the evaluation started — otherwise the criteria will be reverse-engineered
  from the preferred answer, which is the most common failure mode in this genre.
- **Spike reports.** What was built to learn something, what was learned, and
  explicit confirmation that the spike code was **thrown away**.
- **Negative results.** The approach that did not work, and why. These are the most
  valuable documents in the directory and the ones least likely to be written,
  because nobody feels like writing up a dead end. Write it anyway: without it,
  someone re-runs the same dead end next year and pays the cost twice.

## What does not belong here

- **Open questions.** Those live in
  [../memory/project-memory.md](../memory/project-memory.md) until they are
  answered.
- **Decisions.** The decision that follows from research goes in
  [../DECISIONS.md](../DECISIONS.md), linking back here. Research recommends; ADRs
  decide.
- **Spike code.** Delete it. Per
  [../TEMPLATES.md#12](../TEMPLATES.md#12-research-document), a spike is code written
  under the explicit agreement that it will not ship — and the agreement is only real
  if the code is actually deleted. Spike code that survives becomes production code
  nobody reviewed.

---

## Naming convention

`YYYY-MM-DD-<question>.md` — `2026-02-11-queue-vs-outbox-for-webhooks.md`.

The date is first because research **expires**. A benchmark from two years ago
describes a version of a system that no longer exists, and its age needs to be
visible before anyone reads a word of it.

---

## Every document MUST state

1. **The question** — one sentence, answerable.
2. **The decision it unblocks** — if there is none, stop and do something else.
3. **The timebox** — set before starting, and honoured. Research without a timebox
   expands to fill the available schedule and produces a survey instead of an answer.
4. **What "answered" means** — the evidence that would end the investigation. Decided
   in advance, so the finish line cannot move.
5. **What remains unknown** — the boundary of what was actually established. This
   section is what separates research from advocacy.
6. **The recommendation** — with a confidence level, and what would change it.

---

## The honesty rules

**Record the criteria before the evaluation.** Otherwise you are writing a
justification, and everyone downstream will treat it as one.

**Measure, do not estimate.** "Postgres should handle this" is an opinion.
"Postgres handled 12k writes/sec on the target instance class with our schema and a
representative index set, degrading past 15k" is a finding. Only one of them
survives being wrong in production.

**State the confounds.** Benchmarks run on a laptop, with an empty table, without
concurrent load, do not measure what they appear to measure. Say so in the document
rather than leaving it for the person who trusts it.

**Timebox expiry is a result.** "We spent the agreed three days and cannot answer
this without building it" is a legitimate finding that unblocks a decision — usually
the decision to scope a prototype, or to pick the reversible option and move on.

---

## Related

- [../TEMPLATES.md#12](../TEMPLATES.md#12-research-document) — the template
- [../CHECKLISTS.md#19](../CHECKLISTS.md#19-research-checklist) — the gate
- [../PROMPTS.md#17](../PROMPTS.md#17-research) — prompts for running the research
- [../DECISIONS.md](../DECISIONS.md) — where the outcome lands
