# PLAYBOOKS.md — Operational Playbooks

Concrete, ordered runbooks for specific recurring situations, written to be followed under pressure by someone who is tired.

**A workflow is the lifecycle of a kind of work.** See [WORKFLOW.md](WORKFLOW.md). A bug fix workflow defines entry conditions, roles, deliverables, gates, and iteration rules — the universal shape of bug-fixing.

**A playbook is a concrete ordered runbook for a specific recurring situation.** It says: when this exact condition occurs, execute these numbered steps in this order. Playbooks are optimized to be followed at 3am: imperative verbs, explicit decision points, no prose to wade through. Each step is atomic and verifiable.

Use workflows to *design* how work moves through the system. Use playbooks to *execute* when the situation matches the trigger exactly.

| Playbook | Trigger |
| --- | --- |
| [1. Launching a new product](#1-launching-a-new-product) | Zero to first users |
| [2. Starting a new project in an existing organization](#2-starting-a-new-project-in-an-existing-organization) | Inheriting standards, wiring Gatecraft |
| [3. Adding a feature to an existing system](#3-adding-a-feature-to-an-existing-system) | Fast path through feature workflow |
| [4. Fixing a production bug](#4-fixing-a-production-bug) | With severity branch |
| [5. Responding to a production incident](#5-responding-to-a-production-incident) | Mitigate before diagnosing |
| [6. Responding to a security incident](#6-responding-to-a-security-incident) | Containment first |
| [7. Responding to a data-loss or corruption event](#7-responding-to-a-data-loss-or-corruption-event) | Stop the bleeding |
| [8. Scaling a system hitting a limit](#8-scaling-a-system-hitting-a-limit) | Measure first, find constraint |
| [9. Diagnosing a performance regression](#9-diagnosing-a-performance-regression) | Bisect, profile, fix |
| [10. Deploying to production](#10-deploying-to-production) | Routine deployment |
| [11. Rolling back a bad release](#11-rolling-back-a-bad-release) | Decisive rollback |
| [12. Running a database migration safely](#12-running-a-database-migration-safely) | Expand/migrate/contract |
| [13. Upgrading a major dependency](#13-upgrading-a-major-dependency) | Incremental upgrade |
| [14. Paying down technical debt](#14-paying-down-technical-debt) | Choosing what to pay |
| [15. Large refactoring](#15-large-refactoring) | Behaviour-preserving |
| [16. Onboarding a new engineer or agent](#16-onboarding-a-new-engineer-or-agent) | Reading order, first task |
| [17. Starting an AI feature](#17-starting-an-ai-feature) | Baseline first |
| [18. Improving an AI system already in production](#18-improving-an-ai-system-already-in-production) | Drift, eval regression |
| [19. Handling a cost runaway](#19-handling-a-cost-runaway) | Detect, cap, diagnose |
| [20. Conducting a research spike](#20-conducting-a-research-spike) | Timebox, disposable code |
| [21. Deprecating and removing a feature](#21-deprecating-and-removing-a-feature) | Announce, migrate, delete |
| [22. Recovering a project that has lost quality control](#22-recovering-a-project-that-has-lost-quality-control) | Triage inherited chaos |

---

## 1. Launching a new product

**Trigger** — A product intent exists and a launch date is being discussed. No users have ever touched the system.

**Owner** — Product Manager, with Release Manager owning the launch sequence and CTO lens owning the go/no-go.

**Prerequisites** — [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) written and approved. Walking skeleton deployed per [New Project](WORKFLOW.md#1-new-project-workflow). Success metrics defined and instrumented.

**Steps**

1. **Write the launch definition.** Who is the first cohort, how many, how they get in, and what one thing must work for them. If you cannot name the cohort, you are not launching, you are publishing.
2. **Freeze scope four weeks out.** Everything not already built is post-launch. Late features arrive under-reviewed and are the most common cause of launch failure.
3. **Walk the pre-launch gate list.** Every item is binary — pass or block. No item is waived without a named human accepting the risk in [memory/decisions.md](memory/decisions.md):
   - Critical path works end-to-end in production, exercised by a human, not a test.
   - Signup, login, password reset, and account deletion all work.
   - Payment path charges correctly and refunds correctly, if money is involved.
   - Authorization enforced server-side on every endpoint; object-level ownership checked.
   - Secrets in a secret manager, absent from bundles, logs, and error responses.
   - Rate limits on auth, reset, registration, search, and every expensive endpoint.
   - Backups run, and a restore has been performed successfully into a scratch environment.
   - Error tracking, uptime monitoring, and log aggregation live and alerting a human.
   - Rollback tested by exercising it, not by reading the document.
   - Legal surface present: terms, privacy policy, cookie handling, data-deletion mechanism.
   - Support channel exists and someone is watching it.
   - Status page or equivalent, so the first outage is not communicated by silence.
4. **Load-test to 10x the expected first-week traffic.** If it fails, you learn now instead of during the launch post.
5. **Run a closed beta with 5-20 real users** for at least one week. Watch sessions. Read every support message.
6. **Fix what beta found. If beta found a critical-path defect → fix, re-verify, and extend beta by a week; else → proceed.**
7. **Define the abort criteria before launching** — the error rate, the signup-failure rate, and the support-volume threshold at which you pull back.
8. **Launch to the first cohort, not to everyone.** Ramp deliberately: cohort, then 10%, then full.
9. **Staff the launch window.** Named on-call for the first 72 hours with escalation defined.
10. **Watch the pre-defined signals hourly for 24 hours**, then daily for a week.

**Verification** — First cohort completes the critical path with a success rate above the defined bar. Error rate within budget. No open critical or high security findings. Support volume manageable.

**Rollback** — Close signups and revert to waitlist. If a data-integrity defect surfaced, stop writes on the affected path before communicating.

**Aftercare** — Record the launch in [memory/completed-work.md](memory/completed-work.md). Log every gate that was waived, and why, in [memory/decisions.md](memory/decisions.md). Write a launch retrospective within a week: what we shipped that nobody used, what broke, what we learned about the users. File follow-ups as tracked tasks with owners.

**Common mistakes** — Launching to everyone at once so there is no ramp to learn from. Treating the gate list as advisory under date pressure. No abort criteria, so every signal gets argued about live. Nobody watching support. Backups configured but never restored.

---

## 2. Starting a new project in an existing organization

**Trigger** — A requirement for a new service or capability exists. The organization already has repositories, standards, and infrastructure. You are inheriting rather than inventing.

**Owner** — System Architect, with the Planner owning task breakdown and DevOps Engineer owning pipeline wiring.

**Prerequisites** — Organizational standards documented and accessible. Template repositories or examples available. Access to CI, hosting, and secret management provisioned.

**Steps**

1. **Read the organization's standards first.** Start with [STANDARDS.md](STANDARDS.md) and the equivalent in other repositories. Match the surrounding idiom — language, framework, data store, observability stack, secret management, deployment target. Consistency beats novelty in multi-repo organizations.
2. **Clone or reference the template repository** if one exists. Do not reinvent foundations that are already standardized.
3. **Write [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** scoped to this project: problem, users, goals, constraints, non-goals. Link to broader organizational context if it exists elsewhere.
4. **Initialize the Gatecraft in this repository.** Create `.ai/`, copy the framework files, and add the pointer per [README.md](README.md#installing-the-gatecraft-in-a-repository). Initialize [memory/](memory/) with project-specific memory files.
5. **Wire CI/CD to match the organization's pipeline pattern.** Do not invent a new deployment shape unless there is a documented reason the existing one does not apply.
6. **Adopt the organization's gate configuration** — linters, formatters, test runners, security scanners. Gates are enforced at the organization level, not customized per project.
7. **Set up observability using the existing stack.** Logs, metrics, traces, and alerts go where the organization already looks for them.
8. **Record a baseline ADR for this project** — why this project exists, what larger objective it serves, and which organizational standards apply. Place it in [DECISIONS.md](DECISIONS.md).
9. **Build the walking skeleton** using the organization's libraries and patterns. One end-to-end path deployed to the organization's staging or development environment.
10. **Verify the skeleton is discoverable.** Update the organization's service registry, developer portal, or equivalent so others know this exists.

**Verification** — Walking skeleton deployed and accessible through organizational tooling. CI green and enforcing all organizational gates. Project discoverable in service registry. [memory/](memory/) initialized.

**Rollback** — Not applicable — this is creation work. If the project is abandoned before launch, archive the repository visibly so the name and intent are reserved and documented.

**Aftercare** — Record the repository in the organization's project inventory. Add it to relevant dependency graphs. Schedule the first checkpoint review with the System Architect or CTO lens within two weeks.

**Common mistakes** — Choosing a different language or framework without an ADR justifying the divergence. Inventing a new deployment pipeline when a working one exists. Skipping the walking skeleton and building multiple incomplete paths in parallel. Not linking to organizational context, leaving the project an island.

---

## 3. Adding a feature to an existing system

**Trigger** — A requirement exists with testable acceptance criteria. The system is already live and maintained.

**Owner** — Feature Engineer, with Product Manager owning acceptance and QA owning sign-off.

**Prerequisites** — Requirement stated as a user problem, not a solution. Acceptance criteria written and falsifiable. [memory/](memory/) read.

**Steps**

1. **Restate the user problem in your own words.** If you cannot restate it without looking at the document, you do not understand it yet.
2. **Confirm the acceptance criteria are testable.** "Users like it" is not testable. "Completes the task in under 3 seconds with a success rate above 95%" is testable.
3. **Read [memory/decisions.md](memory/decisions.md) for constraints** — past decisions about this area, technical debt known to affect this path, and any non-goals.
4. **Search the codebase for existing solutions.** Grep for similar features. Most features are 80% already built; reuse beats rewrite.
5. **Design interfaces before internals.** API, UI, data model. If the interface is wrong, fast internals are irrelevant.
6. **Design the failure modes with the happy path.** What happens when the input is malformed, the third-party is down, the user has no permission, the data does not exist.
7. **Write an implementation plan** if this spans more than one sitting. Vertical slices. Sequence the riskiest unknown first. Each slice leaves the system working.
8. **Implement slice by slice** following [STANDARDS.md](STANDARDS.md). Match surrounding idiom. Each commit is a working increment.
9. **Write tests at the appropriate levels** — unit for logic, integration for boundaries, end-to-end for the critical path. Test the failure modes, not just the happy path.
10. **Run the full suite.** Green before review, non-negotiable.
11. **Self-review against every applicable gate** using [CHECKLISTS.md](CHECKLISTS.md). Fix what you find before asking others to review.
12. **Document** — user-facing docs if the interface changed, inline comments for non-obvious decisions, an ADR if a significant choice was made.
13. **Update [memory/completed-work.md](memory/completed-work.md)** and any debt deliberately taken in [memory/technical-debt.md](memory/technical-debt.md).
14. **Request review** with evidence that each acceptance criterion passes.

**Verification** — Each acceptance criterion validated with evidence. All tests green. Self-review complete against applicable gates. Documentation current.

**Rollback** — Revert the commit or merge. If a migration shipped, rollback requires the inverse migration and may require data reconciliation.

**Aftercare** — Monitor the feature's usage, error rate, and performance for the first week. File follow-up tasks for any rough edges discovered in production but not severe enough to block release.

**Common mistakes** — Starting implementation without understanding the problem, so the feature solves the wrong thing. Skipping the search for existing solutions and rebuilding what already exists. Implementing the happy path only and discovering failure modes in production. Green-lighting the feature without testing every acceptance criterion.

---

## 4. Fixing a production bug

**Trigger** — A defect is reported affecting users in production, with observed and expected behaviour stated.

**Owner** — The Engineer owning the affected area, with QA owning confirmation that the report no longer reproduces.

**Prerequisites** — A reproduction path or enough signal to build one. Access to production logs and metrics.

**Steps**

1. **Assess severity and blast radius before touching anything.** How many users, how badly, is data at risk, is it getting worse?
2. **Branch on severity. If production is materially degraded, data is at risk, or the impact is growing → stop here and execute [5. Responding to a production incident](#5-responding-to-a-production-incident); else → continue with this playbook.** Mitigation comes before root cause when users are actively affected.
3. **Reproduce reliably.** An intermittent reproduction means you have not found the trigger yet. Keep going. Record the exact steps, environment, and data state.
4. **Write a failing test that captures the defect.** This is the definition of done and becomes the regression test. If you cannot write it, you have not understood the bug.
5. **Find the root cause.** Ask "why" until you reach a cause you can fix. Fixing a symptom creates two bugs: the original and the misleading patch.
6. **Grep for siblings.** Search for the same pattern elsewhere in the codebase. Most bugs have relatives, and shipping a fix for one instance while three remain is worse than not shipping.
7. **Assess data damage. If the bug corrupted or leaked persisted data → execute [7. Responding to a data-loss or corruption event](#7-responding-to-a-data-loss-or-corruption-event) for the repair and disclosure path; else → continue.**
8. **Fix at the right layer** — where the invariant should have been enforced, not where the symptom appeared. A validation bug is fixed at the boundary, not in the renderer.
9. **Verify the failing test passes** and the full suite is green.
10. **Review** against Code Quality, Testing, and Security gates. Ask explicitly: why did the existing tests not catch this?
11. **Improve the safety net.** Add the check, constraint, type, schema rule, or lint rule that makes this class of bug impossible or loud. This step is what makes bug fixing compounding work rather than treadmill work.
12. **Deploy** per [10. Deploying to production](#10-deploying-to-production).
13. **Record in [memory/bugs.md](memory/bugs.md)**: symptom, root cause, root cause *class*, fix, prevention added.

**Verification** — The original reproduction no longer reproduces, confirmed by QA. Regression test in place and proven able to fail. Siblings audited. Full suite green in production configuration.

**Rollback** — Revert the fix commit. If the fix included a migration or data repair, rollback requires the inverse and may not be clean — assess before deploying, not after.

**Aftercare** — Update [memory/bugs.md](memory/bugs.md) with the root cause class, not just the instance. If the same class appears a third time, escalate it to a [14. Paying down technical debt](#14-paying-down-technical-debt) item — recurring bugs in one area are a structural signal.

**Common mistakes** — Fixing the symptom because the root cause is inconvenient. Skipping the failing test and verifying by hand, so the bug returns in six months. Not grepping for siblings. Shipping the fix without adding the prevention, guaranteeing the class recurs. Treating a material production impact as a routine bug fix instead of branching to incident response.

---

## 5. Responding to a production incident

**Trigger** — Production is degraded, broken, or behaving unpredictably, and users are affected now.

**Owner** — Incident Commander — one person, named out loud, who does not also debug. Supporting: DevOps Engineer, the Engineer owning the affected area, Engineering Manager on communication.

**Prerequisites** — Access to logs, metrics, deployment history, and feature flags. A published rollback procedure. A communication channel users can see.

**Steps**

1. **Declare the incident out loud** in the shared channel. Ambiguous ownership is the most common reason incidents run long. An unclear "is someone looking at this?" is not a declaration.
2. **Name the Incident Commander explicitly.** The commander coordinates, decides, and communicates. The commander MUST NOT be head-down in a debugger — if you are the only responder, you are the commander and you narrate your own actions in the channel.
3. **Assess severity** — who is affected, how badly, is data at risk, is it getting worse. Write the answer in the channel so everyone shares one picture.
4. **Branch on suspicion of compromise. If credentials, unauthorized access, or malicious activity are suspected → execute [6. Responding to a security incident](#6-responding-to-a-security-incident) instead; else → continue.**
5. **Mitigate before diagnosing.** Roll back the last deploy, disable the feature flag, shed load, fail over, or scale out. **Restoring service is not the same as fixing the bug, and it comes first.** Resist the pull to understand before acting.
6. **Check the obvious cause first.** If a deploy went out in the last hour → roll it back per [11. Rolling back a bad release](#11-rolling-back-a-bad-release) before investigating anything else; else → look at recent config changes, flag flips, dependency incidents, and traffic shape.
7. **Communicate on a fixed interval** — every 15 minutes for a severe incident, every 30 otherwise. Each update states what is known, what is unknown, and when the next update comes. Set a timer. Silence is interpreted as absence, and absence escalates on its own.
8. **Preserve evidence before restarting anything.** Capture logs, metrics snapshots, heap or thread dumps, queue depths, and the state of affected records. Restarts destroy exactly the evidence you will need in the postmortem, and the pressure to restart is highest when evidence is most fragile.
9. **Diagnose from evidence, not from the hypothesis you find most appealing.** Change one thing at a time so you know what worked. Two simultaneous changes teach you nothing.
10. **Escalate if mitigation does not restore service within one interval.** Bring in more people. Do not persist alone past the point where help would be faster — heroism extends outages.
11. **Verify recovery by exercising the real user path.** Log in as a real user, complete the real transaction. A green dashboard with a broken checkout is a dashboard problem, not a recovery.
12. **Check for a stampede.** Retries, queued jobs, and cron backlogs accumulate during an outage and can re-break the system the moment it recovers. Drain deliberately, with rate limits.
13. **Confirm no data was lost or corrupted.** If it was → execute [7. Responding to a data-loss or corruption event](#7-responding-to-a-data-loss-or-corruption-event); else → continue.
14. **Declare resolution and communicate it**, including what happened in one sentence a non-engineer understands.
15. **Write a blameless postmortem within 48 hours** using the [postmortem template](TEMPLATES.md#11-postmortem). Systems fail; blaming people ends learning and hides the next failure. The 48-hour bound matters because memory decays faster than the calendar suggests.
16. **Convert every action item into a tracked task with a named owner and a date.** A postmortem with unowned actions is an essay.

**Verification** — Real user path exercised successfully by a human. Error rates and latency back within normal bands for a full traffic cycle. Backlogs drained. No data loss, or loss quantified. Postmortem published with owned action items.

**Rollback** — Mitigation itself is the rollback. If mitigation makes things worse, revert the mitigation and escalate severity — you are now in a worse state than you started and need more hands.

**Aftercare** — Record in [memory/lessons-learned.md](memory/lessons-learned.md) and [memory/bugs.md](memory/bugs.md). Ask whether better telemetry would have caught this sooner, and file that as a task. Update the [runbook](TEMPLATES.md#17-runbook) with anything you had to figure out live. If the mitigation was manual, automate it before the next occurrence.

**Common mistakes** — Diagnosing before mitigating while users wait. Nobody named as commander, so three people investigate the same thing and nobody communicates. Restarting the service and destroying the evidence. Going quiet during the hard part, which is exactly when stakeholders need the update. Declaring recovery from a dashboard without exercising the real path. Skipping the postmortem because the fix is obvious in hindsight.

---

## 6. Responding to a security incident

**Trigger** — Unauthorized access, credential exposure, malicious activity, a compromised dependency, or a reported vulnerability being actively exploited.

**Owner** — Security Engineer, with an Incident Commander running coordination and Engineering Manager owning legal and external communication.

**Prerequisites** — Ability to revoke credentials, sessions, and tokens. Audit logs. A legal or compliance contact. An escalation path to leadership that works out of hours.

**This is not a normal incident.** In [5. Responding to a production incident](#5-responding-to-a-production-incident) the goal is restoring service, and evidence is secondary. Here the goal is stopping the adversary and preserving the record, and **service restoration is explicitly subordinate to containment.** An adversary with access is actively working against you while you deliberate. Do not merge these playbooks.

**Steps**

1. **Declare a security incident and name the commander.** Move to a channel the suspected adversary cannot read. If internal systems may be compromised, use out-of-band communication — a phone bridge or a separate platform.
2. **Do not tip off the adversary.** Avoid broad internal announcements naming the compromise until containment is planned. Attackers who detect discovery escalate, destroy logs, or deploy persistence.
3. **Contain first, before diagnosing and before restoring.** Isolate affected systems from the network. Block the attacking source. Disable the compromised account. Containment that is 80% right and immediate beats a perfect plan an hour later.
4. **Rotate credentials and revoke sessions.** All of them in the affected blast radius: API keys, database passwords, service accounts, OAuth tokens, signing keys, SSH keys, webhook secrets, and CI secrets. **Revoke active sessions and refresh tokens** — rotating a password while the attacker holds a valid session changes nothing.
5. **Preserve evidence before remediating.** Snapshot affected instances rather than terminating them. Export audit logs, access logs, and authentication logs to immutable storage outside the affected environment. **Do not rebuild the compromised host until it is imaged** — you are destroying the only record of how they got in and what they took.
6. **Establish the timeline** — first access, method of entry, actions taken, data accessed, and whether persistence was installed. Assume the entry point is not the only one.
7. **Determine the data scope.** What records, whose records, how many, and which fields. Personal data, credentials, payment data, and health data each carry different obligations. Be precise: legal notification requirements turn on this answer.
8. **Engage legal and compliance immediately once scope is estimated.** Do not wait for certainty. Notification deadlines are statutory and short — several regimes require regulator notification within 72 hours of awareness, not of confirmation.
9. **Hunt for persistence before restoring.** Added accounts, modified authorized keys, scheduled tasks, altered deployment configuration, injected dependencies, unexpected outbound connections. Restoring a system that still contains a backdoor restarts the incident with the adversary forewarned.
10. **Remediate the entry point.** Patch the vulnerability, fix the misconfiguration, remove the malicious dependency. If the entry point is unknown → do not restore to the same configuration; rebuild from a known-good image.
11. **Restore service from known-good state**, then verify per [5. Responding to a production incident](#5-responding-to-a-production-incident) step 11.
12. **Notify affected users and regulators** on legal guidance, with human approval for all external wording. Say what happened, what data was involved, what you have done, and what they should do. Delayed or minimized disclosure compounds the original harm.
13. **Monitor intensively for re-entry** for at least 30 days. Adversaries return, often through a second foothold established before containment.
14. **Postmortem within 48 hours**, blameless, using the [postmortem template](TEMPLATES.md#11-postmortem). Include the detection gap: how long between first access and detection?

**Verification** — Entry point closed and verified by re-testing the exploitation path. All credentials in the blast radius rotated and old ones proven inactive. No persistence mechanisms remaining. Evidence preserved in immutable storage. Legal obligations met and documented. Security Engineer approves closure.

**Rollback** — Containment is not rolled back. If you isolated a system unnecessarily, restore it deliberately after confirming it is clean. Never reverse a credential rotation — issue new credentials instead.

**Aftercare** — Full [Security Review](WORKFLOW.md#15-security-review-workflow) of the affected area and every system sharing the same trust boundary. Record in [memory/lessons-learned.md](memory/lessons-learned.md) and [memory/decisions.md](memory/decisions.md). File tasks for the detection gap, the blast radius that was larger than expected, and every credential that turned out not to be rotatable. Review whether one compromised credential should have reached this far.

**Common mistakes** — Rebuilding the compromised host immediately, destroying all forensic evidence. Rotating passwords but not revoking sessions or refresh tokens. Restoring service before hunting for persistence, so the adversary returns within hours. Announcing the breach internally before containment. Delaying legal engagement until scope is certain and blowing a statutory deadline. Rotating only the credential you know leaked, when the attacker had access to the whole secret store.

---

## 7. Responding to a data-loss or corruption event

**Trigger** — Records are missing, wrong, duplicated, or overwritten. A destructive query ran without a `WHERE` clause. A migration wrote bad values. A backup restore produced inconsistent state.

**Owner** — Database Engineer, with an Incident Commander running coordination and Security Engineer involved if the loss may be malicious.

**Prerequisites** — Backups that exist and whose last successful restore test is known. Point-in-time recovery capability, or knowledge that you lack it. Write access controls you can revoke immediately.

**This is the most dangerous playbook in this file.** Every other incident is recoverable by reverting code. Here the damage is in the data, and **the most common way a data-loss event becomes unrecoverable is a well-intentioned repair applied before the scope was understood.** Slow down in exact proportion to how urgent it feels.

**Steps**

1. **Stop the bleeding first.** Disable the writing code path, revoke the credential, kill the running job, or take the service to read-only. Corruption in progress is worse than downtime — every second of continued writing enlarges the blast radius and may overwrite the good data you would have recovered from.
2. **Freeze destructive operations globally.** Pause cron jobs, queue consumers, and scheduled cleanup tasks. A nightly purge running mid-incident can delete the evidence and the recoverable records together.
3. **Do not repair anything yet.** Write this rule in the channel. No `UPDATE`, no re-run, no "quick fix" until step 6 is complete.
4. **Snapshot current state immediately**, corrupted as it is. Take a full backup now, separate from the normal rotation, and mark it protected from expiry. Corrupted state plus a good backup gives you two reference points for reconciliation; corrupted state alone gives you none.
5. **Verify backups exist and are readable before planning any restore.** Check the timestamp of the last successful backup and the last successful *restore test*. **If backups are absent, unreadable, or never tested → escalate to leadership immediately and state plainly that recovery may be partial or impossible.** Discovering this at hour three is common and catastrophic.
6. **Assess scope precisely.** Which tables, which rows, which fields, what time window, how many records, and which users. Query read replicas or the snapshot, never the live primary under repair. Write the numbers down. Every subsequent decision depends on this being right rather than fast.
7. **Determine what is authoritative.** Where does correct data still exist — backups, replicas, event logs, audit tables, upstream systems, application logs, downstream caches, third-party records? Data that exists in a second place is recoverable; data that existed only in the damaged table may not be.
8. **Choose the recovery strategy explicitly. If a clean backup or point-in-time target predates the corruption and the acceptable data loss window covers it → restore. If corruption is interleaved with valid writes after the last clean point → forward-repair from an authoritative source, because restoring would discard good data. If neither → reconstruct from logs and accept partial recovery, documented.**
9. **Rehearse the recovery on a copy.** Restore into a scratch environment, run the repair, and verify the result against known-good records. **Never rehearse on production.** A repair script that is wrong in a scratch environment is a lesson; the same script on production is a second incident with no remaining reference state.
10. **Write the repair as an idempotent, bounded, reversible operation.** Include an explicit `WHERE` clause scoped to the assessed blast radius, a row-count assertion that aborts if it exceeds the expected count, and a record of prior values so it can be undone.
11. **Execute the repair inside a transaction where the engine allows it.** Verify counts and spot-check records before committing. If the counts disagree with step 6 → roll back and reassess; do not commit and investigate afterwards.
12. **Reconcile.** Compare repaired data against every authoritative source. Verify referential integrity, aggregate totals, financial balances, and derived or cached data. Corruption propagates into caches, search indexes, analytics warehouses, and downstream systems — repairing the primary and leaving the derived copies wrong produces a slower second incident.
13. **Quantify residual loss exactly** — how many records, which users, what time window, and what is permanently gone. Vague loss estimates become the worst part of the disclosure.
14. **Re-enable writes and verify** by exercising the real user path, then watch for the corruption pattern recurring.
15. **Disclose.** Affected users MUST be told what data was lost or wrong, over what period, what you recovered, and what they should verify on their side. If the data was personal, financial, or regulated → engage legal for notification obligations. Human approval required for all external wording.
16. **Postmortem within 48 hours** using the [postmortem template](TEMPLATES.md#11-postmortem). Include why the operation was possible at all.

**Verification** — Record counts match the authoritative source. Referential integrity checks pass. Aggregates and balances reconcile. Derived stores rebuilt and consistent. Residual loss quantified in writing. Real user path exercised. The repair script's dry-run against current state now reports zero rows needing change.

**Rollback** — Rolling back a repair requires the prior values captured in step 10 and the protected snapshot from step 4. Without both, the repair is one-way. Confirm you have both before executing step 11.

**Aftercare** — Add the constraint, foreign key, `NOT NULL`, unique index, or check constraint that would have made the corruption impossible. Remove the unbounded write permission that allowed it. Require `WHERE`-clause review and transaction wrapping for all production data operations. Schedule and automate a **recurring restore test** — an untested backup is a hypothesis. Record in [memory/lessons-learned.md](memory/lessons-learned.md) and [memory/bugs.md](memory/bugs.md).

**Common mistakes** — Repairing before assessing scope, and destroying the reference state. Not snapshotting the corrupted data, so there is nothing to reconcile against. Discovering that backups were never restore-tested during the incident. Running the repair without a row-count assertion, turning 200 bad rows into 2 million. Repairing the primary and leaving caches, indexes, and warehouses wrong. Under-reporting the loss because the precise number is uncomfortable.

---

## 8. Scaling a system hitting a limit

**Trigger** — A resource is saturating: latency climbing with load, queue depth growing, connection pool exhausted, disk filling, or a quota approaching.

**Owner** — DevOps Agent with the Engineer owning the saturating component. Performance Engineer owns the measurement.

**Prerequisites** — Metrics showing the saturation. Current load figures and a projection. Knowledge of what the system is supposed to handle.

**Steps**

1. **Measure the actual constraint before changing anything.** Which resource is saturating — CPU, memory, I/O, network, connections, locks, a downstream quota? Adding capacity to the wrong resource costs money and fixes nothing.
2. **Confirm this is load, not a regression.** If throughput fell without load rising → execute [9. Diagnosing a performance regression](#9-diagnosing-a-performance-regression) instead; else → continue. Scaling around a regression pays rent on a bug forever.
3. **Quantify the gap.** Current load, current capacity, projected load, and the multiple you need. "It's slow" is not a target; "p99 is 1.8s at 400 rps, we need under 500ms at 1200 rps" is.
4. **Check for cheap wins first.** A missing index, an N+1 query, an uncached hot path, or a synchronous call that should be async often recovers more headroom than a capacity increase, at a fraction of the cost.
5. **Decide horizontal or vertical.** Horizontal if the component is stateless or can be made so; vertical if state or a single-writer constraint prevents it. Vertical scaling buys time and ends; note where it ends.
6. **If state blocks horizontal scaling, externalize the state** before scaling. Sessions to a shared store, in-process caches to a shared cache, local files to object storage.
7. **Apply the change to one instance or one shard first.** Verify the constraint moved before rolling it out.
8. **Re-measure and name the next constraint.** Every fix reveals the next bottleneck. If you cannot name it, you have not finished measuring.
9. **Load-test at 2x the new target** per [Scalability standards](STANDARDS.md#23-scalability-standards). The knee of the curve arrives before linear extrapolation predicts.
10. **Update alert thresholds** to the new normal, and add an alert on the newly-identified next constraint.
11. **Record in [memory/decisions.md](memory/decisions.md)**: the constraint found, the fix applied, the next constraint, and the load at which it will bite.

**Verification** — Target load sustained at target latency in a load test at 2x. The saturating metric is back under threshold with headroom stated as a number. The next constraint is documented with its trigger load.

**Rollback** — Scale back down. Externalization of state and query fixes are not rolled back; they are improvements independent of capacity.

**Aftercare** — Document the scaling ceiling in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md): what breaks next, at what load. Set a review trigger at 60% of the new ceiling so the next round starts before it is urgent.

**Common mistakes** — Adding capacity without measuring, so the real constraint is untouched. Scaling around a performance regression and paying for it forever. Skipping the cheap query fix in favour of the expensive instance. Scaling one component into a wall that was actually downstream. Not re-measuring, so nobody knows the new ceiling. Forgetting to move alert thresholds, leaving alerts that fire constantly or never.

---

## 9. Diagnosing a performance regression

**Trigger** — Latency, throughput, or resource usage degraded without a corresponding load increase.

**Owner** — Performance Engineer, with the Engineer owning the affected area.

**Prerequisites** — Metrics covering before and after. Deployment history. Ability to reproduce under load in a non-production environment.

**Steps**

1. **Establish when it changed.** Find the point in the metrics where behaviour shifted. A gradual slope and a step change have different causes: step changes point at deployments and configuration; slopes point at data growth, leaks, and cache decay.
2. **List everything that changed in that window** — code deployments, configuration, dependency versions, infrastructure changes, data volume milestones, and traffic-mix shifts. Upstream and downstream both count.
3. **Confirm it is a regression, not growth.** If load rose proportionally → execute [8. Scaling a system hitting a limit](#8-scaling-a-system-hitting-a-limit); else → continue.
4. **Reproduce it under controlled load.** A regression you cannot reproduce is a regression you cannot verify fixed. Match production data volume as closely as possible — many regressions only appear at scale.
5. **Bisect if the window contains multiple changes.** Deploy or revert candidates in a controlled environment until the specific change is isolated. Bisection beats intuition.
6. **Profile, do not guess.** Attach a profiler under load and find where the time or allocation actually goes. The bottleneck is routinely not where the team expects.
7. **Check the usual suspects explicitly** — a new N+1 query, a lost index, a query plan that flipped as data grew, a cache that stopped being hit, a synchronous call added to a hot path, a retry loop with no backoff, an unbounded collection.
8. **Fix the cause at its layer** and re-measure under the same controlled load. State the before and after numbers.
9. **Add a performance test or assertion** that would have caught this. A regression without a guard will return.
10. **Deploy** per [10. Deploying to production](#10-deploying-to-production) and confirm the production metric returns to baseline.
11. **Record in [memory/bugs.md](memory/bugs.md)**: symptom, root cause class, the measurement that found it, and the guard added.

**Verification** — Metric back to or better than the pre-regression baseline, measured in production over a window covering peak. Performance test in place and proven able to fail against the regressed code.

**Rollback** — Revert to the last known-good version if diagnosis is taking longer than the impact tolerates. Reverting first and diagnosing after is the correct order when users are affected.

**Aftercare** — If the regression reached production undetected, the gap is in monitoring, not just code: add the missing signal. Ask in the retrospective why the deployment gate did not catch it.

**Common mistakes** — Optimizing where it looks slow instead of profiling. Skipping bisection and guessing at the cause. Reproducing at toy data volume, where the regression is invisible. Fixing the symptom by raising a timeout. Shipping the fix with no guard, guaranteeing recurrence. Diagnosing at length while users are affected, when a revert was available in minutes.

---

## 10. Deploying to production

**Trigger** — A change has passed review and all gates and is ready for production.

**Owner** — Release Manager Agent, or the Engineer who owns the change where no release manager is assigned.

**Prerequisites** — CI green on the exact commit. All applicable [CHECKLISTS.md](CHECKLISTS.md) gates passed. Rollback tested. Success signals defined before deployment, not after.

**Steps**

1. **Confirm the deployment target and the exact commit.** Deploying a stale branch or the wrong environment is the most preventable production incident there is.
2. **Verify CI is green on that commit specifically**, not on the branch tip or a similar commit.
3. **State the success signals now, in writing.** Which metrics, which values, over which window. Signals defined after a deployment get bent to fit what happened.
4. **Check for migrations. If the change includes a schema migration → execute [12. Running a database migration safely](#12-running-a-database-migration-safely) first and confirm the migration is deployed and backward-compatible; else → continue.** Schema before code, always.
5. **Confirm the rollback path is tested** — not written, executed. Know the command and its duration before you need it under pressure.
6. **Announce the deployment** to whoever is affected: oncall, support, dependent teams.
7. **Deploy to a canary or a single instance** where the platform allows. Full-fleet deployment with no canary discards free information.
8. **Watch the canary against the stated signals** for a defined window. Error rate, latency percentiles, saturation, and the business metric the change targets.
9. **Decision point: do the canary signals hold?**
   - **If yes:** proceed to full rollout in stages.
   - **If no:** execute [11. Rolling back a bad release](#11-rolling-back-a-bad-release). Do not debug forward on a live canary.
   - **If ambiguous:** hold the canary and gather more data. Ambiguous is not a pass.
10. **Roll out in stages**, verifying signals at each stage rather than only at the end.
11. **Monitor actively after full rollout** for a window long enough to cover a full traffic cycle, including peak. Many regressions only appear at peak.
12. **Record the release** — what deployed, when, by whom, which commit — per [Deployment standards](STANDARDS.md#22-deployment-standards).

**Verification** — All stated success signals met over the defined window. Error rate, latency, and saturation within thresholds at peak. The change's intended effect is observable, not assumed.

**Rollback** — [11. Rolling back a bad release](#11-rolling-back-a-bad-release).

**Aftercare** — Close the release record. If the deployment surfaced friction — a manual step, a missing signal, an unclear rollback — fix it before the next deployment, while it is fresh.

**Common mistakes** — Deploying without defined success signals, so "it looks fine" becomes the standard. Skipping the canary because the change is small. Deploying code before its migration. Rolling back without preserving evidence. Deploying Friday evening or overnight when nobody is available. Watching for ten minutes and declaring victory before peak traffic arrives.

---

## 11. Rolling back a bad release

**Trigger** — A deployed release is causing errors, degradation, or incorrect behaviour, and the cause is not fixable within the impact tolerance.

**Owner** — Whoever is holding the deployment, or the incident commander if an incident is open.

**Prerequisites** — Knowledge of the last known-good version. A tested rollback path. Awareness of whether the release included a migration.

**Steps**

1. **Decide fast.** Rollback is cheap; debugging forward under user impact is expensive. If the fix is not obvious and verified within minutes, roll back. Ego is not a factor in this decision.
2. **Preserve evidence before reverting.** Capture logs, traces, metrics snapshots, and a sample of affected requests. The rollback destroys the state you need for diagnosis, and "we rolled back and lost the evidence" means diagnosing it again in production later.
3. **Check for migrations. If the release included a schema migration, stop and assess:** is the previous code version compatible with the current schema? If the migration was expand-only and backward-compatible, roll back the code and leave the schema. If it was not, rolling back code will break against the new schema — you need a forward fix or a schema revert, and a schema revert may lose data. Assess before acting.
4. **Announce the rollback** so nobody deploys on top of it and support knows what users will see.
5. **Execute the rollback** to the last known-good version.
6. **Verify the symptom is gone**, not just that the deployment succeeded. Check the metric that triggered this, and confirm error rate and latency return to baseline.
7. **Confirm no partial state remains** — feature flags left on, cache entries in the new format, queue messages the old code cannot parse, rows written by the new version. Partial state is where rollbacks fail quietly.
8. **Block the bad commit from redeploying.** Revert the merge or mark the release blocked. Bad releases redeployed by the next unrelated merge are common.
9. **Diagnose from the preserved evidence**, not in production.
10. **Record in [memory/bugs.md](memory/bugs.md)** and, if there was user impact, open a postmortem per the [Postmortem template](TEMPLATES.md#11-postmortem).

**Verification** — Symptom gone, confirmed against the triggering metric. No partial state from the rolled-back version. Bad commit cannot redeploy accidentally.

**Rollback** — Rolling back the rollback means deploying forward again. Do not do this until the original cause is understood and fixed.

**Aftercare** — Postmortem within 48 hours if users were affected. Add the signal that would have caught this in the canary window. If the rollback itself was difficult, that is a defect in the deployment system worth fixing before the next release.

**Common mistakes** — Debugging forward for an hour when a rollback would have taken two minutes. Rolling back without preserving evidence. Rolling back code past an incompatible migration. Leaving feature flags on, so the rollback changes nothing. Not blocking the bad commit, so it redeploys with the next merge. Skipping the postmortem because the rollback worked.

---

## 12. Running a database migration safely

**Trigger** — A schema change is required in an environment with data that matters.

**Owner** — Database Engineer, or the Backend Engineer owning the schema.

**Prerequisites** — A tested backup with a measured restore time. The migration tested against a production-sized copy. A rollback plan or documented irreversibility.

**Steps**

1. **Classify the migration.** Additive (new nullable column, new table, new index) is low-risk. Destructive (drop, rename, type change, NOT NULL on existing data) is high-risk and requires the full expand/migrate/contract sequence.
2. **Verify a current backup exists and the restore has been tested.** An untested backup is not a backup. Record the measured restore duration — that is your worst-case recovery time.
3. **Test the migration against a production-sized copy.** Duration matters: a migration that takes 4 seconds on a dev database can take 40 minutes and hold a lock on production. Measure it.
4. **Assess lock behaviour.** Will this lock a table, and for how long? A lock exceeding the request timeout is an outage. Use online/concurrent index creation where the engine supports it.
5. **Decision point: is the migration backward-compatible with the currently-deployed code?**
   - **If yes:** proceed.
   - **If no:** stop and restructure it as expand/migrate/contract. Never deploy a schema change that breaks the running version — during any rollout there are two code versions live at once.
6. **Expand.** Deploy the additive change only: add the new column, table, or index. Nothing reads it yet. This deploys safely alongside the old code.
7. **Deploy code that writes both old and new** and reads the old. Verify in production.
8. **Backfill** existing rows in batches, with a bounded batch size, a pause between batches, and progress logging. A single-transaction backfill of a large table locks it and cannot be resumed if it fails midway.
9. **Verify the backfill.** Row counts match, no nulls where there should be none, spot-check values. Assert the count before and after — a backfill that silently touched the wrong rows is data corruption.
10. **Deploy code that reads the new** and still writes both. Verify.
11. **Contract.** Only once nothing references the old structure and you are confident you will not roll back: drop the old column or table. This is the irreversible step; there is no urgency to it.
12. **Record in [memory/decisions.md](memory/decisions.md)**: the sequence executed, dates of each phase, and the measured durations.

**Verification** — Schema matches intent. Backfill verified with row counts and spot checks. Application works against the new schema in production. Old and new code paths both verified during the transition.

**Rollback** — For additive steps, drop what was added. For backfills, the data is already written — the rollback is the previous code version, which the expand/contract sequence keeps working. Once contracted, rollback requires a restore from backup. That is why contract comes last and unhurried.

**Aftercare** — Confirm backups completed successfully after the change. Update the schema documentation per the [Database Document template](TEMPLATES.md#7-database-document). Remove the dual-write code once contract is complete — it is dead weight that confuses the next engineer.

**Common mistakes** — Migrating and deploying code in one step, breaking the running version mid-rollout. Testing only on a small dev database, so the production lock duration is a surprise. Backfilling in one transaction. Contracting immediately, destroying the rollback path while confidence is still low. Not asserting row counts. Assuming the backup works.

---

## 13. Upgrading a major dependency

**Trigger** — A dependency needs a major version upgrade: for a security fix, an end-of-support deadline, or a capability the current version lacks.

**Owner** — The Engineer owning the area that uses it most heavily.

**Prerequisites** — A test suite you trust. The changelog and migration guide read, not skimmed. Knowledge of which of your code paths touch the dependency.

**Steps**

1. **State why you are upgrading.** A security fix, an EOL date, or a needed capability are reasons. "It is newer" is not, and major upgrades cost real time.
2. **Read the changelog and migration guide for every intermediate major version**, not just the target. Breaking changes accumulate across versions.
3. **Inventory your usage.** Which APIs of this dependency do you call, and which of those changed? This determines whether the upgrade is an afternoon or a fortnight.
4. **Check the transitive impact.** Does this force upgrades in other dependencies? A major version bump often cascades, and the cascade is where the schedule breaks.
5. **Upgrade one major version at a time** where the path allows. Jumping three versions means debugging three sets of breaking changes simultaneously with no way to isolate which one broke you.
6. **Upgrade in an isolated branch** and let the compiler and tests find what broke. This is what the test suite is for.
7. **Fix breakages at the call site**, not by adding a compatibility shim, unless the usage is widespread enough that a shim is genuinely cheaper. Shims become permanent.
8. **Run the full suite plus manual verification of paths the tests do not cover.** Trust the suite proportionally to its coverage of this dependency, not absolutely.
9. **Check for behavioural changes the tests would not catch** — default values, error types, serialization format, timezone handling, sort stability, precision. These are the ones that reach production.
10. **Review the new version's security posture and licence.** A major version can change the licence, and that is a legal issue rather than a technical one.
11. **Deploy behind a canary** per [10. Deploying to production](#10-deploying-to-production) and watch for changes in error types and latency distribution specifically.
12. **Record in [memory/decisions.md](memory/decisions.md)**: version moved from and to, why, what broke, and what to watch for next time.

**Verification** — Full suite green. Manual verification of untested paths using the dependency. No new error types or latency shift in the canary window. Licence and security posture reviewed.

**Rollback** — Revert the dependency and the call-site changes together as one commit. Keeping them in one commit is what makes this a clean revert.

**Aftercare** — Remove any compatibility shims added during the upgrade. Note the next EOL date so the following upgrade is scheduled rather than urgent.

**Common mistakes** — Jumping several major versions at once. Skimming the changelog and discovering the breaking change in production. Adding a shim that outlives the upgrade by three years. Trusting a test suite that does not cover the dependency's edge cases. Missing silent behavioural changes in defaults and formats. Upgrading without a reason.

---

## 14. Paying down technical debt

**Trigger** — Debt is measurably slowing delivery: repeated bugs in one area, changes requiring edits across many files, tests too slow or flaky to trust, or a component nobody will touch.

**Owner** — The Engineer owning the area, with the Planner agreeing the scope.

**Prerequisites** — Evidence of the cost, not a feeling. Knowledge of which debt is actually blocking work.

**Steps**

1. **List the debt with its measured cost.** Not "the auth module is ugly" but "three of the last eight bugs were in the auth module, and adding a field there touches six files." Cost is the only ranking criterion that survives contact with a deadline.
2. **Rank by cost per unit of effort.** Highest-interest debt first: the code you touch weekly, not the code you touch yearly. Ugly code nobody edits is not debt, it is scenery.
3. **Check for deletion first.** The highest-return debt payment is removing code: dead branches, unused features, obsolete flags, abandoned abstractions. Deletion has no maintenance cost and no bug surface.
4. **Pick one item and scope it to fit in a single reviewable change.** A debt payment that takes three weeks and touches everything will be abandoned or merged unreviewed.
5. **Confirm characterization tests exist** for the behaviour you are about to preserve. If they do not, write them first — that is the prerequisite, not the work. See [15. Large refactoring](#15-large-refactoring).
6. **Make the change behaviour-preserving.** Debt payment and behaviour change in one commit means neither can be reviewed or reverted independently.
7. **Verify the suite is green** and the behaviour is identical.
8. **Measure the improvement.** Fewer files per change, faster tests, lower complexity, less duplication. If nothing measurably improved, you rearranged furniture.
9. **Deploy** per [10. Deploying to production](#10-deploying-to-production). Debt payments are deployments and carry deployment risk.
10. **Record in [memory/decisions.md](memory/decisions.md)**: what was paid, the measured before and after, and what remains.

**Verification** — Behaviour identical, confirmed by the suite. The specific cost that motivated the work is measurably lower. Change was small enough to be genuinely reviewed.

**Rollback** — Revert the commit. Behaviour-preserving changes revert cleanly, which is the reason for keeping them separate.

**Aftercare** — Add the lint rule, type constraint, or test that prevents this debt from re-accumulating. Debt paid without a guard returns. Keep the remaining debt list current in [memory/](memory/) so the next round starts from evidence.

**Common mistakes** — Ranking by how much the code annoys you rather than what it costs. Rewriting instead of deleting. Bundling behaviour changes with the refactor. Scoping too large to review. Skipping characterization tests and "improving" behaviour by accident. Not measuring, so nobody can tell whether it helped. Paying the debt without adding the guard.

---

## 15. Large refactoring

**Trigger** — A structural change is needed that cannot be made in one small commit: extracting a module, changing an abstraction, splitting a component, or unwinding a circular dependency.

**Owner** — The Engineer owning the area, with the Architect reviewing the target structure.

**Prerequisites** — A stated target structure. Characterization tests covering current behaviour. Agreement that the refactor is worth the risk.

**Steps**

1. **State the target structure and why it is better.** A refactor without a defined destination becomes an endless series of changes that never converge. Write the target down.
2. **Assess whether the refactor is justified.** Structural change carries real risk. If nothing measurably improves — coupling, change cost, test speed, bug rate — do not do it.
3. **Write characterization tests** that capture current behaviour, including behaviour you suspect is wrong. Bugs are part of the contract until deliberately changed. Without these tests you cannot prove the refactor preserved behaviour.
4. **Verify the characterization tests can fail.** Break the implementation deliberately and confirm they catch it. Tests that cannot fail prove nothing.
5. **Plan the sequence so the system works at every step.** A refactor with a broken intermediate state cannot be paused, reviewed, or shipped incrementally — and it will need to be paused.
6. **Prefer parallel-change (expand/migrate/contract).** Build the new structure alongside the old, migrate callers incrementally, then delete the old. This keeps every intermediate state shippable.
7. **Refactor in small commits, each green.** Each commit is reviewable and revertible on its own.
8. **Change no behaviour.** Not one improvement, not one bug fix, not one rename beyond the refactor's scope. Behaviour changes go in separate commits before or after, never during.
9. **Migrate callers incrementally**, verifying after each group rather than all at the end.
10. **Delete the old structure** once nothing references it. Confirm with a search, not with memory. An abandoned old path left in place is worse than the debt you started with.
11. **Verify behaviour is identical** — full suite green, characterization tests green, manual verification of paths the tests do not cover.
12. **Deploy incrementally** per [10. Deploying to production](#10-deploying-to-production) rather than as one large release.
13. **Record in [DECISIONS.md](DECISIONS.md)** if the refactor changed an architectural boundary, and in [memory/decisions.md](memory/decisions.md) either way.

**Verification** — Behaviour identical, proven by characterization tests that were shown able to fail. Target structure reached. Old structure fully deleted. Every commit in the sequence was independently green.

**Rollback** — Revert commits in reverse order. Parallel-change makes this safe: the old structure is still present until the final deletion. After deletion, rollback means reverting the whole sequence.

**Aftercare** — Update architecture documentation in [architecture/](architecture/). Remove the migration scaffolding. If the refactor revealed why the original structure was wrong, record that reasoning — it prevents rebuilding the same mistake.

**Common mistakes** — Starting without a target structure. Skipping characterization tests because "the suite is good" — the suite tests intent, characterization tests capture actual behaviour. Sneaking in improvements, so a behaviour regression is indistinguishable from a refactoring error. Big-bang rewrites with a broken middle. Leaving the old structure in place. Not verifying the tests can fail.

---

## 16. Onboarding a new engineer or agent

**Trigger** — A new engineer or AI agent begins work in this repository.

**Owner** — Whoever owns the area they will work in.

**Prerequisites** — [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) filled in. [memory/](memory/) current. A first task chosen that is real but bounded.

**Steps**

1. **Point them at the reading order, not the whole framework.** [README.md](README.md), then [SYSTEM.md](SYSTEM.md), then [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), then [memory/project-memory.md](memory/project-memory.md), then [DECISIONS.md](DECISIONS.md). Reading everything at once means retaining nothing.
2. **Have them build and run the system locally** before reading any more. If setup fails or takes more than an afternoon, that failure is the first finding — record it and fix the setup documentation.
3. **Have them run the full test suite** and confirm it is green locally. A suite that only passes in CI is a defect they have just discovered.
4. **Walk them through one end-to-end request path** — entry point to persistence and back. Understanding one path end to end beats reading every file.
5. **Give them a real first task, small and bounded.** Ideally a genuine bug with a clear reproduction. Toy tasks teach nothing about the codebase.
6. **Have them follow the applicable workflow explicitly**, per [WORKFLOW.md](WORKFLOW.md). The first task is where habits are set.
7. **Review the first change thoroughly**, against the same gates as any other change, and explain the reasoning behind each comment rather than only the correction.
8. **Have them fix the first thing that confused them** in the documentation. A newcomer sees what the team has stopped noticing, and the window closes within weeks.
9. **Confirm they know where the escalation lines are** — what requires review, what requires the Security Engineer, what is never done without a human decision. See [SYSTEM.md § Escalation](SYSTEM.md#16-escalation).
10. **Record onboarding friction in [memory/](memory/)** so the next person hits less of it.

**Verification** — They have built, run, and tested the system locally; shipped one reviewed change following the workflow; and can trace one request end to end. Documentation improved from their confusion.

**Rollback** — Not applicable. If the first change was wrong, revert it like any other change — that is a normal outcome, not an onboarding failure.

**Aftercare** — Ask what was harder than it should have been and fix that before the next person arrives. Onboarding friction compounds silently.

**Common mistakes** — Handing over the entire framework on day one. Assigning a toy task that teaches nothing. Skipping local setup because staging exists — setup failures stay hidden and cost everyone. Reviewing the first change leniently to be encouraging, which sets the bar low permanently. Not capturing the newcomer's confusion while it is still visible.

---

## 17. Starting an AI feature

**Trigger** — A feature will use a language model, embedding model, or other AI component.

**Owner** — AI Engineer, with the Product Manager owning the quality bar and the Security Engineer owning the trust boundary.

**Prerequisites** — A stated user problem. Agreement on what "good enough" means, expressed as something measurable.

**Steps**

1. **State the task precisely and the quality bar numerically.** "Summarize support tickets" is not a task; "produce a summary a support agent rates as accurate and complete, at 85% or better across 100 held-out tickets" is. Without a number there is no way to know when to stop.
2. **Build the evaluation set before the feature.** Fifty to two hundred real examples with expected outcomes. Curated by hand from real data, not generated by a model — a model-generated eval set measures agreement with the model, not correctness.
3. **Build the dumbest baseline that could work** — a rule, a heuristic, a keyword match, or a small model with a two-line prompt. Measure it against the eval set. This number is what all sophistication must beat to justify its cost.
4. **Decision point: does the baseline already clear the bar?** If yes, ship the baseline. It is cheaper, faster, deterministic, and debuggable. Not every problem needs a model.
5. **Define the trust boundary explicitly.** Which content in the context window is data, and which is instruction? Retrieved documents, user input, tool results, and database content are always data, never instruction. Write this down; it is the prompt-injection boundary. See [AI systems standards](STANDARDS.md#19-ai-systems-standards).
6. **Bound cost and latency before the first call.** A per-request token cap, a per-user budget, a timeout, and a maximum iteration count for any loop. Unbounded AI features generate unbounded bills.
7. **Start with the smallest, cheapest model** and a simple prompt. Measure against the eval set. Move up in capability only when evaluation proves the smaller model insufficient.
8. **Iterate on the prompt against the eval set, one change at a time.** Changing three things and measuring once teaches nothing about which change helped.
9. **Treat model output as untrusted.** Validate structure, constrain values, sanitize before rendering or persisting. Never execute model output. If it drives a tool call, validate the arguments as you would any external input.
10. **Design the failure path.** The model will be unavailable, slow, refusing, and wrong — all four will happen. Define the behaviour for each before shipping, not after the first incident.
11. **Instrument cost, latency, and quality per request** and store enough of each interaction to diagnose failures — respecting the data policy in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).
12. **Version the prompt in [prompts/](prompts/)**, and record the model choice and its justification in an ADR in [DECISIONS.md](DECISIONS.md).
13. **Ship behind a flag** to a small cohort, and watch the eval metrics and cost before widening.

**Verification** — Eval suite exists with a hand-curated set and a measured baseline. Chosen approach beats the baseline by a stated margin. Cost and latency bounded and instrumented. Trust boundary documented and enforced. Failure paths implemented and tested.

**Rollback** — Disable the flag. The pre-AI path must still work; if it was deleted, there is no rollback, which is a design error caught too late.

**Aftercare** — Move to [18. Improving an AI system already in production](#18-improving-an-ai-system-already-in-production) for the ongoing loop. Add real production failures to the eval set — that is what keeps it honest.

**Common mistakes** — Building the feature before the eval set, so quality is judged by vibes. Generating the eval set with a model. Skipping the baseline and never learning whether the expensive model earns its cost. Treating retrieved content as instruction. No cost cap. Reaching for the largest model first. Changing several prompt variables at once. Deleting the non-AI fallback path.

---

## 18. Improving an AI system already in production

**Trigger** — Quality has degraded, a new failure mode was reported, cost has grown, or a model or prompt change is proposed.

**Owner** — AI Engineer.

**Prerequisites** — An existing eval suite with historical scores. Production telemetry covering quality, cost, and latency.

**Steps**

1. **Reproduce the failure against the eval suite.** If the eval suite still passes while production fails, the eval suite is the problem — it no longer represents reality.
2. **Add the failing production cases to the eval set** with their expected outcomes. Every real failure becomes a permanent regression test. This is the single highest-return habit in AI engineering.
3. **Classify the failure.** Prompt weakness, retrieval failure, model change, input distribution shift, context overflow, or a genuine capability limit. Each has a different fix, and treating all of them as "prompt needs work" wastes weeks.
4. **Check whether the input distribution shifted.** Users find usage patterns you did not design for. If the inputs changed, the fix may be handling a new case rather than improving the prompt.
5. **Check whether the model changed underneath you.** Providers update models; a version pinned in configuration is the only defence. If the model version moved, that is your cause.
6. **Change one variable and re-measure.** Prompt, model, retrieval strategy, context size, temperature — one at a time. Simultaneous changes make attribution impossible.
7. **Compare against the current production baseline, not against zero.** The question is whether this is better than what is running, by how much, and at what cost.
8. **Check for regressions across the whole eval set**, not just the failing cases. Prompt changes that fix one class routinely break another, and this is where most AI regressions come from.
9. **Compare cost and latency alongside quality.** A 2% quality gain for 3x the cost is usually a bad trade; make it explicitly rather than accidentally.
10. **Deploy as an A/B or staged rollout** where volume allows. Eval sets are a proxy; production is the measurement.
11. **Version the new prompt in [prompts/](prompts/)** with the eval scores that justified it. A prompt without its scores cannot be evaluated later.
12. **Record in [memory/decisions.md](memory/decisions.md)**: failure class, change made, eval delta, cost delta.

**Verification** — Failing cases pass. No regression elsewhere in the eval set. Cost and latency within budget. Production metrics confirm the eval-set improvement is real.

**Rollback** — Revert to the previous prompt or model version. This is why both are versioned and why scores are stored alongside them.

**Aftercare** — Review whether the eval suite needs broadening — a failure that reached production is a coverage gap by definition. Set a review cadence for drift rather than waiting for complaints.

**Common mistakes** — Fixing the prompt without adding the case to the eval set, so it regresses silently later. Changing several things at once. Measuring only the fixed cases and shipping a regression elsewhere. Ignoring cost. Not pinning the model version. Trusting eval scores as the final word without confirming in production.

---

## 19. Handling a cost runaway

**Trigger** — Spend is materially above expectation: a budget alert, an unexpected invoice, or a cost metric climbing without corresponding usage growth.

**Owner** — DevOps Agent for infrastructure cost, AI Engineer for model cost, with the Engineer owning the responsible component.

**Prerequisites** — Cost attribution by service, feature, or tag. Access to change caps and quotas.

**Steps**

1. **Stop the bleeding before diagnosing** if spend is growing fast. Apply a hard cap, quota, or rate limit. A cap that degrades a feature is better than an invoice that cannot be paid.
2. **Attribute the cost.** Which service, feature, or user account? Aggregate spend is a number; attributed spend is actionable. If attribution is impossible, that is the first defect to fix.
3. **Establish when it started** and correlate with deployments, configuration changes, traffic changes, and dependency updates.
4. **Classify the cause** — a runaway loop or retry storm, an unbounded query or scan, a resource left running, a cache that stopped working, an abusive or misconfigured client, legitimate growth, or a pricing change.
5. **Branch on the cause.** If it is abuse or an attack → treat as a security matter and execute [6. Responding to a security incident](#6-responding-to-a-security-incident). If it is legitimate growth → execute [8. Scaling a system hitting a limit](#8-scaling-a-system-hitting-a-limit) with cost as the constraint. Otherwise continue.
6. **Look for the classic causes explicitly** — retries without backoff, a loop with no iteration cap, a cron overlapping itself, an autoscaler with no ceiling, logging at DEBUG in production, an oversized instance nobody downsized, orphaned resources from a deleted stack, and AI calls with no token cap.
7. **Fix the cause, then verify the cost curve flattens.** Watch the actual spend metric, not the deployment.
8. **Add a permanent bound** — a quota, a budget alert, a hard cap, or a circuit breaker. A cost incident with no bound added will recur.
9. **Add alerting on the rate of change**, not only the absolute value. Slow leaks never trip absolute thresholds until the invoice arrives.
10. **Record in [memory/decisions.md](memory/decisions.md)**: cause, cost incurred, fix, and the bound added.

**Verification** — Spend rate back to expected, confirmed over a window covering a full usage cycle. A hard bound exists that would have contained this. Alerting fires before the next occurrence becomes expensive.

**Rollback** — If the emergency cap degraded a feature, raise it once the cause is fixed — but keep some bound in place permanently.

**Aftercare** — Review other components for the same unbounded pattern; cost bugs cluster. Add cost to the deployment checklist for features that scale with usage.

**Common mistakes** — Diagnosing while spend keeps climbing instead of capping first. Having no cost attribution, so the investigation is guesswork. Fixing the instance without fixing the pattern. Removing the emergency cap and adding no permanent bound. Alerting only on absolute thresholds. Assuming a cost spike is growth without checking for abuse.

---

## 20. Conducting a research spike

**Trigger** — A decision is blocked by a question that cannot be answered from existing knowledge, and guessing would be expensive.

**Owner** — Whichever role owns the blocked decision.

**Prerequisites** — The decision being blocked, stated explicitly. A timebox agreed before starting.

**Steps**

1. **Write down the decision this research serves.** Research without a decision attached is reading. If you cannot name what you will do differently depending on the answer, do not start.
2. **State the question as something answerable.** "Should we use a queue?" is not answerable. "Can this queue sustain 5,000 messages per second with at-most-once delivery at our message size, on our infrastructure?" is.
3. **Set a timebox and honour it.** Two hours, a day, three days. Research expands to fill the time available; the timebox is what converts it into a decision.
4. **State what evidence would answer the question** — a benchmark result, a working prototype, a documented guarantee, a reference implementation. Naming the evidence in advance prevents accumulating reading that feels productive and decides nothing.
5. **Look for prior art first.** Someone has usually tried this. An hour reading their postmortem beats a day rediscovering their conclusion.
6. **Prototype only what answers the question.** Spike code is disposable and must be marked so — a branch that is never merged. Spike code that reaches production is the most common way research becomes technical debt.
7. **Test the actual constraint, not a proxy.** Benchmarking on a laptop tells you about the laptop. Match production data volume, concurrency, and network conditions as closely as you can, and state the gaps.
8. **Look for the disconfirming evidence deliberately.** Ask what would make this the wrong choice, and go looking for it. Research that only confirms the preferred option is advocacy.
9. **Stop at the timebox and write up what you have**, including "insufficient evidence to decide" if that is the honest answer — with what you would need and how long it would take.
10. **Write the findings to [research/](research/)** using the [Research Document template](TEMPLATES.md#12-research-document): question, method, evidence, confidence, and the recommendation with its caveats.
11. **Make the decision and record it** in an ADR in [DECISIONS.md](DECISIONS.md). Research that does not produce a decision was not finished.
12. **Delete the spike branch** or mark it explicitly as reference-only, never as a starting point for implementation.

**Verification** — The blocked decision is now made, or the specific remaining unknown is named with a plan to resolve it. Findings written to [research/](research/) with evidence, not impressions. Spike code deleted or quarantined.

**Rollback** — Not applicable. Research is disposable by design; that is the point of the timebox.

**Aftercare** — If the research invalidated an assumption in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) or an existing ADR, update it. Stale assumptions that survived contradicting evidence are how teams stay wrong confidently.

**Common mistakes** — Researching with no decision attached. Skipping the timebox. Benchmarking a proxy instead of the real constraint. Looking only for confirming evidence. Producing a summary of options with no recommendation. Merging spike code because it "mostly works". Finishing the research and never recording the decision, so it is re-litigated in three months.

---

## 21. Deprecating and removing a feature

**Trigger** — A feature is being retired: low usage, superseded by a replacement, unsustainable maintenance cost, or a strategic decision.

**Owner** — Product Manager for the decision and communication, the owning Engineer for the removal.

**Prerequisites** — Usage data showing who depends on it. A migration path for those users, or a decision that none is needed.

**Steps**

1. **Measure actual usage before deciding.** "Nobody uses this" is wrong surprisingly often, and the users who do are frequently the ones you can least afford to surprise. Instrument first if the data does not exist.
2. **Identify who depends on it** — end users, internal teams, API clients, integrations, scripts, and anything reading its data. API consumers are the easiest dependency to forget and the most expensive to break.
3. **Decide whether a migration path is required.** If users have data or workflows in this feature, provide one. Removing a feature with no path for existing users is a support incident with a deadline.
4. **Announce with a date and a path**, through every channel affected users actually read. Give a window proportional to the switching cost: a week for an internal tool, a quarter or more for a public API.
5. **Add a deprecation signal in the product** — a banner, a log warning, a response header, a documentation notice. Announcements are missed; in-product signals are not.
6. **Stop new adoption immediately.** Remove it from documentation, hide it for new accounts, and reject new integrations. Every new user added during deprecation extends the timeline.
7. **Monitor usage through the deprecation window.** If usage is not declining as the date approaches, the migration path is not working — find out why rather than removing on schedule and dealing with the fallout.
8. **Decision point at the deadline: has usage reached zero or an acceptable residual?**
   - **If yes:** proceed to removal.
   - **If no:** extend and contact remaining users directly. Removing a feature people still depend on because the date arrived is a choice, and it should be a deliberate one.
9. **Disable behind a flag first**, before deleting code. This gives a fast rollback if a dependency you missed surfaces.
10. **Wait a defined period with it disabled** — long enough to cover monthly or quarterly usage patterns. Batch jobs and reporting flows surface late.
11. **Delete the code, tests, configuration, documentation, dashboards, and alerts.** Partial removal leaves confusing dead paths that outlive everyone's memory of why they exist.
12. **Handle the data deliberately.** Export, archive, migrate, or delete per the retention policy and any legal obligations. Orphaned data is a liability, and deleting user data without a documented decision is a compliance incident.
13. **Record in [DECISIONS.md](DECISIONS.md)**: what was removed, why, when, and what replaced it — so the question "why did we drop that?" has an answer in two years.

**Verification** — Usage at zero or an accepted residual. Code, tests, config, docs, dashboards, and alerts removed. Data handled per policy. No broken references remaining, confirmed by search.

**Rollback** — During the flag period, re-enable the flag. After deletion, rollback means reverting the removal commits — which is why the flag period exists and why deletion comes last.

**Aftercare** — Confirm the replacement is carrying the load. Remove the deprecation notices themselves. Note the maintenance cost recovered — it justifies the next deprecation.

**Common mistakes** — Deciding from an impression of usage rather than data. Missing API and integration consumers. Announcing without a migration path. Deleting code and leaving dashboards, alerts, and documentation behind. Removing on the deadline while usage is still material. Skipping the flag period and discovering a dependency after the code is gone. Leaving orphaned user data with no decision recorded.

---

## 22. Recovering a project that has lost quality control

**Trigger** — You have inherited or returned to a codebase with no tests worth trusting, no documentation, unclear architecture, unknown production state, or all of these.

**Owner** — Whoever is accountable for the system now, with the Architect assessing structure.

**Prerequisites** — Access to the code, the running system, and its history. Authority to slow feature delivery while stabilizing.

**Steps**

1. **Do not rewrite.** The instinct is strong and almost always wrong. The existing system encodes years of requirements nobody wrote down, and a rewrite discards them while delivering nothing for months. Stabilize, then improve incrementally.
2. **Establish what is actually running in production** — which commit, which configuration, which dependencies, which infrastructure. In a neglected project this frequently does not match any branch, and everything else depends on knowing it.
3. **Get a build working reproducibly from a clean checkout.** If nobody can build it, nobody can fix it. This is step one of engineering, not step five.
4. **Establish observability before anything else.** If you cannot see error rates, latency, and traffic, you are working blind and will not know whether your changes help or hurt. This is the highest-value first investment in a recovered project.
5. **Find out whether backups exist and whether they restore.** Test a restore. In neglected projects this is where the genuinely unrecoverable risk usually hides.
6. **Run a security pass for the acute risks** — exposed credentials in the repository and its history, unauthenticated endpoints, unpatched dependencies with known CVEs, and default passwords. Fix these before anything cosmetic. See [Security standards](STANDARDS.md#10-security-standards).
7. **Write characterization tests for the highest-value paths**, starting with whatever generates revenue or holds data. You are not testing intent; you are capturing current behaviour so change becomes safe. Cover the top few paths, not everything.
8. **Get a deployment and rollback path working and tested.** Until you can deploy safely and undo it, every change is a gamble.
9. **Map the architecture as it actually is**, not as it was intended. Write it to [architecture/](architecture/) with the boundaries, the data flows, and the parts nobody understands — marked as such rather than omitted.
10. **Triage the debt by cost** per [14. Paying down technical debt](#14-paying-down-technical-debt). You cannot fix everything; fix what is actively costing delivery.
11. **Install the Gatecraft** and fill in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) and [memory/](memory/) with what you have learned. The knowledge you are reconstructing was lost once already.
12. **Set the bar going forward and hold it.** Every new change meets the standards, even while the old code does not. Mixing "we will fix it later" into new work is how the project got here.
13. **Improve incrementally under the Boy Scout Rule.** Every file touched leaves cleaner. This compounds and does not require permission or a project plan.

**Verification** — Reproducible build from clean checkout. Observability in place with alerts on user-visible symptoms. Tested backup and restore. Acute security issues closed. Characterization tests on the highest-value paths. Tested deploy and rollback. Architecture documented as it is.

**Rollback** — Not applicable — this is a programme, not a change. Individual changes within it roll back normally, which is precisely what step 8 establishes.

**Aftercare** — Record the recovery in [memory/](memory/) including what was found and what remains unknown. Set a review cadence so the next round of decay is caught early. Feed the causes into a retrospective per the [Retrospective template](TEMPLATES.md#18-retrospective) — projects rarely decay for purely technical reasons.

**Common mistakes** — Rewriting. Starting with cosmetic refactoring instead of observability and backups. Writing tests for what the code should do rather than what it does, so every test fails and none are trusted. Trying to fix everything at once. Not verifying what is actually deployed. Continuing to ship at the old quality bar while planning to raise it later. Never recording what was learned, so the next person rediscovers it all.
