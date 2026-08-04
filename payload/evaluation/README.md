# evaluation/

Evaluation suites — how this project measures whether behaviour is **correct** when
correctness cannot be asserted by a unit test.

This directory exists mainly for AI features, where output is non-deterministic and
"it looked right in the demo" is the default and entirely inadequate quality bar. It
applies equally to anything else with fuzzy output: ranking, search relevance,
recommendations, generated content.

---

## What belongs here

| File | Contents |
| --- | --- |
| `README-<feature>.md` | What the feature must do, how it is evaluated, and the current scores. |
| `datasets/<name>.md` | Description of an evaluation set: what it contains, where the cases came from, what it deliberately does not cover. |
| `rubrics/<name>.md` | The grading criteria, precise enough that two people grading independently agree. |
| `runs/YYYY-MM-DD-<feature>.md` | A recorded evaluation run with scores and regressions. |
| `adversarial/<name>.md` | Prompt injection, jailbreak, and misuse cases. See below — these are not optional. |

## What does not belong here

- **The eval data itself**, if it is large. It belongs in the repository proper,
  versioned alongside the code. These files describe and interpret it.
- **Anecdotes.** "It handled my test question well" is not an evaluation. One
  observation of a stochastic system tells you almost nothing, which is precisely why
  demos of AI features are so consistently misleading.

---

## The rule that makes evals real

**Write the eval set before the feature.** Cases collected after the implementation
are contaminated by knowledge of how it behaves — you will unconsciously choose cases
it handles, and the score will be high and meaningless.

An eval set that the first implementation scores 95% on was written to be passed.

---

## What an eval suite MUST contain

**Golden cases** — inputs with known-correct outputs. The floor. A regression here
blocks release.

**Edge cases** — empty input, maximum length, wrong language, contradictory
instructions, missing context, ambiguous requests. This is where most real failures
live, and where demo-driven development never looks.

**Adversarial cases** — prompt injection, instruction override, data exfiltration
attempts, attempts to make the system act outside its authority. **Required for any
feature that reads untrusted input or holds a capability a user should not have.**
Per [../STANDARDS.md#19](../STANDARDS.md#19-ai-systems-standards), an AI feature
without an adversarial suite is not ready for production, and the Security Engineer
role blocks it.

**Refusal cases** — what it must decline, and how gracefully. Both directions matter:
over-refusal is a real product defect that is almost never measured, because nobody
writes tests for the requests they wish the system would answer.

**A regression suite** — every bug that has been fixed, kept forever. This is the
cheapest quality mechanism available and the one most often skipped.

---

## Scoring

State, for every suite:

- **The metric** — exact match, rubric score, human preference, task completion.
- **The threshold** — the score below which it does not ship, decided before the
  first run.
- **The grader** — human, model, or deterministic. If a model grades, its own
  agreement with human judgement is itself a number you owe, or you have measured
  one unvalidated system with another.
- **The variance** — run it more than once. A non-deterministic system that scored
  92% once may score anywhere in a range, and reporting a single run as the score is
  a measurement error, not a rounding one.

---

## Run record format

```markdown
# [Feature] evaluation — YYYY-MM-DD

- **Version / model / prompt version:** [all three — any of them changes the result]
- **Suite:** [which sets, how many cases]
- **Runs:** [N, for variance]

| Suite | Score | Threshold | Result |
| --- | --- | --- | --- |
| Golden | 96% (±2) | 95% | pass |
| Adversarial | 3 failures | 0 | **fail** |

## Regressions

Cases that passed previously and now fail. Each becomes a bug, and its class goes to
[../memory/bugs.md](../memory/bugs.md).

## New failures

With the hypothesis for each. A failure with no hypothesis will be fixed by
prompt-tweaking until the number moves, which fixes nothing.
```

---

## Related

- [../STANDARDS.md#19](../STANDARDS.md#19-ai-systems-standards) — AI systems
  standards
- [../CHECKLISTS.md#5](../CHECKLISTS.md#5-ai-checklist) — the gate
- [../KNOWLEDGE.md#11](../KNOWLEDGE.md#11-ai-engineering-best-practices) — the
  background
- [../PROMPTS.md#7](../PROMPTS.md#7-ai-engineering) — prompts for building and
  evaluating AI features
