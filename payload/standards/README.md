# standards/

Project-specific **standards overrides and additions** — the other half of the
customization mechanism, alongside [../workflows/](../workflows/) and
[../prompts/](../prompts/).

[../STANDARDS.md](../STANDARDS.md) holds the framework's technology-agnostic rules.
This directory holds the rules that are true **only here**: your language
conventions, your naming schemes, your framework idioms, your compliance
obligations.

---

## The rule

**Never edit [../STANDARDS.md](../STANDARDS.md).** It is replaced on upgrade. Put
your rules here instead, and record any *relaxation* of a framework MUST in
[../PROJECT_CONTEXT.md#12](../PROJECT_CONTEXT.md#12-overrides-and-exceptions), where
it needs an owner and an expiry.

---

## What belongs here

| File | Contents |
| --- | --- |
| `<language>.md` | Language-specific rules — `typescript.md`, `python.md`, `go.md`. Formatting, idioms, what is banned and why. |
| `<framework>.md` | Framework conventions — file layout, where logic lives, which escape hatches are permitted. |
| `naming.md` | This project's naming schemes: tables, endpoints, events, feature flags, branches, metrics. |
| `api.md` | Concrete API conventions beyond [../STANDARDS.md](../STANDARDS.md#13-api-design-standards) — your error shape, pagination style, versioning scheme. |
| `<domain>.md` | Domain rules that are engineering constraints — money handling, PII classes, regulated data. |

## What does not belong here

- **Restatements of framework standards.** If [../STANDARDS.md](../STANDARDS.md)
  already says it, saying it again creates two sources of truth that will diverge,
  and the divergence will be discovered during a review argument.
- **Preferences without a cost.** "We prefer arrow functions" is a formatter
  setting. Configure the formatter; do not write a standard. **A standard that
  cannot be violated in a way that hurts is not a standard, it is decoration** —
  and every decorative rule dilutes the ones that matter.
- **Aspirations.** A rule the codebase does not follow is either enforced from today
  forward with a documented boundary, or it is a
  [../memory/technical-debt.md](../memory/technical-debt.md) entry. It is not a
  standard.

---

## Naming convention

Lowercase, hyphenated, named for the subject: `typescript.md`, `naming.md`,
`database-migrations.md`. One subject per file.

---

## Format

Every rule follows the framework's shape — the level, the rule, the reason, and how
it is enforced.

```markdown
## [Topic]

**MUST** [rule].
*Why:* [the failure this prevents — the cost, specifically]
*Enforced by:* [lint rule / CI check / review checklist item / type system / nothing yet]

**SHOULD** [rule].
*Why:* [...]
*Exception:* [when it is legitimately not followed]
```

`Enforced by: nothing yet` is an acceptable and honest answer, and it is a to-do.
Per [../memory/lessons-learned.md](../memory/lessons-learned.md), an unenforced rule
is the weakest rung on the ladder — it is followed until the first deadline.

---

## Precedence

[../PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) (facts) >
[../DECISIONS.md](../DECISIONS.md) (ADRs) > **this directory** (project MUSTs) >
[../STANDARDS.md](../STANDARDS.md) (framework MUSTs) >
[../KNOWLEDGE.md](../KNOWLEDGE.md) (descriptive).

A rule here that contradicts a framework MUST needs an explicit exception entry in
[../PROJECT_CONTEXT.md#12](../PROJECT_CONTEXT.md#12-overrides-and-exceptions) —
silently overriding a security or accessibility MUST is exactly the failure the
precedence chain exists to prevent.

---

## Review

Prune at every retrospective. Standards accumulate: rules written for a framework
you no longer use, for a problem you solved differently, for a person who has left.
A directory of stale rules trains everyone — human and agent — to skim, and skimming
is how the live rules get missed.
