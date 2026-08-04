# WORKFLOW.md — Engineering Workflows

Sixteen workflows covering the situations engineering work actually arrives in.
Each specifies **entry conditions**, **roles**, **steps**, **deliverables**,
**review gates**, **approval gates**, **iteration rules**, and **exit
conditions**.

All workflows are instances of the
[Universal Engineering Loop](SYSTEM.md#3-the-universal-engineering-loop), sized
per [task class](SYSTEM.md#right-sizing-the-loop). Project-specific overrides go
in [workflows/](workflows/) and take precedence over this file.

## Choosing a workflow

| Situation | Workflow |
| --- | --- |
| Empty or new repository | [1. New Project](#1-new-project-workflow) |
| Build something users will notice | [2. Feature Development](#2-feature-development-workflow) |
| Something is broken | [3. Bug Fix](#3-bug-fix-workflow) |
| Unknown that blocks planning | [4. Research](#4-research-workflow) |
| Structure or technology decision | [5. Architecture](#5-architecture-workflow) |
| Turning an objective into tasks | [6. Planning](#6-planning-workflow) |
| Reviewing changes | [8. Code Review](#8-code-review-workflow) |
| Building or fixing tests | [9. Testing](#9-testing-workflow) |
| Shipping to production | [10. Deployment](#10-deployment-workflow) |
| Dependencies, upkeep, debt | [11. Maintenance](#11-maintenance-workflow) |
| Production is broken now | [12. Incident Response](#12-incident-response-workflow) |
| Improving structure, no behaviour change | [13. Refactoring](#13-refactoring-workflow) |
| Writing or fixing docs | [14. Documentation](#14-documentation-workflow) |
| Prompts, models, agents, ML | [7. AI Development](#7-ai-development-workflow) |
| Security assessment | [15. Security Review](#15-security-review-workflow) |
| Cutting a release | [16. Release Management](#16-release-management-workflow) |

**Universal rules for every workflow:**

- Read [memory/](memory/) at entry. Update it at exit. Non-negotiable.
- Security and QA gates apply everywhere, including to "small" changes.
- Any gate failure returns work to the earliest stage that was wrong.
- Iterate until acceptance criteria pass, no critical issues remain, and further
  iteration yields negligible improvement — then say which of those ended it.
- If blocked, follow [SYSTEM.md § 15](SYSTEM.md#15-failure-handling): deliver
  everything unblocked, name precisely what you left out.

---

## 1. New Project Workflow

**Entry conditions** — A product intent exists. No implementation exists, or only
a skeleton does.

**Roles** — Product Manager, Business Analyst, Planner, System Architect, CTO
lens, Security Engineer, DevOps Engineer, Technical Writer, QA.

**Steps**

1. **Define the problem.** Who has it, how they solve it today, what it costs
   them. Write [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — vision, users, problem,
   goals, constraints, budget, timeline, non-goals.
2. **Establish success metrics** before any technology discussion.
3. **Requirements.** Functional, non-functional (performance, availability,
   security, compliance, accessibility), and explicit non-goals. Produce a
   [PRD](TEMPLATES.md#1-product-requirements-document-prd).
4. **Research.** Prior art, build-vs-buy for each major capability, regulatory
   constraints. Record in [research/](research/).
5. **Architecture.** Compare three approaches ([SYSTEM.md § 7](SYSTEM.md#7-decision-framework)).
   Default to the simplest deployable shape that meets stated requirements.
   Record ADRs. Write [architecture/system-overview.md](architecture/system-overview.md).
6. **Technology selection.** One ADR per significant choice — language, data
   store, hosting, framework. Bias to boring and to what the team can operate.
7. **Threat model** before the first line of application code.
8. **Foundations, in this order** — repository and branch strategy; CI with the
   gates wired in; automated tests running; linting and formatting; secret
   management; environments; observability; deployment and rollback. Foundations
   built later are built under pressure.
9. **Walking skeleton.** One thin end-to-end path — real request through real
   layers to real storage and back, deployed to a real environment. This validates
   the architecture before you commit to it.
10. **Plan the first milestones** as vertical slices.
11. **Bootstrap the Gatecraft** — initialize [memory/](memory/), record the initial
    ADRs, and add the pointer described in [README.md](README.md#installing-the-gatecraft-in-a-repository).

**Deliverables** — PROJECT_CONTEXT, PRD, architecture document, initial ADRs,
threat model, working CI/CD with gates, walking skeleton deployed, milestone
plan, initialized memory, developer setup guide.

**Review gates** — Architecture, Security (threat model), Business (does this
solve a real problem), Documentation (can someone else run it).

**Approval gates** — Human approval of PROJECT_CONTEXT and of the architecture
before foundation work; human approval of technology choices with lock-in.

**Iteration rules** — Do not begin feature work until the walking skeleton is
deployed and the pipeline enforces the gates. This is the single highest-leverage
sequencing rule in the framework.

**Exit conditions** — A deployable system exists with one working end-to-end
path, automated gates, observability, documented architecture, and an approved
plan for the next milestone.

---

## 2. Feature Development Workflow

**Entry conditions** — A prioritized requirement exists with a stated user
problem and testable acceptance criteria.

**Roles** — Product Manager, Planner, System Architect (if structure changes),
relevant Engineers, UX Designer and Accessibility Reviewer (if there is an
interface), Database Engineer (if the schema changes), Security Engineer,
Performance Engineer (if hot paths change), Testing Engineer, Technical Writer,
QA.

**Steps**

1. **Understand.** Restate the user problem. Confirm acceptance criteria are
   falsifiable. Identify non-goals.
2. **Research.** Does the codebase already solve 80% of this? Reuse beats build.
   Check [memory/decisions.md](memory/decisions.md) for constraints.
3. **Plan.** Vertical slices. Sequence the riskiest unknown first.
4. **Design.** Interfaces and data model before internals. Design the failure
   modes with the happy path. Specify every UI state including empty and error.
   ADR for any significant choice.
5. **Implement.** Follow [STANDARDS.md](STANDARDS.md). Match surrounding idiom.
   Slice by slice, keeping the system working at each step.
6. **Test.** Unit for logic, integration for boundaries, end-to-end for the
   critical path, plus edge and failure cases.
7. **Review.** Every applicable gate, using [CHECKLISTS.md](CHECKLISTS.md).
8. **Critique.** Adversarially — [SYSTEM.md § 3, stage 7](SYSTEM.md#stage-detail).
9. **Improve and validate** against each acceptance criterion, with evidence.
10. **Document.** User-facing docs, API reference, configuration, ADRs.
11. **Update memory** — completed work, decisions, any debt deliberately taken.
12. **Score and evaluate.** Below 90 or any dimension below 7: iterate.

**Deliverables** — Working feature; tests at appropriate levels; documentation;
ADRs; review records; readiness score with per-dimension justification; updated
memory.

**Review gates** — Architecture (if structure changed), Code Quality, Security,
Performance (if relevant), Testing, Documentation, Accessibility (if UI),
Business, QA.

**Approval gates** — Product Manager confirms the requirement is met. Security
Engineer approves anything touching auth, payments, personal data, or
irreversible actions. QA gives final sign-off.

**Iteration rules** — Findings from review and critique are addressed, then
re-reviewed. New *scope* discovered during review becomes a new task; it does not
expand this one.

**Exit conditions** — All acceptance criteria validated with evidence; all gates
passed; score ≥ 90 with no dimension below 7; documentation and memory updated.

---

## 3. Bug Fix Workflow

**Entry conditions** — A defect is reported with observed and expected behaviour.

**Roles** — Relevant Engineer, Testing Engineer, Security Engineer (if the bug is
security-relevant), QA. Add Database Engineer if data is corrupted.

**Steps**

1. **Assess severity and blast radius first.** If production is materially
   affected, switch to [Incident Response](#12-incident-response-workflow) —
   mitigate now, root-cause after.
2. **Reproduce reliably.** An intermittent reproduction means the trigger is not
   yet understood; keep going. Record the exact reproduction steps.
3. **Write a failing test** that captures the defect. This is the definition of
   done and becomes the regression test.
4. **Find the root cause.** Ask "why" until you reach a cause you can fix. Fixing
   a symptom creates two bugs.
5. **Check for siblings.** Grep for the same pattern elsewhere. Most bugs have
   relatives.
6. **Assess data damage.** Did this corrupt or leak anything already? Repair and
   disclosure are part of the fix.
7. **Fix at the right layer** — where the invariant should have been enforced.
8. **Verify** the failing test passes and the full suite is green.
9. **Review** — Code Quality, Security, Testing gates. Plus: why did existing
   tests not catch this?
10. **Improve the safety net.** Add the check, constraint, type, or lint rule
    that makes this class of bug impossible or loud. This step is what makes bug
    fixing compounding work rather than treadmill work.
11. **Document** in [memory/bugs.md](memory/bugs.md): symptom, root cause, root
    cause *class*, fix, prevention.

**Deliverables** — Fix; regression test; sibling audit result; data-repair record
if applicable; prevention measure; memory entry.

**Review gates** — Code Quality, Testing, Security. Add Data Integrity if
persisted data was affected.

**Approval gates** — QA confirms the original report no longer reproduces.
Security Engineer approves any fix in a security-relevant path.

**Iteration rules** — If the fix does not resolve the reproduction, the root
cause was wrong. Return to step 4; do not layer a second fix on top.

**Exit conditions** — Reproduction no longer reproduces; regression test in
place; siblings audited; prevention added; root cause recorded.

---

## 4. Research Workflow

**Entry conditions** — An unknown blocks planning or design, and the answer is
not derivable from the repository.

**Roles** — Whichever specialist owns the domain, plus the Planner.

**Steps**

1. **State the question precisely** and what decision it unblocks. If it unblocks
   no decision, do not research it.
2. **Timebox.** Write the box down. Research without a limit becomes a hobby.
3. **Define what "answered" means** before starting.
4. **Search inside first** — the repository, [memory/](memory/), prior
   [research/](research/), existing ADRs.
5. **Then outside** — prefer primary sources: specifications, official
   documentation, source code, measured benchmarks. Treat blog posts and forum
   answers as leads, not conclusions.
6. **Spike if reading is insufficient.** Write the smallest program that answers
   the question. Spike code is disposable — never ship it without taking it
   through the full loop.
7. **Record the finding** in [research/](research/) using the
   [research template](TEMPLATES.md#12-research-document): question, method,
   findings, sources, confidence, what remains unknown, recommendation.
8. **Feed the decision.** Attach to the ADR or plan that needed it.

**Deliverables** — Research document with sources and confidence; a
recommendation; disposable spike code clearly marked as such.

**Review gates** — Are sources primary and current? Is the confidence honest? Is
the recommendation actually supported by the findings, or does it exceed them?

**Approval gates** — None, unless the recommendation implies a one-way-door
decision — then human approval.

**Iteration rules** — If the timebox expires unanswered, report what was learned,
what remains unknown, and the options for proceeding anyway. Extend the box only
by explicit decision.

**Exit conditions** — The question is answered with stated confidence, or the
timebox expired and the state of knowledge is documented.

---

## 5. Architecture Workflow

**Entry conditions** — A decision is needed about structure, boundaries,
technology, data model, or a public contract.

**Roles** — System Architect (owner), CTO lens, Security Engineer, Performance
Engineer, Database Engineer (if data), DevOps Engineer (if operational), Engineering
Manager.

**Steps**

1. **State the forces.** What requirement, constraint, or pain is driving this?
   No force, no change — do not restructure for aesthetics.
2. **Establish constraints** from [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md):
   scale, latency, availability, compliance, budget, team capability.
3. **Check prior decisions.** An existing ADR may already settle this; reopen only
   with new evidence, and name the evidence.
4. **Generate at least three genuine options**, including "do nothing" and "the
   simplest thing that could work". If only two genuine options exist, say so
   rather than inventing a strawman.
5. **Evaluate** against the [decision framework](SYSTEM.md#7-decision-framework)
   axes, weighting them *before* scoring.
6. **Assess reversibility.** One-way doors get days of rigour; two-way doors get
   minutes.
7. **Prototype** if a critical assumption is unverified. Do not decide
   architecture on faith.
8. **Decide and record** an ADR: decision, rationale on the axes that mattered,
   what is being given up, consequences, blast radius if wrong, revisit trigger.
9. **Update [architecture/](architecture/)** so the living document reflects
   reality, not history.
10. **Plan the transition** if this changes an existing system — incremental,
    each step leaving the system working, with a rollback per step.

**Deliverables** — ADR in [DECISIONS.md](DECISIONS.md); updated architecture
document with diagrams and trust boundaries; migration plan if applicable.

**Review gates** — Architecture, Security, Performance, Scalability, Business
(cost and time implications).

**Approval gates** — Human approval for any one-way door: public contracts, data
formats, vendor commitments, anything with a material exit cost.

**Iteration rules** — If review reveals an unconsidered option, evaluate it
properly and re-decide. Do not defend the first answer.

**Exit conditions** — Decision recorded with alternatives and revisit trigger;
architecture document current; transition planned if needed.

---

## 6. Planning Workflow

**Entry conditions** — An objective exists that is larger than a single sitting.

**Roles** — Planner (owner), Product Manager, System Architect, Engineering
Manager, plus the specialists who will execute.

**Steps**

1. **Restate the objective** as an outcome, not an activity.
2. **Write falsifiable acceptance criteria.**
3. **Write non-goals.** This is the scope-creep firewall.
4. **Decompose** into milestones that are each independently valuable and
   verifiable, then into tasks with a deliverable and a verification method each.
5. **Identify** assumptions (and how you would detect each being wrong),
   constraints, dependencies, risks ([SYSTEM.md § 12](SYSTEM.md#12-risk-analysis)),
   and unknowns (each becomes a [research](#4-research-workflow) task).
6. **Sequence by risk.** The thing most likely to invalidate the plan goes first.
7. **Verify each milestone leaves the system working.**
8. **Plan rollback** for anything touching persistent data, external contracts, or
   production configuration.
9. **Estimate** with ranges and stated confidence. A single number implies
   certainty you do not have.
10. **Write the plan** to [planning/](planning/) using the
    [plan template](TEMPLATES.md#4-implementation-plan).

**Deliverables** — Plan document: objective, acceptance criteria, non-goals,
milestones, tasks, assumptions, risks, sequencing, rollback, estimates with
ranges.

**Review gates** — Could another engineer execute this without asking questions?
Is the riskiest unknown first? Does each milestone leave the system working? Is
there a rollback for irreversible steps?

**Approval gates** — Human approval of scope, sequencing, and estimate before
execution begins.

**Iteration rules** — Re-plan visibly when implementation contradicts the plan.
State what changed and why. Following a plan you know to be wrong is not
discipline.

**Exit conditions** — Plan approved and executable without clarification.

---

## 7. AI Development Workflow

**Entry conditions** — Work involves prompts, model selection, tool calling,
agent orchestration, retrieval, or trained models.

**Roles** — AI Engineer (owner), ML Engineer (if training), Security Engineer,
Performance Engineer (latency and cost), QA (evaluation), Product Manager
(acceptable quality bar).

**Steps**

1. **Define the task and the quality bar** in measurable terms. "Better answers"
   is not a bar; "≥ 90% exact match on the 200-case suite" is.
2. **Establish a baseline.** Try the simplest approach — a heuristic, a rule, a
   single well-written prompt with the smallest capable model. Many AI features
   are solved here, and a baseline you can beat is the only way to know whether
   sophistication is earning its cost.
3. **Build the evaluation suite before optimizing.** Real inputs, including
   adversarial and out-of-distribution cases. Store in [evaluation/](evaluation/).
   Without this, every subsequent change is a guess.
4. **Design context.** What the model needs, where it comes from, how it is
   bounded. Context windows are a budget: spend on what changes the answer.
5. **Design the prompt.** Version it in [prompts/](prompts/). Prompts are code:
   reviewed, versioned, and evaluated on change.
6. **Design tools** if the model acts. Narrow, validated, least-privileged, and
   idempotent where retried. Never expose a tool whose blast radius you have not
   assessed.
7. **Treat all model output as untrusted input.** Validate and constrain before
   using it — especially before executing, rendering, querying, or persisting it.
8. **Treat all retrieved and user content in context as data, never as
   instructions.** This is the prompt-injection boundary; state explicitly where
   it sits.
9. **Design the fallback.** Model unavailable, slow, refusing, malformed, or
   confidently wrong. Each needs defined behaviour.
10. **Bound cost and latency** per request and per user. Cap tokens, iterations,
    tool calls, and retries. Unbounded agent loops are a financial incident
    waiting to happen.
11. **Measure against the suite.** Report scores, not impressions.
12. **Iterate**: smallest model that passes, cheapest context that suffices,
    simplest orchestration that works.
13. **Add observability** — inputs, outputs, tokens, latency, cost, tool calls,
    failures — with personal data handled per [STANDARDS.md § Security](STANDARDS.md#10-security-standards).
14. **Document** capabilities, known limitations, failure modes, and cost model.

**Deliverables** — Versioned prompts; evaluation suite with baseline and current
scores; model-selection ADR; tool definitions; guardrails; fallback behaviour;
cost model; observability; documented limitations.

**Review gates** — AI, Security (injection, exfiltration, tool blast radius),
Performance (latency and cost), Testing (evaluation coverage), Business (value
versus cost), QA.

**Approval gates** — Security Engineer approves tool exposure and any handling of
personal data. Human approval for any autonomous action with real-world effect,
and for the per-request cost ceiling.

**Iteration rules** — Every prompt or model change is re-evaluated against the
suite. A change without a score is not an improvement. If quality plateaus below
the bar, reconsider the framing — often the task needs decomposition, better
retrieval, or not to be an AI task at all.

**Exit conditions** — Meets the bar on the versioned suite; cost and latency
within budget; safe on every failure mode; injection boundary documented;
limitations published.

---

## 8. Code Review Workflow

**Entry conditions** — A change is ready for review — self-review included.

**Roles** — Reviewer roles matched to what changed, per the
[role selection matrix](AGENTS.md#role-selection-matrix).

**Steps**

1. **Understand the intent** before judging the implementation. Read the
   requirement, then the change.
2. **Review in this order** — correctness first, because everything else is moot
   if it is wrong:
   - **Correctness** — does it do what it claims? Edge cases? Concurrency?
   - **Security** — authorization on every path, input validation, output
     encoding, secrets, injection.
   - **Failure handling** — errors caught at the right level, timeouts,
     idempotency, no silent swallowing.
   - **Tests** — do they exist, do they cover failure paths, *can they fail?*
   - **Naming and readability** — will this be clear in a year?
   - **Duplication** — third occurrence? Abstract. Second? Leave it.
   - **Complexity** — what can be deleted?
   - **Performance** — N+1 queries, unbounded growth, missing pagination.
   - **Logging and observability** — diagnosable in production?
   - **Documentation** — updated where user- or developer-visible?
   - **Standards** — [STANDARDS.md](STANDARDS.md) conformance.
3. **Critique adversarially.** How does this fail? See
   [SYSTEM.md § 3, stage 7](SYSTEM.md#stage-detail).
4. **Separate severity levels explicitly:**
   - **Blocking** — correctness, security, data loss, missing tests on new logic.
   - **Should fix** — maintainability, clarity, standards.
   - **Consider** — preference, alternatives. Explicitly optional.
   Unlabelled feedback wastes time by making everything look equally urgent.
5. **Be specific.** Every finding names the location, the problem, and what would
   fix it. "This is confusing" is not a review comment.
6. **Verify claims.** If the change says "tested", check the tests exist and
   cover the behaviour. If it says "no behaviour change", check.
7. **Record** the review in [reviews/](reviews/) for anything Standard or larger.

**Deliverables** — Review record with findings by severity; explicit approval or
rejection.

**Review gates** — The gates themselves, per [SYSTEM.md § 10](SYSTEM.md#10-quality-gates).

**Approval gates** — Security Engineer must approve security-relevant changes.
Reviewer approval required before merge.

**Iteration rules** — Author addresses all blocking findings and either fixes or
answers each "should fix". Re-review the changes, not the whole diff again. A
reviewer may not add new scope; genuinely new scope becomes a new task.

**Exit conditions** — No blocking findings open; "should fix" items resolved or
consciously deferred with a reason; approval recorded.

---

## 9. Testing Workflow

**Entry conditions** — Behaviour has changed, or the suite needs strengthening.

**Roles** — Testing Engineer (owner), the implementing Engineer, QA, Security
Engineer for security tests, Performance Engineer for load tests.

**Steps**

1. **Identify what must be true** — from acceptance criteria, invariants, and
   failure requirements. Test behaviour, not implementation.
2. **Choose the right level** for each: unit for logic and branching, integration
   for boundaries and contracts, end-to-end for critical user journeys only. Most
   suites are inverted — too many slow end-to-end tests asserting things a unit
   test could catch in milliseconds.
3. **Write the failing test first** where practical. A test you never saw fail is
   a test you cannot trust.
4. **Cover the boundaries** — zero, one, many, maximum, empty, null, malformed,
   duplicate, out-of-order, unicode, maximum length.
5. **Cover the failure paths** — dependency down, dependency slow, dependency
   lying, partial write, concurrent modification, retry, timeout.
6. **Cover the negatives** — unauthorized denied, invalid rejected, rate limit
   enforced. These are where systems are least verified and most exposed.
7. **Add security tests** for authorization boundaries and injection surfaces.
8. **Add performance tests** where a target exists.
9. **Verify tests can fail.** Break the implementation deliberately; confirm red;
   restore. Do this at least once per new test file.
10. **Eliminate flakes immediately.** A flaky test is worse than no test: it
    trains the team to ignore red builds. Fix it or delete it the day it appears.
11. **Assess coverage by risk**, not by line percentage. 100% line coverage with
    no failure-path tests is worse than 60% that covers what matters.

**Deliverables** — Tests at appropriate levels; fixtures and test data strategy;
risk-based coverage analysis; documented gaps.

**Review gates** — Testing, Security (for security tests), plus: does every test
fail when its behaviour breaks?

**Approval gates** — QA confirms acceptance criteria are covered.

**Iteration rules** — Every escaped defect adds a test *and* an answer to "why
did the suite miss this class of bug?"

**Exit conditions** — New behaviour covered including edge, failure, and negative
cases; every test proven able to fail; suite green, deterministic, and fast enough
to run per change.

---

## 10. Deployment Workflow

**Entry conditions** — QA has signed off; all gates pass; rollback exists and has
been tested.

**Roles** — DevOps Engineer (owner), Release Manager, Infrastructure and Cloud
Engineers, the implementing Engineer, Database Engineer if migrations are
involved.

**Steps**

1. **Pre-flight** — [Deployment checklist](CHECKLISTS.md#11-deployment-checklist).
   Confirm gates passed with evidence, not with memory.
2. **Confirm rollback works.** Tested, not documented. An untested rollback is a
   hope.
3. **Order migrations correctly.** Schema changes deploy *before* the code that
   needs them and must be backward-compatible with the currently-running version
   for the whole rollout window. Expand, migrate, contract — never in one step.
4. **Deploy to staging** and verify against production-like data and volume.
5. **Announce** — what is deploying, expected impact, who is watching.
6. **Deploy progressively** — canary or percentage rollout where the platform
   allows. Feature-flag anything risky so exposure is decoupled from deployment.
7. **Watch the pre-defined signals** — error rate, latency, saturation, and the
   feature's own success metric. Defining these *after* deploying means you will
   see what you hope to see.
8. **Verify in production** — exercise the actual path, do not just read the
   dashboard.
9. **Decide: proceed, hold, or roll back.** Roll back on ambiguity. Rolling back
   unnecessarily costs an hour; not rolling back when you should costs a
   postmortem.
10. **Complete the rollout**, then verify again at full traffic.
11. **Record** what deployed, when, its commit, and how to reverse it.

**Deliverables** — Deployed change; verification record; deployment log entry;
updated runbook if operational behaviour changed.

**Review gates** — All gates passed pre-deployment; post-deployment verification
against pre-defined signals.

**Approval gates** — Release Manager go/no-go. Database Engineer approves
migrations. Human approval for anything irreversible.

**Iteration rules** — On any regression: roll back first, diagnose second. Never
debug forward in production while users are affected.

**Exit conditions** — Deployed at full traffic; signals healthy; verified by
exercising the real path; rollback still available; log recorded.

---

## 11. Maintenance Workflow

**Entry conditions** — Scheduled upkeep, dependency updates, or debt paydown.
Run this on a cadence; maintenance deferred indefinitely becomes an incident.

**Roles** — relevant Engineers, Security Engineer, DevOps Engineer, Engineering
Manager (budget), QA.

**Steps**

1. **Inventory** — outdated dependencies, known vulnerabilities, deprecated APIs,
   expiring certificates and credentials, unpatched runtimes, growing tables,
   filling disks, alerts that fire without action, and
   [memory/technical-debt.md](memory/technical-debt.md).
2. **Prioritize by risk**: security vulnerabilities → end-of-life runtimes →
   expiring credentials → capacity limits approaching → debt slowing current work
   → the rest.
3. **Update dependencies incrementally**, not in one large batch. A batch update
   that breaks gives you no signal about which change caused it.
4. **Read changelogs** for breaking changes rather than trusting semantic
   versioning to be honest.
5. **Pay down debt that is actively slowing work** — not debt that merely offends
   you. Debt in stable code that nobody touches is cheap to leave.
6. **Verify with the full suite** after each increment.
7. **Remove dead code, unused dependencies, stale flags, and orphaned
   resources.** Deletion is the highest-return maintenance activity.
8. **Update [memory/technical-debt.md](memory/technical-debt.md)** — what was
   paid, what remains, what it costs to carry.

**Deliverables** — Updated dependencies; resolved vulnerabilities; deletions;
debt register updated; maintenance record.

**Review gates** — Security (vulnerabilities resolved), Testing (suite green),
Code Quality.

**Approval gates** — Human approval for major-version upgrades with breaking
changes.

**Iteration rules** — If an update breaks something, fix or revert that single
update. Never carry a broken update forward to keep momentum.

**Exit conditions** — No known high or critical vulnerabilities; dependencies
within the supported window; debt register current; suite green.

---

## 12. Incident Response Workflow

**Entry conditions** — Production is degraded, broken, or compromised.

**Roles** — Incident Commander (one person, explicitly named), relevant
Engineers, DevOps Engineer, Security Engineer (if compromise is suspected),
Release Manager, Engineering Manager (communication).

**Steps**

1. **Declare the incident and name the commander.** Ambiguous ownership is the
   most common reason incidents run long.
2. **Assess severity** — who is affected, how badly, is data at risk, is it
   getting worse.
3. **Mitigate before diagnosing.** Roll back, disable the flag, shed load, fail
   over. **Restoring service is not the same as fixing the bug, and it comes
   first.**
4. **Communicate early and on a fixed interval.** Say what is known, what is
   unknown, and when the next update comes. Silence is interpreted as absence.
5. **Preserve evidence** before restarting anything — logs, metrics, dumps, the
   state of affected records. Restarts destroy the evidence you will need.
6. **Diagnose from evidence**, not from hypotheses you find appealing. One change
   at a time, so you know what worked.
7. **Contain, if compromise is suspected.** Rotate credentials, revoke sessions
   and tokens, isolate affected systems, then bring in Security Engineer and
   follow legal and disclosure obligations.
8. **Verify recovery** by exercising the real user path, and confirm no data was
   lost or corrupted. Check for a backlog that will now stampede.
9. **Resolve and communicate** the resolution.
10. **Write a blameless postmortem within 48 hours**, using the
    [postmortem template](TEMPLATES.md#11-postmortem). Systems fail; blaming
    people ends learning and hides the next failure.
11. **Convert every action item into a tracked task with an owner.** A postmortem
    with unowned actions is an essay.
12. **Record** in [memory/lessons-learned.md](memory/lessons-learned.md) and
    [memory/bugs.md](memory/bugs.md).

**Deliverables** — Service restored; timeline; postmortem; owned action items;
prevention measures; memory entries.

**Review gates** — Postmortem completeness; are action items specific and owned;
would the detection have been faster with better telemetry.

**Approval gates** — Incident Commander declares resolution. Security Engineer
approves closure of any security incident. Human approval for external
disclosure.

**Iteration rules** — If mitigation does not restore service, escalate the
severity and bring in more people. Do not persist alone past the point where help
would be faster.

**Exit conditions** — Service verified restored; no data loss or loss quantified
and disclosed; postmortem published; action items owned and tracked.

---

## 13. Refactoring Workflow

**Entry conditions** — Structure is impeding work, with a specific example of the
impediment. **"It offends me" is not an entry condition.**

**Roles** — relevant Engineers, System Architect (if boundaries move), Testing
Engineer, QA.

**Steps**

1. **State the force.** What is harder than it should be, specifically? What will
   be easier afterwards, and how will you know?
2. **Confirm the behaviour is covered by tests first.** Refactoring without tests
   is rewriting with extra confidence. If coverage is missing, add it *before*
   changing structure — characterization tests that pin current behaviour, even
   behaviour you believe is wrong.
3. **Separate refactoring from behaviour change absolutely.** Never in the same
   commit. Mixed commits are unreviewable and unbisectable — the single most
   common way refactoring introduces outages.
4. **Refactor in small, reversible steps**, keeping the suite green after each.
   If the suite cannot be green mid-way, the step is too large.
5. **Verify behaviour is unchanged** — same tests, same results, no test
   modifications. Any test you *had* to change is either a behaviour change or a
   test that was asserting implementation detail; know which.
6. **Measure the improvement** against the force from step 1. If the thing that
   was hard is not now easier, the refactor did not work.
7. **Then, separately**, make the behaviour change that motivated it.
8. **Update documentation and diagrams** that referenced the old structure.

**Deliverables** — Restructured code with identical behaviour; unchanged tests
passing; updated documentation; measured improvement against the stated force.

**Review gates** — Architecture (if boundaries moved), Code Quality, Testing
(coverage sufficient and unmodified), plus: is behaviour provably unchanged?

**Approval gates** — System Architect approves boundary changes.

**Iteration rules** — If tests need modifying, stop: you are changing behaviour.
Split the work. If the refactor grows beyond its stated force, stop and re-plan.

**Exit conditions** — Behaviour provably unchanged; the stated force measurably
reduced; documentation current.

---

## 14. Documentation Workflow

**Entry conditions** — Behaviour, interfaces, configuration, or operations
changed; or existing documentation is wrong.

**Roles** — Technical Writer, Documentation Engineer, the implementing Engineer,
QA.

**Steps**

1. **Identify the reader and their intent.** Four distinct needs, four distinct
   documents: *learning* (tutorial), *doing* (how-to guide), *looking up*
   (reference), *understanding* (explanation). Merging them produces documents
   that serve nobody.
2. **Write the reference from the source** — generate it where possible so it
   cannot drift.
3. **Write guides task-first**, in the order the reader will act.
4. **Include working examples.** Copy-pasteable and *executed* to confirm they
   work. A broken example destroys trust in the entire document.
5. **Document the why** — constraints, trade-offs, and rejected alternatives.
   This is the part that cannot be reconstructed from the code, and the part
   future engineers need most.
6. **Document limitations and failure modes explicitly.** Known limitations
   published are a feature; discovered by users, they are a defect.
7. **Document configuration** — every option, its type, default, valid range, and
   effect.
8. **Document operations** — how to deploy, monitor, diagnose, and recover.
9. **Verify by execution**: follow your own instructions on a clean environment.
   This finds the assumed steps that the author cannot see.
10. **Automate the checks** — example execution, link validation, and reference
    generation in CI.

**Deliverables** — Documentation matched to reader intent; verified examples;
generated references; documented limitations; CI checks.

**Review gates** — Documentation. Plus: can a new engineer go from clone to
running in under thirty minutes using only this? Is any claim already false?

**Approval gates** — Technical Writer approves clarity; the implementing Engineer
approves accuracy.

**Iteration rules** — Every documentation-related support question is a
documentation defect. Fix the document, not just the questioner.

**Exit conditions** — Accurate as of today; every example executed successfully;
links resolve; checks automated.

---

## 15. Security Review Workflow

**Entry conditions** — Any change (lightweight pass), or specifically: changes to
authentication, authorization, data handling, dependencies, infrastructure, or
anything internet-facing (full pass). Also run on a recurring schedule
independent of change.

**Roles** — Security Engineer (owner, with veto), System Architect, relevant
Engineers, DevOps and Cloud Engineers for infrastructure, QA.

**Steps**

1. **Threat model.** What are the assets, who are the adversaries, what are the
   entry points, what are the trust boundaries? Assume an attacker with a valid
   account, your source code, and patience.
2. **Authentication** — credential storage and hashing, session lifecycle,
   token expiry and revocation, multi-factor support, brute-force protection,
   password reset flow, account enumeration.
3. **Authorization** — enforced server-side on **every** path; object-level
   ownership checks (not just role checks); horizontal and vertical privilege
   escalation; default-deny; no reliance on the UI hiding anything.
4. **Input validation** — every external input validated at the boundary by
   allowlist where possible: body, query, headers, cookies, file uploads, webhook
   payloads, and any content returned by a third party or a model.
5. **Injection** — SQL, NoSQL, command, LDAP, template, path traversal,
   deserialization, XXE, and prompt injection for AI paths. Parameterize; never
   concatenate.
6. **Output encoding** — contextually correct for each sink: HTML, attribute, JS,
   URL, SQL, shell, log. XSS is an encoding failure, not a validation failure.
7. **SSRF** — validate and allowlist any URL the server fetches; block internal
   ranges and cloud metadata endpoints specifically.
8. **CSRF** — state-changing requests protected by token or equivalent;
   `SameSite` cookies.
9. **Secrets** — absent from code, configuration files, logs, error messages, and
   client bundles; stored in a secret manager; rotatable; rotation tested.
10. **Encryption** — TLS in transit with modern configuration; sensitive data
    encrypted at rest; keys managed and rotatable; no custom cryptography.
11. **Rate limiting** — on authentication, password reset, registration, search,
    export, and any expensive or AI-backed endpoint.
12. **File uploads** — type and size validated by content not extension, stored
    outside the web root, served with correct headers, scanned where warranted,
    never executed.
13. **Dependencies** — scanned, pinned, from trusted sources, with a documented
    update policy. Check for typosquats on new additions.
14. **Audit logging** — actor, action, target, time, and outcome for every
    security-relevant event; tamper-resistant; personal data excluded or
    minimized.
15. **Data protection** — minimization, retention limits, deletion that actually
    deletes (including backups and derived data), residency, and access controls.
16. **Error handling** — no stack traces, internal paths, versions, or SQL in
    responses.
17. **Security headers** — CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`,
    frame protection.
18. **Assess blast radius** — what does one compromised credential, one
    compromised service, or one malicious dependency reach?
19. **Record findings** with severity, a concrete exploitation scenario, and a
    specific remediation, in [reviews/](reviews/).

**Deliverables** — Threat model; findings by severity with exploitation scenarios
and remediations; dependency audit; verification of fixes; accepted risks
documented, dated, and owned.

**Review gates** — Security gate. No critical or high findings may remain open.

**Approval gates** — Security Engineer approval required. **The security veto may
only be overridden by an explicit, documented human risk acceptance**, recorded in
[memory/decisions.md](memory/decisions.md) with a date and a named owner.

**Iteration rules** — Every finding is fixed and *verified fixed* by re-testing
the exploitation scenario — not by reading the patch. Fixing one instance requires
grepping for the same pattern everywhere.

**Exit conditions** — Threat model current; no open critical or high findings;
every accepted risk documented with owner and date; fixes verified by re-test.

---

## 16. Release Management Workflow

**Entry conditions** — A candidate set of changes has passed QA and is intended
for users.

**Roles** — Release Manager (owner), DevOps Engineer, QA, Product Manager,
Technical Writer, Security Engineer, Engineering Manager.

**Steps**

1. **Freeze the scope.** Define exactly what is in the release. Late additions
   are the most common source of release failures because they arrive
   under-reviewed.
2. **Verify every gate passed** with evidence, per change.
3. **Assign the version** per [VERSION.md](VERSION.md) — breaking changes get a
   major bump, honestly, even when inconvenient.
4. **Write the changelog** from the changes and the **release notes** for users.
   Different audiences; both required.
5. **Identify breaking changes and migration steps.** Communicate before
   shipping, never after.
6. **Confirm backward compatibility** for the rollout window: old clients against
   the new server, and the previous release against the migrated schema.
7. **Define the success signal and the abort criteria** *before* releasing.
8. **Verify the rollback** by exercising it.
9. **Go/no-go** with the roles present. Any unresolved blocking finding is a
   no-go, regardless of schedule pressure.
10. **Release** via the [Deployment workflow](#10-deployment-workflow).
11. **Verify against the pre-defined success signal**, and monitor through at
    least one full traffic cycle.
12. **Publish** release notes and update documentation to the released version.
13. **Retrospect** — what made this release harder than it needed to be? Fix that
    before the next one.
14. **Update** [CHANGELOG.md](CHANGELOG.md) and
    [memory/completed-work.md](memory/completed-work.md).

**Deliverables** — Versioned release; changelog; user release notes; migration
guide if breaking; go/no-go record; post-release verification; retrospective
notes.

**Review gates** — All gates per change; Documentation (notes accurate);
Security (no unresolved findings); QA sign-off.

**Approval gates** — Release Manager go/no-go. Human approval for breaking
changes and for any external communication.

**Iteration rules** — A no-go returns the release to the workflow that owns the
blocking issue. Do not narrow the release scope to route around a blocking
finding without recording that decision.

**Exit conditions** — Released; success signal confirmed; notes published;
documentation current; rollback available; retrospective captured.
