# KNOWLEDGE.md — Engineering Knowledge Base

This is the shared vocabulary. Patterns, principles, and laws that let an agent
and a human describe a design in five words instead of five paragraphs.

The single most important thing in this document is **when each item is wrong.**
A pattern applied without its motivating force is not neutral — it is worse than
ignorance, because it looks like expertise. An engineer who has never heard of
the Repository pattern writes a query in a service and moves on; an engineer who
cargo-cults it writes four files, an interface with one implementation, and a
leaky abstraction that hides the query plan from everyone who follows. The second
engineer did more damage and will be harder to correct, because they can name
what they did.

Every entry below therefore has the same shape: what it is, when to use it, **when
NOT to use it and how it is typically misapplied**, and a concrete illustration.
The "when NOT" is the load-bearing part. If you find yourself skimming past it,
you are the reader this document was written for.

**The citation rule.** An agent MUST NOT cite a pattern, principle, or law as
justification for a design decision without naming the specific force in *this*
system that motivates it. "We should use CQRS" is not an argument. "Reads are 200×
writes, the read shapes are five denormalized views, and the write model is a
single aggregate — so CQRS" is an argument. If you cannot name the force, you have
found a preference, not a reason, and it belongs in the
[decision framework](SYSTEM.md#7-decision-framework) as one option among three,
not in the design as a foregone conclusion.

This document is descriptive, not prescriptive. It tells you what things *are*.
[STANDARDS.md](STANDARDS.md) tells you what you MUST *do*.
[SYSTEM.md](SYSTEM.md) tells you how to think and decide.
[DECISIONS.md](DECISIONS.md) records what this project already chose — a prior
ADR outranks anything here. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) outranks
everything on facts about this codebase. Terms are defined in
[GLOSSARY.md](GLOSSARY.md).

Keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are used per RFC 2119.

Contents:

