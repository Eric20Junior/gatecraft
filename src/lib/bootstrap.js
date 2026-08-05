'use strict';

const fsx = require('./fsx.js');
const { paths } = require('./paths.js');

// AGENTS.md — the one file that stays visible.
//
// It is committed, it is short, and it is the entire reason a hidden `.ai/` works:
// every major coding agent (Claude Code, Cursor, Codex, Copilot, Windsurf, Aider,
// Gemini CLI) reads AGENTS.md or CLAUDE.md at the project root without being asked.
// This file is the pointer that turns 16,000 lines of hidden framework into
// behaviour.
//
// Two constraints shape it. It must be short, because it is read on every single
// task and a long bootstrap file gets skimmed. And it must be imperative, because
// a description of a framework produces acknowledgement while an instruction
// produces action.

const BEGIN = '<!-- >>> gatecraft >>> -->';
const END = '<!-- <<< gatecraft <<< -->';

function body({ version, detected }) {
  const stack =
    detected && !detected.empty
      ? [...detected.languages, ...detected.frameworks].slice(0, 4).join(', ')
      : null;

  return `## Engineering operating system

This repository runs the **AI Engineering Operating System v${version}**. The full
framework is installed at \`.ai/\` — hidden and git-ignored, but present. Read it.
${stack ? `\nStack: ${stack}. Confirm against \`.ai/PROJECT_CONTEXT.md\` before relying on it.\n` : ''}
### Before you write any code

1. \`.ai/SYSTEM.md\` — how to think, loop, decide, self-critique, and score. The kernel.
2. \`.ai/PROJECT_CONTEXT.md\` — what *this* repository is and what constrains it.
3. \`.ai/memory/\` — what has already been decided, built, broken, and learned here.
4. \`.ai/WORKFLOW.md\` — find the workflow matching your task and follow its gates.
5. \`.ai/AGENTS.md\` — adopt the specialist roles that workflow calls for.
6. \`.ai/STANDARDS.md\` + \`.ai/CHECKLISTS.md\` — the bar the work has to clear.

If \`.ai/\` is missing, the framework is not installed. Say so rather than
improvising, and run \`npx gatecraft init\`.

### The loop is not optional

Every non-trivial task runs the **Universal Engineering Loop** in
\`.ai/SYSTEM.md#3-the-universal-engineering-loop\`:

> Understand → Research → Plan → Design → Implement → Review → Critique →
> Improve → Validate → Test → Document → Evaluate

Version 1 is never the final version. Produce it, then attack it, then improve it.
Skipping straight to Implement is the failure mode this framework exists to prevent.

### Non-negotiable

- **Never optimize for speed over quality.** Never stop at the first solution.
- **State assumptions explicitly.** If requirements are ambiguous, ask — do not guess
  and do not silently pick.
- **Never invent facts about this codebase.** Read the file. If you have not read it,
  say you have not read it.
- **Ship at ≥ 90/100** on the Production Readiness Score in
  \`.ai/SYSTEM.md#14-completion-criteria\`. Any dimension below 7 blocks. Security
  below 9 blocks anything touching auth, payments, or personal data.
- **Security review has veto power** and it is not overridable by a deadline.
- **Record what you learn.** Decisions to \`.ai/DECISIONS.md\`, defect classes and
  lessons to \`.ai/memory/\`. Work that teaches nobody anything gets repeated.

### Customizing

Never edit the framework documents — they are replaced wholesale on upgrade. Put
project rules in \`.ai/standards/\`, project workflows in \`.ai/workflows/\`, project
prompts in \`.ai/prompts/\`, and any deliberate exception in
\`.ai/PROJECT_CONTEXT.md#12-overrides-and-exceptions\` with an owner and a reason.

<sub>Managed by [gatecraft](https://github.com/Eric20Junior/gatecraft) v${version}. Edits inside this
block are overwritten on upgrade — write yours outside it.</sub>`;
}

function render(opts) {
  return `${BEGIN}\n${body(opts)}\n${END}`;
}

function findBlock(text) {
  const b = text.indexOf(BEGIN);
  if (b === -1) return null;
  const e = text.indexOf(END, b);
  if (e === -1) return null;
  return { start: b, end: e + END.length };
}

/**
 * Write or update the bootstrap.
 *
 * If AGENTS.md already exists — and plenty of repositories have one — we do not
 * clobber it. We insert our block at the top and leave everything the user wrote
 * intact below. On upgrade, only the block between the markers is replaced.
 */
function ensure(root, { version, detected, file = paths(root).bootstrap } = {}) {
  const next = render({ version, detected });

  if (!fsx.exists(file)) {
    const title = `# AGENTS.md\n\nInstructions for AI coding agents working in this repository.\n\n`;
    fsx.writeAtomic(file, `${title}${next}\n`);
    return { action: 'created', file };
  }

  const existing = fsx.read(file);
  const found = findBlock(existing);

  if (found) {
    if (existing.slice(found.start, found.end) === next) return { action: 'current', file };
    fsx.writeAtomic(file, existing.slice(0, found.start) + next + existing.slice(found.end));
    return { action: 'updated', file };
  }

  // Existing file, no block: insert after the first heading so the user's own
  // title stays first, otherwise at the very top.
  const lines = fsx.lines(existing);
  const h1 = lines.findIndex((l) => /^#\s/.test(l));
  const at = h1 === -1 ? 0 : h1 + 1;
  lines.splice(at, 0, '', next, '');
  fsx.writeAtomic(file, lines.join('\n'));
  return { action: 'merged', file };
}

function remove(root, file = paths(root).bootstrap) {
  if (!fsx.exists(file)) return { action: 'absent' };
  const text = fsx.read(file);
  const found = findBlock(text);
  if (!found) return { action: 'absent' };

  let updated = (text.slice(0, found.start) + text.slice(found.end)).replace(/\n{3,}/g, '\n\n');
  // If nothing is left but the stock heading we wrote, remove the file entirely.
  const stripped = updated.replace(/^#\s.*$/m, '').replace(/^Instructions for AI coding agents.*$/m, '');
  if (stripped.trim() === '') {
    fsx.rimraf(file);
    return { action: 'removed-file' };
  }
  fsx.writeAtomic(file, updated.replace(/\s*$/, '\n'));
  return { action: 'removed-block' };
}

module.exports = { BEGIN, END, render, ensure, remove, findBlock };
