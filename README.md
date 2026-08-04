<div align="center">

# Gatecraft

**An engineering operating system for AI coding agents.**

Install it into any project. Your agent stops guessing and starts following a
process — plan, design, implement, review, test, document — with quality gates it
has to actually pass.

[![npm](https://img.shields.io/npm/v/gatecraft.svg)](https://www.npmjs.com/package/gatecraft)
[![CI](https://github.com/Eric20Junior/gatecraft/actions/workflows/ci.yml/badge.svg)](https://github.com/Eric20Junior/gatecraft/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](package.json)

</div>

```sh
npx gatecraft init
```

That is the whole installation. It takes about two seconds, adds one committed
file to your repository, and changes nothing else.

<!-- PLACEHOLDER-README -->

---

## The problem

AI coding agents are good at writing code and bad at finishing work.

Ask one for a feature and you tend to get exactly the feature — no error handling
on the path nobody mentioned, no tests, no migration for the column it added, no
note anywhere about why it chose that approach. It is confident, it is fast, and
it reports "done" at a point no engineer would call done.

This is not a model capability problem. Give the same model a written standard,
a checklist, and the project's actual context and the output changes
substantially. The problem is that every session starts from nothing: no memory of
last week's decision, no idea which database you use, no definition of done.

## What Gatecraft does

It puts a complete engineering framework in your project — **16,300+ lines across
35 documents** — and one small committed file that points your agent at it.

| | |
| --- | --- |
| **A 12-stage loop** | Understand → Research → Plan → Design → Implement → Review → Critique → Improve → Validate → Test → Document → Evaluate. Code that skipped review and tests is not done, and cannot be reported as done. |
| **26 specialist roles** | The agent adopts the right lens — Backend, Security, SRE, Database, Performance, Accessibility. The Security Engineer holds veto power over a release. |
| **25 standards sections** | MUST/SHOULD/MAY rules per RFC 2119, each with the reason attached, so an agent can apply them to cases the text did not anticipate. |
| **20 checklists** | Binary pass/fail gates. Plus a Production Readiness Score over 10 dimensions: ship at 90/100, and any single dimension below 7 blocks regardless of the total. |
| **62 prompts, 38 templates, 22 playbooks** | For the work that recurs — a PRD, a threat model, an ADR, a postmortem, responding to an incident, paying down debt. |
| **Persistent memory** | `.ai/memory/` carries decisions, bugs, lessons, and debt between sessions, so your agent stops relitigating settled questions. |

## Install

**With Node 18+ (recommended):**

```sh
npx gatecraft init
```

This detects your stack and pre-fills `PROJECT_CONTEXT.md` with it, then gives you
`upgrade`, `status`, and `doctor`.

**Without Node:**

```sh
curl -fsSL https://gatecraft.dev/install.sh | sh
```

Same framework, no Node required. POSIX sh; works on macOS, Alpine, and Debian.
It writes only inside the current directory and installs no global binary.

**Globally, if you install into projects often:**

```sh
npm install -g gatecraft && gatecraft init
```

## What it puts in your project

```
your-project/
├── AGENTS.md          ← committed. ~30 lines. The only visible change.
├── .ai/               ← the framework. Hidden from `ls`, git-ignored.
│   ├── PROJECT_CONTEXT.md    the facts about your project
│   ├── SYSTEM.md             the operating rules and quality gates
│   ├── WORKFLOW.md           the 12-stage loop
│   ├── STANDARDS.md          the MUST rules
│   ├── CHECKLISTS.md         the gates
│   ├── AGENTS.md             the 26 roles
│   ├── memory/               what carries between sessions
│   └── … 29 more documents
└── (your code, untouched)
```

**`.ai/` is invisible by design.** It is dot-prefixed, so `ls` does not show it,
and it is added to `.gitignore` inside a marker block, so it never appears in
`git status` or a diff. Your repository stays clean; the framework is there the
whole time.

**`AGENTS.md` is the one committed file**, and it is the file that makes this work
without configuration: Claude Code, Cursor, Codex, Copilot, Windsurf, Aider, and
Gemini CLI all read it automatically. Commit it and your whole team's agents pick
up the framework with nothing installed on their side.

Prefer the framework tracked in git so your team shares the filled-in context?

```sh
npx gatecraft init --share   # commit PROJECT_CONTEXT.md, ADRs and memory; ignore the rest
npx gatecraft init --track   # commit everything
```

## Using it

**There is no special syntax. You write the same prompts you already write.**

The framework is not a command language you have to learn — it is context your
agent reads before it starts. `AGENTS.md` is in your repo root, every major agent
reads that file automatically, and it points at `.ai/`. So:

> Add rate limiting to the login endpoint.

That is a complete Gatecraft prompt. What changes is not how you ask — it is what
comes back.

### What actually happens

Your agent reads `AGENTS.md`, follows it into `.ai/`, and routes your sentence to
the workflow that matches it. "Add rate limiting" is a feature, so it picks
[Feature Development](payload/WORKFLOW.md), which runs the twelve-stage loop and
will not let it report done before Review, Test, and Document have happened.

Concretely, on that one sentence it will now:

1. Read `.ai/PROJECT_CONTEXT.md` and learn you use Redis — so it does not invent
   an in-memory counter that breaks across your three instances
2. Read `.ai/memory/decisions.md` and find you already rejected a token bucket
   in March, and why — so it does not re-propose it
3. Adopt the **Backend** and **Security** roles from `.ai/AGENTS.md`
4. Write the code, then **critique its own first version** — the loop treats v1
   as a draft, not an answer
5. Run the security checklist, because auth is involved and Security has veto
6. Add tests, because untested code cannot pass the gate
7. Score against the Production Readiness Score, and tell you the number
8. Record what it decided in `.ai/DECISIONS.md`

You asked for one thing and got the whole job, because "done" is defined in a
file rather than left to the model's judgement.

### The one thing worth doing by hand

**Fill in `.ai/PROJECT_CONTEXT.md`.** Twenty minutes, once. It is the first
document an agent reads and it outranks the agent's own assumptions — every blank
in it is a fact your agent will otherwise guess at, and guesses about your
database or your auth model are where bad code comes from.

```sh
npx gatecraft status     # counts what is still unfilled
```

`init` pre-fills what it can detect from your manifests and marks each one
`detected by gatecraft — verify`. Correct those first; they are guesses too.

### Prompts that use it more deliberately

You never *need* these — the framework engages on its own. They help when you
want a specific part of it:

| Say this | To get |
| --- | --- |
| "Follow the bug fix workflow." | Reproduce → root cause → failing test → fix → regression test, instead of a patch on the symptom |
| "Review this as the Security Engineer." | One of the 26 roles in `.ai/AGENTS.md`, with its own lens and authority |
| "Run the production readiness checklist." | The 22-item gate, scored, before you ship |
| "Score this against the Production Readiness Score." | A number out of 100 across 10 dimensions, and what is blocking |
| "Write an ADR for this decision." | A record in `.ai/DECISIONS.md` your team can find in six months |
| "Update memory before you finish." | Decisions, bugs, and lessons persisted to `.ai/memory/` for the next session |
| "This is a one-line typo fix — skip the loop." | An explicit escape hatch. The framework is strict by default, and you are allowed to say when it is overkill |

### Small changes

The loop scales down. A typo fix does not get a threat model — `.ai/SYSTEM.md`
sizes the process to the change. If your agent is being ceremonious about
something trivial, say so directly; that is a normal instruction, not a fight
with the framework.

### Between sessions

`.ai/memory/` is what makes the second session better than the first. Decisions,
defects, lessons, and debt accumulate there, and the next agent — yours, or a
teammate's, or a different tool entirely — reads them before proposing anything.
That is the compounding part, and it only works if memory actually gets written,
so it is worth asking for explicitly until it becomes habit.

### For your team

Commit `AGENTS.md`. That is all anyone else needs — their agent picks up the same
framework with nothing installed on their side. If you want the filled-in context
shared too:

```sh
npx gatecraft init --share    # commit PROJECT_CONTEXT.md, ADRs and memory; ignore the rest
```

## Commands

| | |
| --- | --- |
| `gatecraft init` | Install into this project. Detects the stack, pre-fills context. |
| `gatecraft status` | Install health, what you have edited, how much context is unfilled. |
| `gatecraft upgrade` | Update the framework, preserving everything you wrote. |
| `gatecraft doctor` | Verify every file is present and all ~1,150 cross-references resolve. |
| `gatecraft checklist [name]` | Print a quality gate. `--md` to pipe into a PR. |
| `gatecraft eject` | Keep the files, drop the tooling. No lock-in. |
| `gatecraft uninstall` | Remove everything, including our `.gitignore` and `AGENTS.md` blocks. |

## Upgrades will not eat your work

This is the part worth trusting, so here is exactly how it works.

At install, `gatecraft` records a SHA-256 hash of every file as written. At upgrade it
compares:

- **hash matches** → you never touched it → safe to replace
- **hash differs** → you edited it → **preserved**, and reported to you
- **file is gone** → you deleted it → **stays deleted**, because deleting a
  document is a decision and resurrecting it would be overruling you
- **file is new in this version** → installed

On top of that, **project-owned files are never overwritten on upgrade** —
`PROJECT_CONTEXT.md`, `DECISIONS.md`, `memory/`, `standards/`, `workflows/`,
`prompts/`, `architecture/` and the rest. Not even with `--force`. A flag meaning
"give me the current framework" must not be able to erase your team's context.

```sh
npx gatecraft upgrade --dry-run   # see precisely what would change first
```

## Customising it without fighting it

**Never edit the framework documents** — edits are preserved, but they also make
that file stop receiving upgrades. Write deltas instead:

- `.ai/standards/` — your project's rules. They override `STANDARDS.md`.
- `.ai/workflows/` — your own procedures.
- `.ai/prompts/` — prompts specific to your domain.
- `PROJECT_CONTEXT.md` §12 — record deliberate exceptions and why.

Precedence, highest first: **`PROJECT_CONTEXT.md`** (facts) → **`DECISIONS.md`**
(ADRs) → **`.ai/standards/`** (your MUSTs) → **`STANDARDS.md`** (framework MUSTs)
→ **`KNOWLEDGE.md`** (descriptive). Facts about your project always win.

## Privacy and safety

**No network access. No telemetry. Nothing is sent anywhere.** `gatecraft` makes no
network request of any kind; `install.sh` downloads the release tarball and that
is its only reason to exist.

**Zero runtime dependencies**, permanently — there is no transitive supply chain
here. The CLI reads dependency manifests to detect your stack and never executes
them, writes only inside your project, and shells out exactly once, to
`git remote get-url origin`, with arguments passed as an array rather than through
a shell.

**Never put secrets in `.ai/`.** It is documentation an agent reads in full.
Details, plus how to report a vulnerability: [SECURITY.md](SECURITY.md).

## Works with

Claude Code · Cursor · GitHub Copilot · OpenAI Codex · Windsurf · Aider ·
Gemini CLI · Cline · Zed — anything that reads `AGENTS.md`, which is all of them.

Language- and framework-agnostic. The framework reads correctly in a Rust
service, a Django monolith, a Next.js app, or a Swift project; nothing in it
assumes an ecosystem.

## FAQ

**Do I have to write prompts a special way?**
No. Ask for what you want in plain language, exactly as you do now. The framework
is context your agent reads before it starts, not a syntax you invoke.

**How do I know it is working?**
The shape of the response changes. You get a plan before code, tests alongside it,
a self-critique of the first attempt, and a readiness score at the end. If you get
a bare code block with none of that, your agent probably never read `AGENTS.md` —
tell it to read `.ai/README.md` and follow it, and check `npx gatecraft doctor`.

**Does this slow the agent down?**
Yes, on the first response, and that is the trade. You get a plan before code and
tests alongside it, rather than a fast answer you spend the afternoon repairing.

**Do I have to use all 35 documents?**
No. The agent reads what a task needs. Delete what you do not want — upgrades will
respect that and leave it deleted.

**What if I disagree with a standard?**
Override it in `.ai/standards/` and record why in `PROJECT_CONTEXT.md` §12. The
framework is opinionated on purpose and wrong about some things for your project
specifically; overriding it is the designed path, not a workaround.

**Is my code sent anywhere?**
No. See above — no network calls at all.

**Can I remove it cleanly?**
`npx gatecraft uninstall` deletes `.ai/` and removes our blocks from `.gitignore` and
`AGENTS.md`, leaving anything you wrote around them intact. `npx gatecraft eject` keeps
the documents and drops the tooling.

## Contributing

The documents are the product — see [CONTRIBUTING.md](CONTRIBUTING.md) for how
framework prose is reviewed, and for the file-preservation rules any CLI change
has to respect.

```sh
git clone https://github.com/Eric20Junior/gatecraft && cd gatecraft
npm test && npm run verify:payload
```

## Licence

[MIT](LICENSE). Copyright © 2026 Comp AI.

Use it, fork it, modify it, ship it inside your product, sell what you build with
it. No fee, no registration, no usage limit, and no conditions beyond one:

- **Keep the copyright and permission notice** in copies or substantial portions
  of the software. That is the entire obligation. `init` installs [LICENSE](LICENSE)
  into `.ai/` so a team that commits the folder satisfies it without thinking
  about it.

**The name is a separate matter from the code.** MIT covers copyright; it says
nothing about trademarks, and trademark rights exist independently of it. So the
code is yours to do almost anything with, while "Gatecraft" is not: describing
your work as "a fork of Gatecraft" or "built on Gatecraft" is always fine and
needs no permission, and shipping a package called `Gatecraft Pro` is not,
because that claims to *be* this project. [TRADEMARK.md](TRADEMARK.md) has the
details.

We would rather be credited than not, and MIT does not compel it beyond the
notice. If your fork is useful, a line saying where it came from costs you
nothing and helps people find the original.

---

<div align="center">
<sub>Built because "done" should mean the same thing to your agent as it does to you.</sub>
</div>