1. [Engineering principles](#1-engineering-principles)
2. [Design patterns](#2-design-patterns)
3. [Architectural patterns](#3-architectural-patterns)
4. [Domain-Driven Design](#4-domain-driven-design)
5. [Distributed systems](#5-distributed-systems)
6. [Twelve-Factor App](#6-twelve-factor-app)
7. [OWASP Top 10](#owasp-top-10)
8. [Testing knowledge](#8-testing-knowledge)
9. [Performance knowledge](#9-performance-knowledge)
10. [Data knowledge](#10-data-knowledge)
11. [AI engineering best practices](#11-ai-engineering-best-practices)
12. [How to use this knowledge](#12-how-to-use-this-knowledge)

---

## 1. Engineering principles

Principles are heuristics with a domain of validity. Each one below is true inside
its domain and actively harmful outside it. The failure mode is always the same:
applying a principle past the point where its motivating force exists.

### SOLID

Five principles about managing change in object-oriented designs. They were
written for large statically-typed class hierarchies and they earn their keep
there. In a small module of pure functions, four of the five degrade into
ceremony. Read them as answers to "what makes this expensive to change?", not as
a checklist.

**Single Responsibility Principle (SRP).** A module should have one reason to
change — one *actor* whose requirements drive its evolution. The common phrasing
"do one thing" is a mistranslation that has caused more damage than the original
solved, because "one thing" has no natural scale. The real test is: if the
compliance team and the billing team both file changes against this file, it has
two responsibilities.

- *Use when* — a class is edited by unrelated feature streams for unrelated
  reasons, or a change for one stakeholder keeps breaking another's tests.
- *Not when / misapplied* — as a licence to split every class until each has one
  method. This produces the `UserNameValidator`, `UserEmailValidator`,
  `UserAgeValidator` triple where a single `validateUser` was clearer. Cohesion is
  the other half of the principle and it is silently dropped in most citations.
  Splitting things that always change together *increases* the cost of change.
- *In practice* — an `Invoice` class that both computes tax and renders PDF
  layout has two actors (finance, design) and two rates of change; splitting it
  pays. An `Invoice` class with `total()`, `subtotal()`, and `taxAmount()` has one
  actor and splitting it is vandalism.

**Open/Closed Principle (OCP).** You should be able to add new behaviour by
adding code rather than editing existing, tested code. Practically this means
extension points where variation is *known* to occur — a plugin registry, a
strategy interface, a discriminated union with exhaustive matching.

- *Use when* — the axis of variation is proven: you already have three payment
  providers, or a new one arrives every quarter.
- *Not when / misapplied* — building extension points for variation that has never
  occurred. This is the single most common source of speculative abstraction in
  codebases. Note also the honest counterpoint: with good tests and version
  control, *editing* a switch statement is cheap and often clearer than a
  registry of six polymorphic classes scattered across six files. Closed-for-
  modification is a benefit, not an axiom.
- *In practice* — adding `ApplePayProvider` alongside four existing providers
  should touch one new file plus one registration line. Adding the *first*
  provider should not invent the interface — see the [Rule of Three](#rule-of-three).

**Liskov Substitution Principle (LSP).** A subtype must be usable anywhere its
supertype is expected, without the caller knowing. This is a constraint on
*behaviour and contracts*, not on method signatures: preconditions may not be
strengthened, postconditions may not be weakened, invariants must hold, and new
exceptions may not be thrown. A compiler can check the signature; only you can
check the contract.

- *Use when* — designing any inheritance hierarchy or interface implementation,
  which in practice means: check it every time.
- *Not when / misapplied* — the violation is almost never noticed until runtime.
  The canonical cases: `Square extends Rectangle` (setting width mutates height,
  breaking every caller's assumption), a `ReadOnlyList` implementing `List` by
  throwing on `add`, or an HTTP-backed repository that throws `TimeoutException`
  where the in-memory one never could. Each compiles. Each breaks callers.
- *In practice* — if a caller needs `if (x instanceof Y)` to use your subtype
  correctly, LSP is already broken and the hierarchy is wrong. Prefer composition.

**Interface Segregation Principle (ISP).** Clients should not be forced to depend
on methods they do not use. Fat interfaces couple every implementer to every
client's needs, and force test doubles to stub twenty methods to exercise one.

- *Use when* — implementers are stubbing methods with `throw new
  NotImplementedError()`, or a change for one client forces recompilation and
  retesting of unrelated implementers.
- *Not when / misapplied* — shattering a coherent interface into single-method
  fragments so that a simple collaborator now requires six constructor
  parameters. Interfaces should be segregated *by client need*, not by method
  count. A `Repository` with `findById`, `save`, and `delete` used together by
  every caller is one interface, not three.
- *In practice* — an `IUserService` with 40 methods, where the notification module
  needs exactly `getEmail`, should yield a narrow `EmailLookup` interface owned by
  the notification module — the consumer defines the interface it needs.

**Dependency Inversion Principle (DIP).** High-level policy should not depend on
low-level detail; both should depend on an abstraction owned by the *policy* side.
This is what makes business logic testable without a database and survivable
across vendor changes. It is the principle behind
[dependencies pointing inward](SYSTEM.md#6-architecture-principles).

- *Use when* — the dependency is slow, external, stateful, non-deterministic, or
  plausibly replaceable: databases, HTTP clients, clocks, filesystems, queues,
  model providers, payment gateways.
- *Not when / misapplied* — inverting dependencies on things that will never
  change and are not I/O. An interface in front of a pure string formatter, a
  value object, or the standard library is pure cost. The other classic
  misapplication is putting the interface in the *infrastructure* package — if the
  abstraction is owned by the detail, nothing was inverted, you just added a file.
- *In practice* — `OrderService` depends on a `PaymentGateway` interface defined
  next to `OrderService`; the Stripe implementation lives at the edge and is wired
  in at composition root. Tests use a fake. Nothing in the domain imports `stripe`.

### KISS — Keep It Simple

Prefer the least complex solution that fully meets the stated requirements.
Complexity is not measured in lines of code but in the number of things a reader
must hold in their head simultaneously: indirections, states, invariants,
concurrency interactions, configuration permutations.

- *Use when* — always, as a tie-breaker, and especially when you feel clever.
- *Not when / misapplied* — as an excuse to skip necessary complexity. Some
  problems are irreducibly hard: distributed consensus, concurrent state, security.
  "Simple" applied to those means *no accidental* complexity on top of the
  essential complexity, not a naive implementation that is simple and wrong. KISS
  also gets misused to justify a single 900-line function ("no abstractions, very
  simple") — that is simple to write and expensive to read, and reading is what
  dominates.
- *In practice* — three lines of duplicated validation beat a configurable
  validation DSL. But a hand-rolled JWT verifier is not "simpler" than a library;
  it is smaller and more dangerous.

### DRY — Don't Repeat Yourself

Every piece of *knowledge* should have one authoritative representation. The
original formulation was about knowledge — business rules, formats, protocols —
not about text. Two code fragments that look identical but encode different rules
are not duplication, and merging them is a bug waiting for the day the rules
diverge.

- *Use when* — the same *decision* is encoded in two places, such that changing
  the business rule requires finding both. Tax rates, validation rules, permission
  logic, wire formats, magic constants.
- *Not when / misapplied* — **duplication is cheaper than the wrong abstraction.**
  This is the single most important counterpoint in this document. When you merge
  two things that are only coincidentally similar, you create an abstraction with
  a boolean flag, then two flags, then a mode enum, then a function whose body is
  entirely `if` statements about its callers. Removing that abstraction later
  requires understanding all its callers at once — far harder than editing two
  copies. If the shared code needs to know *who is calling it*, the abstraction is
  wrong. Delete it and duplicate.
- *In practice* — the `formatAddress` used by shipping labels and by invoice
  headers should stay duplicated: they will diverge when the postal vendor changes
  requirements. The VAT rate must not be duplicated: it is one fact about the
  world. Tests are the standard exception — readable duplication in tests beats a
  clever helper that obscures what is being asserted.

### YAGNI — You Aren't Gonna Need It

Do not build for requirements nobody has stated. Speculative features cost
implementation time once, and cost comprehension, testing, and maintenance forever
— including for the majority of them that are never used or are needed in a
shape you did not predict.

- *Use when* — considering a config option, extension point, generic parameter, or
  abstraction layer that has no current consumer.
- *Not when / misapplied* — YAGNI does not apply to things that are
  disproportionately expensive to retrofit. Security controls, audit logging,
  observability hooks, data schema versioning, idempotency keys, and pagination on
  a list endpoint are all "not needed yet" and all catastrophic to add after the
  fact under load or after a public API is published. The distinguishing test is
  **cost of deferral**: if adding it later is a config change, defer; if adding it
  later is a migration or a breaking API change, build it now. YAGNI is also
  misused to justify skipping tests, which is a different thing entirely.
- *In practice* — do not build multi-tenancy for one tenant. Do add a tenant-
  scoped foreign key if multi-tenancy is on the roadmap, because backfilling
  tenancy across every table later is a quarter of work.

### Separation of Concerns

Different kinds of decisions belong in different places: transport separate from
business logic, business logic separate from persistence, policy separate from
mechanism. The payoff is that each concern can be understood, tested, and changed
without loading the others into your head.

- *Use when* — a change to one concern forces you to read or edit another. HTTP
  status codes appearing inside a pricing calculation is the smell.
- *Not when / misapplied* — separating concerns that are genuinely one concern, or
  separating them along the wrong axis. A "layer" that only forwards calls — a
  controller that calls a service that calls a repository, each adding nothing —
  is three files where one would do; [every layer must pay
  rent](SYSTEM.md#6-architecture-principles). Also beware separating by *technical
  kind* (`controllers/`, `services/`, `models/`) when the actual axis of change is
  by feature; that layout forces every feature to touch every directory.
- *In practice* — validation of *format* belongs at the transport edge; validation
  of *business invariants* belongs in the domain. Both are "validation"; they are
  different concerns with different lifetimes.

### Principle of Least Astonishment

A component should behave the way a competent reader of its name and signature
expects. Surprise is a defect even when the behaviour is documented, because
readers act on expectation and only consult documentation when already suspicious.

- *Use when* — naming anything, choosing defaults, deciding whether a method
  mutates, deciding what to return on absence, and designing error behaviour.
- *Not when / misapplied* — "least astonishing" is relative to an audience, so it
  is sometimes used to defend familiar-but-bad conventions. If your entire team
  expects `save()` to silently swallow errors because your legacy code does, the
  fix is the convention, not new code that matches it. Consistency with a bad
  pattern is still worth naming explicitly and fixing deliberately, not compounding.
- *In practice* — a `getUser()` that lazily creates a user, a `validate()` that
  writes to the database, or a `toString()` that makes a network call are all
  correctness hazards regardless of their docstrings. `getUser` returning `null`
  for a missing user versus throwing is a real choice; the sin is doing both in
  different modules of the same codebase.

### Law of Demeter — principle of least knowledge

A method should talk only to its immediate collaborators: its own fields, its
parameters, and objects it creates. Long chains like
`order.getCustomer().getAddress().getCountry().getTaxRate()` couple the caller to
four classes' internal structure, so any of the four can break it.

- *Use when* — you find yourself navigating more than one dot into another
  object's graph, particularly across a module boundary.
- *Not when / misapplied* — mechanically obeying it produces a plague of delegating
  wrapper methods: `order.getCustomerAddressCountryTaxRate()` on every class in the
  chain. That is worse — it makes `Order` know about tax. It also does not apply to
  fluent builders, LINQ/stream pipelines, or data-transfer objects, where chaining
  is the point and there is no behaviour to encapsulate. The law is about
  *behaviour-bearing objects*, not about counting dots.
- *In practice* — the right fix for the tax chain is usually `order.taxRate()`
  computed by asking a `TaxPolicy` collaborator, or `Tell, Don't Ask`: instead of
  fetching data to decide, tell the object to do the thing.

### Composition over inheritance

Prefer assembling behaviour from independent parts over deriving it from a base
class. Inheritance couples subclasses to a superclass's implementation forever,
in a relationship that cannot be changed at runtime and cannot be varied along
two axes without a combinatorial explosion of classes.

- *Use when* — sharing behaviour, which is nearly always. Delegate to a
  collaborator, accept a function, or use an interface plus a small adapter.
- *Not when / misapplied* — inheritance is genuinely correct for true
  is-a-substitutable-for relationships with a stable contract: framework-mandated
  base classes, sealed algebraic hierarchies (`Shape` = `Circle | Square`),
  exception taxonomies. And composition has its own overshoot: wiring twelve
  micro-collaborators through constructor injection to express what one 20-line
  class did is not an improvement. Composition also does not save you from bad
  boundaries; it just makes them cheaper to move.
- *In practice* — the classic failure is a deep hierarchy where behaviour must vary
  by two dimensions: `PdfEmailReport`, `PdfSmsReport`, `CsvEmailReport`,
  `CsvSmsReport`. Composition collapses that to `Report(formatter, transport)` —
  two lists instead of a product.

### Fail Fast

Detect invalid state at the earliest point it is detectable and stop loudly.
Errors are cheapest to diagnose closest to their cause; a bad value that is
tolerated at the boundary surfaces five layers later as an inexplicable null, or
worse, as silently wrong output.

- *Use when* — validating input at trust boundaries, checking preconditions and
  invariants, handling configuration at startup (a missing env var should kill the
  process at boot, not at 3am on the one code path that reads it).
- *Not when / misapplied* — failing fast at the wrong *scope*. A single malformed
  record in a 10-million-row batch should be quarantined and reported, not abort the
  job. A transient downstream timeout should be retried, not propagated as a 500. A
  user-facing form should collect all validation errors, not reject on the first.
  Fail fast is about *internal* invariant violations and programmer errors, not
  about being brittle in the face of expected real-world messiness. It is also not
  a licence to litter defensive assertions on every internal function — validate at
  the boundary, then trust your own types.
- *In practice* — parse and validate the request into a domain type at the edge, so
  the core cannot represent an invalid state. This is "parse, don't validate":
  after the boundary, illegal values are unrepresentable rather than merely absent.

### Make It Work, Make It Right, Make It Fast

Three phases, strictly in that order. Get correct behaviour first, then clean the
design while the behaviour is protected by tests, then optimize only what
measurement shows is slow.

- *Use when* — always, as the default sequencing for any non-trivial change. The
  order matters because each phase's output is the next phase's safety net: you
  cannot safely refactor untested code, and you cannot meaningfully optimize code
  whose structure is still in flux.
- *Not when / misapplied* — two failures, symmetric. First, stopping after "make it
  work" and calling it done — the phases are not optional, and skipped phase two
  is how prototypes become production systems nobody can change. Second, using it
  to defer *architectural* performance decisions that cannot be retrofitted: choice
  of data store, whether the API is chatty or batched, whether the hot path crosses
  a network. "Make it fast later" works for constant factors, not for asymptotics or
  topology. If a design requires an N+1 across a network per request, no amount of
  later optimization saves it.
- *In practice* — write the straightforward loop, get the tests green, extract the
  clear names, then profile. If the profile says it is fine, you are done and the
  clever version was never needed.

### Boy Scout Rule

Leave the code slightly better than you found it: fix the misleading name, add the
missing test, delete the dead branch you had to read anyway.

- *Use when* — the improvement is in code you already had to understand for the
  task, is small, and is verifiable by existing tests.
- *Not when / misapplied* — as licence for unrelated refactoring inside a feature
  PR. A diff where 40 lines are the fix and 400 are "cleanup" is unreviewable, and
  it makes bisecting a future regression miserable. It also violates
  [scope discipline](SYSTEM.md#9-continuous-improvement): improvements outside the
  task go to `memory/future-ideas.md` or a separate commit, not into the change
  under review. And never "improve" code you do not understand — that is not
  tidying, it is [Chesterton's Fence](#chestertons-fence).
- *In practice* — renaming `d` to `elapsedDays` in the function you are fixing: yes.
  Reformatting the file, reordering its methods, and switching its error handling
  style: separate commit, or not at all.

### Chesterton's Fence

Before removing something you do not understand, find out why it is there. Odd
code, redundant checks, and strange sleeps usually encode a lesson someone learned
painfully — often from an incident.

- *Use when* — deleting seemingly dead code, removing a defensive check, dropping a
  retry, simplifying a workaround, or "cleaning up" a comment that says
  `// do not remove`. Check git blame, the linked issue, and the tests first.
- *Not when / misapplied* — as a blanket argument for never deleting anything. That
  turns every codebase into a museum of fears. If you have investigated — blame,
  history, tests, and the person who wrote it if reachable — and found no reason,
  delete it and say in the commit message what you checked. The fence stays up only
  while the investigation is incomplete. Unbounded reverence for existing code is
  its own failure mode.
- *In practice* — a `sleep(200)` before a read is almost always papering over a race
  condition. Deleting it "because sleeps are bad" reintroduces the race. Diagnosing
  the race and replacing the sleep with a proper wait removes the fence *and* the
  reason it was built.

### Conway's Law

An organization designs systems that mirror its own communication structure. This
is an empirical observation, not advice — if three teams build a compiler, you get
a three-pass compiler. Its corollary, the "inverse Conway manoeuvre", is to
deliberately shape teams to get the architecture you want.

- *Use when* — explaining why module boundaries keep drifting toward team
  boundaries, or when deciding service boundaries: a boundary that cuts across a
  single team's daily work will erode, and a boundary between two teams that must
  coordinate on every release is not a real boundary.
- *Not when / misapplied* — as justification for microservices in a ten-person
  company ("Conway's Law says services follow teams"). With one team, Conway's Law
  argues for *one deployable*. It is also misused to excuse bad architecture as
  inevitable; the law describes a force, not a fate, and naming the force is the
  first step to resisting it.
- *In practice* — if the frontend team must file a ticket with the backend team for
  every field they need, you will get a BFF whether you planned one or not. Better
  to plan it.

### Postel's Law — robustness principle

"Be conservative in what you send, be liberal in what you accept." It let the
early internet interoperate across implementations of wildly varying quality.

- *Use when* — consuming a protocol or format you do not control and cannot fix,
  and ignoring unknown fields for forward compatibility (which remains genuinely
  good practice — additive schema evolution depends on it).
- *Not when / misapplied* — **for new protocols this is now considered harmful, and
  you SHOULD NOT design to it.** Liberal acceptance means every implementation's
  accidental tolerances become de facto protocol (see
  [Hyrum's Law](#hyrums-law--the-law-of-implicit-interfaces)), the real grammar diverges from the spec, and
  differing interpretations between two lenient parsers become security
  vulnerabilities. Request smuggling, XML entity attacks, and countless
  content-type confusion bugs are Postel's Law's descendants. The modern guidance
  (RFC 9413, and hard experience from HTML, HTTP, and TLS) is: be conservative in
  what you send, and be *strict and explicit* in what you accept — reject
  malformed input loudly and early, while remaining tolerant only along
  deliberately specified extension points.
- *In practice* — accept unknown JSON fields, ignore them, and document that you
  do. Do not accept three date formats, coerce `"true"`, `1`, and `"yes"` to
  boolean, or guess at a missing content type.

### Hyrum's Law — the law of implicit interfaces

With a sufficient number of users, every observable behaviour of your system will
be depended upon by somebody, regardless of your documented contract. Iteration
order, timing, error message text, field ordering in JSON, incidental performance
characteristics — all of it becomes interface.

- *Use when* — assessing the blast radius of a change to anything with external
  users, deciding what to expose, and designing deprecation. It is the strongest
  available argument for making internals genuinely inaccessible and for
  deliberately randomizing non-guaranteed behaviour.
- *Not when / misapplied* — as an argument that you can never change anything. That
  ossifies the system. The correct response is threefold: minimize observable
  surface, break incidental behaviour *early and loudly* while you have few users,
  and version your contracts. Also, "we can't change it, Hyrum's Law" is often
  cover for not having measured who actually depends on it — instrument first.
- *In practice* — Go randomizes map iteration order precisely to prevent this
  dependency from forming. If your API returns results in insertion order without
  promising to, someone's pagination now depends on it and your switch to a hash
  index is a breaking change.

### Gall's Law

A complex system that works is invariably found to have evolved from a simple
system that worked. A complex system designed from scratch never works and cannot
be patched up to make it work — you must start over with a working simple system.

- *Use when* — planning something ambitious. It is an argument for iterative
  delivery, for boring proven components, and for always having a working system
  at every stage rather than a partially-completed grand design.
- *Not when / misapplied* — as an excuse to never design or plan anything. Gall's
  Law says "grow it incrementally from working states"; it does not say "start
  writing code with no idea where you are going." Evolutionary design still has
  design. It is also not a law of nature — it is a heuristic about human ability
  to predict interactions in complicated systems. Trivially simple domains do not
  need it.
- *In practice* — launching a marketplace with manual matching for the first ten
  customers is Gall's Law. Building the ML recommendation engine, the dispute
  resolution workflow, and the reputation system before you have one transaction
  is how you violate it.

### Brooks's Law

Adding manpower to a late software project makes it later. The new members need
training, increase communication overhead quadratically, and partition work in
ways that create integration cost. The underlying lesson is that people are not
fungible and coordination is not free.

- *Use when* — resisting pressure to "add engineers to recover the schedule." On a
  project that is already behind, the only staffing actions that help are either
  removing scope or assigning isolated, non-critical work to newcomers so existing
  members stay focused.
- *Not when / misapplied* — Brooks's Law applies to late projects with integration
  dependencies. It does not apply to embarrassingly parallel work: ten engineers
  can build ten independent microservices faster than one engineer can, provided
  each service genuinely has no shared state or coordination. It also does not
  apply early in a project when there is time for onboarding to pay off. And it is
  not a law that hiring is always bad — it says "rescue hiring into a late project
  is counterproductive", not "teams should never grow."
- *In practice* — doubling the team in month eleven of a twelve-month project to
  "catch up" will push delivery to month fifteen. Hiring three months in, when
  there is runway to onboard, can work.

### Goodhart's Law

When a measure becomes a target, it ceases to be a good measure. People will
optimize for the metric in ways that degrade the thing the metric was meant to
proxy, because the metric is never a perfect representation of the goal.

- *Use when* — setting KPIs, designing incentives, choosing what to monitor, and
  interpreting metrics. Always ask "how would I game this if I wanted the number
  but not the outcome?"
- *Not when / misapplied* — as a reason to never measure anything. That is worse.
  The fix is not "no metrics" but "multiple orthogonal metrics" and "retain
  judgment." Also note that Goodhart's Law applies to *targets* — measuring
  something without tying it to rewards or punishment can remain informative.
- *In practice* — lines of code, test count, and ticket velocity all degrade when
  targeted: you get verbose code, trivial tests, and sliced tickets. Measure them
  to notice anomalies; do not reward them. User signups optimized without tracking
  retention yields bot accounts. Uptime measured without tracking request success
  rate yields servers that return 200 for every error.

### Rule of Three

Do not abstract until you have three concrete instances. One instance is
singular, two could still be coincidence, three reveals the real pattern. This is
"wait for the abstraction to declare itself" made operational.

- *Use when* — deciding whether to extract shared code, build a plugin system, or
  generalize an interface. It is a deliberate bias toward duplication early.
- *Not when / misapplied* — mechanically. The rule is about *examples of variation
  along the same axis*, not about arbitrary repetition. If you have written the
  same null check three times in one function, extract it now; that is local
  duplication, not a case demanding three implementations. Also, the rule does not
  apply when the abstraction is given to you — a framework mandates an interface,
  a protocol defines an extension point, or a standard library provides the
  combinator.
- *In practice* — wait until you have `PdfReport`, `CsvReport`, and `JsonReport`
  before you build the `Formatter` interface, because you do not yet know whether
  the real variation is in the format string, the serialization, or the full
  layout. Two is not enough: you will abstract the wrong thing and the third will
  not fit.

---

## 2. Design patterns

Patterns are names for structures that recur. They are vocabulary, not goals. Most
of the original Gang of Four patterns are workarounds for the absence of
first-class functions or for rigid type systems; in modern languages with closures
and flexible dispatch, many collapse into five lines. A pattern is worth learning
when it clarifies communication ("this is the Strategy pattern") and when applying
it makes the code *simpler*, not just more recognized. If invoking the pattern
adds files, indirections, or ceremony without reducing complexity, you have
cargo-culted it.

### Strategy

Encapsulate interchangeable algorithms behind a common interface so the caller
selects behaviour at runtime. The caller knows what it wants done; the strategy
knows how.

- *Use when* — there are genuinely multiple algorithms for the same job selected by
  configuration, tenant, experiment, or input class: pricing rules, retry policies,
  compression codecs, ranking functions.
- *Not when / misapplied* — **this is the archetypal pattern that is just a
  function.** In any language with first-class functions, a strategy is a parameter
  of function type. Creating an interface, three implementing classes, and a
  factory to choose between them, where `sort(items, comparator)` would do, is
  ceremony. Also misapplied when there is exactly one strategy and a hypothetical
  second — that is speculative OCP, see the [Rule of Three](#rule-of-three).
- *In practice* — `calculateShipping(order, rateStrategy)` with three real carriers
  is Strategy earning its keep. `NameFormatter` with a single
  `DefaultNameFormatter` is not.

### Adapter

Wrap an incompatible interface so it satisfies the interface your code expects.
The adapter's whole job is translation; it holds no business logic. This is the
mechanical enabler of [DIP](#solid) — the domain declares the interface, the
adapter makes the vendor fit it.

- *Use when* — integrating a third-party SDK, a legacy module, or a vendor API
  behind an interface you own. Also when you must swap providers and want the blast
  radius confined to one file.
- *Not when / misapplied* — adapting your own code to your own interface, which
  usually means you should just change one of them. Adapters also rot when
  business logic leaks in: an adapter that decides *whether* to charge, rather
  than *how* to call the charge API, is a service wearing an adapter's name. And
  an adapter that exposes the vendor's types in its signature has adapted nothing.
- *In practice* — `StripePaymentGateway implements PaymentGateway` maps your
  `Money` and `PaymentResult` to and from Stripe's shapes, translates Stripe's
  error codes into your error taxonomy, and imports `stripe` — while nothing else
  in the codebase does.

### Facade

Present a single simplified entry point over a complicated subsystem, so callers
do not orchestrate five collaborators in the right order. It reduces the number of
things a caller must know, at the cost of hiding capability.

- *Use when* — a common workflow requires a fixed sequence across several
  components and every caller repeats it, or when you are wrapping a genuinely
  large legacy subsystem to contain its surface area during a
  [Strangler Fig](#strangler-fig) migration.
- *Not when / misapplied* — a facade that grows a method per caller is not a facade,
  it is a god object with good intentions. The other failure is the facade that
  forwards one call to one collaborator and adds nothing — a layer that does not
  pay rent. And a facade that hides *necessary* capability forces callers to bypass
  it, which leaves you with two entry points and no invariants.
- *In practice* — `OrderCheckout.submit(cart, payment)` hiding inventory reservation,
  payment authorization, and confirmation email is a facade. Beware: if callers
  start needing partial flows ("reserve but do not charge"), the facade must expose
  the steps or be split, not sprout `submitWithoutCharging`.

### Decorator

Wrap an object in another object implementing the same interface, adding behaviour
before or after delegating. Decorators compose, which is their advantage over
subclassing: you can stack retry, caching, logging, and metrics in any order
without a class per combination.

- *Use when* — layering cross-cutting behaviour onto an existing implementation:
  instrumentation, caching, rate limiting, authorization checks, retries.
- *Not when / misapplied* — deep decorator stacks are brutal to debug. A stack trace
  through six wrappers, each adding a frame, hides where the real work happens, and
  ordering bugs are subtle (caching *outside* retry caches failures; caching
  *inside* retry defeats caching). If the decorator changes the interface's
  semantics rather than augmenting them, it is violating [LSP](#solid). In many
  languages middleware, higher-order functions, or annotations do this more legibly.
- *In practice* — `new MetricsClient(new RetryingClient(new HttpClient()))` is fine
  and standard. Nine layers deep with two that mutate arguments is a maintenance
  liability; flatten it.

### Observer

An object maintains a list of dependents and notifies them when its state changes,
so publishers do not know their subscribers. In-process, this is the
event-listener model; across processes it becomes [Pub/Sub](#pubsub) with entirely
different failure characteristics.

- *Use when* — one state change must trigger several unrelated reactions, and the
  publisher genuinely should not know about them: UI updates, cache invalidation
  fan-out, audit logging.
- *Not when / misapplied* — using events for logic that must happen, in order, with
  error handling. Observers turn an explicit call graph into an implicit one: you
  can no longer answer "what happens when I save this?" by reading the code, and
  "find all callers" stops working. Failures in one observer silently affecting or
  not affecting others is a design decision most implementations never make
  deliberately. Also the classic memory leak: listeners that outlive their
  subscribers because nobody unregistered them. And the AI-era version: an event
  with one subscriber, forever, is a function call with extra steps and worse
  observability.
- *In practice* — order confirmation email as an observer of `OrderPlaced`: good,
  it is genuinely optional and independently retryable. Inventory decrement as an
  observer: dangerous, it is part of the transaction's correctness and should be
  an explicit step.

### Factory

Centralize object creation behind a method or class so callers do not know the
concrete type they receive. The value is in abstraction: the caller depends on an
interface, and the factory chooses the implementation.

- *Use when* — the concrete class to instantiate depends on runtime
  configuration, tenant, feature flags, or input classification, and constructors
  are not expressive enough. Also when object construction is complicated enough
  that callers would get it wrong.
- *Not when / misapplied* — wrapping a single constructor with a static factory
  method for no abstraction reason. `UserFactory.create(name, email)` where
  `new User(name, email)` was clearer is ceremony. The pattern earns its keep
  when there is genuinely a choice of implementations or when the construction
  requires coordination (builder methods, default injection, validation).
- *In practice* — `NotificationFactory` returning `EmailNotifier`,
  `SmsNotifier`, or `PushNotifier` based on user preference: good. A factory
  that always returns one class because "factories are best practice": no.

### Builder

Construct a complex object step-by-step, allowing optional parameters, readable
call sites, and immutability after construction. It collapses telescoping
constructors and avoids the setters-on-a-half-initialized-object antipattern.

- *Use when* — an object has many fields, several optional, or construction
  requires ordering constraints. Also when you want immutable objects, which
  preclude setters.
- *Not when / misapplied* — for objects with three required fields and zero
  optional ones, where a constructor is both clearer and shorter. Builders also
  add a compile-time validation risk: a caller can call `build()` with required
  fields missing, which a constructor signature prevents. Some implementations
  try to enforce this at build-time with staged builder interfaces, which is
  more scaffolding than most use cases justify.
- *In practice* — `new QueryBuilder().select("name").from("users").where("active
  = ?", true).build()` is readable and compositional. A `Point.builder().x(3).
  y(4).build()` instead of `new Point(3, 4)` is over-engineered.

### Repository

Mediate between the domain and data-mapping layers, offering a collection-like
interface for aggregates. The domain calls `repository.save(order)` and
`repository.findById(id)` with no awareness of SQL, ORM sessions, or cache
invalidation. This is where [DIP](#solid) meets persistence.

- *Use when* — the domain must be independent of persistence mechanics, or when
  you want tests that run against an in-memory fake without touching a database.
  Essential in [DDD](#4-domain-driven-design) for aggregates.
- *Not when / misapplied* — **this is the most cargo-culted pattern in enterprise
  software.** A repository abstracting an ORM that is itself already an
  abstraction, where no second implementation will ever exist and every method is
  a thin delegate, is pure cost. The DAO/repository debate is mostly syntactic.
  Also repositories leaking SQL-isms (`orderBy`, `limit`, pagination internals)
  or exposing raw query builders have failed their abstraction — if the caller
  writes query logic, the repository is decorative. And a repository per *table*
  rather than per *aggregate* misunderstands the pattern; it is domain-driven, not
  schema-driven.
- *In practice* — `OrderRepository` with `save(order)`, `findById(id)`, and
  `findPendingForUser(userId)` is right-sized. A `UserRepository` with 40 query
  methods covering every conceivable filter combination is a query builder
  cosplaying as a pattern. The real measure: can you test your domain logic with
  an in-memory map implementation of this interface? If not, your abstraction has
  already leaked.

### Command

Encapsulate a request as an object with all its parameters, enabling queueing,
logging, undo, and deferred execution. A command is a reified function call.

- *Use when* — you need to log, queue, retry, or undo operations, or when
  operations must be first-class and composable: job queues, transactional
  command buses, undo stacks, batch operations, audit trails.
- *Not when / misapplied* — in languages with first-class functions, a command
  is often just a closure. If there is no replay, queueing, logging, or undo, and
  the operation executes immediately, `command.execute()` is a function call with
  a heavier syntax. Also beware the trap of making every service method a command
  class — that is mechanical CQRS cargo-culting. Commands earn their keep when
  you treat them as *data*, not just as delayed function calls.
- *In practice* — a `PlaceOrderCommand` queued to a durable store with retries is
  the pattern earning its keep. A `GetUserCommand` that wraps a synchronous
  query for no operational reason is waste.

### State Machine

Model an entity's lifecycle as an explicit set of states plus permitted
transitions, so illegal transitions are rejected structurally rather than
prevented by scattered conditionals. The state becomes data you can inspect,
persist, visualize, and test exhaustively.

- *Use when* — an entity has a genuine lifecycle with meaningful, business-visible
  transitions: order (draft → placed → paid → shipped → delivered), subscription,
  approval workflow, deployment, or any long-running process. Also when the number
  of `if (status === ...)` branches is growing across multiple files.
- *Not when / misapplied* — introducing a state-machine library for a boolean.
  `isActive` does not need a machine. The other failure is a state machine that
  models *technical* states nobody cares about, or one so fine-grained that every
  field change is a transition. And a machine that permits every transition from
  every state has encoded nothing — the value is entirely in the transitions you
  *forbid*.
- *In practice* — an explicit transition table makes "can a cancelled order be
  refunded?" answerable by reading one structure rather than grepping for
  `cancelled`. When the machine is persisted, add a version or guard so two
  concurrent transitions cannot both succeed — that is
  [optimistic locking](#optimistic-vs-pessimistic-concurrency-control).

### Null Object

Provide a valid do-nothing implementation of an interface so callers never branch
on absence. A `NullLogger` that discards, a `NoOpMetrics` that swallows, an empty
collection instead of `null`.

- *Use when* — the "absent" case genuinely has sensible neutral behaviour and
  callers would otherwise be littered with null checks: loggers, metrics
  collectors, feature-flag providers, empty collections.
- *Not when / misapplied* — **when absence is meaningful, a null object silently
  swallows errors.** A `NullPaymentGateway` that returns success is a catastrophe;
  a `NullUser` with empty permissions may accidentally deny or accidentally allow
  depending on your check logic. Null objects turn loud failures into silent
  wrong behaviour, which is a direct violation of [Fail Fast](#fail-fast). Use
  them only where "do nothing" is a correct answer, not where it is a convenient
  one. Prefer `Optional`/`Result` types when the caller genuinely must decide.
- *In practice* — returning an empty list from `findOrders()` rather than null is
  the pattern at its best: every caller iterates safely. Returning a `NullUser`
  from `authenticate()` is how you ship an auth bypass.

### Template Method

A base class defines an algorithm's skeleton and defers specific steps to
subclasses. The invariant sequence lives in one place; the varying steps are
overridden.

- *Use when* — a genuinely fixed multi-step algorithm has one or two varying steps,
  and the framework you are in mandates inheritance (test fixtures with
  setup/teardown, request-processing pipelines in some frameworks).
- *Not when / misapplied* — this is the pattern most directly superseded by
  [composition](#composition-over-inheritance) and first-class functions. Passing
  the varying steps as functions gives the same structure without the inheritance
  coupling, and permits runtime variation. Template Method also invites
  [LSP](#solid) violations: a subclass that needs to change the *order* of steps,
  or skip one, cannot, and will resort to overriding the template itself or
  setting flags the base class reads. When you see a protected boolean hook like
  `shouldValidate()`, the pattern has already failed.
- *In practice* — `processFile(reader, parser, writer)` beats
  `abstract class FileProcessor { abstract parse(); }` in almost every case.
  Reserve Template Method for frameworks that give you no choice.

### Dependency Injection

Provide a component's collaborators from outside rather than letting it construct
or locate them. DI is *how* you achieve [DIP](#solid) at runtime: constructor
parameters, function arguments, or a container that wires the graph at startup.
The important part is inversion of *control over construction*, not the container.

- *Use when* — always, for I/O-bearing, stateful, or non-deterministic
  collaborators. Constructor injection is the default: dependencies are explicit,
  immutable, and impossible to forget. It is the single biggest enabler of fast,
  reliable tests.
- *Not when / misapplied* — three distinct failures. First, injecting pure
  functions and value objects, which adds wiring for zero benefit. Second, the
  service locator: passing a container into a class so it can pull dependencies
  hides them from the signature and reintroduces global state — this is DI in name
  only. Third, framework-magic DI with runtime reflection and annotation scanning,
  where a missing binding is a startup crash instead of a compile error and the
  dependency graph is knowable only by running the app. Prefer explicit wiring at
  a single composition root; you can read it.
- *In practice* — `new OrderService(paymentGateway, orderRepo, clock)` wired once
  in `main`. Injecting the clock is what makes time-dependent logic testable —
  `Date.now()` inside business logic is an untestable hidden dependency.

### On Singleton

**Singleton is usually global mutable state wearing a design-pattern costume.**
It makes dependencies invisible (nothing in a signature reveals it), it makes
tests order-dependent and non-parallelizable (state leaks between tests, and
resetting it is a hack), it is a concurrency hazard, and it prevents having two
configurations in one process — which you always eventually need for testing,
multi-tenancy, or migration.

The legitimate uses are narrow: genuinely process-wide resources where a second
instance is *incorrect* rather than merely wasteful (a connection pool, a metrics
registry, a logging sink). Even then, the correct implementation is one instance
created at the composition root and *injected*, not a static `getInstance()`
reached from anywhere. Singleton-as-lifecycle is fine; Singleton-as-access-pattern
is the problem. If your reason for a singleton is "I did not want to pass it
through five layers", the five layers are the smell — fix them.

### On the Gang of Four generally

Many GoF patterns are workarounds for missing language features, and knowing which
is which prevents a lot of unnecessary code:

| Pattern | What it substitutes for |
| --- | --- |
| Strategy, Command, Template Method | First-class functions and closures |
| Abstract Factory, Factory Method | Functions returning values; module-level factories |
| Visitor | Pattern matching on sum types |
| Iterator | Built-in iteration protocols and generators |
| Decorator | Higher-order functions, middleware |
| Prototype | Structural copy / spread syntax |
| Singleton | A module-level value, or nothing at all |
| Observer | Language- or runtime-level event streams |

This does not make the vocabulary useless — naming a structure is still valuable
in review and design discussion. It means you SHOULD reach for the language
feature first and name the resulting shape second. Writing four classes to
express what a function type expresses is the definition of accidental
complexity. The patterns that survive on their own merit, independent of language,
are the ones about *boundaries and lifecycles* rather than about dispatch:
Adapter, Repository, Facade, State Machine, and Dependency Injection.

---

## 3. Architectural patterns

Architecture patterns describe large-scale structure: how services relate, how data
flows, where boundaries live. Each solves a specific force at a specific scale and
introduces specific operational overhead. The cost is never zero. Adopting a
distributed pattern for a single-team monolith or an enterprise pattern for a
two-person startup is how you spend six months on infrastructure instead of
shipping.

### Layered Architecture

Organize code into horizontal layers with dependencies flowing one direction:
presentation depends on business logic depends on data access. Each layer may only
call the layer directly beneath it.

- *Use when* — a simple system with clear technical tiers and a small team. It is
  the default for a reason: everyone understands it, and violation is obvious.
- *Not when / misapplied* — the failure is a layer that forwards every call with no
  added value, which is every service that is just a DAO wrapper. Also violated by
  "layers" that skip: the UI calling the database, or business logic importing a
  web framework. And when change is by feature, not by layer, the layout forces
  every feature to touch every directory. Modern preference is for **vertical
  slices** — a feature owns all its layers — rather than horizontal layers.
- *In practice* — a Rails or Django app with models/views/controllers is layered.
  It works until you have 200 models in one directory and every feature is
  scattered across six files.

### Clean Architecture / Hexagonal / Ports and Adapters

Three names for the same family of ideas: business logic at the center, pure and
framework-ignorant; dependencies point inward; I/O at the edges behind interfaces
the core defines. This is [DIP](#solid) applied architecturally. The core declares
ports (interfaces), the edges provide adapters (implementations).

- *Use when* — you expect to change vendors, databases, or frameworks; when you
  need comprehensive fast tests without I/O; or when the domain is complex enough
  that it deserves protection from infrastructure churn. Essential for systems
  with long lifetimes and real business logic.
- *Not when / misapplied* — on CRUD apps with no business rules, where the
  "business logic" is `userRepo.save(user)` and nothing else — the indirection is
  pure cost. Also when the ports are leaky: if your `UserRepository` port exposes
  `findByEmailLike(pattern)` with SQL semantics, the abstraction has failed. And
  when it is cargo-culted to the point of an interface per class regardless of
  whether the thing will ever have two implementations.
- *In practice* — domain entities with no import of `express`, `stripe`, or `pg`;
  all external concerns behind interfaces. Tests run in milliseconds without
  Docker. A switch from Postgres to Mongo, or Stripe to Adyen, touches exactly the
  adapters. This is the architecture that survives a decade.

### Modular Monolith

A single deployable divided into modules with clear boundaries, explicit APIs, and
independent internal structure. Modules are separately testable and conceptually
could be services, but are not. This is the **correct default for most systems.**

- *Use when* — starting. One team or a few. Unclear boundaries. Throughput and
  latency addressable with vertical scaling. You want team autonomy and
  changeability without operational complexity. Almost every new project should
  begin here and stay here until the forces driving distribution are proven.
- *Not when / misapplied* — the rare genuine distribution drivers exist: separate
  scaling profiles that are unmanageable with one deployment, security isolation
  that requires a process boundary, or true independent deployment demanded by
  organizational structure. But note that "we have microservices" is not one of
  those forces; it is an outcome you chose, possibly too early.
- *In practice* — Shopify at scale is a modular monolith. So is GitHub. It proves
  the pattern is not a "starter architecture." The modules have defined APIs; you
  cannot reach across a boundary to call an internal; tests enforce this. When a
  boundary is genuinely wrong, you move it — a git operation, not a distributed
  transaction problem.

### Microservices

Decompose a system into independently deployable services, each owning its data,
communicating over the network. The honest framing: microservices trade
*development-time coupling* for *runtime complexity*. You are buying independent
deployability with distributed-systems problems.

The costs you MUST be willing to pay, all of them, before choosing this:

| Cost | What it actually means day to day |
| --- | --- |
| Distributed transactions | No ACID across services. [Sagas](#saga), compensations, eventual consistency in your business logic |
| Network failure as normal | Every call can time out, retry, duplicate, or arrive out of order |
| Observability requirement | Without distributed tracing you cannot debug anything |
| Data duplication | Each service owns its data, so the same entity exists in five shapes |
| Versioned contracts | Every inter-service API is a public API with independent deploy cycles |
| Local development | Running the system on a laptop becomes a project of its own |
| Operational surface | N services × (deploy, monitor, alert, secret, scale, patch) |
| Testing | Integration testing requires [contract tests](#contract-testing) or a full environment |
| Latency floor | Every hop adds network round-trip; a chatty design is unfixable later |
| On-call cognitive load | The failure mode is "which of 30 services is degraded?" |

The organizational preconditions — if these are absent, you are getting the costs
without the benefits:

- **Team ownership.** Each service has one team that owns it end to end, including
  on-call. Services with no owner rot; services with shared ownership deadlock.
- **Deployment autonomy.** A team can deploy its service without coordinating a
  release train. If you deploy everything together, you have a distributed
  monolith — the worst of both worlds.
- **Platform maturity.** CI/CD, service discovery, centralized logging, tracing,
  metrics, and secrets management exist *before* the second service.
- **Team count.** Roughly, you need more teams than the coordination overhead of a
  monolith can bear. Below about four or five independent teams, the monolith wins.

- *Use when* — all the preconditions hold, and a specific force demands it:
  radically different scaling profiles, hard compliance isolation, or independent
  deploy cadence across many teams.
- *Not when / misapplied* — the dominant failure is adopting it for a small team
  because large companies published about it, which is textbook
  [cargo-culting](SYSTEM.md#anti-principles) and directly contradicts
  [Conway's Law](#conways-law). The second failure is splitting by technical layer
  or by entity (`user-service`, `order-service`, `email-service`) instead of by
  [bounded context](#bounded-context), yielding services that cannot change
  independently because every feature spans all of them. The third is starting with
  microservices before the domain is understood, when boundaries are exactly what
  you do not yet know.
- *In practice* — the reliable path is [modular monolith](#modular-monolith) first,
  then extract a service when a boundary has proven stable *and* a real force
  demands separation. Extraction from a good module is a week. Merging two badly
  split services is a quarter.

### Event-Driven Architecture

Components communicate by emitting and reacting to events describing things that
happened. Producers do not know consumers. This buys temporal decoupling — the
producer does not wait — and extensibility: a new consumer needs no producer change.

- *Use when* — reactions are genuinely optional, independently retryable, and
  numerous; when producer and consumer scale differently; when you need an audit
  trail of what happened; or when you must absorb load spikes by buffering.
- *Not when / misapplied* — when the "reaction" is required for correctness of the
  originating operation. Making inventory decrement an event means an order can be
  placed for stock that does not exist, and you now own that reconciliation
  problem forever. The other failure is losing the ability to reason: with an
  event-driven core, no one can answer "what happens when a user signs up?" without
  tracing production. Also, events with exactly one consumer, forever, are a
  function call with a broker, extra latency, and worse debugging. Prefer explicit
  calls for synchronous, required, ordered work.
- *In practice* — name events as past-tense facts (`OrderPlaced`, not
  `PlaceOrder`), include a schema version, make consumers idempotent (they will
  receive duplicates), and never assume ordering unless the transport guarantees it
  per key.

### Pub/Sub

A messaging topology where publishers write to a topic and any number of
subscribers receive copies, mediated by a broker. Distinct from point-to-point
queues, where one consumer wins each message, and distinct from in-process
[Observer](#observer) by having a durable, networked intermediary with its own
failure modes.

- *Use when* — fan-out to multiple independent consumers, each with its own
  processing rate and failure handling; decoupling deployment lifecycles; buffering
  bursts.
- *Not when / misapplied* — treating a broker as a database or as a
  request/response mechanism. "Publish and wait for a reply on another topic" is
  RPC with extra steps and no timeout semantics; use RPC. Also misapplied by
  ignoring the operational realities: dead-letter queues MUST exist and be
  monitored, consumer lag MUST be alerted on, and ordering is per-partition at
  best. A subscriber that is down for an hour either loses messages or receives a
  thundering herd on recovery — decide which, deliberately.
- *In practice* — `payment.succeeded` published once; the receipt service, the
  analytics pipeline, and the fulfilment service each consume independently. Adding
  a fourth consumer requires no change to payments. That is the whole point; if you
  never add the fourth, you did not need the broker.

### Event Sourcing

Persist the full ordered sequence of state-changing events as the system of record;
current state is derived by replaying them. The event log is the truth, not a
projection of it.

- *Use when* — the history itself has business value: financial ledgers, audit-
  mandated domains, systems where "why is the balance this?" must be answerable, or
  where you must retroactively compute new views of past behaviour. Also when
  temporal queries ("what did this look like on 3 March?") are a requirement.
- *Not when / misapplied* — **this is one of the most expensive patterns to adopt
  and one of the hardest to reverse.** Costs: schema evolution of events is
  forever (old events are immutable and must remain readable by new code), you need
  snapshots to keep replay tractable, deletion for GDPR conflicts with an append-
  only log, debugging requires tooling you must build, and every developer must
  learn a non-obvious model. It is routinely adopted for CRUD domains where an
  `updated_at` column and an audit table would have sufficed. It is also frequently
  confused with "we publish events" — publishing events to a broker while a
  database holds the truth is *not* event sourcing.
- *In practice* — a double-entry ledger is the natural fit: the events *are* the
  domain. A user profile with a `displayName` field is not. If you cannot articulate
  a business question that only the log can answer, use a table.

### CQRS — Command Query Responsibility Segregation

Separate the write model from the read model, potentially with different schemas,
different stores, and an asynchronous projection between them. Writes optimize for
invariants; reads optimize for query shape.

- *Use when* — read and write loads differ by an order of magnitude or more, read
  shapes are numerous and denormalized enough that serving them from the write
  schema requires expensive joins, or the write model's invariants and the read
  model's query needs genuinely conflict.
- *Not when / misapplied* — the light form (separate command and query *methods*,
  same database) is nearly free and often good. The heavy form (separate stores with
  async projection) buys you eventual consistency in your UI: a user submits a form
  and does not see their change, which you now must design around with read-your-
  writes handling, and every projection is a rebuild-and-backfill operation when it
  has a bug. CQRS is also often adopted as an inseparable bundle with
  [Event Sourcing](#event-sourcing); they are independent and each should be
  justified alone. Applying it uniformly across a system rather than to the two
  aggregates that need it is over-engineering by default.
- *In practice* — a product catalog with 100,000 reads per write and five
  denormalized search views is a legitimate case. A settings page is not.

### Saga

Coordinate a business transaction spanning multiple services using a sequence of
local transactions, each with a compensating action for rollback. Since there is no
distributed ACID, you get *semantic* rollback instead: not "undo the write", but
"issue a refund."

- *Use when* — a multi-service workflow must maintain business consistency and you
  have accepted [microservices](#microservices). Two flavours: **orchestration** (a
  coordinator drives the steps — easier to reason about, single point of logic) and
  **choreography** (services react to each other's events — more decoupled, much
  harder to trace). Prefer orchestration unless you have a specific reason.
- *Not when / misapplied* — inside a single database, where a transaction is
  simpler, faster, and actually atomic. Sagas are also routinely designed without
  the hard part: **compensations that cannot fail, and steps that may not be
  compensable at all.** You cannot un-send an email or un-ship a package. The
  correct response is to order steps so irreversible ones come last, and to design
  for the case where compensation itself fails (which needs a dead-letter path and
  a human). Every saga step MUST be idempotent because every step will be retried.
- *In practice* — order placement: reserve inventory → authorize payment → create
  shipment. If shipment creation fails, void the authorization and release the
  reservation. Note that "release the reservation" must be safe to run twice and
  safe to run for a reservation that already expired.

### Serverless

Run code in managed, event-triggered, ephemeral compute with no server lifecycle to
manage and per-invocation billing. The provider handles scaling, including to zero.

- *Use when* — workloads are bursty or infrequent (scale-to-zero is a genuine cost
  win), event-driven glue, scheduled jobs, or when the team has no appetite for
  infrastructure operations. Excellent for low-volume, spiky, or clearly bounded
  tasks.
- *Not when / misapplied* — cold starts make latency-sensitive user-facing paths
  unreliable at the tail; execution time limits break long jobs; per-invocation
  pricing becomes *more* expensive than a small VM at sustained load, and the
  crossover comes sooner than people expect; connection-pool exhaustion against a
  relational database is a classic failure (each concurrent invocation wants a
  connection); local development and integration testing are materially harder; and
  vendor coupling is deep. Also, "serverless" as an architecture for a whole
  application — dozens of functions each with its own IAM, logs, and deploy — is
  distributed-system complexity with worse tooling. Prefer a small number of
  well-scoped functions, or a container.
- *In practice* — an image-thumbnail generator triggered by object upload: ideal. A
  synchronous API serving 500 requests per second with a 50ms p99 budget: use a
  container.

### BFF — Backend for Frontend

A dedicated backend per client type (web, iOS, Android, partner API) that
aggregates and reshapes data for that client's specific needs, owned by the client
team.

- *Use when* — multiple clients with genuinely divergent data needs are being served
  by one over-general API, forcing either chatty clients or a bloated response;
  when client teams are blocked waiting on backend teams for shaping changes (a
  direct [Conway's Law](#conways-law) signal); or when clients need aggregation
  across several services.
- *Not when / misapplied* — with a single client, a BFF is an extra deployable that
  forwards calls and does not
  [pay rent](SYSTEM.md#6-architecture-principles). The other failure is business
  logic migrating into the BFF, where it gets duplicated per client and diverges —
  a BFF aggregates and reshapes; it does not decide. Also note GraphQL solves a
  large part of the same problem without a per-client deployable, and is worth
  comparing before building three BFFs.
- *In practice* — the mobile BFF collapses six service calls into one response
  sized for a phone screen; the web BFF returns the richer payload. Both call the
  same domain services, and neither computes a price.

### Sidecar

Deploy a helper process alongside the main application in the same deployment unit,
sharing its lifecycle and network namespace, handling cross-cutting concerns:
proxying, TLS termination, telemetry collection, secret rotation, log shipping.

- *Use when* — you need consistent cross-cutting behaviour across services written
  in different languages, and you would otherwise reimplement a library per
  language. This is the service-mesh model (Envoy, Linkerd) and the observability-
  agent model.
- *Not when / misapplied* — with a small number of services in one language, a
  library is simpler, faster (no extra network hop), and easier to debug. Sidecars
  double your process count, add latency to every call, consume real memory per pod,
  and introduce a startup-ordering problem (the app can start before the proxy is
  ready and fail its first calls). A full service mesh for six services is a
  well-documented regret; it is infrastructure you must now operate and upgrade.
- *In practice* — mTLS between 200 polyglot services: a mesh sidecar earns it. Log
  shipping for three Node services: a library or the platform's log driver.

### Strangler Fig

Incrementally replace a legacy system by routing traffic through a facade that
directs each request to either the old or the new implementation, moving
functionality across piece by piece until the old system is dead.

- *Use when* — replacing a system that is too large, too critical, or too poorly
  understood to rewrite in one step. Which is almost every legacy replacement. It
  keeps the system working at every stage — [Gall's Law](#galls-law) applied to
  migration — and lets you abort at any point with value already delivered.
- *Not when / misapplied* — for small systems where a direct rewrite is genuinely
  cheaper than maintaining a routing layer and two implementations. The common
  failure is the migration that stalls halfway: the routing facade becomes
  permanent, you now operate two systems and the facade forever, and the "legacy"
  system gets new features because that was faster. Guard against this with a
  deadline, a decommissioning owner, and a rule that no new functionality goes into
  the old system. Also: keeping the legacy data model on the new side defeats the
  purpose — pair this with an [Anti-Corruption Layer](#anti-corruption-layer).
- *In practice* — route `/api/v1/users/*` to the new service while everything else
  goes to the monolith, expand the routed set weekly, delete the monolith's user
  code once traffic is fully shifted and a rollback window has passed.

### Anti-Corruption Layer

A translation layer at the boundary with an external or legacy system, converting
its model into yours so its concepts, naming, and awkwardness do not leak into your
domain. Architecturally it is [Adapter](#adapter) applied to a whole subsystem, and
it is a core [DDD](#4-domain-driven-design) pattern.

- *Use when* — integrating with a legacy system, a third-party API with a model that
  conflicts with yours, or a partner whose schema you cannot influence. Mandatory
  when the external model would otherwise infect your domain vocabulary.
- *Not when / misapplied* — between two contexts you both own and can change, where
  fixing one model is better than translating forever. The failure mode is an ACL
  that is a pass-through: if your domain type has the same fields with the same
  names as the external one, you have written a mapping function and called it
  architecture. The other failure is the ACL that leaks — one external concept
  allowed through "just this once" because translating it was awkward, and within
  a year the external vocabulary is in your core domain anyway.
- *In practice* — a payment provider returns `txn_status: "PENDING_CAPTURE"`; the
  ACL maps it to your `PaymentState.AwaitingCapture` and nothing downstream ever
  sees the provider's vocabulary, so swapping providers touches one package.

### Feature flags

Decouple deployment from release by making behaviour conditional on runtime
configuration. Enables trunk-based development, gradual rollout, instant rollback
without redeploy, A/B testing, and per-tenant capability.

- *Use when* — shipping incomplete work safely behind a flag, de-risking a rollout
  (1% → 10% → 100%), running experiments, or providing an instant kill switch for a
  risky path. The instant-rollback property is the strongest argument: turning a
  flag off is seconds, a rollback deploy is minutes.
- *Not when / misapplied* — **flags are debt with a due date, and the interest is
  combinatorial.** Ten permanent boolean flags is 1024 possible configurations,
  almost none of which are tested. Every flag must have an owner, an expiry date, and
  a removal task; flags that outlive their rollout are the most common form of
  accumulated complexity in mature codebases. Nesting flags is a code smell that
  becomes unreadable fast. Flags controlling *security* behaviour are a specific
  hazard — a flag that can disable an authorization check is a one-toggle
  vulnerability. And flag evaluation on a hot path against a remote service adds
  latency and a new dependency; cache with a local fallback default.
- *In practice* — `if (flags.newCheckoutEnabled(user))`, rolled from internal users
  to 5% to all over a week, then the flag and the old branch are deleted in a
  cleanup PR that is part of the original task, not a hoped-for future.

### Blue-green / Canary / Rolling deployment

Three strategies for replacing running code, differing in blast radius and cost:

**Blue-green.** Two identical environments; deploy to the idle one, verify, then
switch all traffic at once. Rollback is switching back — the fastest rollback
available. Costs double infrastructure during the switch, and requires that the
database schema be compatible with both versions simultaneously.

**Canary.** Route a small percentage of traffic to the new version, watch error
rates and latency, then progressively increase. Limits blast radius to the canary
percentage and catches problems only reproducible under real traffic. Requires good
metrics with per-version breakdown, and it fails silently if you do not actually
gate progression on a health signal.

**Rolling.** Replace instances in batches until all are updated. Cheapest — no extra
capacity beyond one batch — but both versions serve traffic during the roll, and
rollback means rolling back through the same slow process.

- *Use when* — canary for anything user-facing with meaningful risk and enough
  traffic for statistical signal; blue-green when you need instant rollback and can
  afford the capacity; rolling for low-risk changes in a system with good health
  checks.
- *Not when / misapplied* — all three require **backward-compatible schema and API
  changes**, because two versions run concurrently in every one of them. A migration
  that drops a column will break the old version instantly; see
  [Expand-Migrate-Contract](#expand-migrate-contract). Canary with too little
  traffic produces no signal and just delays the deploy. Blue-green with a shared
  database does not isolate the risky part. And a rolling deploy without readiness
  probes drops requests on every instance replacement.

---

## 4. Domain-Driven Design

DDD is a way of building software where the structure of the code follows the
structure of the business, and both use the same words. Its real contribution is
not the tactical patterns — those are ordinary object design — but the strategic
ones: deciding where the boundaries go and what each side of a boundary is allowed
to assume.

**When DDD is wrong for you:** the domain is simple, well-understood, or largely
CRUD. A booking form with four fields does not have a domain worth modelling, and
wrapping it in aggregates, repositories, and domain events produces six files to
save four fields. DDD earns its overhead when business rules are complex, contested,
or changing — not when the complexity is technical rather than conceptual.

### Ubiquitous Language

One vocabulary shared by domain experts, engineers, code, and documentation. If the
business says "policy holder", the class is `PolicyHolder` — not `User`, not
`Customer`, not `Account`.

- *Use when* — always, in any domain with real vocabulary. This is the cheapest and
  highest-return idea in DDD, and it costs nothing but discipline.
- *Not when / misapplied* — the failure is not overuse but abandonment: the code says
  `User`, the business says "policy holder", and every conversation carries a silent
  translation step that eventually goes wrong. The second failure is *inventing*
  vocabulary the business does not use, then teaching it back to them — the language
  must come from the domain, not from the engineers.
- *In practice* — when an expert says "we suspend a policy, we do not delete it", the
  method becomes `policy.suspend()`, not `policyService.setStatus(3)`.

### Bounded Context

An explicit boundary within which a model and its vocabulary are consistent. The same
word may mean different things in different contexts, and that is fine — as long as
the boundary is named and the translation across it is explicit.

- *Use when* — the same term genuinely means different things to different parts of the
  business. This is the single most useful strategic idea in DDD, and it is the honest
  answer to "should we have one User model?" — usually not.
- *Not when / misapplied* — drawing context boundaries by technical layer, or by team
  org chart, rather than by language and rules. The classic misapplication is treating
  bounded contexts as a mandate for microservices: a bounded context is a *modelling*
  boundary, and it can live perfectly well as a module inside a
  [Modular Monolith](#modular-monolith). Conflating the two is how teams end up
  distributing a system they did not need to distribute.
- *In practice* — in Sales, a "customer" is a lead with a probability; in Billing, a
  "customer" is an entity with a payment method and a tax jurisdiction. Two models, one
  [Anti-Corruption Layer](#anti-corruption-layer) between them, no shared `Customer`
  class that satisfies neither.

### Aggregate and Aggregate Root

A cluster of objects treated as one unit for changes, with a single entry point (the
root) through which all modification passes. The aggregate is the consistency
boundary: everything inside it is transactionally consistent, everything outside is
eventually consistent.

- *Use when* — you have invariants spanning several objects that must hold at every
  commit. "An order's total must equal the sum of its line items" is an aggregate
  invariant; the aggregate is what makes it enforceable.
- *Not when / misapplied* — the dominant failure is the aggregate that is too large.
  Modelling `Customer` as an aggregate containing all their orders means loading a
  decade of history to change an email address, and it serializes every concurrent
  operation on that customer. Aggregates should be as small as the invariant allows.
  The second failure is reaching across aggregates in one transaction, which quietly
  makes them one aggregate with extra steps — reference other aggregates by ID and
  accept eventual consistency between them.
- *In practice* — `Order` is an aggregate root holding its `LineItem`s; `Customer` is a
  separate aggregate referenced by `customerId`. Changing an address does not touch
  orders.

### Entity and Value Object

An **entity** has identity that persists through change — two entities with identical
fields are still different things. A **value object** has no identity; it is defined
entirely by its values, and is immutable.

- *Use when* — always worth asking. Most codebases under-use value objects and end up
  passing primitives everywhere, losing validation and meaning. `Money`, `EmailAddress`,
  `DateRange`, and `Coordinates` are value objects; making them explicit puts the
  validation in one place and makes invalid states unrepresentable.
- *Not when / misapplied* — wrapping every primitive in a type for its own sake, so a
  simple function takes six wrapper objects and reads like ceremony. The other failure
  is a mutable value object, which is a contradiction: if it can change, it has
  identity, and sharing it will cause a bug that is very hard to find.
- *In practice* — `Money(amount, currency)` with arithmetic that refuses to add USD to
  EUR, rather than a bare `decimal` and a convention everyone is trusted to remember.

### Repository

An abstraction that provides collection-like access to aggregates, hiding the storage
mechanism from the domain.

- *Use when* — the domain logic is genuinely worth isolating from persistence, and you
  have aggregates worth loading and saving as units. See the tactical
  [Repository pattern](#repository) discussion for the full trade-off.
- *Not when / misapplied* — one repository per table rather than one per aggregate,
  which is not the pattern; it is a data access object with an aspirational name. The
  common failure is a repository that leaks query concerns upward —
  `findByStatusAndDateRangeOrderByPriority` — until the interface is a query language
  and the abstraction buys nothing.
- *In practice* — `OrderRepository.save(order)` persists the root and its line items in
  one transaction; there is no `LineItemRepository`, because line items are not
  independently loadable.

### Domain Event

A record that something meaningful happened in the domain, named in the past tense,
that other parts of the system may react to.

- *Use when* — side effects should be decoupled from the action that caused them, and
  when the fact that something happened is itself part of the domain vocabulary.
- *Not when / misapplied* — emitting events for every field change, which produces a
  stream of noise nobody consumes and a system whose behaviour cannot be traced.
  Domain events describe business facts (`OrderShipped`), not database mutations
  (`OrderRowUpdated`). The subtle failure is treating in-process domain events as
  though they were durable messages: if the handler must not be lost, it needs an
  outbox, not an in-memory dispatch.
- *In practice* — `OrderPlaced` triggers inventory reservation and a confirmation
  email, neither of which the ordering code knows about.

---

## 5. Distributed systems

The defining property of a distributed system is **partial failure**: some of it is
broken while the rest keeps running, and no component can reliably tell the
difference between a peer that is slow, a peer that is dead, and a network that has
stopped delivering. Every idea below follows from that.

The most important practical consequence: **do not distribute a system you do not
have to.** Every network hop converts a function call that either returned or threw
into an operation with three outcomes — success, failure, and unknown — and the
third one is where the bugs live.

### CAP theorem

In the presence of a network **P**artition, a distributed system must choose between
**C**onsistency (every read sees the latest write) and **A**vailability (every request
gets a non-error response).

- *Use when* — reasoning about what a datastore will do during a partition, which is a
  question with an answer you should know before an incident rather than during one.
- *Not when / misapplied* — CAP is the most over-cited and least-understood result in
  distributed systems. It says nothing about normal operation, only about behaviour
  during a partition. "We chose AP" is not an architecture. The genuine misapplication
  is using CAP to justify eventual consistency in a system that never partitions
  meaningfully — a single-region database with a replica is not a CAP problem, and
  giving up consistency you could have had is a self-inflicted wound.
- *In practice* — a payment ledger chooses consistency and refuses writes during a
  partition; a social feed chooses availability and serves stale posts. Both are
  correct for their domain.

### PACELC

An extension of CAP that describes the whole operating envelope: if there is a
**P**artition, choose **A**vailability or **C**onsistency; **E**lse — in normal
operation — choose **L**atency or **C**onsistency.

- *Use when* — comparing datastores honestly. PACELC is more useful than CAP because
  the "else" branch describes the 99.9% of time when the network is fine, and that is
  where the trade-off actually costs you.
- *Not when / misapplied* — as a scoring system for picking a database from a table.
  The classification tells you the model, not whether the system meets your latency
  budget at your data volume, which is a benchmark question.
- *In practice* — a system that is PC/EC (consistent in both branches) will make you
  wait for quorum on every read; if your p99 budget is 20ms across regions, you have
  found your constraint before you wrote any code.

### The eight fallacies of distributed computing

The assumptions that are false, that everyone makes anyway: the network is reliable;
latency is zero; bandwidth is infinite; the network is secure; topology does not
change; there is one administrator; transport cost is zero; the network is
homogeneous.

- *Use when* — reviewing any design with a network call in it. Walk the list; each
  fallacy maps to a concrete control. Not reliable → retries with backoff and
  idempotency. Latency non-zero → timeouts and batching. Not secure → authentication
  and encryption on every hop, including internal ones.
- *Not when / misapplied* — as a rhetorical device to block work. The point is to name
  the specific control each assumption requires, not to conclude that networks are
  scary.
- *In practice* — a synchronous call chain of six services, each with a 1-second
  timeout, has a worst-case latency of six seconds and fails if any one of them is
  down. Naming "latency is zero" makes that arithmetic visible at design time.

### Idempotency

An operation is idempotent if performing it more than once has the same effect as
performing it once.

- *Use when* — anything that can be retried, which in a distributed system is
  everything. Because a caller cannot distinguish "the request failed" from "the
  response was lost", every retryable write needs an idempotency key so the second
  attempt is recognized as a duplicate rather than executed again.
- *Not when / misapplied* — the failure is assuming an operation is idempotent because
  it "just sets a value", when it also sends an email, increments a counter, or
  publishes an event. Idempotency is a property of the whole effect, not of the
  database statement. The second failure is an idempotency key with no expiry policy,
  which grows without bound.
- *In practice* — `POST /payments` with `Idempotency-Key: <uuid>` returns the original
  result on retry rather than charging the card twice. This is the difference between
  a retry being safe and a retry being a support ticket.

### Consensus and quorum

Consensus protocols (Raft, Paxos) let a group of nodes agree on a value despite
failures. **Quorum** — a majority — is how they guarantee that any two decisions
overlap in at least one node.

- *Use when* — you need a single agreed answer across replicas: leader election,
  distributed locks, configuration that must not diverge. Use a proven implementation;
  this is the canonical example of something you must not write yourself.
- *Not when / misapplied* — for high-throughput data paths where the coordination cost
  per operation is prohibitive. Consensus requires a round trip to a majority on every
  decision, and across regions that is tens of milliseconds you cannot optimize away.
  The recurring misapplication is the distributed lock used as a mutual-exclusion
  primitive for correctness: locks expire, holders pause for GC, and the lock is not a
  guarantee unless the protected resource also checks a fencing token.
- *In practice* — a three-node cluster tolerates one failure; a five-node cluster
  tolerates two. An even number of nodes buys nothing — four nodes still need three for
  a majority, so you have added a machine and no fault tolerance.

### Eventual consistency

Replicas converge to the same value given no new writes, but a read may return stale
data in the meantime.

- *Use when* — staleness measured in seconds is acceptable and availability or latency
  matters more. Most read-heavy user-facing data qualifies.
- *Not when / misapplied* — where a stale read causes a wrong decision: balances,
  inventory at the point of sale, permission checks, uniqueness constraints. The
  specific failure to watch for is **read-your-writes**: a user updates their profile,
  the read hits a lagging replica, the change appears to have vanished, and they
  submit it again. Route a user's reads to the primary for a window after their write,
  or accept the support load.
- *In practice* — a follower replica lagging by 200ms is invisible on a dashboard and
  catastrophic on a "did my payment go through?" screen.

### Circuit breaker, bulkhead, and backpressure

Three failure-isolation patterns. A **circuit breaker** stops calling a failing
dependency after a threshold, failing fast until a probe succeeds. A **bulkhead**
isolates resource pools so one saturated dependency cannot consume all threads or
connections. **Backpressure** propagates "slow down" upstream instead of accepting
work you cannot complete.

- *Use when* — any synchronous call to a dependency that can be slow or down. Without
  these, one slow dependency exhausts the caller's thread pool and takes down a service
  that was otherwise healthy — the standard cascading failure.
- *Not when / misapplied* — a circuit breaker with a threshold tuned by guesswork trips
  during normal load spikes and turns a degradation into an outage. A breaker with no
  fallback behaviour just converts slow responses into fast errors, which is sometimes
  correct and sometimes worse. Backpressure that is implemented as an unbounded queue
  is not backpressure — it is the same overload with added latency and memory
  consumption.
- *In practice* — the recommendations service is down; the breaker opens after 5
  consecutive failures, the page renders without recommendations, and checkout keeps
  working. Without the breaker, every request waits 30 seconds and the site is down.

### Two-phase commit and why to avoid it

A protocol for atomic commit across multiple resources: a coordinator asks all
participants to prepare, then tells them all to commit or abort.

- *Use when* — rarely, and only within a single administrative domain with a reliable
  coordinator. It is correct, and it is what XA transactions implement.
- *Not when / misapplied* — across services or regions. 2PC is a blocking protocol: if
  the coordinator dies after prepare, participants hold locks indefinitely and cannot
  safely proceed. It converts independent failures into correlated ones, which is the
  opposite of why you distributed the system. The near-universal answer in modern
  service architectures is a [Saga](#saga) with compensating actions and explicitly
  designed intermediate states.
- *In practice* — booking a flight and a hotel atomically across two providers is not a
  2PC problem; it is a saga with a cancellation path, because one of the providers is
  not going to participate in your transaction protocol.

### Retry with exponential backoff and jitter

On a transient failure, retry after a delay that doubles each attempt, plus a random
component. All three parts matter: retrying handles transience, backoff avoids
hammering a struggling dependency, and **jitter prevents synchronized retries from
all clients arriving simultaneously** — without it you have built a
[thundering herd](#thundering-herd) generator.

- *Use when* — the failure is plausibly transient: network blips, 429s, 503s,
  connection resets, deadlock aborts. Combine with a total attempt budget, a total
  deadline, and a [circuit breaker](#circuit-breaker-bulkhead-and-backpressure).
- *Not when / misapplied* — **retrying a non-idempotent operation duplicates work.**
  A retried payment charges twice; see [idempotency keys](#idempotency-keys). Also do
  not retry deterministic failures: a 400, a 401, a validation error, or a
  serialization bug will fail identically forever, and retrying it wastes budget and
  obscures the real error. Unbounded retries turn a brief outage into a self-inflicted
  DDoS. Nested retries multiply: three layers each retrying three times is 27
  requests from one user action — decide *one* layer owns retry policy. Retrying
  behind an already-exhausted deadline is pure load with no chance of success.
- *In practice* — `delay = min(cap, base * 2^attempt) * random(0.5, 1.5)`, max 4
  attempts, total deadline 10 seconds, only on 5xx/429/timeout, with the retry count
  recorded in telemetry so you can see when retries are masking a real problem.

### Idempotency keys

The client generates a unique key per logical operation and sends it with the
request; the server records the key with the result and returns the stored result on
any repeat. This makes an unsafe operation safe to retry, which is the actual
answer to [exactly-once delivery](#exactly-once-as-a-myth).

- *Use when* — any state-changing operation reachable by a client that might retry:
  payments, order creation, transfers, message sends, provisioning. Per
  [SYSTEM.md](SYSTEM.md#6-architecture-principles), idempotency is required at every
  boundary you do not control.
- *Not when / misapplied* — naturally idempotent operations (a full-document PUT, a
  set-to-value update) need no key. The misapplications are subtle and dangerous:
  the key must be recorded **in the same transaction as the effect**, or a crash
  between them loses the guarantee; the stored response must be returned, not
  recomputed; concurrent requests with the same key must be serialized (a unique
  constraint on the key, not a read-then-write check); keys need a documented
  retention window and a defined behaviour after expiry; and a key derived from
  request content silently breaks when a client legitimately repeats an identical
  operation. A key scoped globally rather than per-client is a cross-tenant leak.
- *In practice* — `POST /payments` with `Idempotency-Key: <uuid>`; the row is
  inserted with a unique index on the key inside the charge transaction; a duplicate
  insert fails the constraint and the handler returns the original response with the
  original status code.

### Outbox pattern

Write an event/message to an outbox table in the *same local transaction* as the
state change, then have a separate process publish it to the broker. Solves the
dual-write problem: without this, a crash between "commit DB" and "publish event"
silently drops the event, or a crash before commit publishes a phantom.

- *Use when* — you need reliable event publishing from a relational database with no
  distributed transaction available. It is the standard answer to "how do I
  guarantee the event is published if-and-only-if the transaction commits."
- *Not when / misapplied* — if your datastore is already the broker (Kafka, a
  change-data-capture pipeline over Postgres), the outbox is redundant. Also,
  publishing from the outbox is at-least-once, so consumers MUST be idempotent — the
  outbox does not guarantee exactly-once, it guarantees at-least-once with a
  committed record. The poller adds latency (typically 1–5 seconds if polling, near-
  zero with CDC). Do not use a separate database for the outbox; the whole point is
  same-transaction.
- *In practice* — `INSERT INTO orders` and `INSERT INTO outbox (event_type,
  payload)` in one transaction; a separate worker SELECTs unprocessed outbox rows,
  publishes them, and marks them sent; consumer handles duplicates with an
  [idempotency key](#idempotency-keys).

### Rate limiting algorithms

Three families, with genuinely different behaviour under burst:

| Algorithm | How it behaves | Allows burst? | Cost |
| --- | --- | --- | --- |
| **Token bucket** | Tokens refill at a fixed rate up to a capacity; each request consumes one | Yes, up to bucket size | Two numbers per key (tokens, last-refill) |
| **Leaky bucket** | Requests enter a fixed-size queue drained at a constant rate | No — smooths output to a constant rate | A queue per key |
| **Sliding window** | Counts requests in the trailing window; log form is exact, counter form approximates | Bounded by the true window count | Log form: one timestamp per request |

**Token bucket** is the default choice for public APIs: it permits a legitimate
burst (a client syncing 50 records at once) while enforcing a sustained average.
**Leaky bucket** is right when the *downstream* cannot absorb burst at all — feeding
a fixed-throughput legacy system or a hardware device. **Sliding window log** is
exact and the correct choice when the limit is contractual or billed, at the cost of
storing every request timestamp. **Fixed window counters** — the naive form — allow
2× the limit across a boundary (all requests at 11:59:59 plus all at 12:00:00), which
is why sliding variants exist.

- *Not when / misapplied* — rate limiting per-instance rather than globally means
  your effective limit is `limit × instance_count` and changes when you autoscale;
  use a shared store. Limiting by IP alone breaks NAT'd corporate users and is
  trivially bypassed; limit by authenticated principal where one exists. A limiter
  that returns 429 without `Retry-After` guarantees clients will retry immediately
  and worsen the problem. And a limiter with no burst allowance rejects normal
  bursty client behaviour, generating support tickets rather than protection.

### Strong consistency and linearizability

**Strong consistency** means a read always returns the most recent committed write.
**Linearizability** is the strictest form: every operation appears to take effect
atomically at a single point between its invocation and its response, so the system
behaves as if there were one copy of the data and one global order of operations.
Linearizable systems are the easiest to reason about and the most expensive to
build, because every operation requires coordination.

- *Use when* — correctness depends on it: account balances, inventory allocation,
  distributed locks, leader election, unique-constraint enforcement, anything where
  two clients acting on stale data causes a real-world loss.
- *Not when / misapplied* — the cost is latency on every operation (a quorum round
  trip at minimum) and unavailability during partitions. Requesting linearizability
  for a user's avatar URL is paying consensus cost for nothing. Two more common
  errors: assuming your database provides it when it does not (a single Postgres
  primary is linearizable; the same cluster read from an async replica is not, and
  "serializable" isolation is a *transaction* property, not a *distributed*
  guarantee), and assuming that per-key linearizability composes into
  multi-key atomicity, which it does not.
- *In practice* — moving money between two accounts needs linearizability or an
  equivalent serialization point. Reading a user's display name does not.

### Split-brain

Two or more partitions of a cluster each believe they are authoritative, accept
writes independently, and diverge. On heal, you have two conflicting histories and
no principled way to merge them.

- *Use when* — assessing any leader-based or master-based system. The defences are
  majority quorum (a minority partition refuses to act), fencing tokens
  (monotonically increasing epoch numbers so a stale leader's writes are rejected by
  the storage layer), and leases with clock-skew margins.
- *Not when / misapplied* — the dangerous belief is that a lease or a heartbeat is
  sufficient. A leader that is paused by a long GC or a VM migration can wake up
  believing it still holds a lease that has expired, and write. **Only a fencing
  token checked at the resource** prevents this — the resource rejects any write
  with an epoch lower than the highest it has seen. Distributed locks without
  fencing are not safe locks, however well-regarded the library.
- *In practice* — two schedulers each dispatching the same job because the network
  partitioned for 30 seconds, resulting in double billing. The fix is a fencing
  token on the job record, not a shorter heartbeat interval.

### Delivery guarantees

| Guarantee | Mechanism | Failure mode | Use when |
| --- | --- | --- | --- |
| **At-most-once** | Send, do not retry | Message can be lost | Loss is acceptable and duplication is not: metrics samples, best-effort notifications |
| **At-least-once** | Retry until acknowledged | Duplicates are certain | Loss is unacceptable. **This is the default choice** |
| **Effectively-once** | At-least-once delivery plus idempotent processing | None, given correct idempotency | Always, when correctness matters |

**At-most-once** is the "fire and forget" model. It is a legitimate choice, but it
must be a deliberate one — accidentally at-most-once (no retry, no acknowledgement,
no dead-letter queue) is a silent data-loss bug.

**At-least-once** is what almost every real broker and RPC-with-retry gives you.
Its consequence is unavoidable: **your consumers WILL receive duplicates**, from
retries, from redelivery after a failed acknowledgement, from consumer rebalances,
and from producer retries after a timeout that actually succeeded.

**Effectively-once** is at-least-once delivery combined with idempotent processing,
producing an end-to-end effect that occurs once. This is the achievable goal and
what people usually mean when they say exactly-once.

### Exactly-once as a myth

**Exactly-once *delivery* is impossible** in an asynchronous network with possible
failures. The proof is simple: after the sender transmits and before it receives an
acknowledgement, it cannot distinguish "message lost" from "acknowledgement lost."
If it retries, it may duplicate; if it does not, it may lose. There is no third
option, and no amount of protocol cleverness removes the ambiguity.

What systems marketed as "exactly-once" actually provide is exactly-once
*processing semantics* within a closed system — Kafka's transactional producer plus
consumer offsets committed atomically with output, or Flink's checkpointed state.
These are real and useful, but they hold only when every participant is inside the
transactional boundary. The moment your consumer calls an external HTTP API, sends
an email, or writes to an unrelated database, the guarantee evaporates, because that
external effect cannot be rolled back with the transaction.

- *Misapplied* — designing a system on the assumption that a broker's exactly-once
  mode means handlers need not be idempotent. It does not, and the resulting
  duplicate-charge bug appears only under failure, which is exactly when you are
  least able to debug it.
- *The rule* — an agent MUST design consumers to be idempotent regardless of the
  broker's advertised guarantee.

### Thundering herd

A large number of clients simultaneously retry or reconnect after a shared event,
overwhelming the recovering dependency. The event trigger varies: a cache entry
expiring, a leader failover completing, a deployment finishing, a circuit breaker
closing, or a popular web page refreshing.

- *Use when* — designing any retry, cache, or backoff policy for a shared resource.
  The defences are jitter (randomized backoff), gradual ramp-up (exponential or
  linear), and backpressure (the dependency rejects new work until recovered).
- *Not when / misapplied* — the mistake is synchronized behaviour. Examples: every
  worker's cache expires at the top of the hour (use a randomized TTL); every client
  retries every 5 seconds without jitter (they arrive in synchronized waves); a
  circuit breaker closing lets all queued requests through at once (admit them
  gradually). The pattern repeats: any shared time boundary, any fixed retry
  interval, any synchronized release of pent-up demand is a herd waiting to happen.
- *In practice* — a cache key for a popular item expires; 10,000 concurrent requests
  all miss, all query the database, and the database falls over under a load spike
  it would never see during normal operation. The fix is probabilistic early
  expiration: 1% of requests treat the cached value as expired 10 seconds early and
  refresh it, serializing the regeneration.

### Cascading failure

A failure in one component overloads its dependencies or dependents, causing them to
fail, propagating the failure across the system. The classic dynamic: a node fails,
its traffic shifts to peers, the peers become overloaded and fail, repeat until the
whole tier is down.

- *Use when* — capacity planning, setting timeouts, designing retry policy, and
  choosing circuit-breaker thresholds. Every pattern that limits blast radius
  ([bulkhead](#circuit-breaker-bulkhead-and-backpressure), [circuit breaker](#circuit-breaker-bulkhead-and-backpressure),
  [backpressure](#circuit-breaker-bulkhead-and-backpressure), load shedding) exists to prevent cascades.
- *Not when / misapplied* — the root cause is usually traffic amplification:
  retries, background jobs that trigger on failure, monitoring that generates more
  load than the system under test, or a thundering herd. Another contributor is
  insufficient margin — running at 80% capacity means losing one of five nodes
  pushes the remainder to 100% and they tip. The failure mode most people miss:
  **success can cascade too.** A cache or circuit breaker heals, releasing a flood of
  queued requests, and the flood takes down the thing that just recovered.
- *In practice* — an API sees elevated latency, clients time out and retry, the
  retries double the load, latency climbs further, more timeouts, more retries,
  until the API returns only timeouts. The circuit breaker that would have stopped
  it was never deployed.

### Clock skew and why wall-clock ordering fails

Clocks on different machines drift apart, and NTP corrections are discontinuous
jumps, not smooth adjustments. Using wall-clock timestamps to order events across
nodes produces non-causal orderings: event A can have an earlier timestamp than
event B yet causally depend on B, because A's clock was ahead.

- *Use when* — you need it only to log a human-readable time or to schedule future
  work. For ordering, use logical clocks (Lamport timestamps, vector clocks) or a
  central sequencer.
- *Not when / misapplied* — ordering events by `System.currentTimeMillis()` across
  services produces causality violations visible to users: a message-received event
  timestamped before message-sent. The classic failure is last-write-wins conflict
  resolution keyed on wall-clock timestamp — two concurrent writes to different
  replicas with clocks skewed 100ms apart consistently pick the "winner" based on
  which node's clock is fast, not based on what actually happened last. Even with
  perfect NTP, clock smearing during leap seconds, VM migrations pausing a process,
  and long GC pauses all violate the assumption that elapsed time equals clock
  difference.
- *In practice* — Google Spanner uses TrueTime (bounded clock uncertainty) and waits
  out the uncertainty bound to provide external consistency. For everyone else: use
  causal sequence numbers from a single writer, hybrid logical clocks, or accept
  that cross-node ordering is partial, not total.

### Distributed tracing

Propagate a trace context (trace ID, span ID, parent) across every service hop, so
a single request's full path — with timing per span — is reconstructable. Without it,
debugging a multi-service latency problem is guesswork; the question "where did those
900ms go?" is unanswerable from logs alone.

- *Use when* — you have more than one service, or one service with several external
  dependencies. It MUST exist before you adopt [microservices](#microservices), not
  after. Use W3C Trace Context and OpenTelemetry rather than a proprietary format.
- *Not when / misapplied* — the failures are all about incompleteness. A trace that
  breaks at an async boundary (a queue that does not carry the context) gives you two
  disconnected half-traces. Sampling at 0.1% means the slow request you were asked
  about is not in the data — use tail-based sampling to keep the slow and failed
  traces. Traces without the corresponding log lines correlated by trace ID force you
  to search two systems. And spans without meaningful attributes (which query, which
  tenant, which retry attempt) tell you where time went but not why.
- *In practice* — one trace ID visible in the log line, the error tracker, and the
  trace viewer turns a 40-minute investigation into a 2-minute one.

---

## 6. Twelve-Factor App

A set of practices for services that must be deployed repeatedly and scaled
horizontally. It is dated in places — it predates containers and assumes a particular
platform model — but the core insight holds: **a deployable service should carry no
state and no environment-specific knowledge inside itself.**

**When it does not apply:** desktop and mobile applications, embedded systems,
batch-only data pipelines, and anything with genuinely local state such as a database
node. Applying "stateless processes" to a stateful system is not rigour, it is
category error.

1. **Codebase** — one codebase in version control, many deploys. *Fails when* one repo
   is deployed as several genuinely independent services with divergent lifecycles;
   that is several codebases wearing a trench coat.
2. **Dependencies** — declare and isolate explicitly; never rely on system-wide
   packages. *The failure* is the implicit dependency: a binary that happens to be on
   the build machine and is absent in production.
3. **Config** — store configuration that varies between deploys in the environment.
   *Misapplied* as "everything in environment variables", producing 80 undocumented
   variables and a service nobody can start locally. Secrets belong in a secret
   manager; see [Configuration standards](STANDARDS.md#25-configuration-standards).
4. **Backing services** — treat databases, queues, and caches as attached resources
   addressed by URL, swappable without a code change.
5. **Build, release, run** — strictly separate. A release is an immutable build plus
   config, with a version. *The violation* is editing code on a running instance,
   which makes the deployed state unreproducible.
6. **Processes** — stateless and share-nothing; persist everything to a backing
   service. *The violation is sticky sessions*, which appear to work until a deploy
   drops every logged-in user.
7. **Port binding** — the service exports itself by binding a port, rather than
   requiring injection into an external web server.
8. **Concurrency** — scale out by running more processes. *Not when* the workload is a
   single-writer or coordination-bound problem, where more processes add contention.
9. **Disposability** — fast startup, graceful shutdown on SIGTERM: stop accepting new
   work, finish in-flight work, close connections. *Most commonly violated* — a
   service that dies instantly on SIGTERM drops requests on every deploy and every
   autoscale event.
10. **Dev/prod parity** — keep environments as similar as possible. *The violation* is
    SQLite locally and PostgreSQL in production, which hides an entire class of bug
    until it is expensive.
11. **Logs** — write to stdout as an event stream; let the platform handle routing and
    retention. *The violation* is the application managing its own log files and
    rotation, which breaks in a container.
12. **Admin processes** — run migrations and one-off tasks as processes against an
    identical release, not by hand on a production box.

---

## OWASP Top 10

The ten most critical web application security risks. Read this as a checklist of
**what an attacker will try**, not as a compliance exercise. Enforcement rules are in
[Security standards](STANDARDS.md#10-security-standards); the review procedure is the
[Security Review workflow](WORKFLOW.md#15-security-review-workflow).

**A01 — Broken Access Control.** The most common and most damaging category. The
authorization check is missing, applied only in the UI, or checks authentication
where it needed to check ownership.
- *Watch for* — IDOR: changing `/invoices/1042` to `/invoices/1043` and getting
  someone else's invoice. Enforce ownership server-side on every request, never by
  hiding the link.

**A02 — Cryptographic Failures.** Sensitive data unencrypted in transit or at rest,
weak or home-grown algorithms, secrets in source control.
- *Watch for* — passwords hashed with a fast general-purpose hash instead of a
  password-hashing function with a work factor; TLS terminated at the edge and plain
  HTTP internally, on the assumption that "internal" means "trusted".

**A03 — Injection.** Untrusted input interpreted as code or as part of a command:
SQL, OS commands, LDAP, XPath, template expressions.
- *Watch for* — any string concatenation that builds a query or command. Parameterize.
  Note that ORMs do not make you immune — raw fragments and dynamic ordering clauses
  are the usual holes.

**A04 — Insecure Design.** The vulnerability is in the design, not the code: no rate
limiting on a password reset, a business flow that can be replayed, a trust boundary
that was never drawn.
- *Watch for* — this is the one you cannot patch later. Threat-model before building
  anything handling money, credentials, personal data, or irreversible actions; use
  the [Threat Model template](TEMPLATES.md#16-threat-model).

**A05 — Security Misconfiguration.** Default credentials, verbose errors exposing
stack traces, unnecessary features enabled, permissive CORS, missing security
headers, publicly readable object storage.
- *Watch for* — the difference between the developer configuration that made local
  work convenient and the production configuration nobody reviewed.

**A06 — Vulnerable and Outdated Components.** A dependency with a known CVE, or one
that is unmaintained.
- *Watch for* — transitive dependencies, which are where most of these live. Scan in
  CI, and treat "no upstream fix available" as a decision requiring an owner and a
  date, not a shrug.

**A07 — Identification and Authentication Failures.** Credential stuffing, weak
session management, session fixation, tokens that do not expire, missing
multi-factor authentication on privileged accounts.
- *Watch for* — session identifiers not rotated on privilege change, and password
  reset flows that leak whether an account exists.

**A08 — Software and Data Integrity Failures.** Trusting code or data from an
untrusted source: unsigned updates, an unpinned build dependency, insecure
deserialization of attacker-controlled data.
- *Watch for* — deserializing untrusted input into arbitrary types, which is remote
  code execution in most languages. Also CI pipelines that execute code from a pull
  request with production credentials in scope.

**A09 — Security Logging and Monitoring Failures.** The breach happened and nobody
noticed, or the evidence needed to reconstruct it was never recorded.
- *Watch for* — authentication failures, authorization denials, and privileged actions
  that are not logged with actor, action, target, and time. Also the inverse failure:
  logging the credential itself.

**A10 — Server-Side Request Forgery (SSRF).** The server fetches a URL supplied by a
user, and the attacker points it at internal infrastructure or a cloud metadata
endpoint.
- *Watch for* — any feature that fetches a user-supplied URL: webhooks, image imports,
  link previews, PDF renderers. Allowlist destinations, resolve and validate the IP
  after DNS resolution, and block link-local and private ranges.

**Prompt injection** is not in the OWASP web Top 10 but belongs in the same mental
category and is covered by [AI systems standards](STANDARDS.md#19-ai-systems-standards):
content that enters a model's context — retrieved documents, user text, tool output —
is data, never instruction. The trust boundary must be stated in the design, because
it cannot be enforced by the model.

---

## 8. Testing knowledge

Tests exist to let you change code without fear. Every other justification —
coverage numbers, process compliance, proving the code works — is downstream of
that one. A test suite that does not increase your willingness to refactor is
overhead, however green it is.

### The test pyramid, and what it actually claims

Many fast unit tests, fewer integration tests, fewer still end-to-end tests. The
claim is about *cost per unit of confidence*, not about morality.

- *Use when* — as a default shape for a system with real business logic. The ratio
  follows from mechanics: unit tests are fast and precise about failure location;
  end-to-end tests are slow, flaky, and tell you only that something, somewhere, broke.
- *Not when / misapplied* — as a quota. Teams that treat the pyramid as a target write
  unit tests for code that has no logic — getters, DTO mappers, framework glue — to
  hit a shape, and the suite becomes a change-detector that fails on every refactor
  without ever catching a bug. Also wrong for systems that *are* mostly integration:
  a service whose entire job is orchestrating three APIs has almost no unit-testable
  logic, and its pyramid is legitimately a diamond or an inverted triangle.
- *In practice* — pricing rules, state machines, and validation get exhaustive unit
  tests. The repository layer gets integration tests against a real database. Two or
  three end-to-end tests cover the revenue paths. That is the whole suite.

### The testing trophy

Kent C. Dodds' reweighting: heaviest on integration, with static analysis (types,
linting) as the base. The argument is that the type checker already catches what many
unit tests were written to catch, and integration tests catch the bugs that actually
occur — in the wiring between units.

- *Use when* — the codebase is strongly typed, and the units are thin. Common in
  frontend and in typical CRUD services.
- *Not when / misapplied* — when the domain logic is genuinely complex. You cannot
  integration-test your way through a tax engine's edge cases; the combinatorics
  demand unit tests. Treat trophy vs. pyramid as a question about where your bugs
  come from, answered with your own defect data, not as a doctrinal choice.

### Arrange–Act–Assert (Given–When–Then)

Structure every test in three visually separate blocks: set up state, perform one
action, assert on the result.

- *Use when* — always. It is free and it makes an unfamiliar test readable in seconds.
- *Not when / misapplied* — multiple act blocks in one test. If a test acts twice, it
  is testing a sequence, and when it fails you do not know which step broke it. Split
  it, or name it explicitly as a scenario test and accept the diagnostic cost.
- *In practice* — a blank line between the three sections is enough. Comments naming
  them are noise once the convention is established.

### Test doubles: dummy, stub, spy, mock, fake

Five distinct things, routinely all called "mocks":

- **Dummy** — passed to satisfy a signature, never used.
- **Stub** — returns canned answers. No assertions on it.
- **Spy** — a stub that records how it was called, checked afterward.
- **Mock** — has pre-programmed expectations and fails the test itself if they are
  not met.
- **Fake** — a working lightweight implementation: an in-memory repository, a local
  queue.

- *Use when* — stub for inbound data you do not control; fake for a collaborator you
  call many times; spy when the *call itself* is the observable outcome (an email
  sent, an event published).
- *Not when / misapplied* — mocking types you do not own. When you mock a third-party
  SDK, you encode your belief about its behaviour, and the test passes forever while
  production fails, because your belief was wrong. Wrap it in your own interface
  ([Anti-Corruption Layer](#anti-corruption-layer)) and fake that instead. The second
  failure is mock-heavy tests that assert on interactions rather than outcomes: they
  pin the current implementation in place and fail on every legitimate refactor. If a
  test breaks when behaviour did not change, the test was wrong.
- *In practice* — an in-memory `UserRepository` fake used by two hundred tests is
  worth more than two hundred mock setups, and it is one file to fix when the
  interface changes.

### Test-Driven Development

Red, green, refactor: write a failing test, make it pass with the simplest thing,
then clean up with the tests as a safety net.

- *Use when* — the requirements are clear and the design is uncertain. TDD is at its
  strongest for algorithmic work, bug fixes (write the failing test that reproduces
  it first — always), and any code where you can state the expected output before you
  know how to produce it.
- *Not when / misapplied* — exploratory work where you do not yet know what you are
  building; UI layout; spikes. TDD on an unknown design produces tests for a design
  you are about to throw away. The classic misapplication is skipping the refactor
  step — the third step is where the design benefit lives, and a team that does
  red-green-red-green just writes tests first and gets none of the payoff.
- *In practice* — the non-negotiable case is the bug fix. A fix without a test that
  failed before it is a fix you cannot prove and a regression waiting to recur, per
  [PLAYBOOKS.md#4](PLAYBOOKS.md#4-fixing-a-production-bug).

### Property-based testing

Instead of asserting on examples, state a property that must hold for all inputs and
let the framework generate hundreds of cases, shrinking any failure to a minimal
counterexample.

- *Use when* — the code has invariants: round-trip serialization
  (`decode(encode(x)) == x`), idempotence, commutativity, ordering, or any parser.
  Also strong for finding the input classes your example tests never imagined —
  empty, unicode, enormous, negative zero.
- *Not when / misapplied* — where properties are hard to state without reimplementing
  the function under test. If your property is "the result equals what the algorithm
  would produce", you have written the algorithm twice and tested nothing. Also,
  generated tests are slower and non-deterministic in failure; pin the seed and add
  the shrunk counterexample as a permanent example test when one is found.

### Mutation testing

Automatically inject faults into the code and check that a test fails. The score is
the fraction of mutants killed — a direct measure of whether the assertions are real.

- *Use when* — auditing a suite whose coverage looks good and whose defect rate does
  not. It finds the tests that execute code without asserting anything meaningful.
- *Not when / misapplied* — as a routine CI gate; it is expensive (minutes to hours)
  and produces equivalent mutants that can never be killed, which turn into permanent
  false failures. Run it periodically on the critical modules.

### Coverage, and Goodhart's Law

Line coverage measures which lines executed. It does not measure whether anything was
asserted, whether the important paths were tested, or whether the tests would catch a
regression.

- *Use when* — as a *detector of untested areas*. A module at 5% coverage is a real
  signal. Branch coverage is more informative than line coverage.
- *Not when / misapplied* — as a target. See [Goodhart's Law](#goodharts-law):
  mandate 90% and you get 90%, delivered by tests that call every function and assert
  nothing. Coverage is a floor for conversation, not a gate for merge. Test the
  behaviour that matters and let the number land where it lands — but investigate any
  *drop*, because that is a change in habit.

### Flaky tests

A test that passes and fails on the same code. The usual causes: time and timezones,
shared state between tests, test-order dependence, real network calls, unawaited
async work, and race conditions in the code under test.

- *In practice* — a flaky test is worse than no test, because it teaches the team to
  re-run CI rather than read failures, and that habit is what lets a real failure
  through. Quarantine it immediately, file it with an owner and a date, and fix or
  delete it. Never "fix" flakiness by adding a sleep or a retry to the test — a retry
  hides a race that your users will eventually hit. And consider that the flake may
  be reporting a real concurrency bug, which is the outcome you least want to
  suppress.

### Characterization tests

Tests written against existing behaviour — correct or not — to pin it down before you
change the structure around it.

- *Use when* — refactoring or extracting from legacy code with no test coverage. You
  do not need to know whether the behaviour is right; you need to know whether you
  changed it. Required by
  [PLAYBOOKS.md#15](PLAYBOOKS.md#15-large-refactoring).
- *Not when / misapplied* — treating them as permanent specifications. They encode
  bugs as requirements. Mark them as characterization, and as the real behaviour is
  understood, replace them with intentional tests.

### Contract testing

Each side of a service boundary tests against a shared contract — the consumer
publishes what it needs, the provider verifies it can supply it — rather than the two
being tested together in an integrated environment.

- *Use when* — independently deployed services, especially where end-to-end
  environments are slow or unreliable. It catches breaking changes at the provider's
  CI rather than in staging.
- *Not when / misapplied* — inside a monolith, where the compiler already does this.
  Also, contract tests verify shape and stated semantics; they do not verify that the
  provider's *behaviour* is correct, and teams routinely over-trust them.

### The test naming rule

A test name states the condition and the expected outcome, so a failure in CI is
diagnosable without opening the file.
`rejects_withdrawal_when_balance_below_amount` tells you what broke.
`testWithdraw2` does not.

---

## 9. Performance knowledge

Performance work without measurement is guessing, and guessing has a bad track
record: the bottleneck is almost never where an experienced engineer's intuition puts
it. The rule is absolute — profile first, and profile the environment you care about,
because a laptop and a production container do not share a performance model.

### Amdahl's Law

The speedup from optimizing part of a system is bounded by the fraction of total time
that part consumes. Making a component that takes 5% of runtime infinitely fast buys
5%.

- *In practice* — this is the argument for profiling before optimizing, stated
  mathematically. It also sets the exit condition: once the largest remaining
  contributor is small, further work on it cannot pay, however satisfying it is.

### Latency numbers worth internalizing

Orders of magnitude, not exact figures: L1 cache ~1ns, main memory ~100ns, an SSD
random read ~100µs, a same-datacenter network round trip ~500µs, a cross-continent
round trip ~150ms. A disk seek is ~100,000× a memory access. A network call is
~1,000× a local disk read.

- *In practice* — this is why N+1 queries are catastrophic and why chattiness across
  a service boundary dominates everything else in a distributed system. One call
  returning 100 rows beats 100 calls returning one row by roughly two orders of
  magnitude, regardless of how fast each service is.

### Latency vs. throughput

Latency is the time for one operation; throughput is operations per unit time. They
are not the same axis, and they frequently trade against each other: batching raises
throughput and raises latency; more concurrency raises throughput until queueing
raises latency past the point of usefulness.

- *In practice* — state which one your SLO is about before optimizing. "Make it
  faster" is not a requirement. "p99 under 200ms at 500 rps" is.

### Percentiles, and why the mean lies

Report p50, p95, p99, p99.9 — never a mean. A mean hides the tail entirely, and the
tail is where your users are: at 100 requests per page load, a p99 of 2s means most
page loads contain a 2s request.

- *In practice* — averages of percentiles are meaningless (you cannot average p99
  across shards). Aggregate from histograms. And measure at the client where you can:
  server-side latency excludes queueing, DNS, TLS, and the network, which is most of
  what the user experiences.

### Little's Law

`L = λW`: the average number of items in a system equals arrival rate times average
time in system. Concurrency = throughput × latency.

- *In practice* — it sizes pools with arithmetic instead of opinion. At 200 rps with
  50ms average service time you need ~10 concurrent workers; if latency degrades to
  500ms, you need 100 for the same throughput, and if you do not have them, the queue
  grows without bound. This is the mechanism behind most cascading failures.

### The USE method and the RED method

Two complementary diagnostic checklists. **USE** (for resources: CPU, memory, disk,
network): check Utilization, Saturation, and Errors for every resource. **RED** (for
services): Rate, Errors, Duration for every endpoint.

- *In practice* — during an incident, walking USE across resources and RED across
  services finds the layer at fault faster than reading dashboards in the order they
  happen to be arranged. Saturation is the one most often missing from dashboards and
  the one that most often explains the outage — utilization at 100% tells you less
  than a run queue depth of 40.

### N+1 queries

One query to fetch a list, then one query per item. The canonical ORM performance
bug: fast with 10 rows in development, fatal with 10,000 in production.

- *In practice* — fix with eager loading, a join, or a batched `IN` query — and add a
  test that asserts the query count, because the bug returns the moment someone adds
  an innocuous field to a serializer. Detect it by logging query counts per request in
  development and failing loudly above a threshold.

### Indexing

An index turns a table scan into a lookup at the cost of write amplification and
storage.

- *Use when* — a column appears in a `WHERE`, `JOIN`, or `ORDER BY` on a table with
  meaningful volume. Composite index column order follows the query's predicate order,
  most-selective usually first; a covering index avoids touching the table at all.
- *Not when / misapplied* — indexing every column. Each index is paid for on every
  insert, update, and delete, and unused indexes are pure cost — most databases can
  report them. A low-cardinality index (a boolean, a status with three values) is
  usually not used by the planner at all. Always confirm with the actual query plan;
  the planner's opinion is the only one that counts.

### Caching

The fastest work is work not done. Every cache introduces a consistency problem, so
the question is never "should we cache" but "what staleness is acceptable, and who
invalidates".

- *Not when / misapplied* — caching to hide a query that should be fixed. A cache in
  front of an unindexed query means the first user after every eviction pays the full
  cost and your p99 is unchanged. Fix the query, then decide about the cache. Also,
  cache invalidation complexity grows superlinearly with the number of caches — an
  HTTP cache, a CDN, an application cache, and an ORM cache in the same request path
  produce staleness that nobody can reason about.
- *In practice* — see [Cache-aside](#cache-aside--write-through--write-behind) for
  the strategies and their failure modes.

### Connection pooling

Establishing a database or TLS connection costs a round trip or several; pool and
reuse them.

- *In practice* — pool sizing is a common outage cause in both directions. Too small
  and requests queue for a connection while the database is idle. Too large and you
  exhaust the database's connection limit, at which point every service fails at
  once. Size with [Little's Law](#littles-law), and remember that the total across
  all instances is what the database sees.

### Premature optimization, precisely

Knuth's line is "premature optimization is the root of all evil" — but the full
sentence exempts the critical 3%, and the point was about *unmeasured* optimization,
not about ignoring performance.

- *In practice* — architectural performance decisions (data model, service
  boundaries, sync vs. async, the shape of the API) are extremely expensive to
  reverse and MUST be reasoned about early. Micro-optimizations inside a function are
  cheap to defer and should be. The distinction is reversibility, not timing.

### Load testing vs. stress testing vs. soak testing

**Load** — expected traffic, verifying the SLO holds. **Stress** — increasing until
something breaks, to find the limit and see *how* it breaks. **Soak** — sustained
load for hours, to find leaks, unbounded caches, and connection exhaustion.

- *In practice* — most teams run load tests only, and therefore discover their
  breaking point in production during a spike. Stress testing tells you the number to
  put in your capacity plan and whether the system degrades or collapses; soak
  testing finds the bugs that only appear after the tenth hour, which are the ones
  that page you at 3am.

---

## 10. Data knowledge

Data outlives code. You will rewrite the application three times on the same schema,
and every mistake in the data model will still be there, now with five years of rows
depending on it. Schema decisions are the least reversible decisions in the system
and MUST be treated as such per
[SYSTEM.md#7](SYSTEM.md#7-decision-framework).

### Normalization, and when to stop

First through third normal form: eliminate repeating groups, eliminate partial
dependencies, eliminate transitive dependencies. The goal is one fact in one place,
so an update cannot leave the database self-contradictory.

- *Use when* — as the default for transactional data. 3NF is right for almost every
  OLTP schema, and departures from it need a stated reason.
- *Not when / misapplied* — analytical workloads, where star schemas and wide
  denormalized tables exist for good reason, and read paths where a join has been
  measured as the bottleneck. Denormalize *deliberately*, with a documented owner for
  keeping the copies consistent and a reconciliation job that detects drift.
  Accidental denormalization — a `user_name` copied into `orders` because it was
  convenient — is how you end up with three spellings of the same customer.
- *In practice* — normalize, measure, then denormalize the specific read path that
  needs it, ideally as a [materialized view](#materialized-views) so the duplication
  is derived rather than hand-maintained.

### ACID

**Atomicity** — all or nothing. **Consistency** — constraints hold before and after.
**Isolation** — concurrent transactions do not observe each other's intermediate
state. **Durability** — a committed write survives a crash.

- *In practice* — the letter engineers misjudge is Isolation, because databases do not
  default to full isolation. Read Committed (the PostgreSQL default) permits
  non-repeatable reads and phantoms; MySQL's Repeatable Read permits write skew.
  Read-modify-write logic that is correct under Serializable is silently wrong under
  Read Committed, and this class of bug does not appear in testing — it appears under
  concurrency in production. Know your engine's default, and use `SELECT … FOR UPDATE`
  or an explicit isolation level where an invariant spans rows.

### Isolation levels and the anomalies they permit

- **Read Uncommitted** — dirty reads. Effectively never correct.
- **Read Committed** — no dirty reads; non-repeatable reads and phantoms possible.
- **Repeatable Read** — no non-repeatable reads; phantoms possible (depending on
  engine); write skew possible.
- **Serializable** — as if transactions ran one at a time; costs throughput and
  produces serialization failures the application MUST retry.

- *In practice* — write skew is the anomaly worth memorizing: two transactions each
  read a set, each decide their write is safe, and together they violate the
  invariant. "At least one doctor must be on call" is the textbook case and it fails
  at Repeatable Read. Enforce such invariants with a constraint, a lock, or
  Serializable — never with a read followed by a write.

### Optimistic vs. pessimistic concurrency control

**Optimistic** — read a version number, write conditionally on it being unchanged,
retry on conflict. **Pessimistic** — take a lock before reading, hold it through the
write.

- *Use when* — optimistic for low-contention, short transactions and any HTTP
  request-scoped edit (it is also the correct answer to the lost-update problem in a
  web form). Pessimistic when contention is high and retries would thrash, or when the
  work between read and write is expensive.
- *Not when / misapplied* — optimistic locking without a retry path just moves the
  error to the user as "someone else changed this record"; decide the UX. Pessimistic
  locks held across a network call or a user's think-time are how you get lock
  timeouts and deadlocks under load.

### Transaction boundaries

A transaction should be exactly as wide as the invariant it protects.

- *In practice* — two failure modes, symmetrical. Too narrow: two writes that must
  both happen are in separate transactions, and a crash between them leaves the system
  inconsistent — the classic case is inserting a row and publishing an event, which is
  what the [Outbox pattern](#outbox-pattern) exists to fix. Too wide: the transaction
  wraps an HTTP call to a payment provider, holding row locks for two seconds and
  serializing your entire checkout path. Never do I/O to an external system inside a
  transaction.

### Primary keys: surrogate, natural, UUID, ULID

- *Auto-incrementing integer* — compact, index-friendly, sequential. Leaks volume and
  ordering, and is awkward when rows are created in multiple places (multi-region,
  offline clients).
- *UUIDv4* — generatable anywhere without coordination, no information leak. Random,
  so it fragments B-tree indexes and hurts insert performance and locality at volume.
- *ULID / UUIDv7* — time-ordered and still client-generatable. Usually the right
  default for a distributed system: index locality plus decentralized generation.
- *Natural key* — email, ISBN, country code. Avoid as a primary key: natural keys
  change (people change email addresses, countries change codes), and a changing
  primary key means cascading updates through every referencing table. Enforce it as a
  unique constraint and keep a surrogate primary key.

### Foreign keys and referential integrity

- *In practice* — enforce referential integrity in the database. The argument that the
  application will enforce it is wrong in every system with more than one writer, and
  every system eventually has more than one writer: a migration script, a data fix, a
  second service, an analytics job. Orphaned rows are unrecoverable in the general
  case, because nobody knows what the missing parent was. Choose the `ON DELETE`
  behaviour explicitly — `CASCADE` deletes data, `RESTRICT` blocks the delete, `SET
  NULL` needs a nullable column and a meaning for null — and never leave it to the
  default.

### Soft deletes

A `deleted_at` column instead of a `DELETE`.

- *Use when* — the record must be recoverable, is referenced by history or audit, or
  regulation forbids destruction.
- *Not when / misapplied* — as a default for everything, which is the common outcome.
  The cost is that every query in the system must remember `WHERE deleted_at IS NULL`,
  and the one that forgets is a data leak — a "deleted" user reappearing in a list is
  the mild version; a deleted-but-returned record in an authorization check is the
  serious one. Unique constraints also break: two rows with the same email, one
  soft-deleted, violates a naive unique index. If you soft-delete, enforce the filter
  at the data-access layer where it cannot be forgotten, use partial unique indexes,
  and note that soft deletion does *not* satisfy a GDPR erasure request.

### Migrations

- *In practice* — every migration MUST be reversible or accompanied by a tested
  forward-fix path, and MUST be tested against production-shaped data volume before
  it runs in production. Locking behaviour is what bites: adding a column with a
  non-null default, adding an index without `CONCURRENTLY`, or changing a column type
  can take an exclusive lock on a large table and stop the application. Long
  backfills belong in a batched, resumable job with a progress record, not in the
  migration itself. Follow [Expand-Migrate-Contract](#expand-migrate-contract) and
  [PLAYBOOKS.md#12](PLAYBOOKS.md#12-running-a-database-migration-safely).

### Choosing a data store

- *Relational* — the default. Choose it unless you can name the specific property it
  lacks. Transactions, constraints, ad-hoc queries, and forty years of operational
  knowledge are hard to give up, and modern engines handle document data adequately
  via JSON columns.
- *Document* — genuinely variable or deeply nested schemas, or aggregate-per-document
  access with no cross-document queries. The failure mode is choosing it for
  "flexibility" and then discovering the schema was always there, just unenforced and
  now inconsistent across five years of documents.
- *Key-value* — caches, sessions, rate-limit counters. Fast and simple; no queries.
- *Wide-column* — very high write volume with known query patterns designed up front.
  You model the table per query, and changing the query pattern later means a new
  table and a backfill.
- *Graph* — when traversal depth is variable and the relationships are the data
  (fraud rings, permissions hierarchies, recommendations). Rarely the primary store.
- *Time-series* — metrics and events with time-ordered writes, retention policies,
  and downsampling. Do not build this on a relational table; the write and retention
  patterns are wrong.
- *Search* — full-text relevance, faceting, fuzzy matching. Always a secondary index
  over a source of truth, never the source of truth, because it will need to be
  rebuilt.
- *Vector* — embedding similarity for retrieval. See
  [section 11](#11-ai-engineering-best-practices).

- *In practice* — polyglot persistence is a real cost: each store is another thing to
  back up, monitor, patch, secure, and reason about consistency across. Two stores
  need a justification; four need an architecture review.

### Data modelling for time

- *In practice* — store timestamps in UTC with an explicit type, and store the
  original timezone separately when the local wall-clock time is part of the meaning
  (a calendar appointment is at 9am local even if the offset changes). Never store
  local time alone. Distinguish *event time* from *ingestion time* — they diverge, and
  analytics computed on the wrong one is silently wrong. Use half-open intervals
  `[start, end)` for ranges, which eliminates the entire class of off-by-one-second
  boundary bugs. And remember that dates without times still have timezones: "today"
  depends on where the user is.

### Audit trails and event history

- *In practice* — if the business ever asks "who changed this and when", the answer
  must come from an append-only record, not from a mutable row's `updated_by`. Decide
  early: an audit log is cheap to add at the start and expensive to reconstruct after
  the fact, because the history simply does not exist. Keep audit records immutable
  and outside the reach of the application's normal write path.

### Backups, and the only test that counts

- *In practice* — a backup that has never been restored is not a backup, it is a
  belief. Restore into a scratch environment on a schedule, verify row counts and
  spot-check content, and record the date and the measured restore duration; that
  duration is your real RTO, and it is usually much worse than assumed. Verify that
  backups are encrypted, that their retention matches both the regulatory requirement
  and the maximum plausible time-to-detect for silent corruption, and that they are
  not deletable by the same credentials that can delete production — a compromised
  credential that can wipe both is not a backup strategy. See
  [PLAYBOOKS.md#7](PLAYBOOKS.md#7-responding-to-a-data-loss-or-corruption-event).

### PII and data classification

- *In practice* — you cannot protect data you have not classified. Label every field
  as public, internal, confidential, or regulated, and let the label drive encryption,
  retention, logging, and access control. The commonest breach is not an exotic
  exploit; it is PII in a log line, a stack trace, an error report, or an analytics
  event, shipped to a third party that was never in scope for a review. Minimize
  collection — data you do not hold cannot leak — and set a retention period for
  everything, because "keep forever" is a decision with unbounded liability. See
  [STANDARDS.md#10](STANDARDS.md#10-security-standards).

### Cache-aside / Write-through / Write-behind

Three caching strategies with different consistency models:

**Cache-aside (lazy loading).** The application reads from cache; on a miss, it
reads from the database and populates the cache. Writes go directly to the database
and invalidate (or do not update) the cache. The application owns the cache logic.

**Write-through.** Writes go to the cache and the database synchronously. Every
written value is immediately in cache; reads are always a cache hit after the first
write. The cache owns consistency.

**Write-behind (write-back).** Writes go to the cache immediately and to the
database asynchronously. Fastest write path; highest data-loss risk on cache
failure.

- *Cache-aside* — use for read-heavy, write-infrequent data with acceptable
  staleness. Simple. A cache miss under high load creates a thundering herd;
  mitigate with probabilistic early expiry or a read-through lock.
- *Write-through* — use when read-after-write consistency matters and write latency
  is acceptable. Wastes cache space on data that is written but never read.
- *Write-behind* — use only where write throughput is the constraint and some data
  loss is acceptable (metrics aggregation, activity tracking). Do not use for
  financial or user-critical data.
- *Not when / misapplied* — caching mutable data without a TTL or invalidation
  strategy is how stale data reaches production and stays there until someone
  restarts the app. Cache-aside with no stampede protection under high concurrency
  produces coordinated database load on every popular-key expiry. The biggest
  mistake: caching the wrong things (data that changes per-user, data with
  authorization constraints, data that changes on every write).

### Sharding

Partition data across multiple database nodes by a shard key, so each node holds a
fraction of the total data and the full dataset fits nowhere as one unit.

- *Use when* — data volume or write throughput has exceeded what a single database
  node (including read replicas and vertical scaling) can handle. This is a late
  resort; the costs are severe.
- *Not when / misapplied* — prematurely, which is almost universal. Almost every
  system that introduces sharding before it is required pays the operational cost
  forever while never exceeding a few million rows. The ordering of options before
  sharding: better queries and indexes, connection pooling, vertical scaling, read
  replicas, partitioning (range or list, within one instance), caching. Sharding
  breaks cross-shard joins, cross-shard transactions, and cross-shard aggregations;
  if your access patterns require any of those, you chose the wrong shard key or
  the wrong architecture.
- *In practice* — a multi-tenant SaaS sharding by `tenant_id` is idiomatic: queries
  are almost always scoped to one tenant, cross-tenant aggregations happen in a
  separate analytics pipeline, and tenants can be migrated between shards without
  downtime.

### Read replicas

Route read queries to replicas that asynchronously receive changes from the primary,
freeing the primary for writes. The replication lag (typically milliseconds, but
unbounded under load) means replicas are eventually consistent with the primary.

- *Use when* — read load is the constraint, not write load. Reporting, analytics,
  and secondary indexes that are expensive to maintain on the primary.
- *Not when / misapplied* — for read-your-writes use cases without explicit handling.
  A user creates a record and the next read goes to a replica that has not received
  the write yet — they see no record and think their action failed. This is
  documented behaviour, not a bug, and it must be designed for: route post-write
  reads to the primary for a window, use a session-consistent replica, or re-fetch
  after a delay. Also, replicas are often used to "move load off the primary" for
  queries that are fundamentally expensive and should instead be refactored.

### Materialized views

Precomputed query results stored as a table, updated on a schedule or on write,
serving reads without the join cost. They trade storage and write amplification for
read speed.

- *Use when* — a query is expensive, the underlying data changes infrequently
  relative to how often the query runs, and staleness within the refresh interval is
  acceptable. Dashboards, aggregate counts, denormalized search tables.
- *Not when / misapplied* — when freshness is critical (the view will always be
  one refresh cycle behind), or when write amplification is unacceptable (every
  write to the source table triggers a view refresh). Materialized views in most
  databases are all-or-nothing refreshes; incremental refresh is a rarer feature.
  Do not use them as a substitute for a proper query optimization.

### Expand-Migrate-Contract

The three-phase pattern for making a breaking change non-breaking, applicable to
database schemas, API contracts, and event formats:

1. **Expand.** Add the new structure alongside the old. Write to both. Deploy. Both
   versions of the application work.
2. **Migrate.** Backfill existing data into the new structure. Move readers to the
   new structure. Verify. Deploy.
3. **Contract.** Once nothing reads or writes the old structure — verified by
   telemetry, not assumption — remove it. Deploy.

- *Use when* — any schema or contract change in a system that cannot take downtime,
  which includes anything using rolling, canary, or blue-green deployment. Renaming
  a column, splitting a field, changing a type, removing an API parameter.
- *Not when / misapplied* — genuinely single-version systems with a maintenance
  window, where a single migration is simpler. The dominant failure is **never
  contracting**: the expand phase ships, the system works, and the old column stays
  for three years with ambiguous ownership and drifting data. Schedule the contract
  step as a task with a date. The second failure is contracting too early, based on
  "nobody should be using it" rather than instrumentation proving nobody is. The
  third is treating it as one deploy — each phase MUST be a separate deploy, or
  there is a window where old code meets new schema.
- *In practice* — renaming `name` to `full_name`: add `full_name`, dual-write, deploy;
  backfill, switch reads, deploy; drop `name`, deploy. Three PRs, three deploys, zero
  downtime, and a rollback available at each step.

---

## 11. AI engineering best practices

An AI system is a system with a non-deterministic component. Everything you know
about engineering still applies; what changes is that correctness is statistical, the
dependency is a vendor's model that will change under you, and the failure mode is a
confident wrong answer rather than an exception. Treat the model as an unreliable
remote dependency with a probability distribution over outputs — because that is
exactly what it is.

The binding rules are in
[STANDARDS.md#19](STANDARDS.md#19-ai-systems-standards); this section is the
reasoning behind them.

### Evaluation before prompting

An eval set — inputs with graded expected outputs — is the test suite of an AI
feature. Without it you cannot tell an improvement from a regression, and every
prompt change is a guess.

- *Use when* — always, before writing the second version of a prompt. Thirty
  hand-labelled examples covering the real distribution beat a thousand synthetic
  ones, and they can be built in an afternoon.
- *Not when / misapplied* — an eval set built from the examples you used to write the
  prompt. It will score near-perfect and predict nothing. Hold out real inputs,
  include the failure cases you have actually seen in production, and keep a slice
  the prompt author has never read. The second failure is evaluating only accuracy
  when the product cares about tone, refusal behaviour, latency, or cost.
- *In practice* — every prompt change ships with its eval delta: before, after, and
  which cases changed direction. A change that improves the mean while breaking three
  previously-passing cases is a regression until someone decides otherwise.

### Prompt engineering, ordered by leverage

Roughly in order of return per unit effort: (1) give the model the right *context* —
most failures are missing information, not weak instructions; (2) state the task and
the output format explicitly, ideally as a schema; (3) give few-shot examples,
especially for format and edge cases; (4) allow reasoning before the answer for
multi-step tasks; (5) decompose into multiple calls when one call is doing several
unrelated jobs; (6) fine-tune, last and rarely.

- *Not when / misapplied* — reaching for fine-tuning to fix a problem that is a
  retrieval problem. If the model does not know a fact, training will not reliably
  install it; give it the fact. Fine-tuning is for *behaviour and format at scale*,
  not for knowledge. Also: prompts that grow by accretion — a paragraph added per bug
  — become contradictory, and nobody dares delete a line. Version prompts, keep them
  in the repository, and re-derive rather than patch when one exceeds comprehension.

### Structured output

Constrain the model to a schema (tool use, JSON mode, grammar-constrained decoding)
rather than parsing prose.

- *In practice* — schema-constrained output removes an entire class of parsing bugs
  and makes the boundary between the model and your code explicit and testable.
  Validate anyway: a syntactically valid object can still contain a semantically
  impossible value, and your code MUST handle a schema-valid response that is wrong.

### RAG — retrieval-augmented generation

Retrieve relevant documents and place them in the context so the model answers from
them rather than from parametric memory.

- *Use when* — the answer depends on private, current, or large-corpus knowledge;
  when citations are required; when the knowledge changes faster than you would
  retrain.
- *Not when / misapplied* — as a reflex for problems that are not retrieval problems.
  A reasoning failure does not improve with more documents. The dominant real-world
  failure is retrieval quality: teams debug the prompt for a week when the retriever
  was returning the wrong chunks all along. **Measure retrieval separately from
  generation** — recall@k and precision on a labelled query set — because an
  end-to-end score cannot tell you which half is broken. Chunking strategy matters
  more than embedding model choice in most systems: chunks that split a table from
  its header, or a clause from its definition, cannot be rescued downstream. Hybrid
  search (dense + BM25) beats pure vector search on most real corpora, particularly
  for names, codes, and rare terms, which is where pure embeddings are weakest.
- *In practice* — instruct the model to answer only from the provided context and to
  say when the context is insufficient, then verify it does. Cite chunk IDs in the
  output so an answer can be traced to its source; an uncitable answer is a
  hallucination you have not detected yet.

### Context is a budget, not a container

Long context windows do not make context management unnecessary. Retrieval quality
degrades with irrelevant material, attention to the middle of a long context is
measurably weaker than to its ends, and every token has latency and cost.

- *In practice* — put the instruction and the most important material at the
  beginning or the end. Prefer 5 relevant chunks to 50 plausible ones; adding
  marginal context usually lowers accuracy. Measure the cost per request in tokens as
  a first-class metric, per [PLAYBOOKS.md#19](PLAYBOOKS.md#19-handling-a-cost-runaway).

### Hallucination

The model produces fluent, confident, false output. It is not a bug to be fixed but a
property of the technology to be designed around.

- *In practice* — the mitigations that work: ground answers in retrieved sources and
  require citations; constrain output to a schema; verify claims against a
  deterministic source before acting on them; give the model an explicit, rewarded
  path to say "I don't know"; and keep a human in the loop wherever the cost of a
  confident error exceeds the cost of the review. The mitigation that does not work is
  instructing the model not to hallucinate.

### Prompt injection

Any content that enters the context — retrieved documents, user text, tool results,
web pages, file contents — can contain instructions. The model has no reliable way to
distinguish data from instruction.

- *In practice* — this is a trust-boundary problem and MUST be solved in the
  architecture, not in the prompt. Treat all model output as untrusted input to
  whatever consumes it. Never let a model's output directly trigger a privileged
  action; put a deterministic authorization check between them, evaluated against the
  *user's* permissions, not the agent's. Assume any tool the model can call may be
  called with attacker-chosen arguments, and scope tool permissions accordingly. The
  dangerous combination is private data + untrusted content + an exfiltration channel;
  remove one of the three. See
  [STANDARDS.md#19](STANDARDS.md#19-ai-systems-standards) and
  [WORKFLOW.md#15](WORKFLOW.md#15-security-review-workflow).

### Temperature, determinism, and testing

- *In practice* — temperature 0 is not determinism; batching, hardware, and model
  updates all move outputs. Design tests that assert on properties (schema validity,
  presence of required facts, absence of forbidden content) rather than on exact
  strings, and use an LLM-as-judge with a rubric where properties are subjective —
  validating the judge against human labels first, because an unvalidated judge is
  just a second model's opinion.

### Model versioning

- *In practice* — pin the model version explicitly. A silently-updated model is a
  dependency upgrade that skipped review, and the improvement in aggregate benchmarks
  says nothing about your specific eval set. Re-run evals on every model change, and
  keep the previous version reachable long enough to roll back, per
  [PLAYBOOKS.md#18](PLAYBOOKS.md#18-improving-an-ai-system-already-in-production).

### Agents and tool use

- *Use when* — the task genuinely requires multiple steps whose sequence is not known
  in advance. A fixed sequence of model calls is a pipeline, and a pipeline is easier
  to test, cheaper, and more predictable than an agent.
- *Not when / misapplied* — using an agent loop for what is a deterministic workflow
  with one model call inside it. The agent framing adds non-determinism, cost,
  latency, and a failure mode where the loop does not terminate. When you do build an
  agent: bound the number of steps, bound the spend, make every tool call idempotent
  or confirmable, log the full trajectory for debugging, and require confirmation for
  anything destructive or externally visible.

### Cost and latency as design constraints

- *In practice* — token cost scales with usage in a way that engineering intuition
  from fixed-cost servers does not prepare you for, and a retry loop on a large
  context can multiply a bill overnight. Set per-request and per-tenant budgets,
  cache aggressively (identical prompts, embeddings, and prompt prefixes), route
  simple requests to smaller models, and alert on cost per request rather than only on
  total spend — the total moves too slowly to catch a regression early.

### Human-in-the-loop and graceful degradation

- *In practice* — decide, at design time, what happens when the model is wrong, slow,
  or unavailable, and make that path a designed experience rather than a stack trace.
  Every AI feature needs a defined fallback: a deterministic path, a cached result, a
  queued request, or an honest message. And every AI feature needs a channel for users
  to report a bad output, plus a process that feeds those reports into the eval set —
  that loop is the difference between a system that improves and one that only
  accumulates complaints.

---

## 12. How to use this knowledge

This document is a vocabulary, not a checklist and not a set of instructions. It is
used correctly when it makes a conversation shorter and a decision better documented.
It is used incorrectly when it makes a design longer.

**Read it as a reference, not front to back.** When you are about to make a decision,
look up the two or three items that bear on it — especially their *when NOT* — and
move on. An agent that recites patterns is not demonstrating competence; it is adding
tokens.

**Apply the citation rule.** Naming a pattern is not an argument. State the force in
*this* system that motivates it: the measurement, the constraint, the requirement.
"Reads are 200× writes" is a force. "CQRS is a best practice" is not. If you cannot
state the force, you have found a preference, and it belongs in a comparison of three
options per [SYSTEM.md#7](SYSTEM.md#7-decision-framework), not in the design as a
conclusion.

**Default to the simple thing.** Nearly every item here describes a mechanism that
adds indirection, moving parts, or operational surface. The correct answer for most
systems most of the time is the direct one: a modular monolith, a relational
database, synchronous calls, and boring deployment. Reach for a pattern when a
specific pain exists, not when a pattern is available. Gall's Law is the most
frequently vindicated item in this file.

**Prefer measurement to memory.** Everything in section 9 says the same thing: your
intuition about where the cost is will be wrong. That extends beyond performance —
your intuition about which code is fragile, which endpoint is hot, and which feature
is used is also usually wrong, and all three are measurable.

**Precedence when sources conflict:**

1. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — facts about this codebase beat general
   knowledge.
2. [DECISIONS.md](DECISIONS.md) — a prior ADR outranks this document. If you believe
   the ADR is wrong, write a superseding ADR; do not quietly deviate.
3. [STANDARDS.md](STANDARDS.md) — what you MUST do beats what is generally true.
4. This document — what things are and when they are wrong.

**When this document is wrong, fix it.** If a pattern here failed in this codebase
for a reason not listed under its *when NOT*, add the reason. If an entry has never
once been used in a decision, consider deleting it. Record the change in
[CHANGELOG.md](CHANGELOG.md) and, if it came out of an incident or a retrospective,
link the source in [memory/project-memory.md](memory/project-memory.md).

**The test of whether this document is working:** designs get shorter, review comments
cite specific forces rather than pattern names, and the same mistake stops appearing
twice. If instead you see more layers, more indirection, and more vocabulary, this
file is being used as a menu rather than a warning label, and the fault is in the
reading, not the writing.
