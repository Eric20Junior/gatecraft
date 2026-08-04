# architecture/

The living architecture of **this** system. Not architecture theory — that is
[../KNOWLEDGE.md](../KNOWLEDGE.md#3-architectural-patterns). This directory answers
"how is this thing actually built, today."

---

## What belongs here

| File | Purpose |
| --- | --- |
| `system-overview.md` | **Required.** The single page that orients a new agent or engineer. Kept current. |
| `adr/NNNN-short-title.md` | Individual Architecture Decision Records, if you keep them as files rather than inline in [../DECISIONS.md](../DECISIONS.md). |
| `<component>.md` | A design document per significant component, from [../TEMPLATES.md#6](../TEMPLATES.md#6-design-document). |
| `data-model.md` | Entities, relationships, ownership. From [../TEMPLATES.md#7](../TEMPLATES.md#7-database-document). |
| `threat-model.md` | From [../TEMPLATES.md#16](../TEMPLATES.md#16-threat-model). Required before shipping auth, payments, or PII handling. |
| `diagrams/` | Source files for diagrams. Text-based formats only — see below. |

## What does not belong here

- **Aspirational architecture.** A design that has not been built goes in
  [../planning/](../planning/) or [../research/](../research/). This directory
  describes what exists. Mixing the two is how architecture documents become
  untrustworthy, and an untrustworthy document is worse than none — it is read and
  believed.
- **Decisions.** The *choice* and its rationale go in
  [../DECISIONS.md](../DECISIONS.md). The *result* of the choice goes here. An
  architecture document that argues with itself has swallowed an ADR.
- **API reference.** Generated from the source of truth (schema, spec file), not
  hand-maintained here.
- **Binary diagram exports.** A `.png` cannot be diffed, so it cannot be reviewed,
  so it will drift. Commit the source (Mermaid, PlantUML, D2, Graphviz) and generate
  images in CI if you need them.

---

## Naming convention

- Lowercase, hyphenated: `payment-processing.md`, not `PaymentProcessing.md`.
- ADRs: `adr/NNNN-short-title.md` with a zero-padded four-digit sequence —
  `adr/0007-adopt-event-sourcing-for-ledger.md`. Numbers are never reused, even for
  rejected ADRs.
- One component per file. A file covering three components will be updated for one
  of them and go stale for the other two.

---

## The staleness rule

**Every file here MUST carry a `Last verified: YYYY-MM-DD` line.** Not "last
edited" — *verified*, meaning someone read it against the code and confirmed it is
still true.

A document verified more than 90 days ago is treated as **unverified**, and an agent
reading it MUST say so rather than relying on it. This is the only mechanism that
reliably keeps architecture documentation honest: the alternative is trusting that
people remember to update prose when they change code, which they do not.

Architecture is updated as part of the change that alters it, per
[../WORKFLOW.md#5](../WORKFLOW.md#5-architecture-workflow) — not in a documentation
sweep afterwards.

---

## Related

- [../TEMPLATES.md#13](../TEMPLATES.md#13-architecture-document) — the template
- [../CHECKLISTS.md#1](../CHECKLISTS.md#1-architecture-checklist) — the gate
- [../STANDARDS.md](../STANDARDS.md) — what the architecture MUST satisfy
- [../PROJECT_CONTEXT.md#5](../PROJECT_CONTEXT.md#5-architecture) — the summary an
  agent reads first
