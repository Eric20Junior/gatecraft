# TEMPLATES.md — Document Templates

Eighteen templates for engineering work. Copy the fenced block, fill every field, delete nothing. An empty field is information: write "None" or "Not applicable, because…" rather than removing the heading.

Individual copies live in [templates/](templates/) for direct copying. Full context lives in [SYSTEM.md](SYSTEM.md), [WORKFLOW.md](WORKFLOW.md), [STANDARDS.md](STANDARDS.md), and [CHECKLISTS.md](CHECKLISTS.md).

**The rule:** every field in these templates exists because someone once got burned by its absence. A template used properly forces you to answer the question that would have derailed the work three days in. A template used badly — fields skipped, vague answers, copy-paste from the last one — is worse than no template, because it creates the illusion of rigour.

Contents:

1. [Product Requirements Document (PRD)](#1-product-requirements-document-prd)
2. [Request for Comments (RFC)](#2-request-for-comments-rfc)
3. [Architecture Decision Record (ADR)](#3-architecture-decision-record-adr)
4. [Implementation Plan](#4-implementation-plan)
5. [API Specification](#5-api-specification)
6. [Design Document](#6-design-document)
7. [Database Document](#7-database-document)
8. [Bug Report](#8-bug-report)
9. [Release Plan](#9-release-plan)
10. [Test Plan](#10-test-plan)
11. [Postmortem](#11-postmortem)
12. [Research Document](#12-research-document)
13. [Architecture Document](#13-architecture-document)
14. [Feature Request](#14-feature-request)
15. [Deliverable Report](#15-deliverable-report)
16. [Threat Model](#16-threat-model)
17. [Runbook](#17-runbook)
18. [Retrospective](#18-retrospective)

---

## 1. Product Requirements Document (PRD)

**Use when:** Building something users will notice, before design or implementation begins.

**Owner:** Product Manager Agent

```markdown
# PRD: [Feature/Product Name]

## Problem Statement

[What problem exists? For whom? What evidence do we have that this is real and worth solving? Quantify the cost of the current state.]

## Target Users

[Who experiences this problem? Personas with roles, goals, constraints, and current workflows.]

## Jobs to Be Done

[What functional job is the user hiring this feature to do? Frame as "When I ___, I want to ___, so I can ___."]

## Goals

[What outcomes must this achieve? Each measurable and time-bound.]

## Non-Goals

[What is explicitly out of scope? This is the scope-creep firewall.]

## User Stories

[Each story with acceptance criteria that are falsifiable and testable.]

- **As a** [role], **I want** [capability], **so that** [benefit].
  - **Acceptance criteria:**
    1. [Testable criterion]
    2. [Testable criterion]
    3. [Testable criterion]

## Success Metrics

[How will we know this worked? Each metric with baseline, target, timeframe, and instrumentation plan.]

| Metric | Baseline | Target | Timeframe | Instrumentation |
|--------|----------|--------|-----------|-----------------|
| [Metric name] | [Current value] | [Target value] | [When measured] | [How captured] |

## Scope (MoSCoW)

**Must have:**
- [Critical requirement]

**Should have:**
- [Important but not critical]

**Could have:**
- [Nice to have]

**Won't have:**
- [Explicitly deferred]

## UX Requirements

[Every UI state: empty, loading, partial, complete, error. Include accessibility requirements per WCAG 2.1 AA minimum.]

## Dependencies

[What must exist or be built first? Internal systems, external services, data, approvals.]

## Risks

[What could go wrong? Likelihood, impact, mitigation, detection, owner.]

| Risk | Likelihood | Impact | Mitigation | Detection | Owner |
|------|------------|--------|------------|-----------|-------|
| [Risk description] | [L/M/H] | [L/M/H] | [How we reduce it] | [How we know it happened] | [Role] |

## Open Questions

[Unresolved items that could change the work. Each with owner and deadline for resolution.]

## Launch Criteria

[What must be true before this ships? Gates, approvals, documentation, verified metrics.]
```

**Quality bar:**
- Falsifiable acceptance criteria — each one testable, not "improve UX" but "search results appear within 200ms at p95".
- Evidence for the problem — user research, support tickets, quantified pain, not "users want this".
- Every UI state specified including empty and error — "loading state shows skeleton with accessible status" not "add loading".
- Non-goals as a firewall — specific enough to reject scope creep: "Won't have: export to PDF in v1" not "Won't have: everything else".
- Instrumentation planned before launch — how each success metric will be captured, not left to figure out later.

---

## 2. Request for Comments (RFC)

**Use when:** Proposing a significant change that needs review from multiple stakeholders before implementation.

**Owner:** System Architect or relevant domain specialist

```markdown
# RFC-[NUMBER]: [Title]

## Summary

[One paragraph: what is being proposed and why.]

## Motivation

[What problem does this solve? What evidence do we have? Why now?]

## Detailed Design

[The proposal in enough detail that someone else could implement it. Include interfaces, data structures, algorithms, failure modes, migration path.]

## Alternatives Considered

[At least two genuine alternatives, each with rationale for rejection. If only one alternative exists, say so rather than inventing a strawman.]

### Alternative 1: [Name]

[Description]

**Pros:**
- [Advantage]

**Cons:**
- [Disadvantage]

**Why not chosen:** [Specific reason]

## Drawbacks

[What are we giving up? Cost, complexity, constraints, technical debt, what breaks if we're wrong?]

## Unresolved Questions

[What remains unknown? Each with owner and deadline.]

## Migration Path

[For existing systems: how do we get from current state to proposed state without breaking anything? Include rollback plan.]

## Review Requests

- **[Role]:** [What aspect should this role focus on?]
- **[Role]:** [What aspect should this role focus on?]

## Decision Log

[Append as discussion happens]

- **[Date]:** [Decision or feedback]
- **[Date]:** [Decision or feedback]
```

**Quality bar:**
- Genuine alternatives — not strawmen, each representing a real path someone might advocate for.
- Migration path for existing systems — incremental steps that leave the system working, not "we'll figure it out".
- Specific review requests — "Security Engineer: assess the token storage approach" not "please review".
- Unresolved questions owned and timeboxed — not left hanging indefinitely.

---

## 3. Architecture Decision Record (ADR)

**Use when:** Recording any decision about structure, technology, data model, or public contract that is expensive to reverse.

**Owner:** System Architect

```markdown
# ADR-[NUMBER]: [Title]

**Date:** [YYYY-MM-DD]

**Status:** [Proposed | Accepted | Superseded | Deprecated | Rejected]

**Owner:** [Name or role]

**Deciders:** [Names or roles who approved this]

## Context and Forces

[What situation and forces are driving this decision? Include requirements, constraints, and the pain of the current state if replacing something.]

## Requirements and Constraints

[What must be true? Performance targets, compliance, budget, team capability, timeline, vendor lock-in tolerance.]

## Options

### Option 1: [Name]

[Description with enough detail to evaluate]

**Pros:**
- [Advantage with evidence]

**Cons:**
- [Disadvantage with evidence]

**Complexity:** [L/M/H with reason]

**Cost:** [Initial and ongoing, or "negligible"]

**Risk:** [What could go wrong and how likely]

### Option 2: [Name]

[Repeat structure]

### Option 3: [Name]

[Repeat structure]

## Decision

[What option was chosen, in one sentence.]

## Rationale

[Why this option, on the axes that actually mattered. Be honest: "We chose boring over optimal because the team has no Rust experience and hiring is frozen."]

## What We Are Giving Up

[Make the trade-offs explicit. Every decision rejects something — name it.]

## Consequences

**Positive:**
- [What improves]

**Negative:**
- [What gets worse or harder]

**Neutral:**
- [What changes without clear valence]

## Blast Radius if Wrong

[What breaks if this decision proves incorrect? Is it fixable or catastrophic?]

## Reversibility

[Can this be undone? Easily, with effort, or never? If never, that informed the rigour above.]

## Revisit Trigger

[What change in context would make us reconsider? Growth, new evidence, vendor change, team change, requirements change.]

## Approvals

- **[Role]:** [Approved | Conditional | Rejected] on [date]

## Links

**Supersedes:** [ADR-XXX] (if applicable)

**Superseded by:** [ADR-YYY] (if applicable)
```

**Quality bar:**
- At least three genuine options evaluated — including "do nothing" and "simplest thing" where applicable.
- Honest rationale on the axes that mattered — not post-hoc justification, but the real deciding factors including constraints.
- Explicit trade-offs — "We're giving up performance for debuggability" not "this is the best choice".
- Reversibility assessed — one-way doors got more rigour than two-way doors.
- Revisit trigger defined — not "if it stops working" but specific conditions like "if monthly cost exceeds $10k" or "if team grows beyond 5 engineers".

---

## 4. Implementation Plan

**Use when:** An objective is larger than a single sitting and needs decomposition before work begins.

**Owner:** Planner Agent

```markdown
# Implementation Plan: [Title]

**Date:** [YYYY-MM-DD]

**Owner:** [Role]

## Objective

[One sentence, stated as an outcome not an activity. "Users can reset their password without contacting support" not "Build password reset flow".]

## Acceptance Criteria

[Numbered, falsifiable, testable. Each one either passes or fails with no judgment call.]

1. [Criterion]
2. [Criterion]
3. [Criterion]

## Non-Goals

[Explicitly out of scope. This is what stops scope creep mid-execution.]

## Milestones

[Each independently verifiable and leaving the system working. No milestone ends with a broken build, red tests, or a half-migrated schema.]

### Milestone 1: [Name]

**Delivers:** [What works after this that did not before]

**Verified by:** [How we know it works]

**Leaves system working:** [Confirm: yes, because ___]

## Tasks

| # | Task | Deliverable | Verification | Dependencies | Risk |
|---|------|-------------|--------------|--------------|------|
| 1 | [Task] | [Artifact produced] | [How verified] | [Task numbers or "none"] | [L/M/H] |

## Assumptions

[Each with the signal that would tell you it is wrong.]

| Assumption | Detection Signal |
|------------|------------------|
| [What we are assuming] | [How we would find out it is false] |

## Risks

| Risk | Likelihood | Impact | Mitigation | Detection | Owner |
|------|------------|--------|------------|-----------|-------|
| [Risk] | [L/M/H] | [L/M/H] | [Reduction action] | [Signal] | [Role] |

## Sequencing and Critical Path

[What must be serial, what can be parallel, what is on the critical path. Sequence by risk: the thing most likely to invalidate the plan goes first.]

**Critical path:** [Task numbers in order]

**Parallelizable:** [Task numbers that can run concurrently]

## Rollback Plan

[How to undo this if it goes wrong in production. Required for anything touching persistent data, external contracts, or production configuration.]

## Estimates

[Ranges with confidence, not single numbers. A single number implies certainty you do not have.]

| Milestone | Optimistic | Likely | Pessimistic | Confidence |
|-----------|------------|--------|-------------|------------|
| [Name] | [Time] | [Time] | [Time] | [0-100 with reason] |
```

**Quality bar:**
- Another engineer could execute it without asking questions — the actual test of a plan.
- Riskiest unknown sequenced first — not the most comfortable task.
- Every milestone leaves the system working — verifiable, not aspirational.
- Assumptions paired with detection signals — "we assume the vendor API supports batch writes; we will know within 2 hours of the spike".
- Rollback designed with the action, not after — especially for schema changes and external contracts.

---

## 5. API Specification

**Use when:** Defining or changing any endpoint that another system or team will call.

**Owner:** Backend Engineer, reviewed by System Architect

```markdown
# API: [Endpoint Name]

## Endpoint

`[METHOD] /path/to/resource`

## Purpose

[What this endpoint does, in one sentence, from the caller's perspective.]

## Authentication

**Method:** [Bearer token | API key | mTLS | None]

**Required scopes:** [Specific scopes, or "none"]

**Authorization:** [Object-level ownership checks, role requirements. Not just "authenticated".]

## Rate Limits

[Requests per window, per what dimension (user, IP, API key), and behaviour when exceeded.]

## Request

### Path Parameters

| Name | Type | Required | Constraints | Description |
|------|------|----------|-------------|-------------|
| [name] | [type] | [yes/no] | [format, range, length] | [meaning] |

### Query Parameters

| Name | Type | Required | Default | Constraints | Description |
|------|------|----------|---------|-------------|-------------|
| [name] | [type] | [yes/no] | [value] | [format, range] | [meaning] |

### Headers

| Name | Required | Description |
|------|----------|-------------|
| [name] | [yes/no] | [purpose] |

### Body Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| [field] | [type] | [yes/no] | [validation rules] | [meaning] |

## Responses

### [Status Code] — [Meaning]

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| [field] | [type] | [yes/no] | [meaning] |

## Error Catalogue

[Every error this endpoint can return, with a machine-readable code the caller can branch on.]

| Status | Code | Meaning | Caller Action |
|--------|------|---------|---------------|
| 400 | `INVALID_INPUT` | [Specific condition] | [Fix and retry] |
| 401 | `UNAUTHENTICATED` | [Condition] | [Re-authenticate] |
| 403 | `FORBIDDEN` | [Condition] | [Do not retry] |
| 404 | `NOT_FOUND` | [Condition] | [Do not retry] |
| 409 | `CONFLICT` | [Condition] | [Resolve and retry] |
| 429 | `RATE_LIMITED` | [Condition] | [Back off per Retry-After] |
| 500 | `INTERNAL_ERROR` | [Condition] | [Retry with backoff] |

## Idempotency

[Is this endpoint idempotent? If not naturally, how is idempotency achieved — idempotency key header, natural key, conditional request? What happens on duplicate submission?]

## Pagination

**Strategy:** [Cursor | offset | none]

**Parameters:** [How the caller requests the next page]

**Response fields:** [How the caller knows there is more]

**Maximum page size:** [Limit and behaviour when exceeded]

## Versioning

**Current version:** [Version identifier]

**Version mechanism:** [URL path | header | query param]

**Deprecation policy:** [Notice period, sunset process]

## Examples

### Success

**Request:**
\`\`\`http
[Complete request with headers and body]
\`\`\`

**Response:**
\`\`\`http
[Complete response with status, headers, body]
\`\`\`

### Error

**Request:**
\`\`\`http
[Complete request that triggers the error]
\`\`\`

**Response:**
\`\`\`http
[Complete error response]
\`\`\`

## Backward Compatibility

[What changed from the previous version? Which changes are breaking? What is the migration path for existing callers?]
```

**Quality bar:**
- Complete error catalogue with machine-readable codes — callers branch on codes, not on message strings.
- Idempotency behaviour stated explicitly — anything retryable will be retried, including by clients you did not write.
- Worked examples that actually work — copy-pasteable and executed to confirm, including the error case.
- Authorization beyond authentication — object-level ownership checks named, not just "requires token".
- Constraints on every input — types, ranges, formats, max lengths. Unvalidated input is the top security failure.

---

## 6. Design Document

**Use when:** A feature or component needs its structure settled before implementation.

**Owner:** System Architect or the implementing Engineer

```markdown
# Design: [Component/Feature Name]

**Date:** [YYYY-MM-DD]

**Owner:** [Role]

## Context

[What situation makes this necessary? What exists today? What is the driving force?]

## Goals

[What this design must achieve, measurably.]

## Non-Goals

[What this design deliberately does not address.]

## Proposed Design

[The design itself. Structure, components, responsibilities, and how they interact. Include a diagram description if the structure is non-obvious.]

## Data Model

[Entities, relationships, ownership, lifecycle. Who owns each piece of state, and where the single source of truth lives.]

## Interfaces

[Public surfaces: APIs, function signatures, events, message formats. Interfaces are expensive to change; internals are cheap.]

## Failure Modes and Handling

[For every dependency and every operation: what happens when it is slow, down, or returns wrong data? Timeouts, retries with backoff, circuit breakers, idempotency, graceful degradation.]

| Failure | Detection | Handling | User Impact |
|---------|-----------|----------|-------------|
| [What fails] | [How we know] | [What the system does] | [What the user sees] |

## Security Considerations

[Authentication, authorization, input validation, output encoding, secrets, data exposure, injection surfaces. Assume an attacker with a valid account.]

## Performance Considerations

[Expected load, latency targets, resource use, hot paths, caching strategy, and what is measured to confirm.]

## Observability Plan

[What logs, metrics, and traces exist so that "is it healthy?", "what is it doing?", and "why did that request fail?" are answerable from telemetry alone.]

## Testing Strategy

[What is tested at which level, and how failure paths and negative cases are covered.]

## Rollout Plan

[How this reaches production: flags, canary, percentage rollout, migration ordering, and the rollback path.]

## Alternatives

[What else was considered and why it was not chosen.]

## Open Questions

[What remains unresolved, with owner and deadline.]
```

**Quality bar:**
- Failure modes designed with the happy path, not after — undefined failure behaviour is a design defect, not an edge case.
- Interfaces defined before internals — the expensive part settled first.
- Observability specified as a deliverable — not "add logging later".
- Security considered against a specific adversary — an attacker with a valid account and your source code.
- Alternatives named — a design with no rejected alternatives was not designed, it was assumed.

---

## 7. Database Document

**Use when:** Introducing or changing a schema, or documenting an existing data store.

**Owner:** Database Engineer

```markdown
# Database: [Store or Domain Name]

**Date:** [YYYY-MM-DD]

**Engine and version:** [e.g. PostgreSQL 16]

**Owner:** [Role]

## Entities and Relationships

[Each entity, what it represents in the domain, and how it relates to the others. Cardinality stated explicitly: one-to-many, many-to-many with the join table named.]

## Schema

### [table_name]

[What this table represents. One sentence.]

| Column | Type | Null | Default | Constraints | Description |
|--------|------|------|---------|-------------|-------------|
| [name] | [type] | [yes/no] | [value or none] | [PK, FK→table.col, UNIQUE, CHECK …] | [meaning] |

## Indexes

[Every index with the specific query it serves. An index without a named query is either dead weight or an untested guess.]

| Index | Columns | Type | Serves This Query | Justification |
|-------|---------|------|-------------------|---------------|
| [name] | [columns, in order] | [btree/hash/gin/partial…] | [The query, or its location] | [Why this shape, and why not an existing index] |

## Access Patterns

[How this data is actually read and written. Reads and writes are different problems; list both.]

| Pattern | Frequency | Read/Write | Path | Index Used |
|---------|-----------|------------|------|------------|
| [What the application does] | [per second/day] | [R/W] | [Code location] | [Index name or "full scan, acceptable because…"] |

## Volume and Growth

| Table | Rows Today | Growth Rate | Rows at 12 Months | What Breaks First |
|-------|------------|-------------|-------------------|-------------------|
| [name] | [count] | [per day/month] | [projection] | [The query, index, or resource that degrades first] |

## Retention and Deletion

[How long each class of data is kept, what triggers deletion, and whether deletion is hard or soft. Deletion must reach backups, replicas, caches, and derived data — state where it reaches and where it does not.]

| Data | Retention | Deletion Trigger | Hard/Soft | Reaches Backups? |
|------|-----------|------------------|-----------|------------------|
| [class] | [period] | [event or schedule] | [hard/soft] | [yes/no + how] |

## Migration History

[Every migration in order, with what it did and whether it was reversible. Expand-migrate-contract steps recorded as separate entries.]

| Migration | Date | Change | Reversible | Notes |
|-----------|------|--------|------------|-------|
| [id/name] | [YYYY-MM-DD] | [What it did] | [yes/no] | [Backfill, lock duration, phase] |

## Backup and Restore

**Backup:** [Method, frequency, retention, storage location, encryption.]

**Restore procedure:** [Numbered, executable steps. Not a description — the actual commands.]

1. [Step]
2. [Step]

**Last tested restore:** [YYYY-MM-DD] — [outcome, and time taken]

**Measured RTO:** [Time to restore service, from the tested run — not the target]

**Measured RPO:** [Maximum data loss window, from the tested run]
```

**Quality bar:**
- Every index justified by a named query — indexes cost write throughput and storage; unjustified ones are debt.
- Access patterns documented alongside the schema — the schema alone does not tell you whether it will perform.
- Growth projected with what breaks first — "at 50M rows the unindexed status filter goes sequential" is useful; "it should scale" is not.
- Restore procedure tested with a date and measured RTO/RPO — an untested backup is not a backup.
- Deletion policy states where it reaches — including backups and derived data, because "delete" that leaves copies is a compliance finding.

---

## 8. Bug Report

**Use when:** Reporting a defect, before diagnosis begins.

**Owner:** Whoever observed it; triaged by QA Engineer

```markdown
# Bug: [One-line symptom, observable, not diagnostic]

**Reported:** [YYYY-MM-DD HH:MM TZ]

**Reporter:** [Role]

## Environment

[Environment name, OS, browser or client, region, and any relevant configuration or feature-flag state.]

## Version

**Version:** [Release identifier]

**Commit:** [SHA]

## Severity

**Severity:** [Critical | High | Medium | Low]

**Definition applied:** [State the definition, so the label is auditable. e.g. "Critical: data loss, security exposure, or complete unavailability for all users."]

## Reproduction

[Minimal numbered steps. Minimal means every step removed that does not affect the outcome.]

1. [Step]
2. [Step]
3. [Step]

## Expected

[What should happen, and where that expectation comes from — spec, acceptance criterion, or documented behaviour.]

## Actual

[What happens instead. Observable facts only.]

## Frequency

[Always | intermittent with a rate | specific conditions only. If intermittent, state what is known about the trigger — an intermittent reproduction means the trigger is not yet understood.]

## First Observed

[When it was first seen, and whether it is a regression. If a regression, the last known-good version.]

## Blast Radius

[Who and what is affected: users, records, downstream systems. Is data corrupted or leaked? Is it getting worse?]

## Evidence

[Logs, traces, stack traces, screenshots, correlation IDs, request IDs. Attach the actual output, redacted of secrets and personal data.]

**Correlation IDs:** [IDs that let someone else find this in telemetry]

## Workaround

[Anything users or operators can do meanwhile. Write "None known" if none.]

## Suspected Area

[Where the problem likely lives, marked as inference not evidence. Say "unknown" rather than guessing.]
```

**Quality bar:**
- Reproduction is minimal and numbered — someone else can follow it cold and see the failure.
- Severity states the definition used — otherwise the label is opinion and triage is a negotiation.
- Evidence includes correlation IDs — so a diagnoser can find the failure in telemetry rather than reproducing from scratch.
- Blast radius assessed before diagnosis — data damage and exposure change the workflow from bug fix to incident.
- Expected behaviour cites its source — "should" without a source is a feature request wearing a bug's clothes.

---

## 9. Release Plan

**Use when:** Cutting a release intended for users.

**Owner:** Release Manager

```markdown
# Release Plan: [Version]

**Target date:** [YYYY-MM-DD]

**Release Manager:** [Role]

## Version

**Version:** [Semantic version]

**Bump rationale:** [Why major/minor/patch, per VERSION.md. Breaking changes get a major bump, honestly, even when inconvenient.]

## Frozen Scope

[Exactly what is in this release. Frozen means frozen: late additions arrive under-reviewed and are the most common source of release failures.]

| Change | Type | Author | Gates Passed |
|--------|------|--------|--------------|
| [Description] | [feature/fix/chore] | [Role] | [Evidence link] |

## Breaking Changes and Migration

[Each breaking change, who it affects, and the exact steps a consumer must take. "None" is a valid and welcome entry.]

| Breaking Change | Affects | Migration Steps | Communicated On |
|-----------------|---------|-----------------|-----------------|
| [What changed] | [Which consumers] | [Numbered actions] | [YYYY-MM-DD] |

## Gate Evidence

[Every gate, with evidence rather than memory. A gate marked passed without evidence has not passed.]

| Gate | Status | Evidence |
|------|--------|----------|
| Architecture | [Pass/N/A] | [Link or artifact] |
| Code quality | [Pass] | [Link] |
| Security | [Pass] | [Link] |
| Performance | [Pass/N/A] | [Link] |
| Testing | [Pass] | [Link] |
| Documentation | [Pass] | [Link] |
| Accessibility | [Pass/N/A] | [Link] |
| QA sign-off | [Pass] | [Who, when] |

## Success Signals

[Defined before releasing. Defining these after deploying means you will see what you hope to see.]

| Signal | Baseline | Healthy Range | Measured Where |
|--------|----------|---------------|----------------|
| [Metric] | [Value] | [Range] | [Dashboard/query] |

## Abort Criteria

[Pre-defined conditions that trigger a rollback without further debate. Roll back on ambiguity.]

- [Condition, e.g. "error rate above 1% sustained for 5 minutes"]
- [Condition]

## Rollout Strategy

[Canary, percentage, blue-green, or all-at-once with justification. Feature flags for anything risky, so exposure is decoupled from deployment.]

| Stage | Traffic | Duration | Proceed If |
|-------|---------|----------|------------|
| [Stage] | [%] | [Time] | [Signal condition] |

## Rollback Procedure

[Numbered, executable steps. Verified by exercising it, not by reading it.]

1. [Step]
2. [Step]

**Rollback verified on:** [YYYY-MM-DD] — [outcome and time taken]

## Migration Ordering

[Schema changes deploy before the code that needs them and must be backward-compatible with the currently-running version for the whole rollout window. Expand, migrate, contract — never in one step.]

| Order | Action | Backward Compatible With Previous Version? |
|-------|--------|--------------------------------------------|
| 1 | [Migration or deploy step] | [yes + how] |

## Communication Plan

| Audience | Message | Channel | When | Owner |
|----------|---------|---------|------|-------|
| [Who] | [What they need to know] | [Where] | [Before/during/after] | [Role] |

## On-Call

**During rollout:** [Role or name, and how to reach them]

**For the 24 hours after:** [Role or name]

## Go/No-Go

**Decision:** [Go | No-Go]

**Date:** [YYYY-MM-DD HH:MM TZ]

| Role | Approver | Decision | Notes |
|------|----------|----------|-------|
| Release Manager | [Name] | [Go/No-Go] | [Conditions] |
| QA | [Name] | [Go/No-Go] | [Conditions] |
| Security Engineer | [Name] | [Go/No-Go] | [Conditions] |
```

**Quality bar:**
- Success signals and abort criteria written before the release, not after — with numeric thresholds, not "looks fine".
- Rollback exercised with a date — a documented rollback is a hope; a tested one is a plan.
- Gate evidence linked, not asserted — "QA passed" with no artifact is an unverified claim.
- Migration ordering proven backward-compatible for the whole rollout window — the old version runs against the new schema.
- Named approvers with an absolute timestamp — a go/no-go without names is not a decision anyone owns.

---

## 10. Test Plan

**Use when:** Building or fixing a feature, before implementation is complete, to define what must be proven.

**Owner:** QA Engineer

```markdown
# Test Plan: [Feature/Component Name]

**Date:** [YYYY-MM-DD]

**Owner:** [Role]

## What Must Be True

[The invariants and acceptance criteria this plan proves. Each one falsifiable.]

## Risk-Based Coverage Matrix

[Map each acceptance criterion to tests at the appropriate level. Risk drives coverage depth: auth gets more coverage than CSS.]

| Acceptance Criterion | Test Level | Test Location | Risk | Coverage Rationale |
|---------------------|------------|---------------|------|-------------------|
| [Criterion] | [unit/integration/e2e] | [File path or suite] | [L/M/H] | [Why this level suffices or why multiple levels] |

## Edge Cases

[Enumerated, not "we'll test edge cases". Each one a specific input or condition.]

1. [Edge case: zero, one, boundary, maximum]
2. [Edge case]

## Failure Paths

[What happens when dependencies fail, inputs are malformed, or the happy path cannot complete. Each failure mode tested.]

| Failure | Expected Behaviour | Test |
|---------|-------------------|------|
| [Dependency slow] | [Timeout, fallback, or error] | [Test name/location] |
| [Dependency down] | [Circuit break, degrade, or fail] | [Test name/location] |
| [Invalid input] | [400 with specific code] | [Test name/location] |

## Negative Cases

[Explicit tests that the system refuses what it should refuse: unauthorized access, invalid state transitions, constraint violations.]

## Security Tests

[Auth, authz, injection, data exposure. Assume an attacker with a valid account and the source code.]

| Attack Vector | Test | Expected Outcome |
|---------------|------|------------------|
| [Vector] | [Test] | [System behaviour] |

## Performance Tests

[Load, latency, resource use — with numeric targets from the requirements, not "should be fast".]

| Test | Target | Measured Where | Pass Threshold |
|------|--------|----------------|----------------|
| [Load test] | [X req/sec at pYY latency] | [Tool/dashboard] | [Numbers] |

## Test Data Strategy

[How test data is sourced, isolated, and cleaned up. Anonymized production snapshots, fixtures, generated, or factories.]

## Environment

[Where tests run: local, CI, staging. Each level with what it can and cannot verify.]

## Known Gaps

[Explicitly stated. Untested things are risks; unstated untested things are unknown risks.]

- [What remains untested and why: limitation, cost, dependency]
```

**Quality bar:**
- Coverage justified by risk — auth and payments get more than CSS; state the reason per criterion rather than testing everything equally.
- Edge cases enumerated specifically — zero, one, boundary, maximum, not "we'll test edge cases".
- Failure paths tested, not just the happy path — every dependency has at least one failure test proving graceful handling.
- Negative cases explicit — tests that unauthorized requests are rejected, not just that authorized ones succeed.
- Known gaps stated — untested areas with reasons, so risk is visible and owned.

---

## 11. Postmortem

**Use when:** After any incident, outage, data issue, or security event, to understand root cause and prevent recurrence.

**Owner:** Incident Commander or the on-call who responded

```markdown
# Postmortem: [Incident Title]

**Date of incident:** [YYYY-MM-DD]

**Date of postmortem:** [YYYY-MM-DD]

**Author:** [Role]

**Blameless statement:** This postmortem is blameless. We are analyzing systems and processes, not individuals. Naming specific people is prohibited — use roles and systems only. The goal is learning, not accountability.

## Summary

[What happened, to whom, for how long, in two or three sentences. Plain language: "the payment API returned 500s for 47 minutes, preventing 230 transactions".]

## User Impact

[Quantified. Users affected, transactions lost, data corrupted, revenue impact, SLA breach if applicable.]

- **Users affected:** [Count or %]
- **Duration:** [From HH:MM to HH:MM TZ, total duration]
- **Scope:** [Geographic, feature, customer tier]
- **Data integrity:** [Corrupted, lost, or intact]

## Severity

**Severity:** [Critical | High | Medium | Low]

**Definition applied:** [State the definition, so the label is auditable.]

## Detection

**How detected:** [Alert, user report, monitoring, chance]

**Time to detection:** [From first failure to first awareness — absolute timestamps and duration]

**Why this long?** [If detection was slow, what would have made it faster?]

## Timeline

[Absolute timestamps in a consistent timezone. What happened, what was observed, what action was taken. Include the false starts and the red herrings — those are data.]

- **YYYY-MM-DD HH:MM TZ:** [Event]
- **HH:MM:** [Observation or action]
- **HH:MM:** [Event]

## Root Cause

[The root cause, singular. "Multiple causes" means you have not finished the analysis. Use the five whys: keep asking why until you reach a cause you can fix.]

**Root cause:** [One sentence.]

**Five-whys chain:**

1. [Why did the incident happen?]
2. [Why did that happen?]
3. [Why did that happen?]
4. [Why did that happen?]
5. [Why did that happen? — This is the root cause.]

## Contributing Factors

[Things that made it worse or longer, but were not the root cause. Monitoring gaps, deployment risk, lack of rollback, tight coupling, missing timeout.]

## What Went Well

[Celebrate what worked. Fast detection, clean rollback, good communication, an alarm that fired correctly.]

## What Went Badly

[What made this harder than it needed to be. Missing runbook, unclear ownership, untested rollback, alarm fatigue.]

## Where We Got Lucky

[The near-misses. What *could* have gone wrong but did not, by chance. "If this had happened during peak hours…", "If the backup had also been corrupted…" Luck is not a strategy; these become action items.]

## Action Items

[Each one specific, with type (prevent/detect/mitigate), owner, due date, and tracking link. "Improve monitoring" is not an action. "Add an alarm on X metric with Y threshold, owned by Z, due DATE, tracked in LINK" is.]

| Action | Type | Owner | Due Date | Tracking Link | Status |
|--------|------|-------|----------|---------------|--------|
| [Specific action] | [Prevent/Detect/Mitigate] | [Role] | [YYYY-MM-DD] | [Link] | [Open/Done] |

## Lessons Learned

[The generalizable lessons. What class of problem is this, and where else does that class exist in the system?]
```

**Quality bar:**
- Blameless in fact, not just in label — no names, only roles and systems. A blameless postmortem that feels like blame will not be trusted next time.
- Root cause reaches fixable — "the service crashed" is a symptom; "the handler did not validate nil" is closer; "our language does not enforce nil-checks and our review process does not catch them" is the root.
- Timeline with absolute timestamps — relative time ("a few minutes later") becomes ambiguous when read months later.
- Where we got lucky becomes action items — luck recorded and not acted on is a reminder that you chose to stay lucky-dependent.
- Actions are specific and owned — verifiable, not aspirational.

---

## 12. Research Document

**Use when:** An unknown blocks planning or design, and the answer requires investigation.

**Owner:** The domain specialist — AI Engineer, Database Engineer, Security Engineer, Performance Engineer, or System Architect

```markdown
# Research: [Question Being Answered]

**Date:** [YYYY-MM-DD]

**Owner:** [Role]

## Question

[The question, precisely stated. One sentence, ending with a question mark.]

## Decision This Unblocks

[What decision or plan depends on this answer. If it unblocks no decision, do not research it — research without a decision is a hobby.]

## Timebox

**Allocated:** [Time budget]

**Spent:** [Actual time, filled at completion]

## What "Answered" Means

[The form the answer will take, and the confidence threshold. "A recommendation with 80% confidence and named risks" is answerable. "The best option" is not.]

## Method

[How the question was investigated: reading, benchmarks, spikes, prototypes, interviews. Reproducible.]

## Findings

[What was learned, with sources. Separate fact from inference. Mark primary sources.]

### Finding 1

[Finding, with source and confidence.]

**Source:** [Primary source link or "measured via spike at COMMIT"]

**Confidence:** [High/Medium/Low with reason]

### Finding 2

[Repeat structure]

## What Remains Unknown

[Explicitly stated. Honest uncertainty is more useful than a guess dressed as a finding.]

## Recommendation

[The recommendation, with its limits and risks. A recommendation is an opinion derived from findings; state which findings support it and what would change it.]

**Recommendation:** [Specific action]

**Supporting findings:** [Which findings above support this]

**Risks if wrong:** [What breaks if this recommendation is incorrect]

**Confidence:** [0-100 with reason]

## Disposable Spike Code

[Location of any code written to answer this question. Clearly marked as disposable. Spike code is never shipped without going through the full loop.]

**Location:** [Path or branch, marked "DISPOSABLE SPIKE — DO NOT MERGE"]
```

**Quality bar:**
- Question stated precisely — answerable and falsifiable, not "should we use X?" but "does X meet latency requirement Y under load Z?".
- Sources are primary — official docs, specs, source code, measured benchmarks. Blog posts are leads, not conclusions.
- What remains unknown is honest — a research document that claims certainty on every point is not research, it is advocacy.
- Timebox stated and respected — research without a limit becomes a hobby, and incomplete research with a stated limit is useful data.
- Recommendation states what would change it — "if load exceeds X" or "if the vendor adds feature Y" makes the shelf life explicit.

---

## 13. Architecture Document

**Use when:** Documenting the shape of a system, and kept current thereafter. This is a living document, not a historical record.

**Owner:** System Architect

```markdown
# Architecture: [System Name]

**Last updated:** [YYYY-MM-DD]

**Owner:** [Role]

## System Purpose

[What this system does and for whom, in two sentences. If you cannot state it briefly, the boundaries are wrong.]

## Context

[The system's place in the wider world: who calls it, what it calls, which humans interact with it. Describe the context diagram in prose so it survives without the image.]

**Upstream (calls us):** [Systems and their purpose]

**Downstream (we call):** [Systems and what we need from each]

**Human actors:** [Who uses this and how]

## Component Inventory

| Component | Responsibility | Owns | Depends On |
|-----------|----------------|------|------------|
| [Name] | [One sentence — if it needs two, it may be two components] | [State or data it owns] | [Other components] |

## Data Flow

[For the primary paths, trace data from entry to exit. Bugs live at boundaries, so name every boundary crossed.]

**[Path name]:** [Entry point] → [transform] → [store or downstream] → [response]

## Trust Boundaries

[Where trust changes. Every boundary needs validation on the inside edge. Mark where untrusted input becomes trusted, and what performs that transition.]

| Boundary | Outside | Inside | Validation Performed | By What |
|----------|---------|--------|---------------------|---------|
| [Name] | [Untrusted source] | [Trusted zone] | [What is checked] | [Component] |

## Technology Choices

| Choice | Technology | Rationale | ADR |
|--------|------------|-----------|-----|
| [Concern] | [What we use] | [One line — full reasoning in the ADR] | [ADR-XXX](DECISIONS.md) |

## Cross-Cutting Concerns

**Authentication:** [Mechanism, where enforced, token lifecycle.]

**Authorization:** [Model, where enforced, how object-level ownership is checked.]

**Logging:** [What is logged, at what level, where it goes, retention, and what is deliberately excluded — secrets, personal data.]

**Error handling:** [Error model, where errors are caught, what reaches the user, what reaches telemetry.]

**Configuration:** [Where config lives, how it is loaded, how secrets are separated, how changes take effect.]

## Scaling Strategy

[How this grows, and — the useful part — what breaks first.]

| Dimension | Current | Strategy | What Breaks First | At What Multiple |
|-----------|---------|----------|-------------------|------------------|
| [Load type] | [Today's figure] | [Horizontal/vertical/shard/cache] | [The specific component or query] | [e.g. 4x today] |

## Failure Modes

| Failure | Blast Radius | Detection | Behaviour | Recovery |
|---------|--------------|-----------|-----------|----------|
| [What fails] | [What else stops working] | [Signal] | [Degrade/fail/queue] | [Automatic or manual, with runbook link] |

## Deployment Topology

[Environments, regions, instance counts, networking, and what is shared between environments. Shared resources between production and non-production are a finding, not a detail.]

## Known Limitations

[What this system does not do well, stated plainly. Published limitations are a feature; limitations discovered by users are a defect.]

## Evolution Plan

[Where this is heading, what would trigger each step, and what is deliberately deferred. Not a roadmap of features — a roadmap of structure.]
```

**Quality bar:**
- Reflects reality today, not the plan — an architecture document describing an intended system is fiction, and it will be trusted by someone at 3am.
- Trust boundaries explicit with the validating component named — this is the document a security review starts from.
- Scaling section names what breaks first and at what multiple — "we will scale horizontally" is not a strategy, it is a hope.
- Every significant technology choice links to an ADR — the reasoning is preserved where the decision was made.
- Known limitations written honestly — the section that saves the most time for the next engineer.

---

## 14. Feature Request

**Use when:** Capturing a request for new capability, before it is prioritized or designed.

**Owner:** Product Manager Agent

```markdown
# Feature Request: [Short title describing the problem, not the solution]

**Date:** [YYYY-MM-DD]

**Requester:** [Role or team]

## The User Problem

[What cannot the user do today, or what does it cost them to do it? State the problem, not the proposed solution. A feature request is a proposed solution to an unstated problem — this field recovers the problem.]

## Evidence of Need

[Support tickets, usage data, user interviews, lost deals, observed workarounds. Counts and quotes beat assertions.]

## Who Else Is Affected

[How widespread is this? One customer, a segment, everyone. Named accounts or a quantified population.]

## Current Workaround

[What people do today instead. The cost and friction of that workaround is the value of fixing it. "Nothing — they give up" is an important answer.]

## Proposed Solution

[If the requester has one, capture it — but as input, not as a requirement. Write "None proposed" if they described only the problem.]

## Success Criteria

[How we would know this solved the problem. Observable, ideally measurable.]

## Priority Rationale

[Why this over other work. Impact, reach, urgency, strategic fit, and cost of delay. An argument, not a label.]

**Proposed priority:** [Level]

**Reasoning:** [The argument]
```

**Quality bar:**
- Problem stated separately from the solution — the single most valuable thing this template does.
- Evidence is specific and countable — "14 tickets in Q2" beats "users keep asking".
- Current workaround documented — it quantifies the value and sometimes reveals the feature is unnecessary.
- Priority rationale is an argument — "high" with no reasoning is a preference, not a prioritization.

---

## 15. Deliverable Report

**Use when:** Reporting a substantive engineering deliverable. Referenced from [SYSTEM.md § 18](SYSTEM.md#18-ai-behaviour-contract).

**Owner:** Whichever role owned the deliverable

**This format is for substantive deliverables only.** Ordinary tasks — a bug fix, a small refactor, a documentation correction — get a plain description of what changed, what was verified, and what remains. Applying this format to a typo is its own quality failure.

Genuinely inapplicable sections are marked **N/A** with a reason and excluded from scoring. "N/A" is not 10: a system with no UI does not earn full marks for UI/UX.

```markdown
# Deliverable: [Title]

**Date:** [YYYY-MM-DD]

**Owner:** [Role]

## 1. Executive Summary

[What was built, what problem it solves, and its current state, in one paragraph. Written for someone who will read only this section.]

## 2. Requirements Analysis

[The requirements as understood, including restated ambiguities and the assumptions made. Each acceptance criterion with its validation evidence.]

## 3. Architecture

[Structure, components, boundaries, and how this fits the existing system. Link to ADRs for significant decisions.]

## 4. Implementation Plan

[What was built in what order, and what remains. If the plan changed during execution, say what changed and why.]

## 5. Folder Structure

[Where the code lives, and why it is organized that way. Deviations from existing repository conventions justified.]

## 6. Database Design

[Schema changes, indexes with the queries they serve, migration ordering, and rollback. N/A with reason if no data store is involved.]

## 7. API Design

[Endpoints or interfaces added or changed, with auth, error model, idempotency, and backward compatibility. N/A with reason if none.]

## 8. UI/UX Design

[Interface states including empty, loading, partial, error, and success. Accessibility conformance. N/A with reason if no interface.]

## 9. AI Design

[Prompts and their versions, model selection with rationale, context strategy, tool definitions and their blast radius, the prompt-injection boundary, evaluation results against the suite, fallback behaviour, and cost per request. N/A with reason if no AI component.]

## 10. Security Review

[Findings by severity, with what was fixed and what was accepted. Auth, authz, input validation, output encoding, secrets, injection surfaces, dependency audit. Never N/A — security applies to everything.]

## 11. Performance Review

[Measured against stated targets. Numbers, not impressions. Query plans, benchmarks, resource use. If nothing was measured, say so — that is a finding.]

## 12. Testing Strategy

[What is tested at which level, edge and failure and negative coverage, and proof that tests can fail. Known gaps stated.]

## 13. Deployment Strategy

[How this reaches production: flags, staging, rollout stages, migration ordering, and the verified rollback path.]

## 14. Documentation

[What was written or updated, and where. Including memory/ updates.]

## 15. Risks

| Risk | Likelihood | Impact | Mitigation | Detection | Owner |
|------|------------|--------|------------|-----------|-------|
| [Risk] | [L/M/H] | [L/M/H] | [Action] | [Signal] | [Role] |

## 16. Trade-offs

[What was deliberately traded for what, and why. Every deliverable makes trades; unstated trades become someone else's surprise.]

## 17. Future Improvements

[What was left for later, deliberately. Recorded in [memory/future-ideas.md](memory/future-ideas.md) so scope discipline does not cost the insight.]

## 18. Production Readiness Score

[One-line justification per score. Scores without justification are noise.]

| Dimension | /10 | Justification |
|-----------|-----|---------------|
| Architecture | | |
| Code quality | | |
| Security | | |
| Performance | | |
| Testing | | |
| Documentation | | |
| Maintainability | | |
| Scalability | | |
| User experience | | |
| Business readiness | | |
| **Overall** | **/100** | |

[Below 90 overall: keep iterating. Any dimension below 7 blocks completion. Security below 9 blocks completion for anything touching authentication, authorization, payments, personal data, or irreversible actions. N/A dimensions are excluded and the total rescaled to 100.]

## 19. Confidence Score

**Confidence:** [0-100]

**Reason:** [Anchored to evidence. "95 — the failing test now passes and the full suite is green" is a score. "95 — this looks right" is not. Confidence is capped by the weakest verified link; untested code caps at 85.]

## 20. Recommended Next Steps

[Specific and ordered. What should happen next, by whom, and why that order.]
```

**Quality bar:**
- Scores honest, including the unflattering ones — a 72 reported as 72 with what would move it is far more useful than a fictional 91.
- Confidence anchored to evidence, not fluency — naming the unverified part explicitly.
- N/A sections carry a reason and are excluded from scoring rather than silently scored 10.
- Trade-offs and remaining gaps stated plainly — the sections a reader checks to decide whether to trust the rest.
- Format matched to deliverable size — used for substantive work, not for every change.

---

## 16. Threat Model

**Use when:** Before the first line of application code on a new system, and again whenever authentication, authorization, data handling, or an internet-facing surface changes.

**Owner:** Security Engineer

```markdown
# Threat Model: [System or Feature Name]

**Date:** [YYYY-MM-DD]

**Owner:** [Role]

**Scope:** [What is in scope, and explicitly what is not. An unbounded threat model is never finished.]

## Assets

[What is worth attacking, and what it is worth. Value drives how much control is justified.]

| Asset | Type | Value if Stolen | Value if Altered | Value if Destroyed |
|-------|------|-----------------|------------------|--------------------|
| [e.g. user credentials] | [Data/credential/capability] | [Impact] | [Impact] | [Impact] |

## Trust Boundaries

[Where trust changes, and what enforces the change. Every boundary needs validation on the inside edge.]

| Boundary | Outside (untrusted) | Inside (trusted) | Enforced By |
|----------|--------------------|--------------------|-------------|
| [Name] | [Source] | [Zone] | [Component performing validation/authz] |

## Entry Points

[Every way data or control enters the system. Missing one here is how systems get breached.]

| Entry Point | Protocol | Authenticated | Rate Limited | Validated By |
|-------------|----------|---------------|--------------|--------------|
| [e.g. POST /api/login] | [HTTPS] | [No — it is the auth endpoint] | [Yes/No] | [Component] |

## Adversary Profiles

[Who is attacking, what they can do, and why they bother. Start from the assumption of an attacker with a valid account, your source code, and patience.]

| Adversary | Capability | Motivation | In Scope |
|-----------|------------|------------|----------|
| Authenticated user | [Valid session, own data, API access, source code] | [Access others' data, escalate privilege] | [Yes] |
| Unauthenticated internet | [Network reach, automated scanning] | [Credential stuffing, resource abuse] | [Yes] |
| Compromised dependency | [Code execution in our process] | [Supply-chain data theft] | [Yes] |
| Malicious insider | [Production access, audit-log awareness] | [Exfiltration, sabotage] | [Yes/No + reason] |

## Threat Enumeration (STRIDE)

[One row minimum per category per significant entry point. "Not applicable" needs a reason.]

| Category | Threat | Entry Point | Severity | Existing Control | Adequate? |
|----------|--------|-------------|----------|------------------|-----------|
| **Spoofing** | [Impersonating a user or service] | [Where] | [C/H/M/L] | [Control] | [Yes/Gap] |
| **Tampering** | [Modifying data in transit or at rest] | [Where] | [C/H/M/L] | [Control] | [Yes/Gap] |
| **Repudiation** | [Denying an action with no audit trail] | [Where] | [C/H/M/L] | [Control] | [Yes/Gap] |
| **Information disclosure** | [Reading data without authorization] | [Where] | [C/H/M/L] | [Control] | [Yes/Gap] |
| **Denial of service** | [Exhausting a resource] | [Where] | [C/H/M/L] | [Control] | [Yes/Gap] |
| **Elevation of privilege** | [Gaining rights not granted] | [Where] | [C/H/M/L] | [Control] | [Yes/Gap] |

## Existing Controls

[What already defends this system, and where each control is enforced. A control described but not located in code is a hope.]

| Control | Defends Against | Enforced At | Verified By |
|---------|-----------------|-------------|-------------|
| [Control] | [Threats] | [Code location or infrastructure] | [Test or audit] |

## Gaps

[Threats without adequate controls. Each with a concrete exploitation scenario — a gap with no scenario cannot be prioritized or verified fixed.]

| Gap | Severity | Exploitation Scenario | Remediation | Owner | Target Date |
|-----|----------|----------------------|-------------|-------|-------------|
| [Missing control] | [C/H/M/L] | [Concrete steps an attacker takes] | [Specific fix] | [Role] | [YYYY-MM-DD] |

## Accepted Risks

[Risks knowingly not remediated. Only a human may accept a risk, and silent acceptance is the one unacceptable option.]

| Risk | Severity | Why Accepted | Compensating Control | Accepted By | Date | Review Date |
|------|----------|--------------|---------------------|-------------|------|-------------|
| [Risk] | [C/H/M/L] | [Reasoning] | [What reduces it meanwhile] | [Named human] | [YYYY-MM-DD] | [YYYY-MM-DD] |

## Blast Radius

[What one compromise reaches. This is the section that determines whether an incident is contained or total.]

| Compromised | Reaches | Data Exposed | Detection | Containment |
|-------------|---------|--------------|-----------|-------------|
| One user credential | [Scope] | [What data] | [Signal] | [Revocation path and time] |
| One service credential | [Scope] | [What data] | [Signal] | [Rotation path and time] |
| One dependency | [Scope] | [What data] | [Signal] | [Pinning, isolation, response] |
```

**Quality bar:**
- Every entry point enumerated — including webhooks, admin paths, scheduled jobs, message consumers, and anything a model can call. An unlisted entry point is an unreviewed one.
- Adversaries have capability and motivation, not just labels — "authenticated user with your source code and patience" changes the analysis; "hackers" does not.
- Gaps carry a concrete exploitation scenario — so remediation can be verified by re-running the scenario rather than by reading the patch.
- Accepted risks are dated, owned by a named human, and have a review date — an undated acceptance becomes permanent by accident.
- Blast radius stated per credential class — the difference between rotating one token and rebuilding an environment.

---

## 17. Runbook

**Use when:** An operational procedure will be executed more than once, or executed once under pressure by someone who did not write it.

**Owner:** DevOps Agent, or whichever role owns the system being operated

A runbook is written for a tired person at 3am. Imperative verbs, one action per step, explicit decision branches. If a step requires judgement, say what the judgement is and what each answer leads to. Prose belongs in the context section, not in the steps.

```markdown
# Runbook: [Procedure name]

**Last verified:** [YYYY-MM-DD — the date someone actually executed this and it worked]

**Owner:** [Role or team]

**Estimated duration:** [Realistic time including verification, not the happy-path minimum]

## Trigger

[The exact condition that means "run this runbook". An alert name, a symptom, a scheduled event. If you are reading this and the trigger does not match, this is the wrong runbook.]

## Severity and urgency

[How bad is it if this is not run? What is the deadline? Who needs to be told it is happening?]

## Prerequisites

- [ ] [Access required — which credentials, which systems, which permissions]
- [ ] [Tools required — installed and authenticated]
- [ ] [State required — a backup exists, traffic is drained, a maintenance window is open]
- [ ] [People required — who must be available or notified before starting]

## Steps

1. [Imperative action. One step, one action.]
   - **Verify:** [The observable signal that this step succeeded]
   - **If it fails:** [Explicit branch — retry, escalate, or go to rollback]

2. [Next action]
   - **Verify:** [Signal]
   - **If it fails:** [Branch]

3. **Decision point:** [The question being asked]
   - **If [condition A]:** go to step 4
   - **If [condition B]:** go to step 7
   - **If neither:** stop and escalate to [role]

[Continue. Every step verifiable. Every failure branch explicit.]

## Verification

[How to confirm the whole procedure worked, not just that each step ran. Specific: which dashboard, which metric, which value range, over what window.]

- [ ] [Check 1 — with the expected value]
- [ ] [Check 2]
- [ ] [The user-visible symptom that triggered this is gone]

## Rollback

[The tested procedure to undo this. If there is no rollback, say so explicitly and state what makes it irreversible — that is information the operator needs before step 1, not after step 9.]

1. [Rollback step]
2. [Rollback step]

**Rollback last tested:** [YYYY-MM-DD]

## Aftercare

- [ ] [Notify — who, with what information]
- [ ] [Record — where this execution is logged]
- [ ] [Monitor — what to watch, for how long, and what would mean it is not actually fixed]
- [ ] [Follow up — the work this procedure revealed but did not do]

## Common mistakes

- [The mistake someone has actually made running this, and what it caused]
- [The step people skip because it looks optional, and why it is not]
- [The signal people misread, and what it actually means]

## Related

- [Links to the playbook, workflow, or ADR this belongs to]
```

**Review criteria**

- Every step is a single imperative action with a verification signal.
- Every failure mode has an explicit branch, not "investigate".
- Prerequisites are complete enough that the operator does not discover missing access at step 6.
- Rollback exists and has a tested date, or irreversibility is stated up front.
- **Last verified** is a real date. A runbook nobody has executed in a year is a hypothesis.

---

## 18. Retrospective

**Use when:** A milestone, release, or project phase completes. Also after an incident, in addition to the [Postmortem](#11-postmortem) — the postmortem examines the failure, the retrospective examines how the team worked.

**Owner:** Whichever role led the work

A retrospective that produces no changed behaviour was a meeting. The output is a short list of specific, owned, dated actions — not a long list of observations.

```markdown
# Retrospective: [Milestone, release, or period]

**Date:** [YYYY-MM-DD]

**Period covered:** [YYYY-MM-DD to YYYY-MM-DD]

**Participants:** [Roles involved]

## What we set out to do

[The goal as stated at the start, quoted from the plan or PRD. Not the goal as it evolved — the original, so drift is visible.]

## What we actually delivered

[What shipped. Where it differs from the goal, state the difference plainly and why it happened.]

| Planned | Delivered | Variance and cause |
| --- | --- | --- |
| [Item] | [Shipped / Partial / Cut] | [Why] |

## Measurements

[Estimates versus actuals. Numbers, not impressions.]

| Metric | Estimated | Actual | Ratio |
| --- | --- | --- | --- |
| Duration | [ ] | [ ] | [ ] |
| Defects found post-release | [ ] | [ ] | [ ] |
| Rework cycles | [ ] | [ ] | [ ] |
| [Project-specific metric] | [ ] | [ ] | [ ] |

## What worked

[Specific practices, decisions, or tools that measurably helped. "Good communication" is not an entry. "Writing the failing test before the fix caught two sibling bugs in the same module" is.]

- [Practice] → [The observable benefit it produced]

## What did not work

[Specific, blameless, and honest. Describe systems and decisions, not people. If a decision was wrong, name the decision and the reasoning that made it look right at the time.]

- [Problem] → [What it cost — time, defects, rework, morale]

## What we learned

[Insights that change how the next phase runs. Each one should be actionable or it is trivia.]

- [Learning, stated as a general principle rather than a one-off observation]

## Where our estimates were wrong

[The most valuable section, and the one most often skipped. Which categories of work did we systematically underestimate? Estimation improves only when the error is examined.]

## Actions

[The only section that changes anything. Each action is specific, owned, and dated. Vague actions with no owner are decoration.]

| Action | Owner | Due | Verification |
| --- | --- | --- | --- |
| [Specific change] | [Role] | [YYYY-MM-DD] | [How we will know it happened] |

## Standards or workflow changes

[If this retrospective implies a change to STANDARDS.md, WORKFLOW.md, CHECKLISTS.md, or a project override in standards/ or workflows/, name it here and open the change. A learning that does not reach the framework will be re-learned.]

## Recorded to memory

[What from this retrospective belongs in memory/ so the next phase starts with it. Link the entry.]
```

**Review criteria**

- Planned versus delivered is honest, including cut scope.
- Estimates versus actuals are numbers, and the estimation error is analysed rather than noted.
- Every "what did not work" entry states its cost.
- Every action has an owner, a date, and a verification signal.
- Learnings that imply framework changes are propagated to the relevant document, not left in the retrospective.
- Written blamelessly: systems and decisions are examined, people are not.
