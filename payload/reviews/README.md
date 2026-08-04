# reviews/

Records of completed reviews — code reviews with findings worth keeping, security
reviews, architecture reviews, and readiness assessments.

Most code review happens in your pull request tool and stays there. That is correct.
**This directory is for reviews whose findings must outlive the pull request**:
because they gate a release, because they satisfy an obligation, or because the
finding is a pattern rather than an instance.

---

## What belongs here

| File | Contents |
| --- | --- |
| `YYYY-MM-DD-security-<subject>.md` | Security review, per [../WORKFLOW.md#15](../WORKFLOW.md#15-security-review-workflow). Required before shipping auth, payments, or PII handling. |
| `YYYY-MM-DD-architecture-<subject>.md` | Architecture review against [../CHECKLISTS.md#1](../CHECKLISTS.md#1-architecture-checklist). |
| `YYYY-MM-DD-readiness-<subject>.md` | A production readiness score with the evidence for all ten dimensions, per [../SYSTEM.md#10](../SYSTEM.md#10-quality-gates). |
| `YYYY-MM-DD-code-<subject>.md` | A code review whose findings are structural — the kind that produce a standard, not a comment thread. |

## What does not belong here

- **Routine PR comments.** They live in the PR. Copying them here creates an archive
  nobody reads and a maintenance burden nobody accepted.
- **Approvals with no content.** "LGTM" recorded as a document is worse than
  useless: it constitutes evidence of a review that did not happen, and it will be
  cited as such.

---

## Naming convention

`YYYY-MM-DD-<type>-<subject>.md`. Type is one of `security`, `architecture`,
`readiness`, `code`, `accessibility`, `performance`.

---

## Record format

```markdown
# [Type] review — [subject]

- **Date:** YYYY-MM-DD
- **Reviewer(s):** [who — by role, per ../AGENTS.md]
- **Subject:** [commit, PR, component, or release]
- **Standard applied:** [which checklist or standard, with a link]
- **Verdict:** APPROVED / APPROVED WITH CONDITIONS / BLOCKED

## Findings

| # | Severity | Finding | Location | Disposition |
| --- | --- | --- | --- | --- |
| 1 | critical / major / minor | [what is wrong, and what it causes] | [file:line] | fixed / accepted / deferred |

## Conditions

For "approved with conditions": each condition, its owner, and its deadline. A
condition without both is an approval.

## Accepted risks

Anything not fixed, with who accepted it and why. Mirror it into
[../PROJECT_CONTEXT.md#12](../PROJECT_CONTEXT.md#12-overrides-and-exceptions) —
that file is where accepted risk is tracked, and a risk accepted only inside a
review record is a risk nobody will find again.

## Evidence

What was actually examined. Files read, tests run, tools executed, threat model
consulted. A review whose scope is unstated cannot be trusted later, because
"reviewed" is assumed to mean "all of it" and it never does.
```

---

## Two rules

**A finding states the consequence, not just the deviation.** "This does not follow
the standard" is a comment. "This allows a tenant to read another tenant's invoices
because the query filter is applied after pagination" is a finding. The second gets
fixed today.

**Severity is about blast radius, not effort.** A one-line fix that prevents data
loss is critical. A large refactor that improves readability is minor. Conflating
"hard to fix" with "important" is how critical findings get deferred into
[../memory/technical-debt.md](../memory/technical-debt.md) and stay there.

---

## Security review has veto power

Per [../AGENTS.md](../AGENTS.md), the Security Engineer role can block a release
outright, and that block is not overridable by schedule pressure. When it is
overridden anyway, the override is a decision — record it in
[../DECISIONS.md](../DECISIONS.md) with the name of the person who made it. Decisions
made under pressure also belong in
[../memory/decisions.md](../memory/decisions.md#4-decisions-made-under-pressure), so
they get revisited rather than silently becoming policy.
