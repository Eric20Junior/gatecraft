# prompts/

This project's **own** prompt library — the prompts that only make sense here
because they carry this system's names, constraints, and conventions.

[../PROMPTS.md](../PROMPTS.md) holds 20 sections of technology-agnostic prompts. It
is replaced on upgrade and **is not edited**. Anything project-specific goes here.

---

## What belongs here

- **Prompts loaded with project context** — a framework prompt with your service
  names, your module layout, your error conventions filled in. These are
  substantially more effective than the generic version and substantially less
  portable, which is exactly why they live here rather than upstream.
- **Prompts for tasks unique to this project** — your migration procedure, your
  tenant-provisioning flow, your particular ingestion pipeline.
- **Prompts that encode a hard-won correction.** When an agent gets something wrong
  the same way twice, the fix is often a prompt that pre-empts it. That is worth
  keeping.

## What does not belong here

- **Copies of framework prompts, unchanged.** Link to
  [../PROMPTS.md](../PROMPTS.md) instead. A copy is a fork, and it will rot.
- **Single-use prompts.** If you will not run it again, it was a message, not a
  library entry. This directory is small on purpose; a prompt library nobody can
  navigate does not get used.
- **System prompts for production features.** Those are application code — they
  belong in the repository proper, under version control with tests and an eval
  suite in [../evaluation/](../evaluation/). Prompts that ship to users are a
  product surface, not documentation.

---

## Naming convention

`<verb>-<object>.md` — `review-migration.md`, `explain-billing-flow.md`,
`generate-tenant-fixture.md`. Named for what it does, so the directory listing is
the index.

---

## Format

Match [../PROMPTS.md](../PROMPTS.md) so the two read as one library:

````markdown
### [Name]

**Use when** — the trigger, specifically. Not "when reviewing code" but "when
reviewing a change that touches the tenant boundary".

```
[The prompt itself, in a plain fenced block so it can be copied without
markdown artifacts.]
```

**Expected output** — what a good response looks like. This is how you tell a
useful run from a plausible one.

**Follow with** — [next prompt or workflow step].
````

---

## Writing prompts that keep working

**Point at files; do not paste them.** A prompt that embeds a code snippet is
correct on the day it is written and quietly wrong afterwards. `Read
src/billing/ledger.ts` stays true.

**State the constraint, not just the task.** "Add caching" gets you caching. "Add
caching; invalidation must be correct across the three writers listed in
architecture/system-overview.md, and a stale read here is a billing error" gets you
the caching you wanted.

**Ask for the failure modes.** The single highest-value line to append to almost any
engineering prompt is: *"then list what would have to be true for this to be wrong."*

**Name the standard.** "Per `standards/typescript.md`" is shorter than restating the
rules and cannot drift from them.

---

## Review

When a prompt here stops producing what it used to, the usual cause is that the code
moved and the prompt still describes the old shape. Fix the prompt in the change
that moves the code, or delete it — a prompt that gives confidently wrong context is
more expensive than no prompt, because its output looks informed.

---

## Related

- [../PROMPTS.md](../PROMPTS.md) — the framework library
- [../PROMPTS.md#20](../PROMPTS.md#20-meta-prompts) — prompts for writing prompts
- [../AGENTS.md](../AGENTS.md) — the roles these prompts address
