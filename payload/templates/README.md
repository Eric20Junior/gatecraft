# templates/

Ready-to-copy document templates, one per file.

[../TEMPLATES.md](../TEMPLATES.md) holds all 18 framework templates in a single
document — good for reading and comparing, awkward for copying. This directory holds
extractable copies plus any template this project needs that the framework does not
provide.

---

## What belongs here

- **Extracted framework templates** — a copy of one section of
  [../TEMPLATES.md](../TEMPLATES.md) as a standalone file you can `cp` into place.
- **Project-specific templates** — the documents your organization requires that the
  framework knows nothing about: a compliance form, a change-advisory record, a
  customer-facing incident notice.
- **Tailored variants** — a framework template with your fields added. Keep the
  framework's sections; add yours. Removing a section is the same act as removing a
  gate, and it belongs in
  [../PROJECT_CONTEXT.md#12](../PROJECT_CONTEXT.md#12-overrides-and-exceptions).

## What does not belong here

- **Filled-in documents.** A completed PRD goes in [../planning/](../planning/), a
  completed research doc in [../research/](../research/), a completed postmortem
  with your incident records. A template directory containing real documents stops
  being usable as a template directory within a month.
- **Code scaffolding.** Boilerplate files, project generators, and starter repos are
  tooling, not documents.

---

## Naming convention

`<document-type>.md`, lowercase and hyphenated, matching the framework's name for
it where one exists:

```
prd.md              rfc.md                  adr.md
implementation-plan.md   api-specification.md   design-document.md
database-document.md     bug-report.md          release-plan.md
test-plan.md             postmortem.md          research-document.md
architecture-document.md feature-request.md     deliverable-report.md
threat-model.md          runbook.md             retrospective.md
```

Project-specific templates take a clear prefix so they are distinguishable at a
glance: `internal-change-request.md`, `internal-vendor-review.md`.

---

## Every template MUST carry a header

```markdown
<!--
Template: [name]
Source: ../TEMPLATES.md#N-slug   (or "project-specific")
Use when: [the trigger]
Delete this comment block when you fill it in.
-->
```

Without the source line, a template that has drifted from the framework version is
indistinguishable from one that was deliberately tailored, and nobody will risk
touching either.

---

## The discipline that makes templates useful

A template is a **checklist wearing a document's clothes**. Its value is entirely in
the sections people would otherwise skip: "what we are giving up", "blast radius if
wrong", "where we got lucky", "what remains unknown".

Two failure modes, both fatal:

1. **Deleting the uncomfortable sections** because they are hard to fill in. They
   are hard to fill in because they are the ones that catch problems. A PRD without
   non-goals is a wish; a postmortem without "where we got lucky" has learned
   nothing.
2. **Filling every section with prose that says nothing** so the document looks
   complete. `{{TBD}}` is more honest than a paragraph of hedging, and it is
   greppable.

Leave a marker for what you do not know. Per
[../SYSTEM.md#14](../SYSTEM.md#14-completion-criteria), an unfilled required section
is an incomplete document, and an incomplete document that looks complete is worse
than a visibly incomplete one.

---

## Related

- [../TEMPLATES.md](../TEMPLATES.md) — all 18 framework templates
- [../CHECKLISTS.md](../CHECKLISTS.md) — the gates these documents feed
- [../WORKFLOW.md](../WORKFLOW.md) — which workflow produces which document
