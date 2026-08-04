# spec/ — the origin documents

**These files are not part of the product. Nothing reads them at runtime.**

`SYSTEM.md`, `AGENTS.md`, and `loop.md` in this directory are the original
specification AI-OS was built from. They are kept for provenance: when someone
asks "why does the Production Readiness Score have ten dimensions" or "where did
the twelve-stage loop come from", the answer is here.

## Status: frozen and non-normative

| | |
| --- | --- |
| **Authority** | None. Superseded by `payload/`. |
| **Maintained** | No. Frozen as of v1.0.0. |
| **Shipped to users** | No — excluded from the npm tarball by `files` in `package.json`. |

If these documents and the framework in `payload/` disagree, **`payload/` is
correct**. It is the implementation, it is what users install, and it has been
revised many times since these were written. Treat anything here as a historical
statement of intent, not as a requirement.

## Do not edit these to change behaviour

Changing `spec/SYSTEM.md` changes nothing. The corresponding live document is
`payload/SYSTEM.md`, and that is the file to edit — see
[CONTRIBUTING.md](../CONTRIBUTING.md).

The three files map roughly as follows, though the correspondence is loose and
gets looser with every release:

| Origin document | Became |
| --- | --- |
| `spec/SYSTEM.md` | `payload/SYSTEM.md`, `payload/STANDARDS.md`, `payload/CHECKLISTS.md` |
| `spec/AGENTS.md` | `payload/AGENTS.md` — the role definitions and their authority |
| `spec/loop.md` | `payload/WORKFLOW.md` — the twelve-stage engineering loop |

## Can this directory be deleted?

Yes, with no functional consequence. It is excluded from the published package,
so users never receive it, and no code path references it. It is kept because
deleting the record of why a system is shaped the way it is has a cost that only
shows up later — which is, as it happens, one of the things the framework itself
argues about technical debt.
