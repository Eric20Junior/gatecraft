# VERSION.md — Versioning and Compatibility

**Current version: 1.1.0**

This file governs the version of the AI Engineering Operating System itself — the
`.ai/` directory — not the version of the project that hosts it. Those are separate
lifecycles and MUST be tracked separately: upgrading the framework is not a release
of your software, and releasing your software does not bump the framework.

For versioning *your project*, see [Project versioning](#5-project-versioning) below;
the policy there is the one referenced by
[WORKFLOW.md#11](WORKFLOW.md#16-release-management-workflow) and
[CHECKLISTS.md#12](CHECKLISTS.md#12-release-checklist).

Keywords MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are used per RFC 2119.

Contents:

1. [The scheme](#1-the-scheme)
2. [What counts as breaking](#2-what-counts-as-breaking)
3. [Upgrading the Gatecraft](#3-upgrading-the-gatecraft)
4. [Compatibility matrix](#4-compatibility-matrix)
5. [Project versioning](#5-project-versioning)

---

## 1. The scheme

Semantic versioning, `MAJOR.MINOR.PATCH`, applied to the framework as a contract with
two kinds of consumer: the agents that read it, and the projects that have customized
it.

| Component | Bumped when |
| --- | --- |
| **MAJOR** | A change that breaks existing overrides, removes or renumbers a document or section, or changes the kernel's semantics — the loop, the gates, the completion criteria, the escalation rules. |
| **MINOR** | New content that is additive: a new checklist, a new playbook, a new prompt, a new standards section, a new template. Existing overrides and links keep working. |
| **PATCH** | Corrections that change no meaning: typos, broken links, clarified wording, a fixed example. |

The version is stated in three places and MUST agree in all three: the heading of
this file, the subtitle of [README.md](README.md), and the latest entry in
[CHANGELOG.md](CHANGELOG.md). A disagreement between them is a defect, not a
cosmetic issue — it is the signal that an upgrade was applied halfway.

---

## 2. What counts as breaking

The contract is not the prose. Consumers depend on **structure**, and structure is
what breaks.

**MAJOR — breaking:**

- Removing or renaming a top-level document. Every cross-link to it dies, and so does
  every project override that referenced it.
- Renumbering a numbered section. `STANDARDS.md#10-security-standards` is an address;
  changing what lives at number 10 silently redirects every citation to the wrong
  content, which is worse than a broken link because nothing errors.
- Changing an anchor that other documents link to.
- Changing the meaning of a MUST — either adding one that existing conforming work
  would now fail, or downgrading one that projects relied on.
- Changing the completion criteria, the scoring dimensions, or the gate definitions
  in [SYSTEM.md](SYSTEM.md).
- Changing the override mechanism, so that existing entries in
  [PROJECT_CONTEXT.md#12](PROJECT_CONTEXT.md#12-overrides-and-exceptions),
  [standards/](standards/), or [workflows/](workflows/) stop being honoured.
- Removing a role from [AGENTS.md](AGENTS.md) that other documents delegate to.

**MINOR — additive:**

- A new section appended at the end of an existing numbered document, taking the next
  number.
- A new checklist, playbook, prompt, template, or knowledge entry.
- A new SHOULD or MAY.
- A new working directory.
- Strengthening guidance without making previously-conforming work fail.

**PATCH — non-semantic:**

- Typos, grammar, formatting.
- Fixing a link that pointed at the wrong anchor.
- Clarifying wording where the meaning was already unambiguous to a careful reader.
- Correcting a factually wrong example that nothing depended on.

**The test:** if a project that had customized the previous version would need to
change anything to keep working, it is MAJOR. If an agent following the previous
version would now be doing something wrong, it is at least MINOR. If neither, it is
PATCH.

Numbered sections are addresses. **Never renumber to make a list tidier** — append,
or accept the gap. Tidiness is not worth a silent redirect.

---

## 3. Upgrading the Gatecraft

The framework is designed so that a newer version can be dropped in without losing
your customizations, provided you followed the override mechanism rather than editing
the core files. If you edited the core files directly, upgrading is a merge, and that
is the cost of having forked.

**Files that are yours and MUST be preserved across an upgrade:**

- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — entirely yours after first fill-in.
- [DECISIONS.md](DECISIONS.md) — your ADRs. Only the template and guidance sections
  come from the framework.
- Everything under [memory/](memory/), [research/](research/),
  [planning/](planning/), [reviews/](reviews/), [metrics/](metrics/),
  [evaluation/](evaluation/), and [architecture/](architecture/).
- Your override files in [standards/](standards/), [workflows/](workflows/),
  [prompts/](prompts/), [checklists/](checklists/), and [templates/](templates/).

**Files that are the framework's and are replaced wholesale:**

[README.md](README.md), [SYSTEM.md](SYSTEM.md), [AGENTS.md](AGENTS.md),
[WORKFLOW.md](WORKFLOW.md), [STANDARDS.md](STANDARDS.md),
[CHECKLISTS.md](CHECKLISTS.md), [PROMPTS.md](PROMPTS.md),
[PLAYBOOKS.md](PLAYBOOKS.md), [TEMPLATES.md](TEMPLATES.md),
[KNOWLEDGE.md](KNOWLEDGE.md), [GLOSSARY.md](GLOSSARY.md), this file, and
[CHANGELOG.md](CHANGELOG.md).

**Procedure:**

1. Read [CHANGELOG.md](CHANGELOG.md) for every version between yours and the target.
   Do not skip to the latest entry; a MAJOR two versions back still applies to you.
2. For a MAJOR bump, list your overrides first and check each against the breaking
   changes. Anything referencing a removed or renumbered section MUST be updated.
3. Replace the framework files. Preserve the files listed above.
4. Re-check every override in
   [PROJECT_CONTEXT.md#12](PROJECT_CONTEXT.md#12-overrides-and-exceptions): does the
   thing it deviates from still exist at that address, and does the reason still hold?
   An upgrade is the natural moment to retire an override whose reason has expired.
5. Verify links resolve. A broken cross-link is the most common upgrade defect and
   the cheapest to catch.
6. Update the version reference in your repository's root agent-instruction file if it
   states one.
7. Record the upgrade as an ADR if it changed anything you had customized. Otherwise a
   line in your project's changelog is sufficient.

**Downgrading** is not supported. Content added by a newer version — a checklist item,
a standard, a playbook — may be referenced by work already done. Pin the version you
want instead of moving backwards.

---

## 4. Compatibility matrix

| Gatecraft version | Documents | Working directories | Kernel semantics | Notes |
| --- | --- | --- | --- | --- |
| 1.0.0 | 15 | 12 | Twelve-stage loop; ten scoring dimensions; 90/100 threshold; Security veto | Initial release |
| 1.0.1 | 15 | 12 | Unchanged | Installer fixes only. No document, directory, or kernel change; no override can be affected. |
| 1.1.0 | 15 | 12 | Unchanged | Retrieval commands (`standard`, `prompt`) and a bootstrap section pointing at them. No document, directory, section number, or anchor changed; no override can be affected. |

Record each release here. The columns are the things an override can depend on, so a
change in any of them is the fastest way to see whether an upgrade will cost you
work.

**Model and tool compatibility.** The framework is deliberately technology-agnostic
and depends on nothing but a filesystem and Markdown. It carries no requirement on a
model, vendor, or agent runtime, and pins no versions of either. If a future version
does introduce such a dependency, that is a MAJOR change and MUST be stated here.

---

## 5. Project versioning

The policy for versioning *your software*, referenced by the release workflow and the
release checklist.

**Use semantic versioning, `MAJOR.MINOR.PATCH`,** where the contract is with your
consumers:

- **MAJOR** — any change that requires a consumer to do work: a removed or renamed
  endpoint, field, or parameter; a changed type or format; a narrowed accepted input;
  a widened output that consumers parse strictly; a changed default that alters
  behaviour; a removed configuration option; a new required field on a request.
- **MINOR** — new capability that existing consumers can ignore: a new endpoint, a new
  optional parameter, a new field in a response, a new permitted enum value where
  consumers were told to tolerate unknowns.
- **PATCH** — a fix that brings behaviour into line with the documented contract, with
  no interface change.

**Rules:**

- **Breaking changes get a MAJOR bump, honestly.** The most common versioning failure
  is shipping a breaking change as a MINOR because a MAJOR felt disproportionate. The
  bump is not a judgement about the size of the work; it is a signal to consumers
  about the work *they* must do, and understating it converts your inconvenience into
  their outage.
- **What counts as breaking is defined by consumer expectations, not by intent.** If
  a consumer's code stops working, it was breaking, regardless of whether the
  behaviour was documented. Hyrum's Law applies: observable behaviour becomes the
  contract.
- **Pre-1.0 is not a licence.** `0.x` conventionally permits breaking changes in
  MINOR, but if you have real consumers, communicate breaks as though you were past
  1.0. The version number is not what makes their code break.
- **Deprecate before removing.** Announce, provide a migration path, allow a stated
  window, warn at runtime where you can, and only then remove — in a MAJOR release.
  See [PLAYBOOKS.md#21](PLAYBOOKS.md#21-deprecating-and-removing-a-feature).
- **Tag the release immutably**, and ensure the artifact you shipped was built from
  that tag. Per [STANDARDS.md#22](STANDARDS.md#22-deployment-standards).
- **The changelog entry is written for the consumer**, in language they understand,
  describing what changed for them — not a list of commit subjects. Per
  [CHECKLISTS.md#12](CHECKLISTS.md#12-release-checklist).

**Internal services** with a known, small set of consumers MAY use a simpler scheme —
a date, a build number, or a commit hash — provided breaking changes are still
communicated explicitly and a rollback can identify exactly what was running. Record
the choice in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) so it is a decision rather
than a drift.
