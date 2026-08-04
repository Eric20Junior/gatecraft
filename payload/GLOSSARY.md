# GLOSSARY.md — Terms

This defines every term the Gatecraft uses, so that "gate", "loop", "blast radius", and "one-way door" mean the same thing to every agent and every human in the repository. Entries link to the document where the term is authoritative.

---

## A

**Abstraction** — a layer that hides implementation detail while exposing a stable interface. Good abstractions reduce coupling and improve maintainability; premature abstraction creates complexity without corresponding benefit. See [SYSTEM.md § 6](SYSTEM.md#6-architecture-principles).

**Acceptance criterion** — a falsifiable, testable condition that must be satisfied for a task to be considered complete. Each criterion answers "how will we know this works?" See [SYSTEM.md § 14](SYSTEM.md#14-completion-criteria).

**ACID** — Atomicity, Consistency, Isolation, Durability. The four properties that guarantee database transaction reliability. Often traded against availability and partition tolerance in distributed systems; see CAP and BASE.

**ADR** — Architecture Decision Record. A document that captures an important architectural decision, the context that led to it, the alternatives considered, and the consequences. See [DECISIONS.md](DECISIONS.md) and [memory/](memory/).

**Agent** — an AI system that pursues a goal through a loop of observation, reasoning, action, and evaluation. Agents call tools, make decisions, and adapt based on results. See [AGENTS.md](AGENTS.md) and [SYSTEM.md § 17](SYSTEM.md#17-agent-coordination).

**Agent loop** — the observe-reason-act-evaluate cycle an agent runs until it reaches a goal or determines it cannot. Loop quality determines agent reliability; loop theatre is running the loop without material progress. See [SYSTEM.md § 3](SYSTEM.md#3-the-universal-engineering-loop).

**Gatecraft** — AI Engineering Operating System. A technology-agnostic Markdown framework copied into any repository so AI coding agents know how to work. Defined in [SYSTEM.md](SYSTEM.md) and extended in all other `.ai/` documents.

**Allowlist** — a security control that permits only explicitly listed values and denies everything else. More secure than a blocklist, which attempts to enumerate bad values and permits everything else. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Anti-corruption layer** — a translation layer that prevents a legacy or external system's domain model from corrupting your own. Common in strangler fig migrations and bounded contexts. See [SYSTEM.md § 6](SYSTEM.md#6-architecture-principles).

**Anti-principle** — a practice that feels like good engineering but creates waste. Examples: gold-plating, cargo-culting, architecture astronautics, loop theatre. Named explicitly because each one is seductive. See [SYSTEM.md § 1](SYSTEM.md#1-core-philosophy).

**Architecture astronautics** — building abstractions for requirements that do not exist. Interfaces with one implementation, events with one subscriber, microservices with one team. See [SYSTEM.md § 1](SYSTEM.md#1-core-philosophy).

**Attack surface** — the sum of all points where an attacker can attempt to enter or extract data from a system. Reducing attack surface is a primary security strategy. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Audit log** — an append-only, tamper-evident record of who did what and when. Essential for security incident response, compliance, and debugging authorization failures. See [STANDARDS.md](STANDARDS.md).

**Authentication** — proving identity. "Are you who you claim to be?" Often confused with authorization. See authn vs authz and [KNOWLEDGE.md](KNOWLEDGE.md).

**Authorization** — granting access. "Are you allowed to do this?" Comes after authentication. See authn vs authz and [KNOWLEDGE.md](KNOWLEDGE.md).

**Authn vs authz** — authentication proves identity; authorization grants permission. A user who successfully logs in (authn) may still lack permission to view a resource (authz). Conflating the two is a common source of security bugs. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Account enumeration** — an attacker's ability to determine which usernames or email addresses are valid by observing system responses. Mitigated by returning identical error messages for valid and invalid accounts. See [KNOWLEDGE.md](KNOWLEDGE.md).

## B

**Backpressure** — a mechanism by which a slow consumer signals a fast producer to slow down. Without it, queues grow unbounded until memory exhausts. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Baseline** — the recorded performance of the current system against which changes are measured. Without a baseline, "faster" and "better" are assertions, not evidence. See [evaluation/](evaluation/) and [metrics/](metrics/).

**BASE** — Basically Available, Soft state, Eventual consistency. The relaxed alternative to ACID adopted by many distributed data stores. Trades immediate consistency for availability and partition tolerance.

**Bisect** — a binary search through commit history to locate the change that introduced a regression. `git bisect` automates it. The fastest way to find when a bug appeared when you cannot reason about why.

**Blameless postmortem** — an incident review that treats failures as systemic rather than individual. Assumes everyone acted reasonably given the information available, and asks what made the failure possible. Blame suppresses the reporting that prevents recurrence. See [PLAYBOOKS.md](PLAYBOOKS.md).

**Blast radius** — the scope of what breaks if a change is wrong. Measured by affected users, systems, and data. Blast radius determines how much verification a change requires, and whether it needs human confirmation before proceeding. See [SYSTEM.md § 12](SYSTEM.md#12-risk-analysis).

**Blue-green** — a deployment strategy running two identical production environments, switching traffic from one to the other. Enables instant rollback by switching back. See [PLAYBOOKS.md](PLAYBOOKS.md).

**Bulkhead** — an isolation pattern that partitions resources so failure in one partition cannot exhaust resources needed by another. Named for ship compartments. Complements the circuit breaker. See [KNOWLEDGE.md](KNOWLEDGE.md).

---

## C

**Canary** — a deployment that routes a small fraction of traffic to a new version, monitoring for problems before wider rollout. Limits blast radius. See [PLAYBOOKS.md](PLAYBOOKS.md).

**CAP** — Consistency, Availability, Partition tolerance. A distributed system can guarantee only two of the three during a network partition. Commonly misunderstood: partitions are not optional, so the real choice is consistency or availability *when a partition occurs*. See PACELC for the more useful formulation.

**Cargo-culting** — adopting a pattern because a large company published it, without evaluating whether their constraints match yours. Their scale, team size, and failure modes are not yours. See [SYSTEM.md § 1](SYSTEM.md#1-core-philosophy).

**Changelog** — a curated, human-readable record of notable changes per release. Distinct from a commit log, which is exhaustive and unfiltered. See [STANDARDS.md](STANDARDS.md).

**Characterization test** — a test written to capture existing behaviour, correct or not, before refactoring. It documents what the system does today so changes that alter behaviour are detected. Essential when the original intent is unknown. See [STANDARDS.md](STANDARDS.md).

**Chunking** — splitting documents into segments for embedding and retrieval in a RAG pipeline. Chunk size and boundary choice materially affect retrieval quality; splitting mid-sentence or mid-table destroys meaning. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Circuit breaker** — a pattern that stops calling a failing dependency after a threshold of failures, failing fast instead, then periodically retries to detect recovery. Prevents cascading failure and thundering herd on a recovering service. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Code freeze** — a period during which no non-critical changes are merged, typically before a release. Reduces risk at the cost of throughput. See [WORKFLOW.md](WORKFLOW.md).

**Cohesion** — how strongly the elements within a module belong together. High cohesion means a module has one clear responsibility. The complement of coupling: aim for high cohesion, low coupling. See [SYSTEM.md § 6](SYSTEM.md#6-architecture-principles).

**Confidence score** — an explicit, calibrated statement of how sure an agent is about a claim or deliverable, with the reasons. Low confidence triggers research, verification, or escalation rather than fluent hedging. See [SYSTEM.md § 11](SYSTEM.md#11-confidence-scoring).

**Context window** — the maximum number of tokens a model can process in a single request, spanning system prompt, conversation, tool results, and response. Exceeding it forces truncation or compaction. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Contract test** — a test verifying that a provider and consumer agree on an interface, run independently by both sides. Catches breaking API changes without requiring both systems deployed together. See [STANDARDS.md](STANDARDS.md).

**Correlation ID** — an identifier propagated across every service, log line, and trace involved in handling a single request. Without it, debugging a distributed request means guessing which log lines belong together. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Cost per request** — the money spent per unit of work, including model inference, retries, and tool calls. A first-class constraint in AI systems, not an afterthought. See [metrics/](metrics/).

**Coupling** — the degree to which one module depends on another's internals. Tight coupling means a change in one forces a change in the other. Reducing coupling is usually worth accepting some duplication. See [SYSTEM.md § 6](SYSTEM.md#6-architecture-principles).

**Covering index** — a database index containing all columns a query needs, so the query is answered from the index without reading the table. Trades write cost and storage for read speed.

**Critique (vs review)** — review checks the work against known gates and standards; critique is adversarial and asks how this will fail in ways nobody listed. Review is a checklist; critique is an attack. Both are required stages. See [SYSTEM.md § 8](SYSTEM.md#8-self-critique).

**CSRF** — Cross-Site Request Forgery. Tricking an authenticated user's browser into submitting an unwanted request. Mitigated by anti-CSRF tokens and `SameSite` cookies. See [OWASP Top 10](KNOWLEDGE.md#owasp-top-10).

**CVE** — Common Vulnerabilities and Exposures. A public identifier for a specific known security flaw, e.g. `CVE-2021-44228`. A CVE identifier alone does not indicate exploitability in your context. See [KNOWLEDGE.md](KNOWLEDGE.md).

---

## D

**Data leakage** — when information from the evaluation set influences training or prompt construction, inflating measured performance. The most common cause of models that score well and perform badly. See [evaluation/](evaluation/).

**Data minimization** — collecting and retaining only the data required for a stated purpose. Data you never collected cannot be breached. A legal requirement under GDPR and a sound security default. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Deadlock** — two or more processes each holding a resource the other needs, so none can proceed. Prevented by acquiring locks in a consistent order and using timeouts. See race condition.

**Defense in depth** — layering independent security controls so no single failure results in compromise. Assumes each layer will eventually fail. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Denormalization** — deliberately duplicating data across tables to avoid joins and speed reads. Trades write complexity and consistency risk for read performance. Only justified with a measurement. See normalization.

**Dependency injection** — supplying a component's dependencies from outside rather than constructing them internally. Makes components testable and substitutable. A technique; inversion of control is the principle it serves. See [STANDARDS.md](STANDARDS.md).

**Deserialization attack** — executing attacker-controlled code by deserializing untrusted data into objects. Mitigated by never deserializing untrusted input into arbitrary types and preferring data-only formats. See [OWASP Top 10](KNOWLEDGE.md#owasp-top-10).

**Dirty read** — reading data written by a transaction that has not committed and may roll back. Prevented at isolation levels above `READ UNCOMMITTED`.

**Distillation** — training a smaller model to reproduce a larger model's behaviour. Reduces inference cost and latency at some capability cost. See [KNOWLEDGE.md](KNOWLEDGE.md).

**DORA metrics** — four delivery performance measures: deployment frequency, lead time for changes, change failure rate, and time to restore service. Measure delivery capability, not individual productivity. See [metrics/](metrics/).

**Drift** — degradation of model or system performance over time as real-world input distributions diverge from those the system was built against. Detected by monitoring, not by assumption. See [evaluation/](evaluation/).

---

## E

**Embedding** — a numeric vector representing the semantic content of text, images, or other data, such that similar items are near each other in vector space. The basis of semantic search and RAG retrieval. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Encryption at rest** — encrypting stored data so it is unreadable without keys if storage media or backups are obtained. Does not protect against an application with valid credentials. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Encryption in transit** — encrypting data moving over a network, typically with TLS. Protects against interception and tampering between endpoints, not at them. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Error budget** — the amount of unreliability an SLO permits over a window. If the SLO is 99.9% availability monthly, the error budget is roughly 43 minutes. Budget remaining is the objective input to whether to ship or stabilize. See [metrics/](metrics/).

**Escalation** — stopping work and surfacing a decision to a human because it exceeds the agent's authority, confidence, or blast radius tolerance. Escalating is a correct outcome, not a failure. See [SYSTEM.md § 16](SYSTEM.md#16-escalation).

**Eval / evaluation suite** — a repeatable set of test cases with expected outcomes and scoring criteria, used to measure AI system quality across changes. Distinguished from unit tests by tolerating non-determinism and scoring on a scale rather than pass/fail. See [evaluation/](evaluation/).

**Eventual consistency** — a guarantee that replicas converge to the same value once writes stop, with no guarantee about when. Commonly misunderstood as "usually consistent": it makes no promise about any individual read. See strong consistency.

**Evidence hierarchy** — the ranking of how much a claim can be trusted, from strongest to weakest: observed behaviour in the target environment, passing tests, read code, documentation, memory, inference, assumption. Always state which tier a claim rests on. See [SYSTEM.md § 2](SYSTEM.md#2-reasoning-discipline).

**Excessive agency** — granting an AI system more capability, permission, or autonomy than its task requires, so a bad decision has consequences disproportionate to its purpose. Mitigated by least privilege and human confirmation on one-way doors. See [AGENTS.md](AGENTS.md).

**Expand-migrate-contract** — a three-phase schema or API change: add the new form alongside the old (expand), move readers and writers across (migrate), then remove the old form (contract). Turns a breaking change into three backward-compatible ones. See [PLAYBOOKS.md](PLAYBOOKS.md).

---

## F

**Falsifiable** — stated so that it is clear what observation would prove it wrong. "The endpoint is fast" is not falsifiable; "p95 latency under 200ms at 100 req/s" is. Every acceptance criterion must be falsifiable. See [SYSTEM.md § 14](SYSTEM.md#14-completion-criteria).

**Fallback** — a degraded but acceptable behaviour when the primary path fails: a cached response, a simpler model, a clear error. Systems without fallbacks convert dependency failures into total failures. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Feature flag** — a runtime switch that enables or disables functionality without redeploying. Decouples deploy from release and enables canary rollout. Flags are debt: each one needs a removal date. See [PLAYBOOKS.md](PLAYBOOKS.md).

**Fine-tuning** — further training a pretrained model on task-specific data to adjust its behaviour. Usually the wrong first answer: prompting and RAG are cheaper and faster to iterate. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Five whys** — asking "why" repeatedly to move from a symptom to a systemic cause. Stops when the answer becomes a process or design decision rather than a person. See [PLAYBOOKS.md](PLAYBOOKS.md).

**Flake** — a test that passes and fails without code changes, usually from timing, shared state, ordering, or network dependence. Flakes are worse than failures: they train everyone to ignore red. Fix or delete them. See [STANDARDS.md](STANDARDS.md).

---

## G

**Gate** — a checkpoint a deliverable must pass before proceeding. Gates are binary and objective: either the evidence exists or it does not. An agent may not self-certify a gate it has not actually run. See [SYSTEM.md § 10](SYSTEM.md#10-quality-gates).

**Go/no-go** — an explicit decision point where a release proceeds or stops, made against stated criteria rather than sentiment. See [CHECKLISTS.md](CHECKLISTS.md).

**Gold-plating** — building for requirements nobody stated. Quality means the stated scope done properly, not extra scope done properly. The most common way well-intentioned agents waste effort. See [SYSTEM.md § 1](SYSTEM.md#1-core-philosophy).

**Grounding** — constraining a model's output to supplied source material so claims are traceable to evidence rather than parametric memory. The primary defence against hallucination. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Guardrail** — a constraint on AI system behaviour, enforced in code rather than requested in a prompt. Input validation, output filtering, tool permission scoping, and spend limits are guardrails; instructions are not. See [AGENTS.md](AGENTS.md).

---

## H

**Hallucination** — model output that is fluent, confident, and false. Not lying and not random: the model is producing plausible continuations without a truth check. Mitigated by grounding, citation requirements, and verification. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Hashing** — a one-way transformation producing a fixed-length digest. For passwords, use a slow, salted algorithm with a tuned work factor (bcrypt, scrypt, Argon2), never a fast general-purpose hash like SHA-256. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Holdout set** — evaluation cases deliberately excluded from all development and prompt iteration, used to measure real generalization. Once you look at it repeatedly and tune against it, it is no longer a holdout. See [evaluation/](evaluation/).

---

## I

**Idempotency** — the property that repeating an operation produces the same result as doing it once. Essential for safe retries and recovery. `CREATE` is not idempotent; `PUT` with a fixed ID can be. See [STANDARDS.md](STANDARDS.md).

**IDOR** — Insecure Direct Object Reference. Exposing internal object identifiers without verifying the requester has permission to access them. A user changes `/profile/123` to `/profile/124` and sees another user's data. See [OWASP Top 10](KNOWLEDGE.md#owasp-top-10).

**Index** — a database structure that speeds reads at the cost of write overhead and storage. An unindexed query on a large table is usually a bug, not a performance characteristic. See covering index and partial index.

**Inference** — running a trained model to produce an output. Distinct from training. Measured by latency, throughput, and cost per request. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Injection** — an attack that inserts malicious input into a command or query so the system interprets data as code. SQL injection, command injection, and prompt injection share the same root cause: untrusted input mixed with instructions. See [OWASP Top 10](KNOWLEDGE.md#owasp-top-10).

**Invariant** — a condition that must always hold. "User balance is never negative" is an invariant. Tests should verify invariants at boundaries, and the code should enforce them. See [STANDARDS.md](STANDARDS.md).

**Inversion of control** — the principle that a framework calls your code rather than your code calling the framework. The strategy behind dependency injection, not a synonym for it. See [STANDARDS.md](STANDARDS.md).

**Isolation level** — the degree to which transactions see each other's uncommitted changes. Higher isolation prevents anomalies but reduces concurrency. Most systems default to weaker isolation than developers assume. See dirty read, phantom read, and write skew.

---

## J

**Jobs-to-be-done** — a product framework that defines user goals as the functional, social, and emotional outcomes they want, rather than the features they request. "Help me look professional" is a job; "add a spell checker" is a feature. See [WORKFLOW.md](WORKFLOW.md).

---

## K

**Kernel** — the core of the Gatecraft. [SYSTEM.md](SYSTEM.md), which defines how an agent thinks, decides, builds, and finishes. The highest-authority document in the framework except for project-specific facts. See [SYSTEM.md § 1](SYSTEM.md#1-core-philosophy).

---

## L

**Last responsible moment** — the latest point at which a decision can be deferred without incurring more cost than the information gained is worth. Decide too early and you commit before learning; too late and you lose the ability to act. See [SYSTEM.md § 7](SYSTEM.md#7-decision-framework).

**Latency budget** — the maximum acceptable delay for an operation. Usually stated as a percentile: p95 under 200ms means 95% of requests complete within 200ms. The budget allocates time across dependencies. See [metrics/](metrics/).

**Least privilege** — granting only the minimum permissions required to complete a task. A batch job that reads one table should not have write access to the entire database. Reduces blast radius. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Lens** — a perspective from which to evaluate a design or decision. The security lens asks "how does this fail under attack?"; the maintainability lens asks "who debugs this at 3 AM?" Multiple lenses reveal trade-offs a single view hides. See [SYSTEM.md § 7](SYSTEM.md#7-decision-framework).

**Linearizability** — the strongest consistency guarantee: once a write completes, all subsequent reads see it. Expensive in distributed systems. See strong consistency and eventual consistency.

**Loop** — see Universal Engineering Loop and agent loop.

**Loop theatre** — running the improvement loop and declaring improvement without changing anything material. An iteration that produces no diff is a signal to stop, not a box to tick. See [SYSTEM.md § 1](SYSTEM.md#1-core-philosophy).

---

## M

**Memory (project)** — see project memory.

**Migration** — a versioned, ordered change to a database schema or data. Must be reversible or forward-only by explicit decision, never by accident. See expand-migrate-contract and [PLAYBOOKS.md](PLAYBOOKS.md).

**Model registry** — a catalogue of model versions with their metadata, evaluation results, and deployment status. Enables reproducibility and rollback. See [KNOWLEDGE.md](KNOWLEDGE.md).

**MoSCoW** — a prioritization method: Must have, Should have, Could have, Won't have. The "Won't have" category is the valuable one, because it makes non-goals explicit. See [WORKFLOW.md](WORKFLOW.md).

**MTTR** — Mean Time To Recovery. The average time from incident detection to service restoration. Usually more actionable than mean time between failures: you cannot prevent all failures, but you can recover faster. See [metrics/](metrics/).

**MUST/SHOULD/MAY** — normative keywords with precise meanings from RFC 2119. MUST is an absolute requirement; SHOULD means there may be valid reasons to deviate but the full implications must be understood; MAY is optional. Used throughout the Gatecraft so requirement strength is unambiguous. See [SYSTEM.md](SYSTEM.md).

**Mutation testing** — deliberately introducing faults into code to verify the test suite detects them. Measures test effectiveness, unlike coverage, which only measures test execution. A line can be 100% covered by tests that assert nothing. See [STANDARDS.md](STANDARDS.md).

---

## N

**N+1 query** — issuing one query to fetch a list, then one more per item. Turns a single request into hundreds. Fixed by batching or eager loading. The most common database performance bug in ORM-based code. See [STANDARDS.md](STANDARDS.md).

**Non-determinism** — the property that identical inputs may produce different outputs. Inherent in language models at temperature above zero, and present even at zero. Tests for AI systems must assert on properties rather than exact strings. See [evaluation/](evaluation/).

**Non-goal** — something explicitly out of scope, stated so nobody assumes it. "Not supporting offline mode in v1" prevents both scope creep and the accusation of an oversight. See [SYSTEM.md § 4](SYSTEM.md#4-planning-strategy).

**Non-repeatable read** — reading the same row twice within a transaction and getting different values because another transaction committed a change in between. Prevented at `REPEATABLE READ` and above.

**Normalization** — organizing a schema to eliminate redundant data, so each fact is stored once. Reduces update anomalies and storage; can require joins that cost read performance. See denormalization.

---

## O

**Object-level authorization** — checking that the authenticated principal is permitted to act on the *specific object* requested, not merely permitted to use the endpoint. Missing this check is IDOR. See [OWASP Top 10](KNOWLEDGE.md#owasp-top-10).

**Observability** — the ability to answer new questions about a system's behaviour from its outputs, without shipping new code. Broader than monitoring, which answers questions you already knew to ask. Built from logs, metrics, and traces. See [KNOWLEDGE.md](KNOWLEDGE.md).

**OLAP** — Online Analytical Processing. Workloads that scan and aggregate large volumes for analysis. Optimized for throughput on complex reads, usually columnar. See OLTP.

**OLTP** — Online Transaction Processing. Workloads with many small, low-latency reads and writes. Optimized for concurrency and point access, usually row-oriented. See OLAP.

**One-way door** — a decision that is expensive or impossible to reverse: a public API contract, a data deletion, a schema migration that drops data, a production credential rotation. One-way doors require more analysis and, for agents, human confirmation. See [SYSTEM.md § 7](SYSTEM.md#7-decision-framework).

**Optimistic locking** — detecting concurrent modification by checking a version number or timestamp at write time and failing if it changed. Cheaper than pessimistic locking when conflicts are rare. See pessimistic locking.

**Override (project)** — a documented, project-specific deviation from an Gatecraft default, recorded so it reads as a decision rather than a violation. Overrides live in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) and win on facts about this project. See [SYSTEM.md](SYSTEM.md).

**Override (role)** — a decision by one role that supersedes another's recommendation. Distinct from a veto, which blocks rather than replaces. Overrides must be recorded with reasoning. See [AGENTS.md](AGENTS.md).

**OWASP Top 10** — the Open Web Application Security Project's periodically updated list of the most critical web application security risks. A floor for security review, not a complete threat model. See [OWASP Top 10](KNOWLEDGE.md#owasp-top-10).

---

## P

**p50/p95/p99** — percentile latency metrics: p50 is the median, p95 means 95% of requests were faster, p99 means 99% were faster. Averages hide tail latency. Always specify percentiles; "average response time" is meaningless for user-facing systems. See tail latency and [metrics/](metrics/).

**PACELC** — an extension of CAP: during a Partition, choose Availability or Consistency; Else (when no partition), choose Latency or Consistency. More useful than CAP because it acknowledges the latency-consistency trade-off in the common, non-partitioned case.

**Partial index** — a database index that covers only rows matching a condition. Smaller and faster than a full index when the useful rows are a minority. See [STANDARDS.md](STANDARDS.md).

**Path traversal** — an attack exploiting insufficient filename validation to access files outside an intended directory, e.g. `../../etc/passwd`. Mitigated by canonicalizing paths and verifying they remain under the allowed root. See [OWASP Top 10](KNOWLEDGE.md#owasp-top-10).

**Pessimistic locking** — acquiring an exclusive lock at read time, blocking other writers until the transaction completes. Appropriate when conflicts are frequent or the cost of conflict resolution is high. See optimistic locking.

**Phantom read** — a transaction re-executing a range query and finding rows that didn't exist in the first execution, because another transaction inserted them. Prevented only at `SERIALIZABLE` isolation.

**PII** — Personally Identifiable Information. Data that can identify a specific individual. Triggers legal obligations (GDPR, CCPA) and disproportionate breach consequences. Apply data minimization: collect only what you need, retain only as long as required. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Playbook** — a documented response to a known scenario: a specific incident type, a deployment failure, an outage. Distinct from a runbook, which covers routine operations. See [PLAYBOOKS.md](PLAYBOOKS.md).

**Postmortem** — see blameless postmortem.

**PRD** — Product Requirements Document. Defines what is being built and why, including user goals, constraints, and success criteria. Not a design document. See [WORKFLOW.md](WORKFLOW.md).

**Privilege escalation** — gaining more permissions than were granted. Horizontal escalation: acting as another user with the same privilege level. Vertical escalation: gaining admin from a non-admin account. Both are authorization failures. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Production readiness score** — a structured assessment of whether a system is ready to handle production traffic, covering availability, observability, security, performance, and operational runbooks. A number without the underlying evidence is noise. See [CHECKLISTS.md](CHECKLISTS.md).

**Project memory** — the collection of documents under [memory/](memory/) that persist decisions, findings, and context across sessions. Agents read memory before acting; they update it after learning something non-obvious. See [SYSTEM.md § 2](SYSTEM.md#2-reasoning-discipline).

**Prompt** — the input given to a language model, including the system prompt and conversation history. The primary interface for directing model behaviour; not a substitute for code-level guardrails. See [PROMPTS.md](PROMPTS.md).

**Prompt injection** — manipulating a model by embedding instructions in untrusted data it processes, causing it to follow attacker-controlled instructions instead of operator-controlled ones. Mitigated by treating external content as data, not instructions. See [AGENTS.md](AGENTS.md).

**Pure function** — a function whose output depends only on its inputs and that causes no observable side effects. Easy to test, safe to cache, and safe to parallelize. The baseline for unit-testable code. See [STANDARDS.md](STANDARDS.md).

---

## Q

**Quality gate** — see gate.

**Query plan** — the execution strategy a database engine produces for a SQL query, detailing index use, join order, and estimated cost. `EXPLAIN ANALYZE` outputs it. Slow queries usually have a bad plan, often because of a missing index or an unexpected full scan. See [STANDARDS.md](STANDARDS.md).

**Quorum** — a majority of nodes required to agree before a distributed operation succeeds. Prevents split-brain by ensuring any two quorums share at least one member. See split-brain.

---

## R

**Race condition** — a bug where the outcome depends on the relative timing of concurrent operations. Common in check-then-act sequences without atomicity. Reproduces intermittently, which makes it dangerous rather than harmless. See [STANDARDS.md](STANDARDS.md).

**RAG** — Retrieval-Augmented Generation. Retrieving relevant documents and supplying them as context so the model answers from evidence rather than parametric memory. Improves accuracy and enables citation, but retrieval quality bounds output quality. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Rate limiting** — capping how many requests a client may make in a time window. Protects against abuse, credential stuffing, and accidental overload. Absence of rate limiting on authentication endpoints is a security finding. See [KNOWLEDGE.md](KNOWLEDGE.md).

**RCE** — Remote Code Execution. An attacker running arbitrary code on your infrastructure. The most severe class of vulnerability: it compromises everything the process can reach. See [OWASP Top 10](KNOWLEDGE.md#owasp-top-10).

**Refactoring** — changing code structure without changing its observable behaviour. If behaviour changes, it is not refactoring. Requires tests that verify behaviour first; see characterization test. See [STANDARDS.md](STANDARDS.md).

**Regression** — previously working behaviour that breaks. Every fixed bug should gain a test that fails without the fix, so the regression is caught mechanically rather than by a user. See [STANDARDS.md](STANDARDS.md).

**Release notes** — user-facing communication about what changed and what it means for them. Distinct from a changelog, which is developer-facing and exhaustive. See [TEMPLATES.md](TEMPLATES.md).

**Replication lag** — the delay before a write on a primary appears on a replica. Reads from a replica may return stale data. The most common cause of "I saved it but it isn't there" bugs in read-replica architectures.

**Retrospective** — a recurring team review of process, distinct from a postmortem, which reviews a specific incident. Produces process changes, not blame. See [WORKFLOW.md](WORKFLOW.md).

**RFC** — Request For Comments. A written proposal circulated for feedback before a significant change is committed to. Forces the author to articulate trade-offs and gives reviewers a chance to object cheaply. See [TEMPLATES.md](TEMPLATES.md).

**RFC 2119** — the IETF specification defining the normative keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY. The Gatecraft uses these keywords with their RFC 2119 meanings so requirement strength is precise rather than rhetorical. See MUST/SHOULD/MAY and [SYSTEM.md](SYSTEM.md).

**Right-sizing** — matching process weight to task risk. A typo fix does not need an ADR; a schema migration does. Applying full ceremony to trivial work is as wrong as skipping it on risky work. See task class and [SYSTEM.md § 4](SYSTEM.md#4-planning-strategy).

**Role** — a defined perspective with specific responsibilities, authority, and veto rights, adopted by an agent to evaluate work. Roles make trade-offs explicit by giving each concern an advocate. See [AGENTS.md](AGENTS.md).

**Rolling deployment** — replacing instances of the old version with the new version incrementally, so both run simultaneously during the rollout. Requires backward-compatible changes. See [PLAYBOOKS.md](PLAYBOOKS.md).

**RPO** — Recovery Point Objective. The maximum acceptable data loss, measured in time. An RPO of one hour means losing up to an hour of writes is tolerable. Determines backup frequency. See RTO.

**RTO** — Recovery Time Objective. The maximum acceptable downtime for restoring service after a failure. Determines the recovery architecture: an RTO of minutes requires hot standby, not restore-from-backup. See RPO.

**Runbook** — step-by-step instructions for a routine operational procedure: deploying, rotating a credential, scaling a service. Written so someone unfamiliar can execute it under pressure. See [PLAYBOOKS.md](PLAYBOOKS.md).

---

## S

**Salt** — a unique random value added to each password before hashing, so identical passwords produce different hashes. Defeats precomputed rainbow tables. Salts are per-record and need not be secret. See work factor and [KNOWLEDGE.md](KNOWLEDGE.md).

**Schema** — the formal structure of data: tables, columns, types, and constraints. Constraints belong in the schema, not only in application code, because the database is the last line of defence for data integrity. See [STANDARDS.md](STANDARDS.md).

**Scope creep** — incremental expansion of requirements without a corresponding change to timeline or explicit agreement. Reviews improve the deliverable; they do not expand it. New scope becomes a new task. See [SYSTEM.md § 1](SYSTEM.md#1-core-philosophy).

**Secret** — a credential whose disclosure compromises security: API keys, tokens, private keys, database passwords. Never committed to version control, never logged, never echoed in output. See [STANDARDS.md](STANDARDS.md).

**Secret rotation** — periodically replacing credentials, limiting the window in which a leaked secret is useful. Systems must support rotation without downtime, which usually means accepting two valid secrets during the overlap. See [PLAYBOOKS.md](PLAYBOOKS.md).

**Self-critique** — the adversarial stage where an agent attacks its own work before presenting it, asking how it fails rather than confirming it works. Distinct from review, which checks against known gates. See critique (vs review) and [SYSTEM.md § 8](SYSTEM.md#8-self-critique).

**Semantic versioning** — `MAJOR.MINOR.PATCH`, where MAJOR signals a breaking change, MINOR adds backward-compatible functionality, and PATCH fixes bugs compatibly. The contract is with consumers, so what counts as breaking is defined by their expectations, not yours. See [VERSION.md](VERSION.md).

**Sharding** — partitioning data across multiple databases by a key so no single node holds everything. Scales writes, but cross-shard queries and rebalancing are expensive. Choosing a shard key is close to a one-way door.

**Side effect** — any observable change a function causes beyond returning a value: writing a file, mutating shared state, sending a request. Side effects are what make code hard to test and reason about. See pure function.

**SLA** — Service Level Agreement. A contractual commitment to a service level, with consequences for breach. The external, legal wrapper around an SLO. See SLI and SLO.

**SLI** — Service Level Indicator. The actual measurement of a service property: request success rate, p99 latency, availability. The number you observe. See SLO.

**SLO** — Service Level Objective. The target value for an SLI, e.g. "99.9% of requests succeed over 30 days". Internal, set by you, and the basis for an error budget. Commonly confused with an SLA, which is the external contract. See SLA and error budget.

**Spike** — a timeboxed investigation to reduce uncertainty before committing to an approach. Output is knowledge, not shippable code. A spike that produces production code was not a spike. See timebox and [WORKFLOW.md](WORKFLOW.md).

**Split-brain** — a partition state where two sides of a cluster both believe they are authoritative and accept conflicting writes. Prevented by quorum. See quorum.

**SSRF** — Server-Side Request Forgery. Tricking a server into making requests to attacker-chosen destinations, often to reach internal services or cloud metadata endpoints. Mitigated by allowlisting outbound destinations. See [OWASP Top 10](KNOWLEDGE.md#owasp-top-10).

**STRIDE** — a threat modeling taxonomy: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. A prompt for systematic threat enumeration rather than ad-hoc guessing. See threat model and [KNOWLEDGE.md](KNOWLEDGE.md).

**Strangler fig** — incrementally replacing a legacy system by routing functionality to new code piece by piece until the old system is unused. Avoids the big-bang rewrite. Named for the vine that grows around a tree. See anti-corruption layer and [PLAYBOOKS.md](PLAYBOOKS.md).

**Strong consistency** — every read returns the most recent write. Simplifies application logic at the cost of latency and availability under partition. See eventual consistency and linearizability.

**Supply chain risk** — the risk introduced by third-party dependencies, build tooling, and CI infrastructure. Your security posture includes everything you install. Mitigated by pinned versions, lockfiles, and provenance verification. See typosquatting and [KNOWLEDGE.md](KNOWLEDGE.md).

**System prompt** — the instructions that establish a model's role, constraints, and behaviour for a session, distinct from user turns. Not a security boundary: content in the system prompt can be influenced by prompt injection downstream. See [PROMPTS.md](PROMPTS.md).

---

## T

**Tail latency** — the slowest requests, at p95, p99, and beyond. Tail latency determines perceived reliability: a p99 of 5 seconds means one user in a hundred has a bad experience every time. Averages hide it entirely. See p50/p95/p99.

**Task class** — a categorization of work by risk and scope that determines how much process applies: which gates run, whether an ADR is needed, how much verification is required. The mechanism behind right-sizing. See [WORKFLOW.md](WORKFLOW.md).

**Technical debt** — the future cost of a shortcut taken now. Debt is a legitimate tool when taken deliberately with a repayment plan; it becomes a problem when taken accidentally and never named. Unnamed debt compounds. See [SYSTEM.md § 6](SYSTEM.md#6-architecture-principles).

**Telemetry** — the data a system emits about its own behaviour: logs, metrics, traces, and events. The raw material of observability. See observability and [KNOWLEDGE.md](KNOWLEDGE.md).

**Temperature** — a sampling parameter controlling output randomness. Lower values make output more deterministic and repetitive; higher values increase diversity and error rate. Temperature 0 reduces but does not eliminate non-determinism. See [KNOWLEDGE.md](KNOWLEDGE.md).

**Threat model** — a structured analysis of what an attacker wants, what they can reach, and what would stop them. Produces prioritized mitigations rather than a generic checklist. See STRIDE and [KNOWLEDGE.md](KNOWLEDGE.md).

**Thundering herd** — many clients retrying simultaneously after a failure, overwhelming a recovering service and causing it to fail again. Mitigated by exponential backoff with jitter and circuit breakers. See circuit breaker.

**Timebox** — a fixed time limit on an activity, after which you stop and reassess regardless of completion. Prevents open-ended investigation from consuming a project. A timebox that is routinely extended is not a timebox. See spike.

**Token** — the unit of text a model processes, roughly three-quarters of an English word. Context windows, pricing, and latency are all measured in tokens. See context window.

**Tool calling** — a model's ability to invoke external functions with structured arguments and use the results. The mechanism that turns a language model into an agent. Tool permissions are a guardrail; tool descriptions are not. See [AGENTS.md](AGENTS.md).

**Tracing** — following a single request across every service and component that handled it, using a shared correlation ID. Answers "where did the time go?" in a distributed system. See correlation ID and observability.

**Two-way door** — a decision that is cheap to reverse: an internal function name, a library choice behind an interface, a feature flag default. Two-way doors should be decided quickly and revisited if wrong; agonizing over them wastes the analysis budget that one-way doors need. See one-way door and [SYSTEM.md § 7](SYSTEM.md#7-decision-framework).

**Typosquatting** — publishing a malicious package with a name similar to a popular one (`reqeusts` for `requests`), hoping for install typos. A supply chain attack. Verify package names before adding dependencies. See supply chain risk.

---

## U

**Universal Engineering Loop** — the twelve-stage cycle every task runs: understand, research, plan, design, implement, review, critique, improve, validate, test, document, evaluate. Each stage produces an artifact; if there is no artifact, the stage did not happen. See [Universal Engineering Loop](SYSTEM.md#3-the-universal-engineering-loop).

---

## V

**Validation** — proving the system meets requirements through testing, measurement, and inspection. Validation asks "did we build the right thing?" Verification asks "did we build the thing right?" Both are required.

**Vertical slice** — a feature that cuts through all layers of the system, end to end, delivering visible user value. Preferred over horizontal slices (all backend, then all frontend) because each slice is deployable, testable, and yields feedback.

**Vet** — to thoroughly examine and verify before committing. Code is vetted in review; decisions are vetted in ADRs; designs are vetted by comparing at least three options.

---

## W

**Walking skeleton** — a minimal end-to-end implementation of the system that performs a small but complete function. It connects all major components with the simplest possible logic, proving the architecture works before adding features. See [New Project workflow](WORKFLOW.md#1-new-project-workflow).

**Workflow** — the lifecycle of a kind of work: its entry conditions, roles, deliverables, gates, and iteration rules. See [WORKFLOW.md](WORKFLOW.md). Compare [playbook](GLOSSARY.md#p).

---

## X

**XSS (Cross-Site Scripting)** — a vulnerability where attacker-controlled data is rendered as executable script in a victim's browser. Mitigated by escaping or sanitizing all user input before rendering it in HTML, JavaScript, or CSS contexts. See [OWASP Top 10](KNOWLEDGE.md#owasp-top-10) and [Security standards](STANDARDS.md#10-security-standards).

---

## Y

**YAGNI (You Aren't Gonna Need It)** — do not build functionality before it is required. Speculative features cost time, add complexity, and are often never used. Build what is needed now; defer everything else until demand is proven. See [Engineering principles](KNOWLEDGE.md#1-engineering-principles).

---

## Z

**Zero-trust architecture** — a security model that assumes no network location, identity, or device is inherently trusted. Every request is authenticated, authorized, and encrypted regardless of origin. Compare with perimeter-based security, which trusts everything inside the network boundary.
