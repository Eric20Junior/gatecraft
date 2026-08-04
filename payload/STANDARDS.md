# STANDARDS.md — Engineering Standards

The bar that work must clear. These are technology-agnostic: they say *what* must
be true, not which library achieves it. Project-specific standards — language
idioms, framework conventions, chosen tools — go in [standards/](standards/) and
take precedence over this file where they conflict.

**MUST** is a [gate](SYSTEM.md#10-quality-gates): failing it blocks completion.
**SHOULD** is a default you may override with a written reason recorded in the
change or an ADR. **MAY** is discretionary.

One rule outranks every specific standard below:

> **Consistency with the surrounding code beats conformance to this document.**
> A file written in a coherent style you disagree with is better than a file
> written in two styles. If a project convention conflicts with a SHOULD here,
> follow the project and record the convention in [standards/](standards/). If it
> conflicts with a MUST, fix the project — with an ADR.

Contents: [Architecture](#1-architecture-standards) · [Coding](#2-coding-standards)
· [Naming](#3-naming-standards) · [Git](#4-git-standards) ·
[Branches](#5-branch-standards) · [Commits](#6-commit-standards) ·
[Pull requests](#7-pull-request-standards) · [Documentation](#8-documentation-standards)
· [Testing](#9-testing-standards) · [Security](#10-security-standards) ·
[Performance](#11-performance-standards) · [Database](#12-database-standards) ·
[API design](#13-api-design-standards) · [Logging](#14-logging-standards) ·
[Monitoring](#15-monitoring-standards) · [Observability](#16-observability-standards)
· [Accessibility](#17-accessibility-standards) · [UX](#18-ux-standards) ·
[AI systems](#19-ai-systems-standards) · [Cloud](#20-cloud-standards) ·
[Infrastructure](#21-infrastructure-standards) · [Deployment](#22-deployment-standards)
· [Scalability](#23-scalability-standards) · [Maintainability](#24-maintainability-standards)
· [Configuration](#25-configuration-standards)

---

## 1. Architecture standards

**MUST**

- Every module has a single, stateable responsibility. If describing it requires
  "and", it is two modules.
- Dependencies point inward: business logic MUST NOT import frameworks, HTTP
  types, ORM entities, or vendor SDKs. Those live at the edges behind interfaces
  the project owns.
- No circular dependencies between modules. A cycle means the boundary is wrong.
- Every external dependency call is wrapped with a timeout. No exceptions.
- Every significant structural or technology decision has an ADR in
  [DECISIONS.md](DECISIONS.md).
- Public contracts — APIs, event schemas, database schemas, published types — are
  versioned and changed only in backward-compatible ways within a major version.
- Every layer justifies its existence. A layer that only forwards calls MUST be
  deleted.

**SHOULD**

- Start as a well-modularized single deployable. Split into services only under a
  measured force: independent scaling, independent deploy cadence, team autonomy
  at scale, or hard isolation. Record the force in the ADR.
- Introduce an abstraction on the third repetition, not the first.
- Keep the dependency graph shallow. Deep chains make every change a survey.
- Isolate vendor SDKs behind an interface you own, so replacing the vendor is a
  contained change.
- Prefer explicit data flow over implicit coupling through shared mutable state,
  ambient context, or global singletons.

**Anti-patterns that MUST be rejected in review** — abstractions with one
implementation; interfaces with one caller and no test seam; events with one
subscriber and no async requirement; a "utils" or "helpers" module that has
become a junk drawer; business logic in controllers, views, or database triggers;
configuration that changes behaviour in ways not visible from the code.

See [SYSTEM.md § 6](SYSTEM.md#6-architecture-principles) for the reasoning and
[KNOWLEDGE.md](KNOWLEDGE.md) for the pattern vocabulary.

---

## 2. Coding standards

**MUST**

- Handle every error explicitly. An empty catch block, a swallowed rejection, or
  an ignored return value MUST NOT ship. If an error is genuinely ignorable, a
  comment MUST say why.
- Never catch broadly and continue silently. Catch what you can handle at the
  level that can handle it; let the rest propagate to a boundary that logs and
  responds.
- Validate all external input at the boundary where it enters the system, before
  it reaches business logic.
- Make illegal states unrepresentable where the language allows it. A type that
  cannot hold an invalid value beats a check that might be forgotten.
- No commented-out code. Version control remembers; commented code rots and
  confuses.
- No dead code, unused parameters, unreachable branches, or unused dependencies.
- No hardcoded secrets, credentials, tokens, keys, or personal data — see
  [§ 10](#10-security-standards).
- Every function has one clear purpose. A function whose name needs "and" does
  too much.
- Formatting and linting are automated and enforced in CI. Style MUST NOT be
  discussed in review — that is the tool's job.

**SHOULD**

- Prefer pure functions for logic; push side effects to the edges. Pure logic is
  trivially testable and trivially reasoned about.
- Keep functions short enough to hold in your head. If you cannot see the whole
  function at once, it is doing too much.
- Guard clauses and early returns over nested conditionals. Nesting depth beyond
  three is a signal to extract.
- Immutable data by default; mutate only where it earns something measurable.
- Return typed, structured errors rather than strings or booleans. Callers need to
  distinguish "not found" from "not permitted" from "upstream failed".
- Avoid boolean parameters that select behaviour — `render(true)` tells the reader
  nothing. Use two functions or a named value.
- Avoid clever code. Cleverness is a loan against the next reader's time.
- Keep nesting, parameter counts, and cyclomatic complexity low enough that a
  reviewer does not have to trace execution to understand intent.

**Comments**

- Comment the **why**, never the **what**. The code says what it does; only a
  human knows why it does it that way.
- MUST comment: non-obvious constraints, workarounds with their reason and a link,
  deliberate deviations from an obvious approach, security-relevant invariants,
  and any unit or coordinate assumption.
- MUST NOT: restate the code, narrate the obvious, or leave `TODO` without an
  owner and a tracking reference.
- Match the surrounding file's comment density. A heavily-commented codebase and a
  sparsely-commented one are both fine; a file that switches is not.

---

## 3. Naming standards

**MUST**

- Names describe purpose, not type or implementation. `retryDelay` not
  `intValue`; `activeSubscribers` not `list2`.
- Include units and currency in names where ambiguity is possible:
  `timeoutMs`, `sizeBytes`, `priceCents`, `distanceMetres`. Unit confusion has
  destroyed spacecraft and mispriced orders.
- Use the same word for the same concept across the entire codebase. If it is a
  `customer` in the database, it is not a `client` in the service and a `user` in
  the API. Pick one and record it in the project glossary.
- Booleans read as assertions: `isActive`, `hasPermission`, `canRetry`,
  `shouldRetry`. Never negated names like `isNotDisabled` — double negatives in
  conditionals are a reliable bug source.
- Follow the language's idiomatic casing conventions, enforced by the linter.

**SHOULD**

- Length proportional to scope. A loop index may be `i`; a module-level export
  may not.
- Functions are verb phrases (`calculateTax`, `fetchInvoice`); values and types
  are noun phrases (`taxRate`, `Invoice`).
- Avoid abbreviations except universally understood ones (`id`, `url`, `http`,
  `db`). `usrMgrSvcImpl` is not a name, it is a puzzle.
- Prefer positive, specific names for flags: `paymentsEnabled` over
  `featureFlag3`.
- Async operations that return a future or promise SHOULD read as the action, not
  the mechanism.
- Name test cases as the behaviour asserted, so a failure message is a bug report:
  "rejects withdrawal when balance is insufficient", not "test withdraw 2".

---

## 4. Git standards

**MUST**

- Every change is version controlled. No manual edits on servers, in consoles, or
  in production databases outside a reviewed migration.
- Never commit secrets, credentials, tokens, keyfiles, `.env` files, or personal
  data. If one is committed, treat it as **compromised**: rotate the credential
  first, then purge the history. Removing the file in a later commit does not
  make it safe.
- Never rewrite published history on a shared branch. Force-push only to your own
  unmerged branch, and only when you understand who else may have it.
- `.gitignore` covers build output, dependencies, local configuration, editor
  files, and anything generated. A repository MUST NOT contain artifacts it can
  rebuild.
- Large binaries use appropriate storage (LFS or an artifact store), not the
  object database.

**SHOULD**

- Commit early and often locally; curate before publishing.
- Keep the default branch always releasable. If it is broken, fixing it is the
  team's top priority — a broken default branch blocks everyone.
- Sign commits where the project requires provenance.
- Tag releases immutably, matching the version in [VERSION.md](VERSION.md).

---

## 5. Branch standards

**MUST**

- Work happens on a branch, not on the default branch, unless the project
  explicitly uses trunk-based development with equivalent gates.
- Branch names follow one convention project-wide, including the change type and
  a reference: `feat/1234-invoice-export`, `fix/1290-null-on-empty-cart`,
  `chore/pin-dependencies`.
- Branches are short-lived. A branch open longer than a few days accumulates merge
  risk faster than it accumulates value.
- Delete merged branches. A branch list is not a changelog.

**SHOULD**

- Rebase onto the default branch to stay current; merge to integrate. Rebasing
  your own unpublished work keeps history readable; rebasing shared work does not.
- One branch, one purpose. A branch containing a feature and an unrelated
  refactor cannot be reviewed properly or reverted cleanly.
- Prefer feature flags over long-lived feature branches. Integrate continuously,
  release deliberately — these are separate decisions and MUST NOT be coupled.

---

## 6. Commit standards

**MUST**

- Each commit is one logical change, and the build passes at every commit on a
  published branch. This is what makes `bisect` and `revert` work — the two tools
  you will want most during an incident.
- Never mix a refactor with a behaviour change in one commit. This is the single
  most common way restructuring causes outages: the diff is unreviewable and the
  revert is unusable.
- The subject line states what changed, in the imperative, under about 72
  characters: "Add retry with jitter to webhook delivery".
- The body explains **why**, and any consequence a future reader needs: what
  problem it solves, what alternative was rejected, what it breaks.
- Reference the issue, ticket, or requirement.
- Breaking changes are marked unmistakably in the message.

**SHOULD**

- Use a conventional prefix (`feat`, `fix`, `docs`, `refactor`, `test`, `perf`,
  `build`, `chore`) if the project generates changelogs from history.
- Explain non-obvious decisions in the commit rather than only in the pull
  request. Commit messages travel with the code; review comments do not.
- Write the message as if the reader is you in eighteen months, mid-incident,
  with no memory of this work. That reader is the actual audience.

---

## 7. Pull request standards

**MUST**

- The description states what changed, why, how it was verified, and what risk it
  carries.
- Every applicable [gate](SYSTEM.md#10-quality-gates) has run, with evidence
  linked — not claimed from memory.
- Breaking changes, migrations, and required configuration or environment changes
  are called out explicitly at the top, not buried.
- All blocking review findings are resolved before merge. See the
  [Code Review workflow](WORKFLOW.md#8-code-review-workflow).
- Security-relevant changes have Security Engineer approval per
  [AGENTS.md](AGENTS.md#security-engineer).
- CI is green. A red pipeline is never merged "because the failure is unrelated" —
  if it is unrelated, fix it first or the suite loses its authority.

**SHOULD**

- Keep pull requests small enough to review carefully. Review quality falls off a
  cliff with size; a 2000-line diff receives approval, not review.
- Include the reproduction or the failing test for a bug fix, so the reviewer can
  verify the claim rather than trust it.
- Include before-and-after evidence for anything visual or performance-related.
- Call out what you are *unsure* about, and what you want scrutinized. This is the
  highest-value sentence in most descriptions and the most commonly omitted.
- Self-review the diff before requesting review. Most findings are things the
  author would have caught by reading their own change once.

---

## 8. Documentation standards

**MUST**

- Every deliverable is documented before it is considered complete. See the
  [completion criteria](SYSTEM.md#14-completion-criteria).
- Every public interface — API endpoint, exported function, event, CLI command,
  configuration option — documents its purpose, parameters with types and
  constraints, return value, errors, and side effects.
- Every configuration option documents its type, default, valid range, and effect.
- Every example is executed and verified working. A broken example destroys trust
  in every other statement in the document.
- Known limitations and failure modes are stated explicitly. A limitation
  published is a feature; discovered by a user, it is a defect.
- Documentation is updated in the same change as the code. A follow-up
  documentation task is a documentation defect with a delay.
- Absolute dates, never relative ones. "Deprecated 2026-03-14", not "deprecated
  recently".

**SHOULD**

- Separate documents by reader intent: *tutorial* (learning), *how-to guide*
  (doing), *reference* (looking up), *explanation* (understanding). Merging them
  produces documents that serve nobody.
- Generate reference material from source so it cannot drift.
- Record the *why* — constraints, trade-offs, rejected alternatives. This is the
  part that cannot be reconstructed from the code and the part future engineers
  need most.
- Every repository has a README that gets a new engineer from clone to running in
  under thirty minutes.
- Verify by execution: follow your own instructions on a clean environment. This
  is the only reliable way to find the steps you assumed.

---

## 9. Testing standards

**MUST**

- New behaviour has tests. New branching logic has tests for each branch.
- **Every test MUST be proven able to fail.** Break the implementation
  deliberately, confirm red, restore. A test that has never failed is an
  assumption wearing a test's clothing.
- Every fixed bug gets a regression test that reproduces it. Write the test
  first, watch it fail, then fix.
- Tests are independent: no shared mutable state, no ordering dependency, no
  reliance on a previous test's side effects.
- Tests are deterministic. No dependence on wall-clock time, timezone, locale,
  random seeds, network, or iteration order — inject those.
- Failure paths are tested, not only happy paths: dependency down, dependency
  slow, dependency returning malformed data, partial write, concurrent
  modification, timeout, retry.
- Negative cases are tested: unauthorized denied, invalid rejected, rate limit
  enforced. This is where systems are least verified and most exposed.
- Boundaries are tested: zero, one, many, maximum, empty, null, malformed,
  duplicate, out-of-order, unicode, maximum length.
- **A flaky test MUST be fixed or deleted the day it is noticed.** A flake is
  worse than no test: it trains everyone to ignore red, which is how real
  failures ship.
- Tests assert behaviour, not implementation. A test that breaks on every
  refactor is testing the wrong thing and will eventually be deleted in
  frustration.

**SHOULD**

- Choose the cheapest level that can catch the defect: unit for logic and
  branching, integration for boundaries and contracts, end-to-end for critical
  journeys only. Most suites are inverted — slow end-to-end tests asserting
  things a unit test would catch in a millisecond.
- Name tests as the behaviour asserted, so the failure output reads as a bug
  report.
- Structure as Arrange / Act / Assert with the three parts visually distinct.
- One logical assertion per test. A test asserting five unrelated things reports
  one failure and hides four.
- Use real implementations where they are fast and reliable; fake only what is
  slow, non-deterministic, external, or expensive. Over-mocking produces tests
  that pass while the system is broken.
- Keep the suite fast enough to run on every change. A suite nobody runs before
  pushing is a suite that catches nothing until CI, which is too late to be
  cheap.
- Measure coverage by risk, not by line percentage. 100% line coverage with no
  failure-path tests is weaker than 60% that covers what matters. Coverage
  targets, once made a goal, get gamed — see Goodhart's Law in
  [KNOWLEDGE.md](KNOWLEDGE.md).
- Add contract tests at service boundaries and property-based tests where the
  input space is large and invariants are clear.

---

## 10. Security standards

The [Security Engineer](AGENTS.md#security-engineer) has veto authority here. See
the [Security Review workflow](WORKFLOW.md#15-security-review-workflow) for the
full pass and [OWASP Top 10](KNOWLEDGE.md#owasp-top-10) for the underlying
categories.

**Authentication — MUST**

- Store passwords only as salted hashes from a current password-hashing function
  with deliberate work factors. Never encryption, never a general-purpose hash.
- Never log, store, or transmit credentials in plaintext, including in error
  messages, analytics, and crash reports.
- Expire sessions and tokens. Support revocation, and revoke on password change,
  privilege change, and logout.
- Rate-limit and progressively delay authentication, password reset, and
  registration.
- Return identical responses and timings for "user not found" and "wrong
  password" — otherwise the endpoint is an account enumeration oracle.
- Make password reset tokens single-use, short-lived, and unguessable.

**Authorization — MUST**

- Enforce authorization **server-side on every path**. A hidden UI control is not
  an access control.
- Check **object-level ownership**, not just role. "Is this user an admin?" is not
  the same question as "does this user own invoice 4471?" Failing to distinguish
  them is the most common serious vulnerability in real systems.
- Default deny. New endpoints, new fields, and new actions are inaccessible until
  explicitly permitted.
- Re-check authorization on every request. Never trust a client-supplied role,
  tenant, or identity claim that has not been verified server-side.
- Test both horizontal (another user's data) and vertical (elevated privilege)
  escalation.

**Input and output — MUST**

- Validate every external input at the boundary: body, query, path, headers,
  cookies, uploads, webhooks, and any third-party or model response. Prefer
  allowlists.
- Parameterize every query. String concatenation into SQL, NoSQL filters, shell
  commands, LDAP filters, or templates MUST NOT ship.
- Encode output for its specific sink — HTML body, HTML attribute, JavaScript,
  URL, SQL, shell, log line. XSS is an output-encoding failure, not an
  input-validation failure.
- Allowlist and validate any URL the server will fetch; block internal ranges and
  cloud metadata endpoints explicitly. This is the SSRF defense.
- Protect state-changing requests against CSRF, and set `SameSite` on cookies.
- Validate uploads by content, not extension; cap size; store outside the web
  root; serve with a non-executing content type; never execute.

**Secrets — MUST**

- No secrets in source, configuration files in the repository, client bundles,
  logs, error messages, or URLs.
- Store secrets in a secret manager; inject at runtime.
- Every secret is rotatable, and **rotation has been tested**. An unrotatable
  secret is an incident waiting for a trigger.
- Treat any exposed secret as compromised: rotate first, investigate second.
- Scan for committed secrets automatically in CI.

**Data — MUST**

- Encrypt in transit with current TLS configuration. Encrypt sensitive data at
  rest.
- Never implement your own cryptography, and never use a broken primitive because
  it is convenient.
- Minimize collection: if you do not need it, do not store it. Data you never
  collected cannot leak.
- Enforce retention limits, and make deletion actually delete — including
  backups, caches, search indexes, logs, and derived data. A deletion feature that
  leaves copies is a compliance failure and a lie to the user.
- Never send personal data to third parties, including logging and AI providers,
  without an explicit, recorded decision.

**Operational — MUST**

- Audit-log every security-relevant event with actor, action, target, timestamp,
  and outcome. Exclude or minimize personal data in logs.
- Rate-limit expensive, enumerable, and AI-backed endpoints.
- Return generic error messages externally; keep detail in server-side logs. No
  stack traces, internal paths, SQL, or version numbers in responses.
- Set security headers: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`,
  and frame protection.
- Pin dependencies, scan them continuously, and patch known vulnerabilities within
  a stated window by severity.
- Verify new dependencies are the package you intended — check for typosquats.
- Run with least privilege: every service identity, database user, and cloud role
  gets the narrowest permissions that work.

**SHOULD**

- Threat-model before building anything handling authentication, money, personal
  data, or irreversible actions.
- Assume an attacker with a valid account, your source code, and patience.
- Design so one compromised credential has a small blast radius.
- Defense in depth: never rely on a single control.

---

## 11. Performance standards

**MUST**

- Meet the performance targets stated in
  [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md). If there are no targets, set them
  before claiming performance is acceptable.
- Every performance claim is backed by a measurement under production-like
  conditions. Assertion is not evidence.
- Measure before optimizing. An optimization without a before measurement is a
  guess; one without an after measurement is a hope.
- Every query hitting a table with meaningful data volume has an index, and the
  query plan has been checked. N+1 queries MUST be eliminated.
- Every collection exposed to a client is paginated. Unbounded result sets MUST
  NOT ship.
- No unbounded growth: memory, cache, queue depth, result set, retry count, loop
  iteration. Every accumulation has a limit.

**SHOULD**

- Profile before guessing. The bottleneck is usually not where intuition suggests.
- Optimize the hot path after measuring it is hot, not because it looks
  expensive.
- Cache where the cost of a miss is acceptable and invalidation is correct.
  Incorrect caching is worse than no caching — it creates hidden state that
  breaks under concurrency and deployment.
- Measure resource cost per operation: database round-trips, allocations,
  cryptographic operations, large copies. These compound.
- Load-test at 2× expected peak before calling performance done. The knee of the
  latency curve arrives faster than linear extrapolation predicts.
- Trade complexity for performance only when the measurement justifies it. Most
  complexity buys nothing measurable.

---

## 12. Database standards

**MUST**

- Every foreign-key relationship has a constraint. Orphaned rows are data
  corruption waiting to surface.
- Every frequently-queried column or combination has an index, verified with the
  query plan.
- Migrations are reversible or explicitly documented as one-way, with a tested
  backup gate. An irreversible migration without a backup is a data-loss incident
  in waiting.
- Schema changes are backward-compatible with the currently-deployed version for
  the entire rollout window. The deployment sequence is expand, migrate, contract
  — never in one step. See [KNOWLEDGE.md](KNOWLEDGE.md).
- Transactions are correctly scoped: wide enough to enforce the invariant,
  narrow enough not to lock unrelated rows.
- No `SELECT *` in production code. Explicit columns so schema additions do not
  silently widen network transfers and break client assumptions.
- Backups are tested with a measured restore. An untested backup is not a backup.

**SHOULD**

- Choose the appropriate normal form and denormalize only under a measured force.
  Premature denormalization creates update anomalies; late denormalization is a
  migration.
- Use the correct column type. Storing structured data in a string column, dates
  as integers, or booleans as strings creates bugs when the parsing fails.
- Set defaults, `NOT NULL`, and `CHECK` constraints at the schema level where
  they belong, not only in application code. The database outlives every version
  of the application.
- Document why each index exists — the query it serves or the constraint it
  enforces — so future changes do not blindly delete it.
- Measure RTO and RPO; do not assume. Backup frequency and restore duration
  determine the worst-case data loss and downtime.

---

## 13. API design standards

**MUST**

- Every endpoint has authentication and authorization. No implicit "this is
  internal so it's safe" — internal is a deployment detail, not a security
  control.
- Validate every input parameter: type, range, format, length. Fail loudly on
  invalid input rather than coercing silently.
- Return structured errors with a machine-readable code, a human message, and
  enough context to act. Generic "something went wrong" errors are not errors,
  they are silence with a 500 status.
- Version breaking changes. Endpoints are contracts; existing clients MUST
  continue working within a major version.
- Idempotent writes where the operation can be retried. PUT, PATCH, and DELETE
  are specified idempotent; POST is not but should be where clients cannot know
  whether their first call succeeded.
- Rate-limit where abuse, cost, or resource exhaustion are risks.
- Document every endpoint, parameter, response, and error in the API
  specification, per the [API Specification template](TEMPLATES.md#5-api-specification).

**SHOULD**

- Follow REST conventions where they fit; deviate deliberately and document the
  deviation. Consistency within the project beats consistency with an external
  style guide, but arbitrary differences are noise.
- Use the correct HTTP method: GET for reads with no side effects, POST for
  non-idempotent writes, PUT for full replace, PATCH for partial update, DELETE
  for removal. Status codes similarly: 2xx for success, 4xx for client error,
  5xx for server error.
- Paginate every collection. Use cursor-based pagination for consistency under
  concurrent modification; offset-limit is simpler but skips or duplicates rows
  when the underlying data changes mid-pagination.
- Support filtering, sorting, and field selection on collections. Clients should
  not fetch 100 fields to read three.
- Keep responses compact. Every unnecessary byte in a hot endpoint compounds
  across millions of calls.
- Make endpoints consistent: similar operations on different resources look
  similar, use the same parameter names, and have the same error structure.

---

## 14. Logging standards

**MUST**

- Every error is logged with enough context to diagnose it: what failed, why,
  and a correlation ID tracing the request end-to-end.
- Logs are structured, not prose. Key-value pairs can be queried; sentences
  cannot.
- No personal data, credentials, tokens, or secrets in logs. Mask or omit them.
- Set a log level and respect it: DEBUG for local tracing, INFO for normal
  operations, WARN for recoverable anomalies, ERROR for failures.
- Logs survive the process. Writing to stdout and letting the runtime or
  orchestration layer persist them is the simplest correct approach.

**SHOULD**

- Log the start and end of expensive or significant operations with their
  duration.
- Log at boundaries: when a request arrives, before calling an external
  dependency, after it returns.
- Include the actor, action, and target for security-relevant operations. This
  is auditing, not debugging.
- Use correlation IDs to trace a request across services, retries, and async
  work.
- Keep log volume proportional to value. High-frequency logs on the hot path
  cost money and hide signal in noise. Sample or aggregate where volume is high
  and the information is low.

---

## 15. Monitoring standards

**MUST**

- Every service exposes a health endpoint checked by the orchestration layer.
  The check is active, not just "the process is running" — query the database,
  confirm the dependency is reachable.
- Every service emits metrics: request rate, error rate, latency distribution,
  and saturation of the resources it depends on.
- Alerts fire on symptoms users feel, not causes engineers find interesting. An
  alert without a corresponding user-visible impact is noise.
- Every alert has a runbook in [PLAYBOOKS.md](PLAYBOOKS.md) or
  [templates/](templates/) saying what it means and what to do. An alert without
  a runbook is a question with no answer, sent at 3am.
- Define SLIs, SLOs, and an error budget per service. The SLO is the reliability
  target; the error budget is how much room there is before the target is
  breached. When the budget is exhausted, the priority is reliability, not
  features.

**SHOULD**

- Monitor the four golden signals: latency, traffic, errors, saturation. Most
  incidents show in one of these before they show anywhere else.
- Set thresholds from observed behaviour rather than guessing. A threshold
  pulled from intuition either fires constantly or never; one derived from
  historical percentiles adapts to reality.
- Alert on rate of change, not absolute values, where growth is the signal. A
  slow leak is invisible to an absolute threshold until it is a crisis.
- Build dashboards that answer the questions asked during incidents. If a
  question comes up twice, the answer belongs on a dashboard.
- Aggregate and sample metrics where volume is high and individual values are
  not diagnostic. Send percentiles, not every data point.

---

## 16. Observability standards

Observability is the ability to answer arbitrary questions about a running
system from its telemetry alone — not a specific question you anticipated, but
the one you did not. Logs, metrics, and traces together make a system
observable; one alone does not.

**MUST**

- Use distributed tracing to follow a request across service boundaries, retries,
  and queues. Every component propagates the trace context; every external call
  is a span.
- Correlation IDs tie logs, traces, and metrics for a single request. Generate
  one at the entry boundary and thread it through every layer, log line, and
  trace.
- Emit structured events at every state transition, decision point, and boundary
  crossing. This is what makes the system's behaviour reconstructable from
  telemetry.
- Make telemetry durable and queryable. Local logs on an instance that crashed
  are not telemetry — they are evidence that sank with the ship.

**SHOULD**

- Emit telemetry as early in the request as possible and as late as possible,
  bracketing the work.
- Record both the inputs and the outcome of expensive or fallible operations:
  enough to reproduce the operation or understand why it failed.
- Use sampling where volume makes storing every trace infeasible, but never
  sample errors. Every failure trace is diagnostic.
- Trace the slow path and the fast path with equal fidelity. Incidents are
  usually changes in distribution, not new errors — the p99 climbing silently
  before the p50 notices.

---

## 17. Accessibility standards

Accessibility is not an afterthought or a checklist. Systems are accessible when
they are designed to be, from the start. Retrofitting accessibility is slower,
more expensive, and less complete than building it in.

Target **WCAG 2.2 Level AA** as the baseline. See the
[Accessibility checklist](CHECKLISTS.md#14-accessibility-checklist) for the full
pass.

**MUST**

- Every function is operable with a keyboard alone, in a logical order, with
  visible focus. No keyboard traps.
- All non-decorative images, icons, and controls have text alternatives.
- Colour is never the sole carrier of meaning. Use shape, label, or pattern
  alongside colour.
- Contrast ratios meet **4.5:1 for normal text, 3:1 for large text and UI
  components**, measured against the background.
- Forms associate labels with inputs, errors with the fields that caused them,
  and required fields are marked explicitly.
- Dynamic content changes are announced to assistive technology. Use ARIA live
  regions; do not rely on visual updates alone.
- The page has a logical heading structure, and landmarks identify regions.
- Media has captions and transcripts.
- Users can pause, stop, or hide any auto-playing or auto-updating content.

**SHOULD**

- Design and build with accessibility from the start. Using semantic HTML, ARIA
  correctly, and testing with assistive technology as you go is faster than
  retrofitting.
- Test with a keyboard, a screen reader, and magnification. Automated tools
  catch maybe 30% of issues; the rest require a human.
- Respect user preferences: `prefers-reduced-motion`, `prefers-color-scheme`,
  zoom.
- Touch targets are at least 44×44 CSS pixels, with adequate spacing.
- Avoid relying on hover-only interactions — they are unusable on touch and
  inaccessible to keyboard users.
- Write meaningful link and button text. "Click here" and "Read more" are not
  meaningful.

---

## 18. UX standards

**MUST**

- Every interface state is designed and implemented: loading, empty, partial
  data, error, and success. An interface that shows only the happy path is
  unfinished.
- Errors are actionable and written in the user's language, not the system's.
  "Validation failed on field X" is not actionable; "Email address is missing"
  is.
- Forms validate on submission and inline where clarifying, show errors beside
  the field that caused them, and focus the first error.
- Actions are labelled with what they do, not how. "Save changes" beats "Submit".
- Destructive actions — deletion, data loss — have a confirmation step and
  describe what is about to be lost. An undo where possible is better than a
  confirmation.
- The interface is responsive at the supported viewport sizes, not just on the
  developer's preferred screen.
- The interface works at 200% zoom without horizontal scroll or clipped content.

**SHOULD**

- Make the right thing the easy thing. Default selections, smart ordering, and
  progressive disclosure reduce the decisions a user must make and the errors
  they can make.
- Show progress on long operations; show feedback on immediate ones.
- Let the user correct errors without restarting. Losing ten fields of data
  because one was wrong is hostile design.
- Empty states guide the user toward their first action. An empty list with no
  prompt is abandonment by indifference.
- Keep navigation consistent and predictable. If "Back" moves forward or a menu
  changes location, the user is lost.
- Design for interruption. Users do not finish tasks in one sitting; your
  interface should let them pick up where they left off.

---

## 19. AI systems standards

**MUST**

- Every AI feature has an evaluation suite with a measured baseline and a stated
  quality bar, per the [AI Development workflow](WORKFLOW.md#7-ai-development-workflow).
- Model outputs are treated as untrusted input: validated, constrained, and
  sanitized before being used, rendered, or written. **Never execute model output
  directly.**
- Retrieved content, user content, and any text in the context window is treated
  as data, never as instructions. This is the prompt-injection boundary; state
  explicitly where it is and enforce it.
- Cost is bounded per request and per user. Unbounded loops, unlimited retries,
  and uncapped token budgets MUST NOT ship.
- Latency is bounded. Every model call has a timeout; every agent loop has a
  maximum iteration count.
- Every prompt is versioned and stored in [prompts/](prompts/). Prompts are
  code; they are reviewed, tested, and evaluated on change.
- Every tool exposed to a model is narrow, validated, idempotent where retried,
  and least-privileged. Assess the blast radius of every tool before exposing
  it: assume the model calls it with adversarial inputs.
- Failure modes and fallback behaviour are designed and implemented. The model
  may be unavailable, slow, refusing, or wrong — all four happen, and behaviour
  under each is part of the design.
- Personal data is not sent to model providers without an explicit, documented
  decision. Logs, prompts, retrieved content, and model outputs all count.

**SHOULD**

- Start with the smallest, cheapest model that could work. Move to a larger,
  more expensive model only when evaluation proves the smaller one insufficient.
- Use a baseline: a heuristic, a rule, or a simple prompt with a small model.
  The baseline tells you whether sophistication is earning its cost.
- Provide citations and sources alongside model-generated content. Users should
  be able to verify claims and distinguish model output from fact.
- Evaluation is continuous. Drift, regression, and unexpected prompts happen in
  production; detect them with ongoing evaluation, not by waiting for support
  contacts.
- Cost is instrumented and monitored per feature and per user. What is not
  measured cannot be controlled, and AI cost can grow unboundedly if left
  unwatched.
- Model selection is justified in an ADR. Explain why this model, at this cost,
  with this latency, rather than a smaller or free alternative.

---

## 20. Cloud standards

**MUST**

- Every resource is managed as code. No console clicking; no manual edits.
- Every identity is least-privileged. A role gets the narrowest permissions that
  work, scoped to specific resources. Broad wildcard permissions MUST NOT ship.
- Critical components are multi-zone. A single-zone deployment of anything users
  depend on is an availability incident waiting for a data-centre event.
- Secrets are stored in a secret manager, injected at runtime, and rotatable.
  Secrets in environment variables are better than secrets in code, but neither
  is acceptable where a secret manager is available.
- Encryption at rest and in transit is the default. Data is encrypted where it
  sits and when it moves, unless a documented decision says otherwise.
- Quotas and limits are known before they are hit. Hitting a quota without
  warning is an outage.

**SHOULD**

- Right-size resources continuously. The cheapest cloud bill is the one for
  resources you are actually using.
- Use managed services for undifferentiated work: databases, queues, caches,
  logs. Operating these yourself is a cost in engineering time, oncall, and
  incidents — pay it only when it buys something the managed service cannot
  provide.
- Automate scaling: horizontal where possible, vertical where it is not. Manual
  scaling is reacting to an alert at 3am.
- Tag resources for cost attribution. Aggregate spend is a number; attributed
  spend is a decision input.
- Monitor spend against budget and alert before breaching. A surprise cloud bill
  is a failure of instrumentation.

---

## 21. Infrastructure standards

**MUST**

- Infrastructure is defined as code and lives in version control. The
  infrastructure repo is the source of truth; the deployed state is a cache.
- Environments are reproducible. Spin up a new staging environment from code
  without a runbook.
- Secrets are never committed. Use a secret manager and inject at runtime.
- Changes are reviewed and tested like application code. Infrastructure outages
  are as serious as application outages and more common than anyone admits.
- Disaster recovery is tested. Run a DR drill; do not assume the procedure
  works. Measure actual RTO and RPO, not theoretical.

**SHOULD**

- Keep staging and production configurations identical except for scale and
  backend pointers. Differences between environments are bugs waiting to
  surprise you in production.
- Parameterize where environments vary; do not duplicate.
- Prevent configuration drift with automation. Drift is invisible until it
  causes an outage.
- Use immutable infrastructure where practical: deploy new instances rather than
  mutating running ones. Mutation leaves systems in states you did not test.

---

## 22. Deployment standards

**MUST**

- Deployment is automated through CI/CD. Manual steps in deployment are steps
  that will be forgotten, inverted, or skipped under pressure.
- Every gate in the [Deployment workflow](WORKFLOW.md#10-deployment-workflow)
  runs and passes: tests, linters, security scans, required approvals.
- Rollback is a single tested action. Tested means you have run it, not that
  you have written the script.
- Deployments are traceable: every release records what deployed, when, by whom,
  and to which commit.
- Migrations are ordered correctly: schema changes deploy before the code that
  needs them and are backward-compatible with the currently-running version for
  the entire rollout window.
- Canary or staged rollouts where the platform allows. Deploy to a subset, verify,
  then proceed.

**SHOULD**

- Deploy frequently. Small, frequent changes are easier to review, test, and
  roll back than large, infrequent ones.
- Decouple deployment from release with feature flags. Deploy continuously,
  release deliberately.
- Monitor actively during and after deployment. Pre-define the success signals;
  do not rely on "it looks fine".
- Keep the deployment window during hours when the team is available. Deploying
  Friday afternoon or late at night trades convenience for risk.

---

## 23. Scalability standards

**MUST**

- No unbounded resource consumption: memory, disk, connections, queue depth,
  result sets, retries, iterations.
- Every collection API is paginated.
- Every resource that grows with usage has a cleanup or retention policy.
- Scaling constraints are documented: what breaks first, at what multiple of
  current load, and what the next bottleneck is after fixing that.
- State is minimal and externalized. Stateless services scale horizontally;
  stateful ones scale by crying.

**SHOULD**

- Horizontal scaling over vertical where possible. Adding identical instances is
  simpler and cheaper than finding ever-larger machines.
- Test at 2× expected peak before calling it done. The nonlinear behaviour
  appears past the load you tested at.
- Use caching, queues, and async processing to decouple spikes from steady-state
  capacity.
- Shard where a single instance of a resource cannot scale further: databases,
  caches, queues. Sharding is invasive; do it when measured load demands it, not
  before.

---

## 24. Maintainability standards

**MUST**

- Every significant decision is documented in an ADR in
  [DECISIONS.md](DECISIONS.md). Future engineers should not have to reconstruct
  your reasoning from commit messages and Slack.
- Every component has a stated owner — a person or team responsible for its
  operation, not just its development. Orphaned code is code that will cause an
  incident with nobody able to fix it.
- Code is understandable by someone who was not there when it was written.
  Clarity beats cleverness.
- Dependencies are pinned, scanned, and updated on a schedule. Unmaintained
  dependencies are future CVEs.

**SHOULD**

- Keep modules loosely coupled. Changes should be local: touching six files to
  add a field is a signal the boundaries are wrong.
- Delete unused code immediately. Commented-out code, unreachable branches, and
  feature-flag branches for flags removed six months ago are weight. Carrying
  weight costs velocity.
- Refactor continuously and incrementally, not in one large heroic effort. Small
  improvements compound; large rewrites never finish.
- Leave every file cleaner than you found it. The Boy Scout Rule, applied
  consistently, prevents decay.

---

## 25. Configuration standards

**MUST**

- Configuration that changes behaviour is explicit and visible in the code or a
  named file, not hidden in environment variables or remote systems.
- Secrets are never configuration. They live in a secret manager.
- Defaults are safe. A service started with no configuration overrides should be
  inert or minimal-capability, not full-privilege.
- Changes to production configuration are reviewed and logged.

**SHOULD**

- Prefer convention over configuration. Reasonable defaults and standard
  locations reduce the knobs a deployer must set.
- Validate configuration at startup and fail fast if it is invalid. A service
  that starts with bad config and fails later wastes deploy cycles and incident
  time.
- Keep configuration minimal. Every knob is a decision a deployer must
  understand and an interaction with every other knob. Most configuration grows
  until it is unmaintainable; prune aggressively.
- Document every option: what it does, its type, valid range, and default.
