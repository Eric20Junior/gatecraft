# Checklists

Every checklist is **binary: pass or fail**. A partial pass is a fail. Every item
is **falsifiable**: state the evidence that proves it done, not the effort
toward it.

Run checklists at the gates specified in [WORKFLOW.md](WORKFLOW.md). A failing
item blocks the gate; fix it or document a written exception in an ADR in
[DECISIONS.md](DECISIONS.md).

---

## 1. Architecture checklist

Run before committing to a design, per the
[Architecture workflow](WORKFLOW.md#5-architecture-workflow).

- [ ] At least three design options were compared on weighted axes documented
      in writing. The chosen option is not the first one proposed.
- [ ] The decision is reversible or the irreversibility is documented with a
      tested rollback or migration path.
- [ ] Every dependency points inward: the core has no knowledge of the
      periphery.
- [ ] Every layer pays rent: it provides isolation, a boundary, or a meaningful
      abstraction. Layers that only forward calls are removed.
- [ ] State is minimized and externalized. Services are stateless where
      possible.
- [ ] Failure modes and fallback behaviour are designed and documented.
- [ ] The blast radius of a component failure is bounded and stated.
- [ ] Every external dependency is justified: what it provides that we cannot
      build cheaper, and what we lose if it disappears.
- [ ] The design handles 2× expected peak load without heroics.
- [ ] The design is documented in [architecture/](architecture/) or
      [TEMPLATES.md#13](TEMPLATES.md#13-architecture-document), and an ADR
      records the decision in [DECISIONS.md](DECISIONS.md).

---

## 2. Backend checklist

Run before marking backend work done.

- [ ] Every endpoint has authentication and authorization. No unauthenticated
      paths exist unless documented as deliberately public.
- [ ] Every input is validated: type, range, format, length. Invalid input
      fails loudly with a structured error.
- [ ] Every error is handled. No bare `try` without `catch`, no ignored return
      codes, no silent fallthrough.
- [ ] Every external call has a timeout and retry logic with exponential
      backoff and jitter. Retries are idempotent or explicitly marked unsafe.
- [ ] Logging is structured with correlation IDs. Every error logs enough
      context to diagnose it.
- [ ] Every query on a table with meaningful data volume has an index, verified
      with the query plan. N+1 queries are eliminated.
- [ ] Every collection API is paginated.
- [ ] Transactions are correctly scoped: wide enough to enforce invariants,
      narrow enough not to lock unrelated rows.
- [ ] Tests exist and pass: unit tests for logic, integration tests for the
      data layer, and at least one end-to-end test for the happy path and one
      error case.
- [ ] The code is reviewed per [WORKFLOW.md#8](WORKFLOW.md#8-code-review-workflow).

## 3. Frontend checklist

Run before marking frontend work done.

- [ ] Every state is designed and implemented: loading, empty, error, partial,
      success. No screen renders a spinner forever or a blank area on failure.
- [ ] Every form validates on submit and on blur, shows errors adjacent to the
      offending field, and preserves the user's input on failure.
- [ ] Every destructive action requires confirmation or offers undo. Nothing
      irreversible happens on a single click.
- [ ] Keyboard navigation reaches every interactive element in a logical order,
      focus is always visible, and no keyboard trap exists.
- [ ] The accessibility checklist passes: see
      [14. Accessibility checklist](#14-accessibility-checklist).
- [ ] Layout is verified at 320px, 768px, 1024px, and 1440px widths. No
      horizontal scroll, no clipped content, no overlapping text.
- [ ] Performance budget met and measured on a mid-tier device over a throttled
      connection, not on the developer's machine: LCP under 2.5s, CLS under 0.1,
      INP under 200ms.
- [ ] No secrets, API keys, or internal URLs are present in the client bundle.
      Verified by inspecting the built artifact, not the source.
- [ ] All user-supplied content is escaped or sanitized at render. No
      unsanitized HTML injection path exists.
- [ ] Tests exist and pass: component tests for behaviour and at least one
      end-to-end test covering the primary user journey.

---

## 4. Mobile checklist

Run before submitting a build to a store or an internal distribution channel.

- [ ] The app functions offline or degrades to a designed offline state. Network
      loss does not produce a crash or an unrecoverable screen.
- [ ] All persisted sensitive data uses the platform keystore or keychain. No
      credentials or tokens in plain files, shared preferences, or logs.
- [ ] Every permission request is made at the point of need with an explanation,
      and denial is handled without breaking the app.
- [ ] Background work respects platform limits and does not drain battery:
      verified with the platform's energy profiler over a realistic session.
- [ ] Deep links and app links resolve correctly, including from a cold start
      and when unauthenticated.
- [ ] The app is tested on the oldest supported OS version and the smallest
      supported screen, on a physical device.
- [ ] Cold start time is measured and within budget. Startup does no network
      call that blocks first render.
- [ ] Crash reporting and analytics are wired up and verified to receive events
      from a release build.
- [ ] Store metadata is complete: screenshots, description, privacy declaration,
      and data-collection disclosure matching what the app actually collects.
- [ ] Upgrade path from the previous released version is tested with real
      migrated data, not a fresh install.

---

## 5. AI checklist

Run before shipping any feature whose behaviour depends on a model, per
[WORKFLOW.md#7](WORKFLOW.md#7-ai-development-workflow).

- [ ] An eval set exists with at least 30 real, held-out cases covering the
      expected distribution and the known failure cases. It is stored in
      [evaluation/](evaluation/) and versioned with the code.
- [ ] Baseline eval scores are recorded. Every prompt or model change reports its
      delta against them, including which individual cases changed direction.
- [ ] The model version is pinned explicitly. No implicit "latest" alias is used
      in production.
- [ ] Output is schema-constrained and validated in code. A schema-valid but
      semantically wrong response is handled, not assumed away.
- [ ] The trust boundary is documented: all retrieved content, user text, and
      tool output is treated as data, never as instruction. Model output is
      treated as untrusted input by every consumer.
- [ ] No model output can trigger a privileged or destructive action without a
      deterministic authorization check evaluated against the end user's
      permissions.
- [ ] For retrieval systems, retrieval quality is measured separately from
      generation quality, with recall and precision on a labelled query set.
- [ ] Cost and latency per request are measured, budgeted, and alerted on. A
      retry or agent loop cannot run unbounded.
- [ ] A designed fallback exists for model failure, timeout, or unavailability.
      The user sees a defined experience, not an error trace.
- [ ] A user-facing path exists to report a bad output, and reported cases are
      routed into the eval set.

---

## 6. Database checklist

Run before any schema change or data-layer work is marked done.

- [ ] The schema is normalized to 3NF, or every denormalization is documented
      with its consistency owner and a reconciliation check.
- [ ] Every foreign key is declared in the database with an explicit
      `ON DELETE` behaviour. Referential integrity is not left to application
      code.
- [ ] Every constraint that expresses a business invariant is enforced by the
      database: `NOT NULL`, `UNIQUE`, `CHECK`, or an exclusion constraint.
- [ ] Every query in the change has been run against production-shaped data
      volume and its query plan inspected. No unexpected sequential scans.
- [ ] Migrations are reversible, or a tested forward-fix path is documented.
- [ ] Migration locking behaviour is verified: no exclusive lock is taken on a
      large table, indexes are created concurrently where the engine supports it,
      and backfills are batched and resumable outside the migration.
- [ ] Timestamps are stored in UTC with an explicit type. Ranges use half-open
      intervals.
- [ ] Every field is classified (public, internal, confidential, regulated) and
      the classification drives encryption, logging, and retention.
- [ ] A retention period is defined for every table. Nothing is kept forever by
      default.
- [ ] A restore from backup has been performed into a scratch environment, and
      the measured restore duration is recorded as the real RTO.

---

## 7. Infrastructure checklist

Run before infrastructure changes reach production.

- [ ] All infrastructure is defined as code, in version control, and reviewed.
      No resource was created by hand in a console.
- [ ] The plan or diff was reviewed before apply, and no unexpected
      destroy-and-recreate appears in it.
- [ ] State is stored remotely with locking and versioning enabled.
- [ ] Every secret comes from a secret manager. No secret is in source, in an
      environment file in the repository, or in a container image.
- [ ] Least privilege is applied: every role and policy grants the minimum
      required, and no wildcard administrative permission is attached to a
      workload identity.
- [ ] Network access is default-deny. Every open ingress path is documented with
      its purpose.
- [ ] Encryption is enabled at rest and in transit for every data store and
      every hop.
- [ ] Resources are tagged with owner, environment, and cost centre, and a cost
      estimate for the change is recorded.
- [ ] Backups are configured and their restore has been tested for every
      stateful resource.
- [ ] The change can be rolled back, and the rollback procedure is written down
      in [PLAYBOOKS.md](PLAYBOOKS.md) or a runbook, not held in someone's head.

---

## 8. API checklist

Run before an API is exposed to any consumer, internal or external.

- [ ] The contract is defined in a machine-readable schema, committed to the
      repository, and generated from or verified against the implementation.
- [ ] Versioning strategy is explicit, and no breaking change ships without a
      new version and a documented deprecation window.
- [ ] Every endpoint authenticates and authorizes. Authorization is checked
      against the resource, not only the route.
- [ ] Every input is validated against the schema before any business logic
      runs. Unknown fields are rejected or explicitly ignored by decision.
- [ ] Errors use a consistent structured format with a stable machine-readable
      code, and never leak stack traces, SQL, or internal hostnames.
- [ ] Every collection endpoint is paginated with a documented maximum page
      size, and pagination is stable under concurrent writes.
- [ ] Rate limits are enforced per client and communicated in response headers.
- [ ] Every mutating endpoint is idempotent or accepts an idempotency key.
- [ ] Timeouts are defined for every endpoint, and long operations return a
      job handle rather than holding the connection.
- [ ] Documentation exists with a working example request and response for every
      endpoint, and the examples are tested.

---

## 9. Security checklist

Run before every production release. The Security Engineer role holds veto power
here per [AGENTS.md](AGENTS.md).

- [ ] Every entry point authenticates, and every authenticated request is
      authorized against the specific resource. No horizontal or vertical
      privilege escalation path exists.
- [ ] All queries are parameterized. No string-concatenated SQL, shell command,
      or template expression built from user input exists in the change.
- [ ] All output is encoded for its destination context. No unsanitized HTML,
      URL, or shell interpolation path exists.
- [ ] Secrets are in a secret manager, are not in source control history, and
      have a documented rotation procedure that has been executed at least once.
- [ ] Dependencies are scanned, and no known high or critical vulnerability is
      shipping without a documented, dated exception.
- [ ] All transport is encrypted with current TLS. No plaintext internal hop is
      assumed safe because it is internal.
- [ ] Passwords are hashed with a current memory-hard algorithm. Sessions and
      tokens expire, can be revoked, and are invalidated on password change.
- [ ] Logs contain no credentials, tokens, PII, or full payment data. Verified by
      inspecting actual log output, not by intent.
- [ ] Security-relevant events are logged and auditable: authentication,
      authorization failures, privilege changes, and data exports.
- [ ] A threat model exists for the feature per
      [TEMPLATES.md#16](TEMPLATES.md#16-threat-model), and every identified
      threat has a mitigation, an accepted-risk record, or a tracked task.

---

## 10. Performance checklist

Run before release for anything on a user-facing or high-volume path.

- [ ] A performance requirement is stated numerically, with a percentile and a
      load level, before the work began.
- [ ] The system has been profiled under realistic load, and the top three
      contributors to latency are identified with measurements.
- [ ] p50, p95, and p99 are measured and within budget. No decision rests on a
      mean.
- [ ] No N+1 query exists on any exercised path, verified by counting queries per
      request.
- [ ] Every hot query is index-supported, confirmed with the query plan.
- [ ] Payload sizes are bounded: responses paginated, images sized and
      compressed, and no unbounded field returned by default.
- [ ] Connection and thread pools are sized from measured concurrency, not
      guessed, and the total across instances is within the downstream limit.
- [ ] Caching, where used, has a documented TTL or invalidation owner, and
      stampede protection on hot keys.
- [ ] A load test and a soak test have been run, and results are recorded in
      [metrics/](metrics/).
- [ ] The breaking point is known from a stress test, and behaviour past it is
      graceful degradation rather than collapse.

---

## 11. Deployment checklist

Run immediately before every deploy to production, per
[WORKFLOW.md#10](WORKFLOW.md#10-deployment-workflow) and
[PLAYBOOKS.md#10](PLAYBOOKS.md#10-deploying-to-production).

- [ ] All quality gates in [SYSTEM.md#10](SYSTEM.md#10-quality-gates) pass. CI is
      green on the exact commit being deployed.
- [ ] The change has been deployed and verified in a staging or pre-production
      environment that shares the production configuration shape.
- [ ] Database migrations are separated from application deploys and follow
      expand-migrate-contract. No deploy requires a schema change to land in the
      same step.
- [ ] The rollback procedure is written down, and the last time it was tested is
      recorded and recent.
- [ ] Feature flags for anything risky are in place and default to off.
- [ ] Monitoring and alerting cover the new code path: at minimum error rate and
      latency, with a threshold that would actually fire.
- [ ] The deploy window is appropriate: not immediately before the on-call
      handover, the end of the day, or a weekend, unless the change is fixing an
      active incident.
- [ ] A named person is watching the deploy and knows the rollback trigger — a
      specific metric crossing a specific threshold, decided beforehand.
- [ ] Stakeholders who would notice a change in behaviour have been told.
- [ ] Post-deploy verification steps are written down before the deploy starts,
      so nobody has to invent them under pressure.

---

## 12. Release checklist

Run when a release is cut, distinct from the mechanical deploy.

- [ ] The release scope matches what was planned. Anything added late is
      identified and was reviewed to the same standard.
- [ ] [CHANGELOG.md](CHANGELOG.md) is updated with user-visible changes in
      language a user would understand.
- [ ] The version number is bumped per the scheme in [VERSION.md](VERSION.md),
      and a breaking change carries a major bump.
- [ ] All documentation affected by the change is updated in the same release:
      API docs, README, runbooks, and onboarding material.
- [ ] Breaking changes have a migration guide and a deprecation window that has
      already been communicated.
- [ ] Every item in the release notes maps to a merged, reviewed change; nothing
      is claimed that did not ship.
- [ ] Support, sales, or customer-facing teams have what they need before users
      see the change.
- [ ] Known issues are documented rather than omitted, with a workaround where
      one exists.
- [ ] The production readiness score is at or above threshold per
      [16. Production readiness checklist](#16-production-readiness-checklist).
- [ ] The release is tagged in version control, and the tag is what was built.

---

## 13. Documentation checklist

Run before marking any documentation work done. Documentation is a deliverable,
not a courtesy.

- [ ] Every public interface has documentation stating purpose, parameters,
      return value, errors raised, and at least one example.
- [ ] Every example has been executed and produces the output shown.
- [ ] The README lets a new engineer clone, install, configure, run, and test the
      project without asking anyone a question.
- [ ] Every configuration option is documented with its type, default, valid
      range, and what happens when it is wrong.
- [ ] Architecture documentation explains *why*, not only what. Rejected
      alternatives are named.
- [ ] Every non-obvious decision has an ADR in [DECISIONS.md](DECISIONS.md), and
      the ADR is linked from the code or docs it governs.
- [ ] Runbooks exist for every operational task that would otherwise require
      tribal knowledge, and each records the date it was last verified.
- [ ] No documentation contradicts the code. Where it did, the documentation was
      corrected in the same change as the code.
- [ ] No placeholder, TODO, or "coming soon" text remains in shipped
      documentation.
- [ ] Links resolve. No reference points at a moved, renamed, or deleted target.

---

## 14. Accessibility checklist

Run before any user-facing interface ships. Targets WCAG 2.2 Level AA per
[STANDARDS.md#17](STANDARDS.md#17-accessibility-standards).

- [ ] All content and functionality is reachable and operable by keyboard alone,
      in a logical order, with no keyboard trap.
- [ ] Focus is always visible with a clearly distinguishable indicator, including
      against custom backgrounds.
- [ ] Text contrast is at least 4.5:1, and large text and meaningful non-text
      elements at least 3:1, measured with a contrast tool.
- [ ] Colour is never the only carrier of meaning. Status, errors, and required
      fields are also indicated by text, icon, or shape.
- [ ] Every image, icon, and control has an appropriate accessible name.
      Decorative images are explicitly hidden from assistive technology.
- [ ] Every form field has a programmatically associated label, and errors are
      announced and linked to the field they concern.
- [ ] Semantic structure is correct: one main landmark, headings in order without
      skipping levels, lists marked as lists, and native elements used before ARIA.
- [ ] Dynamic content changes are announced: live regions for status updates,
      focus management for dialogs and route changes.
- [ ] Interactive targets are at least 44×44 CSS pixels or have equivalent
      spacing.
- [ ] Verified with an automated scanner (zero violations) **and** a manual pass
      with a screen reader on at least the primary journey. Automated tools alone
      are not a pass.

---

## 15. Scalability checklist

Run when a system is expected to grow, or when reviewing a design per
[STANDARDS.md#23](STANDARDS.md#23-scalability-standards).

- [ ] The current load and the target load are both stated numerically, with the
      time horizon.
- [ ] The bottleneck at the target load is identified by measurement or explicit
      calculation, not assumed.
- [ ] Application instances are stateless, so capacity can be added
      horizontally. Any local state is documented with its consequence.
- [ ] Sessions, caches, and locks are external to the instance.
- [ ] Work that does not need to be synchronous is asynchronous, with a bounded
      queue and a defined behaviour when the queue is full.
- [ ] Every unbounded resource has a bound: request payloads, result sets, queue
      depth, retry counts, concurrency, and fan-out.
- [ ] Load shedding and backpressure are implemented. Behaviour past capacity is
      degradation, not collapse.
- [ ] Failure isolation is in place: timeouts, circuit breakers, and bulkheads on
      every remote dependency.
- [ ] The scaling cost is calculated at the target load, and the cost per unit of
      work is known.
- [ ] The data layer's scaling path is identified for the next order of
      magnitude, in order: query and index work, caching, replicas, partitioning,
      then sharding.

---

## 16. Production readiness checklist

The final gate before a system serves real users. Run alongside the
**production readiness score** in
[SYSTEM.md#14](SYSTEM.md#14-completion-criteria) — this checklist is the evidence
behind the score, and the score is not credible without it.

**Functionality**

- [ ] Every stated requirement is implemented and demonstrated, not asserted.
- [ ] Every error path is handled with a defined user-visible outcome.
- [ ] Edge cases are enumerated and tested: empty, maximum, boundary, malformed,
      concurrent, and duplicate.

**Reliability**

- [ ] Every remote dependency has a timeout, a retry policy, and a defined
      behaviour when it is unavailable.
- [ ] There is no single point of failure whose loss causes total outage, or the
      one that exists is documented and accepted in writing.
- [ ] Health checks distinguish liveness from readiness and fail when the service
      genuinely cannot serve traffic.
- [ ] Graceful shutdown drains in-flight work; a restart loses nothing.

**Observability**

- [ ] Logs are structured and carry a correlation ID end to end.
- [ ] Metrics cover rate, errors, and duration for every endpoint, plus
      saturation for every resource.
- [ ] Alerts exist for the conditions that matter, are routed to a person who is
      on call, and have been test-fired.
- [ ] A dashboard exists that answers "is it healthy" in under thirty seconds.

**Security**

- [ ] The [security checklist](#9-security-checklist) passes in full.
- [ ] A threat model exists and every threat has a mitigation or an accepted-risk
      record.

**Operations**

- [ ] Deployment is automated and repeatable, and rollback has been tested.
- [ ] Runbooks exist for the failure modes that are foreseeable, each with a last
      verified date.
- [ ] On-call ownership is assigned and the owner knows they own it.
- [ ] Backups are configured and a restore has been executed successfully.
- [ ] Capacity is sufficient for 2× current peak, and the cost at that level is
      known.

**Quality**

- [ ] Tests pass, cover the critical paths, and the suite is trusted — no
      quarantined flaky tests on the paths that matter.
- [ ] No known high or critical defect ships without a documented, dated
      exception.
- [ ] Documentation is complete per the
      [documentation checklist](#13-documentation-checklist).

**Scoring**

- [ ] The production readiness score is recorded with a one-line justification
      per dimension, is at or above 90/100, no dimension is below 7, and Security
      is at or above 9 where the system touches authentication, authorization,
      payments, personal data, or irreversible actions.

---

## 17. Postmortem checklist

Run after every incident, per
[TEMPLATES.md#11](TEMPLATES.md#11-postmortem) and
[PLAYBOOKS.md#5](PLAYBOOKS.md#5-responding-to-a-production-incident).

- [ ] The postmortem is written within five working days, while memory is intact.
- [ ] The timeline is reconstructed from evidence — logs, metrics, deploy records,
      chat transcripts — with timestamps, not from recollection.
- [ ] Detection time, response time, mitigation time, and resolution time are all
      stated as numbers.
- [ ] User impact is quantified: how many, for how long, and what they
      experienced.
- [ ] Root cause analysis goes past the proximate trigger to the systemic cause,
      and stops at something the team can change.
- [ ] The document is blameless: it names systems, processes, and missing
      safeguards, never individuals as causes.
- [ ] It records what made the incident harder than it needed to be: missing
      alerts, wrong dashboards, stale runbooks, unclear ownership.
- [ ] It records what worked, so those things are not accidentally removed later.
- [ ] Every action item has a named owner, a due date, and a stated verification
      — how we will know it was done and that it works.
- [ ] The lesson is recorded in [memory/project-memory.md](memory/project-memory.md)
      and, if it changes a rule, in [STANDARDS.md](STANDARDS.md) or
      [PLAYBOOKS.md](PLAYBOOKS.md). A postmortem that changes no artifact changed
      nothing.

---

## 18. Incident response checklist

Run *during* an incident. Order matters: stop the bleeding, then diagnose.

- [ ] Severity is declared out loud, and one person is named incident commander.
- [ ] A single communication channel is designated and everyone is in it.
- [ ] Mitigation is attempted before root cause is understood. Restoring service
      outranks explaining it.
- [ ] The most likely mitigation is tried first: roll back the last deploy, flip
      the feature flag off, scale up, fail over.
- [ ] Every action taken is logged with a timestamp in the channel, as it
      happens, by the person taking it.
- [ ] Nothing is changed that is not necessary. No opportunistic fixes during an
      incident; they destroy the evidence and add variables.
- [ ] Evidence is preserved before restarting anything: logs, heap dumps, metric
      snapshots, and the current configuration.
- [ ] Affected users are informed within the timeframe the severity requires,
      with what is known, what is not, and when the next update comes.
- [ ] Recovery is verified with data, not with an absence of alerts: the metric
      that showed the problem is back to normal and staying there.
- [ ] The incident is formally closed, a postmortem owner is assigned with a date,
      and any temporary mitigation is filed as a task to be undone.

---

## 19. Research checklist

Run before a research or spike output is accepted as a basis for decisions, per
[TEMPLATES.md#12](TEMPLATES.md#12-research-document) and
[PLAYBOOKS.md#20](PLAYBOOKS.md#20-conducting-a-research-spike).

- [ ] The question being answered is written down as a question, and it is
      specific enough to be answerable.
- [ ] The decision this research feeds is named, along with who makes it and when.
- [ ] A time box was set in advance and is recorded, along with whether it held.
- [ ] At least three options were investigated, including the do-nothing or
      build-it-ourselves option.
- [ ] Every option was evaluated against the same explicit criteria, weighted
      before the evaluation, not after.
- [ ] Claims are cited to a source, and the source is dated. Vendor marketing is
      labelled as such.
- [ ] Anything load-bearing was verified by direct test — a spike, a benchmark, a
      trial integration — not accepted from documentation alone.
- [ ] Costs are quantified: licence, infrastructure, migration, operational
      burden, and the cost of reversing the choice later.
- [ ] Risks and unknowns are stated, including what would falsify the
      recommendation.
- [ ] The output ends in a recommendation with a rationale, and the artifact is
      filed in [research/](research/) and linked from the ADR it informs.

---

## 20. Planning checklist

Run before implementation starts on any non-trivial piece of work, per
[SYSTEM.md#3](SYSTEM.md#3-the-universal-engineering-loop).

- [ ] The problem is stated in terms of user or business outcome, not in terms of
      the chosen solution.
- [ ] Success criteria are measurable and agreed before work begins.
- [ ] Explicit non-goals are written down, so scope creep is visible when it
      happens.
- [ ] Requirements are complete enough that no implementation decision requires
      guessing at intent; open questions are listed with owners.
- [ ] The work is decomposed into increments that each deliver something
      verifiable, and none is larger than a few days.
- [ ] Dependencies and sequencing are identified, including the ones outside the
      team's control.
- [ ] Every task has an owner, whether human or agent, and an acceptance
      condition.
- [ ] Risks are identified with a mitigation or a trigger for reassessment, and
      the riskiest assumption is scheduled first, not last.
- [ ] Estimates are recorded — knowing they will be wrong — so the retrospective
      can measure the error and improve the next estimate.
- [ ] The plan is written in [planning/](planning/) and reviewed by someone other
      than its author.
