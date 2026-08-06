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
| **Project name** | gatecraft |
| **One-line purpose** | Installs a complete engineering loop, quality gates, and 26 specialist roles into any repository, so a coding agent follows a defined process instead of improvising. |
| **Repository** | git@github.com:Eric20Junior/gatecraft.git |
| **Lifecycle stage** | Pre-launch. The package is release-ready and gated green; the infrastructure around it is not (see [Known problems](#14-known-problems)). |
| **Business criticality** | Experimental — no users, no revenue, no SLA. This is deliberately *not* flattery: it means an override is cheap and a missing runbook is not a defect. |
| **Primary owner** | Eric20Junior (sole maintainer) |
| **On-call owner** | None — no on-call exists, and none is warranted for a CLI with no running service. |
| **Team size and shape** | 1 engineer, no designer, no ops. Every role in [AGENTS.md](AGENTS.md) is played by the same person or by an agent. |
| **Last reviewed** | 2026-08-06 |

Criticality is not flattery — it sets the bar. A revenue-critical system inherits
the strictest reading of every standard; an experiment does not, and pretending
otherwise wastes real capacity.

---

## 2. Problem and users

**The problem.** A coding agent given a task improvises a process. It picks its own
definition of done, skips the checks it was not reminded of, and produces work whose
quality varies with the phrasing of the prompt rather than with the difficulty of the
task. The knowledge that would fix this — the standards, the review checklist, the
architecture decision record — either does not exist in the repository or exists in a
form no agent reads.

**Evidence it matters.** Anecdotal and first-person: this project exists because its
author kept re-typing the same quality instructions into every agent session. There
is no survey, no measured baseline, and no user research. That is itself the honest
state — an agent proposing work here MUST NOT cite demand evidence that does not
exist.

**Users.**

| Who | What they are trying to do | Context that constrains the design |
| --- | --- | --- |
| Developer using a coding agent | Get consistent, reviewable output from an agent without re-explaining standards every session | Works in an existing repository they did not necessarily write; will abandon anything that takes more than one command to try |
| Their coding agent | Find the relevant process and standard for the task at hand | Finite context window; may be unable to run shell commands; reads whatever the repo's agent-instruction file points it to |
| A teammate on a shared repo | Understand the conventions an agent is following | Did not install it, may not know it exists, must not be forced to adopt it to keep working |

**What users do today instead.** Paste standards into the prompt each time, keep a
personal snippets file, or accept the variance. The friction is invisible because it
is spread across every session rather than concentrated in one painful event — which
is exactly why it goes unfixed.

**How we know we succeeded.** No measurable target is set, because there is no
baseline and no user base to measure. The falsifiable near-term proxy: this
repository runs on its own framework, and an agent working here asks zero questions
that this file already answers. Every such question is a missing section.

---

## 3. Scope and non-goals

**In scope.** Authoring and shipping the framework documents under `payload/`, and
the CLI that installs, upgrades, ejects, and removes them. Keeping the installed copy
invisible to git by default. Being addressable section-by-section so an agent can
read one standard rather than a whole document.

**Explicitly out of scope.**

- **Being a runtime.** Nothing here executes during a user's build or test run. The
  product is Markdown plus an installer.
- **Model or vendor integration.** No API calls, no model provider, no prompt
  execution. The framework is read by whatever agent the user already has.
- **Enforcement.** Gates are documents an agent follows, not CI checks that block a
  merge in the user's repo. Turning a checklist into a lint rule is the user's call.
- **Editing the user's source.** The CLI writes `.ai/`, `AGENTS.md`, `.gitignore`,
  and optional tool pointers. Nothing else, ever.

**Deliberately deferred.** A hosted `install.sh` at a real domain (blocked on
registering it), and any telemetry (deferred indefinitely — it would contradict the
zero-dependency, zero-network posture).

---

## 4. Technology

State versions. "Python" and "Python 3.9" imply different available features, and an
agent that assumes the wrong one writes code that does not run.

| Layer | Choice and version | Notes / why |
| --- | --- | --- |
| Language(s) | JavaScript (CommonJS, `"type": "commonjs"`) | No TypeScript, no build step. The source that ships is the source that runs. |
| Runtime | Node.js `>=18.0.0` | Enforced by `engines`. CI proves 18, 20, and 22. |
| Framework(s) | None | A CLI of this size does not need one, and one would be a runtime dependency. |
| Database | N/A | No persistent store. The only state is a JSON manifest in the user's repo. |
| Cache | N/A | Nothing to cache; every command is a filesystem read. |
| Queue / messaging | N/A | Synchronous CLI. |
| Object storage | N/A | |
| Search | N/A | Section lookup is an in-memory parse of one Markdown file. |
| Frontend | N/A | Terminal output only, via `src/lib/ui.js`. |
| Mobile | N/A | |
| Infrastructure | None. Distribution is npm plus a `curl \| sh` script. | There is no server to run. |
| IaC tooling | N/A | No infrastructure to describe. |
| CI/CD | GitHub Actions | `ci.yml` (matrix + CRLF + payload + install.sh + pack), `release.yml` (tag-triggered publish). |
| Observability | N/A | No running service. The only signal is CI, and issues users file. |
| Model provider(s) and pinned versions | None | Deliberate: the framework must work with any agent, so it depends on none. |
| Package manager | npm | `package-lock.json` is gitignored because there are no dependencies to lock. |
| Test framework(s) | `node:test` (built in), run via `scripts/run-tests.js` | A test framework would be the first dependency. |

**Technology we have deliberately rejected.** Every runtime dependency, without
exception — CI asserts `dependencies` is empty and fails the build otherwise. A
dependency in an installer that runs via `npx` in someone else's repository is a
supply-chain surface the product does not need. TypeScript was rejected for the same
reason a build step was: the published tarball should be readable as-is.

**Technology we are stuck with.** Nothing. There is no legacy here — the repository
is days old and every choice is current and revisitable.

---

## 5. Architecture

**Shape in one paragraph.** A single-process Node CLI with no network calls and no
state beyond the filesystem. `bin/gatecraft.js` parses argv and dispatches to one of
nine commands in `src/commands/`, each of which is a function returning an exit code.
Commands compose small libraries in `src/lib/` — filesystem helpers, path resolution,
manifest hashing, `.gitignore` editing, Markdown section parsing. The product it
installs lives in `payload/` as 35 Markdown documents, copied verbatim into the
user's `.ai/` directory and tracked by a SHA-256 manifest so a later upgrade can tell
a pristine file from one the user edited.

**Diagram.** See [architecture/system-overview.md](architecture/system-overview.md).

**Modules and their responsibilities.**

| Module / service | Owns | Must not | Depends on |
| --- | --- | --- | --- |
| `bin/gatecraft.js` | argv parsing, dispatch, exit codes | Contain command logic | `src/cli.js` |
| `src/commands/*` | One user-facing command each | Import another command | `src/lib/*` |
| `src/lib/fsx.js` | All filesystem writes, hashing, the write-outside-root guard | Know about commands | `fs`, `crypto` |
| `src/lib/paths.js` | Deciding what "the project root" is | Write anything | `fs`, `path` |
| `src/lib/manifest.js` | The install record and pristine/modified/unknown diffing | Delete files | `fsx`, `paths` |
| `src/lib/gitignore.js` | The managed block, and detecting rules that defeat it | Touch lines outside its markers | `fsx`, `paths` |
| `src/lib/sections.js` | Parsing and resolving one section of a payload document | Print anything | `fsx`, `links` |
| `src/lib/ui.js` | All terminal output and colour | Make decisions | none |
| `payload/` | The framework itself — the actual product | Reference the CLI's internals | none |

**Entry points.** Nine subcommands: `init`, `upgrade`, `status`, `doctor`,
`checklist`, `standard`, `prompt`, `uninstall`, `eject`. Plus `install.sh` for the
no-Node path. That is the entire surface area.

**Boundaries we enforce.**

- **Never write outside the resolved project root.** Enforced in code by
  `fsx.assertInside()`, which throws rather than writing. Not review-only.
- **Never overwrite a user-authored file without being told to.** Enforced by the
  manifest diff: a file whose hash does not match the shipped one is `modified` and
  is left alone unless `--force`.
- **`payload/` is the source of truth for framework documents.** The installed
  `.ai/` copy in this repository is gitignored precisely so it cannot drift from it.
- **Commands do not import each other.** Review-only — nothing enforces it.
- **Zero runtime dependencies.** Enforced by a CI step, not by convention.

**Detailed architecture** lives in [architecture/](architecture/). Significant
decisions are recorded in [DECISIONS.md](DECISIONS.md).

---

## 6. Scale and performance

Numbers, not adjectives. Every performance decision downstream depends on these, and
an agent given "high traffic" will either over-engineer or under-engineer.

| Metric | Current | Peak observed | Target / next horizon |
| --- | --- | --- | --- |
| Requests per second | N/A — no service | — | — |
| Active users | 0 (unpublished) | — | Not targeted |
| Data volume (largest tables) | N/A — no database | — | — |
| Growth rate | N/A | — | — |
| Background job volume | N/A — no jobs | — | — |

The meaningful scale figures for this project are the size of what it installs and
how long the commands take:

| Metric | Current | Notes |
| --- | --- | --- |
| Payload documents | 35 | Asserted at ≥30 by the `pack` CI job |
| Payload size | 16,490 lines | Across 12 working directories |
| Internal links verified | 1,150 | All resolve; `doctor` and CI both check |
| Test count | 69 | `node scripts/run-tests.js` |

**Latency budgets.**

| Path | p50 | p95 | p99 | Measured where |
| --- | --- | --- | --- | --- |
| `gatecraft init` | ~0.6s | — | — | Local, warm disk, from the test suite |
| `gatecraft standard <topic>` | <0.2s | — | — | Local; one file read and parse |
| Full test suite | ~15s | — | — | Local, Node 20 |
| CI matrix job | ~1–4min | — | — | GitHub Actions; macOS runners are slowest |

Only p50 is recorded because there is no telemetry and no population to take
percentiles over. An agent MUST NOT invent the empty cells.

**Availability target.** No formal target. There is nothing running to be available;
the only availability that matters is npm's.

**Known scaling ceiling.** The one real limit is agent context, not machine
resources: `PROMPTS.md` is 114 KB and `STANDARDS.md` is 46 KB, which is why the
`standard`, `prompt`, and `checklist` retrieval commands exist. If the payload keeps
growing, the next thing to break is a small-context model's ability to load
`AGENTS.md` plus one document — the fix would be to extend section retrieval to the
remaining documents.

**Cost.** £0/month. No infrastructure. The only future costs are a domain
registration and whatever the maintainer's time is worth.

---

## 7. Data

**Sources of truth.** `payload/` is the source of truth for every framework
document. `.ai/.gatecraft-manifest.json` in a user's repository is the source of
truth for what was installed there and at what hash. There is no third store, and no
data leaves the user's machine.

**Core entities.** Three, and they are all files:

- **Payload document** — a Markdown file under `payload/`, identified by its relative
  path.
- **Manifest** — version, install mode, and a `path -> sha256` map of every file
  written, plus the list of tool pointers created.
- **Section** — a parsed slice of a document (`## N. Title`, or `### Name` under a
  category), addressable by number, slug, prefix, or substring.

**Data classification.**

| Data | Classification | Encryption | Retention | Notes |
| --- | --- | --- | --- | --- |
| Framework documents | Public | None needed | Indefinite | MIT-licensed, published in the tarball |
| Install manifest | Internal to the user's repo | None | Until uninstall | Contains only paths and hashes, never file contents |
| Detected stack facts | Internal to the user's repo | None | Until overwritten | Read from `package.json`/`pyproject.toml` and written into `PROJECT_CONTEXT.md`; never transmitted |

**Migration approach.** N/A — no database. The analogous mechanism is `upgrade`,
which is expand-only by construction: it replaces pristine framework files, leaves
modified ones, and leaves user-deleted files deleted. It never destroys, so no
contract phase exists.

**Backups.** N/A for the project. For users, `uninstall` backs `.ai/memory/` up to
`.ai-memory-backup/` before removing anything, because memory is the only
irreplaceable content in an install. That path is covered by tests, which is the
closest thing to a restore drill this project has.

**Data we must never log.** The CLI prints file paths and counts. It MUST NOT print
the contents of any file it reads from a user's repository — `package.json`
dependency names are read for stack detection and MUST stay local to the machine.
There is no logging destination, which is the strongest form of this guarantee.

---

## 8. Security and compliance

**Authentication.** N/A for the CLI — it has no accounts and no server. The only
authenticated action in the project is `npm publish`, which uses a repository secret
in the `release` GitHub environment.

**Authorization.** N/A. The CLI runs with the invoking user's permissions and has no
privilege model of its own.

**Secrets management.** One secret exists: the npm publish token, held as a GitHub
Actions secret and scoped to the `release` environment. It has never been rotated —
the project is days old. No secret is read at runtime by the CLI.

**Trust boundaries.** This is the section that matters for this project.

- **The user's filesystem is the asset.** The CLI writes into a directory it
  resolves, not one it is handed. `paths.findProjectRoot()` walks upward looking for
  markers, so a mis-resolution writes into the wrong repository. Every write is
  funnelled through `fsx.assertInside()`, which throws if the target escapes the
  resolved root.
- **Untrusted input is the user's own repository.** `package.json` and
  `pyproject.toml` are parsed for stack detection. They are read as data and never
  executed — a test asserts detection survives a malformed `package.json`.
- **`install.sh` fetches over the network.** It downloads a tarball from a registry
  and unpacks it. This is the highest-risk path in the product, and the reason
  `GATECRAFT_REGISTRY` is overridable is so CI can exercise it against a local stub.
- **AI-specific:** nothing here enters a model context automatically and nothing the
  model outputs triggers an action in this system. The framework is inert text; the
  agent reading it is the user's.

**Regulatory obligations.** None known. No personal data is collected, stored, or
transmitted, so GDPR has no processing to attach to. No payment data, no health data.

**Threat model.** None written. Given the trust boundaries above, the gap worth
closing first is a written model for the `install.sh` fetch-and-unpack path. Recorded
here rather than in a document that does not exist.

**Known accepted risks.**

- **MIT gives no attribution guarantee for forks.** A fork must keep the copyright
  line and nothing else — no obligation to credit, describe changes, or point
  upstream. Accepted by Eric20Junior on 2026-08-04, knowingly, when moving from
  Apache-2.0 to MIT. The name is protected by [TRADEMARK.md](../TRADEMARK.md) and
  trademark law alone. Do not attempt to recover the guarantee through the licence.

**Security contact / disclosure process.** `security@gatecraft.dev` is referenced in
the shipped documents but **does not exist yet** — the domain is unregistered. Until
it does, disclosure goes to the repository's GitHub issues, which is unsuitable for
an embargoed report. This is a live gap, tracked in
[Known problems](#14-known-problems).

---

## 9. Environments and deployment

| Environment | Purpose | URL | Data | Who can deploy |
| --- | --- | --- | --- | --- |
| Local | Development and the full test suite | — | Synthetic; every test builds a throwaway repo under `os.tmpdir()` | Maintainer |
| CI | Prove the matrix, the payload, and the packed tarball | — | Synthetic | Automatic on push and PR |
| Staging | N/A — none exists | — | — | — |
| Production | The published npm package | `npmjs.com/package/gatecraft` | None | Maintainer, via a `v*.*.*` tag |

**How production differs from staging.** There is no staging. The closest substitute
is the `pack` CI job, which installs the packed tarball into a scratch project and
runs `init` and `doctor` as a user would — that job is the only thing standing
between a packaging mistake and a broken publish.

**Deployment mechanism.** Push a `v*.*.*` tag; `release.yml` verifies and then runs
`npm publish --provenance --access public` from the `release` environment. There is
no rolling or canary concept — a publish is atomic and immediately global.

**Rollback.** npm does not allow a republish of the same version. The rollback is to
publish a higher patch version, and — only within 72 hours and only if nothing
depends on it — `npm deprecate` or unpublish the bad one. **Never executed.** Treat
the procedure as a hypothesis until it has been.

**Release cadence.** Ad hoc. Three releases exist: 1.0.0, 1.0.1, and 1.1.0, all
within three days.

**Freeze windows.** None.

**Feature flags.** None, and none are wanted. The CLI's behaviour is switched by
explicit flags the user passes, which is a different thing and needs no cleanup
policy.

---

## 10. Operations

**Monitoring.** None. The honest answer for a CLI with no service: the maintainer
learns something is wrong when CI fails or a user files an issue.

**Alerts.** GitHub Actions emails the maintainer on a failed workflow. Nothing pages
anyone, and nothing should.

**Logging.** No log destination exists. The CLI writes to stdout/stderr and exits.
During a user-reported problem, the query interface is asking the user to paste the
output of `gatecraft doctor`.

**Runbooks.** [PLAYBOOKS.md](PLAYBOOKS.md) ships 22 runbooks as *product*, for the
user's project. This project itself has no operational runbooks and needs almost
none. The one procedure worth writing down is the release rollback above.

**Incident process.** N/A — no service, no severities, no on-call. A bad publish is
the only incident shape available, and its response is the rollback procedure in
[Environments and deployment](#9-environments-and-deployment).

**Support load.** No users yet, so none. The recurring cost that *does* exist is CI
flakiness from GitHub infrastructure — action resolution has failed with 5xx and
consumed a full job before any step ran. That is not fixable from inside the
workflow; the response is to re-run.

---

## 11. Constraints

Real constraints only. A preference recorded here becomes a rule nobody can question,
which is how projects acquire arbitrary limits with no remaining rationale.

**Technical.**

- **Zero runtime dependencies. Real, and enforced by CI.** Non-negotiable: this runs
  via `npx` inside other people's repositories.
- **Must work on Node 18, 20, and 22, on Linux, macOS, and Windows. Real, and proven
  by the matrix.** This rules out newer APIs — `Object.groupBy`, `Array.toSorted`,
  `fs.globSync`, `util.styleText` are all unavailable on 18.
- **Must work with CRLF checkouts. Real.** A Windows checkout converts the payload to
  CRLF, which once made every heading regex silently match nothing. Parsers tolerate
  it and a CI job reproduces it.
- **Must not write outside the resolved project root. Real, enforced in code.**

**Organizational.** Single maintainer. Every review is a self-review or an agent
review, so the framework's own gates are the only check that exists — which is a real
argument for keeping them strict here rather than relaxing them.

**Commercial.** No budget. Anything requiring recurring spend (a domain, a hosted
installer endpoint) is currently blocked on that. Licence is MIT; the name is
protected by trademark policy, not by the licence.

**Temporal.** None. No deadline exists, and there is no consequence to any date — so
an agent MUST NOT treat "ship it" as time pressure justifying a skipped gate.

**For each constraint, state whether it is real or assumed.** Assumed constraints are
worth testing; a surprising number dissolve when someone asks the owner directly. The
Node 18 floor is the one worth re-testing: Node 18 reached end-of-life in April 2025,
and dropping it would widen the available API surface at the cost of some users.

---

## 12. Overrides and exceptions

Documented deviations from the Gatecraft defaults. An override recorded here is a
decision; an undocumented deviation is a violation. This is the mechanism for
customizing the framework without forking it.

| What we deviate from | Our rule instead | Why | ADR | Review by |
| --- | --- | --- | --- | --- |
| [STANDARDS.md#10](STANDARDS.md#10-security-standards) — threat model required | No threat model document; the trust boundaries in [§8](#8-security-and-compliance) stand in | The attack surface is one local CLI and one fetch script, and it is fully described above. A separate document would restate it. | — | 2026-11-06, or on the first network feature |
| [STANDARDS.md#17](STANDARDS.md#17-monitoring-standards) — monitoring and alerting | None | There is no running service to monitor. Adding observability would mean adding telemetry, which contradicts the product's stated posture. | — | On the first hosted component |
| [CHECKLISTS.md#16](CHECKLISTS.md#16-production-readiness-checklist) — on-call and incident readiness | Not applicable, not merely skipped | A published npm package has no operational duty of care beyond correctness at publish time. | — | On the first hosted component |

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

**Naming.** Files are lower-case with dashes (`run-tests.js`), except payload
documents which are `SHOUTING.md` at the top level and lower-case inside working
directories. Commands are single words. Library modules are nouns (`manifest.js`,
`gitignore.js`). Test files are `<area>.test.js` under `test/`.

**Code layout.** A new command goes in `src/commands/<name>.js` and is registered in
the table at the top of `src/cli.js`. Shared logic goes in `src/lib/` — a command MUST
NOT import another command. Tests live in `test/`, never beside the source.

**Error handling.** Commands return an exit code; they do not throw for expected
conditions. A user-facing failure is `ui.fail(...)` followed by `return 1`. Throwing
is reserved for programmer error and for the write-outside-root guard, where crashing
is the correct behaviour.

**Logging.** All output goes through `src/lib/ui.js` — never bare `console.log`. It
honours `NO_COLOR`. `--md` output goes to `process.stdout.write` unformatted, so it
can be piped into a prompt without escape codes.

**Commits and branches.** History is linear and pushed directly to `main`. Commit
subjects are imperative and describe the *consequence*, not the diff ("Refuse to
uninstall an install that was ejected", not "update uninstall.js"). Bodies explain why
the change was necessary and what would have gone wrong without it — the existing log
is the style guide.

**Pull requests.** None so far; the maintainer pushes to `main`. If that changes, CI
must pass on all nine matrix legs.

**Comments.** Comments explain *why*, never *what*. The codebase's house style is a
short paragraph at the top of each file explaining the problem that file solves, and
inline comments only where the reason for a line is not recoverable from reading it.
A comment restating the code is a defect here.

**Formatting and linting.** `npm run lint` is `node --check` on every source file —
syntax only. There is no formatter and no style linter, so formatting is by hand and
by matching the surrounding code. Do not reformat a file you are editing.

---

## 14. Known problems

Honesty here is the highest-value content in this file. An agent that knows where the
minefield is will avoid it; an agent that does not will step on it confidently.

**Blocking publication — infrastructure that does not exist.** All of it is the
maintainer's to provision, and none of it can be fixed in code:

- `gatecraft.dev` is not registered, so the `curl … | sh` install path in the README
  is a dead link.
- Three addresses are referenced in shipped documents but do not exist:
  `security@`, `conduct@`, and `trademark@gatecraft.dev`.

**Fragile areas.**

- **`paths.findProjectRoot()`** decides where everything gets written by walking
  upward for markers. It is correct today, but a wrong answer here writes into the
  wrong repository. Change it only with tests that cover the monorepo case.
- **`gitignore.js`** edits a file the user owns. The negation logic is subtle: git
  will not re-include a file inside an excluded directory, which is what made
  `--share` silently do nothing in 1.0.0.

**Missing test coverage.**

- `install.sh` is exercised end to end by CI on Linux and macOS, but not on Windows,
  where it is not expected to run.
- `doctor`'s repair paths are less covered than its detection paths.
- No test asserts behaviour on a case-insensitive filesystem, so a macOS-only
  case-collision bug would not be caught locally.

**Known bugs we are living with.** None currently. The eject/uninstall data-loss bug
found on 2026-08-06 is fixed. See [memory/bugs.md](memory/bugs.md) for the record.

**Technical debt with measured interest.** None worth the name. The repository is
days old and the cost of every known shortcut is currently zero per month. An agent
MUST NOT manufacture debt findings to fill this section.

**Documentation known to be stale.** The README's install instructions describe the
`curl | sh` path as if the domain resolved. It does not.

**Recurring operational pain.** GitHub Actions has failed to resolve action download
info with 5xx errors, burning a full job before any step ran. It looks like a test
failure in the checks list and is not one. Re-run before investigating.

---

## 15. Working agreements for agents

Specific rules for AI agents in this repository, beyond
[SYSTEM.md#18](SYSTEM.md#18-ai-behaviour-contract).

**You MAY change without asking.** `src/`, `test/`, `scripts/`, and
`.github/workflows/`. Adding a test is always in scope. Fixing a bug you can
demonstrate with a failing test is always in scope.

**You MUST ask before changing.**

- Anything under `payload/` — that is the product, and its wording is deliberate.
- `package.json` version, `payload/VERSION.md`, or `payload/CHANGELOG.md`. Cutting a
  release is the maintainer's decision, and the verifier requires all three to agree.
- `LICENSE` or `TRADEMARK.md`. The licensing position was settled after four
  reversals; do not reopen it, and do not reintroduce a `NOTICE` file.
- The public CLI surface: adding, renaming, or removing a command or flag.

**You MUST NOT change.** The `.ai/` directory in this repository — it is an installed
copy, gitignored for exactly that reason, and `payload/` is its source of truth. Edit
the payload and re-run `init --force`. The one exception is this file and the other
project-owned files (`DECISIONS.md`, `memory/`, `architecture/`), which are committed
and are meant to be edited here.

**Commands you may run.** `npm test`, `npm run lint`, `npm run verify:payload`,
`node bin/gatecraft.js <any subcommand>`, and any read-only git command.

**Commands you MUST NOT run.** `npm publish`, `git push --force`, anything that
rewrites history, `git tag` (tags trigger a real publish), and `npm install <pkg>` —
adding a dependency fails CI by design.

**When you hit ambiguity.** Stop and ask. Do not guess and do not proceed on an
assumption you cannot verify — record the question and escalate per
[SYSTEM.md#16](SYSTEM.md#16-escalation).

**What you MUST report.** The actual output of `npm test`, not a claim that it
passed. Which of the nine CI matrix legs you verified locally and which you did not.
Any assumption you made about the user's environment. What you deliberately did not
do, and why.

**Context to load first.** [README.md](README.md), then
[SYSTEM.md](SYSTEM.md), then this file, then
[memory/project-memory.md](memory/project-memory.md), then the relevant
[DECISIONS.md](DECISIONS.md) entries. Per
[PROMPTS.md](PROMPTS.md#assemble-the-right-context-for-a-task).

---

## 16. Maintenance

**Owner of this file.** Eric20Junior, sole maintainer.

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
