# Security Policy

## Reporting a vulnerability

**Do not open a public issue.**

Report privately through
[GitHub Security Advisories](https://github.com/Eric20Junior/gatecraft/security/advisories/new),
or by email to **security@gatecraft.dev**.

Please include:

- What the vulnerability allows an attacker to do
- The steps to reproduce it, and the version you reproduced it on
- Your assessment of the impact, if you have one

You will get an acknowledgement within **72 hours** and an assessment with a fix
timeline within **7 days**. We will keep you updated until it is resolved, and
credit you in the advisory unless you would rather we did not.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |
| < 1.0   | No        |

Fixes land on the latest minor of the current major.

## Threat model

Knowing what this software actually does narrows what can go wrong with it.

**The CLI runs on a developer's machine, inside their own project.** It:

- reads dependency manifests (`package.json`, `pyproject.toml`, and similar) to
  detect the stack, and never executes them
- writes Markdown into `.ai/` in the current project
- appends a marker-fenced block to `.gitignore` and `AGENTS.md`
- shells out exactly once, to `git remote get-url origin`, with a 3-second timeout
  and arguments passed as an array — never through a shell

**The CLI has zero runtime dependencies.** There is no transitive supply chain to
compromise. This is a deliberate and permanent constraint.

**The framework payload never executes.** It is Markdown. It is read by humans and
by AI agents, and by nothing else.

**No network access, no telemetry.** `gatecraft` sends nothing anywhere. It makes no
network request of any kind. `install.sh` is the sole exception: it downloads the
release tarball from the npm registry, and that is its entire purpose.

### What we consider a vulnerability

- Path traversal — any way to make the CLI write outside the target project
  directory (every destination path goes through `assertInside`, and a bypass of
  that is a real finding)
- Arbitrary command execution through a crafted project file, directory name,
  git remote, or CLI argument
- Destroying user data that the manifest rules say must be preserved: overwriting
  a modified file, resurrecting a deleted one, or clobbering `.ai/memory/`,
  `PROJECT_CONTEXT.md`, or `DECISIONS.md`
- Corruption of `.gitignore` or `AGENTS.md` outside our marker block
- Any code path that transmits project contents off the machine

### What we do not

- **Advice in the framework that you disagree with.** The documents make
  engineering claims and some of them are debatable. That is what issues and pull
  requests are for.
- **An AI agent doing something wrong after reading the framework.** The framework
  is instructions to a model, not a sandbox around it. It cannot constrain a model
  that ignores it, and it is not a security boundary.
- **`curl | sh`.** Piping a downloaded script into a shell requires trusting the
  host and the transport. If that trust is not warranted in your environment, use
  `npx gatecraft init`, or download `install.sh`, read it, and run it yourself.
- **Content you put in `.ai/` yourself.** If you write a credential into
  `PROJECT_CONTEXT.md`, it is on disk in your repository. The default install
  git-ignores `.ai/`, which keeps it out of commits but not off your machine.

## Hardening notes for users

- `.ai/` is git-ignored by default. Run `npx gatecraft init --share` only if you have
  read what is in `PROJECT_CONTEXT.md` and are comfortable committing it.
- Never put secrets in `.ai/`. It is documentation an agent reads in full, and
  anything in it may end up in a model's context window.
- Pin the version in CI: `npx gatecraft@1.0.0 init`, not `npx gatecraft init`.
- Verify what you install: `npm view gatecraft dist.integrity`, and the published
  package carries npm provenance attestation.
