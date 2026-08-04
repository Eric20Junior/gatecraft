# PROJECT_CONTEXT.md — This Project

**This is the only file in the Gatecraft that MUST be edited before the framework is
useful.** Everything else works as shipped. This file is where the framework meets
reality.

**This file wins on facts.** Where it contradicts [SYSTEM.md](SYSTEM.md),
[STANDARDS.md](STANDARDS.md), or [KNOWLEDGE.md](KNOWLEDGE.md) about *what is true in
this repository*, this file is correct and the others are general guidance. It does
not override the reasoning rules in [SYSTEM.md](SYSTEM.md) or the completion bar in
[SYSTEM.md#14](SYSTEM.md#14-completion-criteria) — those are the kernel. It overrides
facts, constraints, and — where explicitly recorded in the
[Overrides](#12-overrides-and-exceptions) section — specific standards.

**Every unfilled section is a defect.** An agent reading `{{placeholder}}` will
either stop and ask, or guess. Both cost more than the ten minutes it takes to write
the real answer. If a section genuinely does not apply, write `N/A` and one sentence
saying why — an explicit N/A is information; a placeholder is not.

**Keep it current.** A stale PROJECT_CONTEXT is worse than none, because agents trust
it. Review it at every retrospective, and update it in the same change as anything
that invalidates it. The most common rot: a stated constraint that was lifted a year
ago, and a scale figure from before the system grew.

Keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are used per RFC 2119.

Contents:

1. [Identity](#1-identity)
2. [Problem and users](#2-problem-and-users)
3. [Scope and non-goals](#3-scope-and-non-goals)
4. [Technology](#4-technology)
5. [Architecture](#5-architecture)
6. [Scale and performance](#6-scale-and-performance)
7. [Data](#7-data)
8. [Security and compliance](#8-security-and-compliance)
9. [Environments and deployment](#9-environments-and-deployment)
10. [Operations](#10-operations)
11. [Constraints](#11-constraints)
12. [Overrides and exceptions](#12-overrides-and-exceptions)
13. [Conventions](#13-conventions)
14. [Known problems](#14-known-problems)
15. [Working agreements for agents](#15-working-agreements-for-agents)
16. [Maintenance](#16-maintenance)

---

## 1. Identity

| Field | Value |
| --- | --- |
| **Project name** | `{{name}}` |
| **One-line purpose** | `{{what it does, in outcome terms, for whom}}` |
| **Repository** | `{{URL or path}}` |
| **Lifecycle stage** | `{{prototype / pre-launch / production / maintenance / sunsetting}}` |
| **Business criticality** | `{{revenue-critical / important / internal / experimental}}` |
| **Primary owner** | `{{name or team}}` |
| **On-call owner** | `{{name, team, or "none — no on-call exists"}}` |
| **Team size and shape** | `{{e.g. 3 engineers, 1 designer, no dedicated ops}}` |
| **Last reviewed** | `{{YYYY-MM-DD}}` |

Criticality is not flattery — it sets the bar. A revenue-critical system inherits
the strictest reading of every standard; an experiment does not, and pretending
otherwise wastes real capacity.

---

## 2. Problem and users

**The problem.** `{{What is broken or missing in the world without this system.
State it as a problem, not as a description of the software.}}`

**Evidence it matters.** `{{The measurement: support volume, revenue at risk, hours
lost, error rate, user research. If there is no evidence, say so — that is itself
important context for prioritization decisions.}}`

**Users.**

| Who | What they are trying to do | Context that constrains the design |
| --- | --- | --- |
| `{{role}}` | `{{their goal, in their words}}` | `{{device, expertise, urgency, environment, accessibility needs}}` |

**What users do today instead.** `{{The workaround. Its friction is the real measure
of how badly this is needed.}}`

**How we know we succeeded.** `{{Measurable outcomes with baselines and targets. Not
"improve X" — "reduce X from 34% to under 25% by Q3".}}`

---

## 3. Scope and non-goals

**In scope.** `{{What this system is responsible for.}}`

**Explicitly out of scope.** `{{What it deliberately does not do, and who or what
does it instead. This section prevents the most expensive kind of scope creep: the
kind that looks like a small, reasonable addition.}}`

**Deliberately deferred.** `{{Things we intend to do and are not doing yet, with the
condition that would start them. Distinguishes "not yet" from "never", which are
different answers to a feature request.}}`

---

## 4. Technology

State versions. "Python" and "Python 3.9" imply different available features, and an
agent that assumes the wrong one writes code that does not run.

| Layer | Choice and version | Notes / why |
| --- | --- | --- |
| Language(s) | `{{}}` | `{{}}` |
| Runtime | `{{}}` | `{{}}` |
| Framework(s) | `{{}}` | `{{}}` |
| Database | `{{}}` | `{{}}` |
| Cache | `{{}}` | `{{}}` |
| Queue / messaging | `{{}}` | `{{}}` |
| Object storage | `{{}}` | `{{}}` |
| Search | `{{}}` | `{{}}` |
| Frontend | `{{}}` | `{{}}` |
| Mobile | `{{}}` | `{{}}` |
| Infrastructure | `{{}}` | `{{}}` |
| IaC tooling | `{{}}` | `{{}}` |
| CI/CD | `{{}}` | `{{}}` |
| Observability | `{{}}` | `{{}}` |
| Model provider(s) and pinned versions | `{{}}` | `{{}}` |
| Package manager | `{{}}` | `{{}}` |
| Test framework(s) | `{{}}` | `{{}}` |

**Technology we have deliberately rejected.** `{{With the ADR reference. This stops
the same proposal recurring quarterly.}}`

**Technology we are stuck with.** `{{Legacy choices we would not make today, and
what it would cost to change them. An agent needs to know the difference between a
choice it should respect and a constraint it should not extend.}}`

---

## 5. Architecture

**Shape in one paragraph.** `{{e.g. "A modular monolith behind a load balancer, one
PostgreSQL primary with a read replica, background work on a queue with three worker
types, and a React SPA served from a CDN." Enough for an agent to place a change
correctly.}}`

**Diagram.** `{{ASCII or a link to architecture/. Text beats an image an agent
cannot read.}}`

**Modules and their responsibilities.**

| Module / service | Owns | Must not | Depends on |
| --- | --- | --- | --- |
| `{{}}` | `{{}}` | `{{}}` | `{{}}` |

**Entry points.** `{{HTTP routes, message consumers, scheduled jobs, CLI commands,
webhooks. This is the real surface area and it is usually far smaller than the file
count suggests.}}`

**Boundaries we enforce.** `{{Dependency rules that MUST hold — e.g. "the domain
package imports nothing from the web layer", "no service reads another service's
tables". State how each is enforced: a lint rule, a build check, or review only.
"Review only" is honest and tells an agent to be careful.}}`

**Detailed architecture** lives in [architecture/](architecture/). Significant
decisions are recorded in [DECISIONS.md](DECISIONS.md).

---

## 6. Scale and performance

Numbers, not adjectives. Every performance decision downstream depends on these, and
an agent given "high traffic" will either over-engineer or under-engineer.

| Metric | Current | Peak observed | Target / next horizon |
| --- | --- | --- | --- |
| Requests per second | `{{}}` | `{{}}` | `{{}}` |
| Active users | `{{}}` | `{{}}` | `{{}}` |
| Data volume (largest tables) | `{{}}` | — | `{{}}` |
| Growth rate | `{{}}` | — | `{{}}` |
| Background job volume | `{{}}` | `{{}}` | `{{}}` |

**Latency budgets.**

| Path | p50 | p95 | p99 | Measured where |
| --- | --- | --- | --- | --- |
| `{{endpoint or journey}}` | `{{}}` | `{{}}` | `{{}}` | `{{client / server / edge}}` |

**Availability target.** `{{e.g. 99.9% monthly, or "no formal target" — say which}}`

**Known scaling ceiling.** `{{What breaks first, at what load, and what the next step
would be. Per PLAYBOOKS.md#8. If nobody has worked this out, say "unknown" — an
agent should not infer that unknown means safe.}}`

**Cost.** `{{Monthly infrastructure spend, the largest line items, and the cost per
unit of work (per request, per tenant, per job) if known. Required for any
optimization decision.}}`

---

## 7. Data

**Sources of truth.** `{{Which store owns which data. Ambiguity here is the root of
a whole class of consistency bugs.}}`

**Core entities.** `{{The five to ten that matter, with their relationships. Not the
full schema — the mental model.}}`

**Data classification.**

| Data | Classification | Encryption | Retention | Notes |
| --- | --- | --- | --- | --- |
| `{{field or entity}}` | `{{public / internal / confidential / regulated}}` | `{{at rest / in transit / field-level}}` | `{{period}}` | `{{}}` |

**Migration approach.** `{{Tool, review requirement, and whether
expand-migrate-contract is mandatory. Per PLAYBOOKS.md#12.}}`

**Backups.** `{{Frequency, retention, where stored, and — the only part that
matters — the date a restore was last actually performed and how long it took. That
duration is the real RTO.}}`

**Data we must never log.** `{{Explicit list. This is the most common source of
breaches and the easiest to prevent by naming the fields.}}`

---

## 8. Security and compliance

**Authentication.** `{{Mechanism, provider, session or token model, expiry, and
revocation path.}}`

**Authorization.** `{{Model — RBAC, ABAC, ownership-based — and where it is enforced.
State whether it is checked per-route, per-object, or both. "Per-route only" is a
finding an agent should know about.}}`

**Secrets management.** `{{Where secrets live, how code obtains them, rotation
procedure, and the last time rotation was executed.}}`

**Trust boundaries.** `{{Where untrusted input enters and what validates it. For AI
features, explicitly: what enters model context, and what the model's output is
allowed to trigger. Per STANDARDS.md#19.}}`

**Regulatory obligations.** `{{GDPR, HIPAA, PCI-DSS, SOC 2, accessibility law,
sector-specific rules — or "none known". Each obligation implies specific
non-negotiable requirements; naming them here is what makes them enforceable.}}`

**Threat model.** `{{Link to the current one, per TEMPLATES.md#16, and its date.}}`

**Known accepted risks.** `{{Each with the accepter's name and the date. An accepted
risk with no named accepter is an unaccepted risk that nobody is tracking.}}`

**Security contact / disclosure process.** `{{}}`

---

## 9. Environments and deployment

| Environment | Purpose | URL | Data | Who can deploy |
| --- | --- | --- | --- | --- |
| Local | `{{}}` | `{{}}` | `{{synthetic / anonymized / none}}` | `{{}}` |
| CI | `{{}}` | — | `{{}}` | `{{}}` |
| Staging | `{{}}` | `{{}}` | `{{}}` | `{{}}` |
| Production | `{{}}` | `{{}}` | real | `{{}}` |

**How production differs from staging.** `{{Every difference is a place a bug hides.
Data volume, configuration, scale, third-party accounts, feature flags.}}`

**Deployment mechanism.** `{{Pipeline, strategy — rolling, blue-green, canary — and
typical duration.}}`

**Rollback.** `{{The exact procedure, its duration, and the date it was last
executed. An untested rollback is a hypothesis.}}`

**Release cadence.** `{{}}`

**Freeze windows.** `{{Periods when production changes are prohibited, and who can
grant an exception.}}`

**Feature flags.** `{{System used, who can toggle, and the cleanup policy — stale
flags are a real and growing cost.}}`

---

## 10. Operations

**Monitoring.** `{{Tools, and the dashboard that answers "is it healthy" in under
thirty seconds.}}`

**Alerts.** `{{What pages a human, what merely notifies, and where alerts are routed.
An alert nobody receives is a comment.}}`

**Logging.** `{{Where logs go, retention, and how to query them. Include the actual
query interface an agent would use during an incident.}}`

**Runbooks.** `{{Location and coverage. Which failure modes have one and which do
not.}}`

**Incident process.** `{{Severity definitions, who declares, where the channel is,
and the communication obligation per severity. Per PLAYBOOKS.md#5.}}`

**Support load.** `{{Recurring issues that consume time. These are usually the
highest-value work available and are usually invisible in the roadmap.}}`

---

## 11. Constraints

Real constraints only. A preference recorded here becomes a rule nobody can question,
which is how projects acquire arbitrary limits with no remaining rationale.

**Technical.** `{{Must run on-premises; must support IE11; must work offline; cannot
add a new datastore; must stay within a 200KB bundle.}}`

**Organizational.** `{{Team size and skills; a shared service owned by another team;
a required review from a specific group; a change-management process.}}`

**Commercial.** `{{Budget ceiling; contractual SLA; vendor lock-in with a term;
licence restrictions.}}`

**Temporal.** `{{Hard deadlines with their consequence. A deadline with no
consequence is a preference.}}`

**For each constraint, state whether it is real or assumed.** Assumed constraints are
worth testing; a surprising number dissolve when someone asks the owner directly.

---

## 12. Overrides and exceptions

Documented deviations from the Gatecraft defaults. An override recorded here is a
decision; an undocumented deviation is a violation. This is the mechanism for
customizing the framework without forking it.

| What we deviate from | Our rule instead | Why | ADR | Review by |
| --- | --- | --- | --- | --- |
| `{{e.g. STANDARDS.md#5 test coverage}}` | `{{}}` | `{{}}` | `{{ADR-NNNN}}` | `{{date}}` |

Rules for overrides:

- Every override MUST name what it deviates from, by anchor.
- Every override MUST have a reason grounded in this project's constraints, not a
  preference.
- Every override SHOULD have a review date. An override with no review date becomes
  permanent by inertia, and its original reason is forgotten.
- **The completion criteria in [SYSTEM.md#14](SYSTEM.md#14-completion-criteria) MUST
  NOT be overridden downward** for anything reaching production users. Lowering the
  bar is the one deviation that defeats the purpose of having one.

---

## 13. Conventions

Things an agent will get wrong without being told, because they are arbitrary and
locally consistent rather than universally correct.

**Naming.** `{{Files, directories, classes, functions, database tables and columns,
API paths, events, branches, feature flags.}}`

**Code layout.** `{{Where a new module goes; where tests live relative to source;
where shared code is allowed to live and where it is not.}}`

**Error handling.** `{{The project's actual pattern — exceptions, result types,
error codes — and the error response shape.}}`

**Logging.** `{{Format, required fields, correlation ID propagation, and level
conventions.}}`

**Commits and branches.** `{{Format, whether history is linear, squash policy.}}`

**Pull requests.** `{{Size expectation, required reviewers, required checks,
description expectations.}}`

**Comments.** `{{When a comment is expected. The house style on comments that explain
why versus comments that restate the code.}}`

**Formatting and linting.** `{{Tools and how they run. If they run automatically,
say so — an agent should not hand-format what a formatter owns.}}`

---

## 14. Known problems

Honesty here is the highest-value content in this file. An agent that knows where the
minefield is will avoid it; an agent that does not will step on it confidently.

**Fragile areas.** `{{Modules where changes break things unexpectedly, with the
reason if known. "Nobody understands the pricing module" is legitimate and useful.}}`

**Missing test coverage.** `{{Where the suite will not catch a regression.}}`

**Known bugs we are living with.** `{{With their workarounds. See
[memory/bugs.md](memory/bugs.md) for the full record.}}`

**Technical debt with measured interest.** `{{Per PROMPTS.md's debt assessment: what
it costs per month, not merely that it is ugly. Ugly and stable is not debt.}}`

**Documentation known to be stale.** `{{Better to name it than to let an agent trust
it.}}`

**Recurring operational pain.** `{{The thing that pages someone every fortnight and
has never been fixed.}}`

---

## 15. Working agreements for agents

Specific rules for AI agents in this repository, beyond
[SYSTEM.md#18](SYSTEM.md#18-ai-behaviour-contract).

**You MAY change without asking.** `{{Paths and kinds of change.}}`

**You MUST ask before changing.** `{{e.g. schema, public API contracts, auth logic,
infrastructure, dependencies, anything under a named path.}}`

**You MUST NOT change.** `{{e.g. generated code, vendored dependencies, migration
files already applied, another team's owned paths.}}`

**Commands you may run.** `{{Test, lint, build, format. Name them exactly.}}`

**Commands you MUST NOT run.** `{{Anything touching production, anything that
rewrites git history, anything that costs money without approval.}}`

**When you hit ambiguity.** Stop and ask. Do not guess and do not proceed on an
assumption you cannot verify — record the question and escalate per
[SYSTEM.md#16](SYSTEM.md#16-escalation).

**What you MUST report.** `{{Test output rather than a claim that tests pass; the
readiness score with per-dimension justification; assumptions made; what you did not
do.}}`

**Context to load first.** [README.md](README.md), then
[SYSTEM.md](SYSTEM.md), then this file, then
[memory/project-memory.md](memory/project-memory.md), then the relevant
[DECISIONS.md](DECISIONS.md) entries. Per
[PROMPTS.md](PROMPTS.md#assemble-the-right-context-for-a-task).

---

## 16. Maintenance

**Owner of this file.** `{{name or role}}`

**Review triggers — this file MUST be updated when:**

- A technology, version, or provider changes.
- An architectural boundary changes, or a module is added or removed.
- A scale figure moves by more than roughly 50%, or a latency budget changes.
- A constraint is added, lifted, or discovered to have been assumed.
- An override is added, or an existing one expires.
- A known problem is fixed — stale warnings cost credibility, and an agent that
  finds one wrong entry discounts the rest.
- A retrospective or postmortem produces a fact that belongs here. Per
  [CHECKLISTS.md#17](CHECKLISTS.md#17-postmortem-checklist), a postmortem that
  changes no artifact changed nothing.

**Review cadence.** At minimum, at every retrospective. Record the date in
[Identity](#1-identity).

**The test of whether this file is working:** an agent starting a task in an
unfamiliar part of this repository asks zero questions that this file could have
answered. Every such question is a missing section, and the question tells you
exactly what to add.
