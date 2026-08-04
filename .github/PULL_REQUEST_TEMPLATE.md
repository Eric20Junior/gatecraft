## What changes

<!-- One or two sentences on what is different for the user after this merges. -->

## Why

<!-- The problem this solves. For framework changes, the concrete failure you saw. -->

## Type

- [ ] Bug fix
- [ ] Framework document change (standards, workflows, checklists, roles)
- [ ] New CLI feature
- [ ] Documentation
- [ ] Internal refactor

## For framework changes

<!-- Delete this section if it does not apply. Reviewers need to read the words,
     not a diff summary. -->

**Before:**
> 

**After:**
> 

- [ ] Every normative statement uses MUST / SHOULD / MAY per RFC 2119
- [ ] Every MUST states its reason in the same breath
- [ ] It is technology-agnostic — reads correctly in a Rust service, a Django
      monolith, and a Swift app
- [ ] No `{{placeholders}}` outside project-owned files
- [ ] Any new cross-reference resolves (`npm run verify:payload`)

## For CLI changes

<!-- Delete this section if it does not apply. -->

- [ ] No new runtime dependencies (this is permanent — the count must stay zero)
- [ ] Writes to files we did not create stay inside a marker block
- [ ] Every new error message names the problem *and* the command that fixes it
- [ ] If this touches install / upgrade / uninstall / the manifest, there is a
      test demonstrating the file-preservation property it affects

## Checks

- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run verify:payload`

## Anything reviewers should look at closely

<!-- Trade-offs you made, alternatives you rejected, parts you are unsure about. -->
