'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const h = require('./helpers.js');

// `init` is the command everyone runs and most people run exactly once, so its
// side effects on a repository they care about have to be exactly right.

test('init installs the framework, hides it, and leaves one committed file', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));

  const r = h.run(dir, ['init', '--yes']);
  assert.strictEqual(r.code, 0, r.all);

  assert.ok(h.exists(dir, '.ai/SYSTEM.md'), 'framework installed');
  assert.ok(h.exists(dir, '.ai/.gatecraft-manifest.json'), 'manifest written');
  assert.ok(h.exists(dir, 'AGENTS.md'), 'bootstrap written');

  // The invisibility requirement, stated as an assertion.
  assert.match(h.read(dir, '.gitignore'), /^\.ai\/$/m, '.ai/ is git-ignored');
  assert.match(h.read(dir, '.gitignore'), /node_modules/, 'existing .gitignore preserved');
});

test('init writes a manifest that records every payload file', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  const m = JSON.parse(h.read(dir, '.ai/.gatecraft-manifest.json'));
  assert.strictEqual(m.schema, 1);
  assert.ok(Object.keys(m.files).length >= 30, `expected the payload to be recorded, got ${Object.keys(m.files).length}`);
  for (const [rel, entry] of Object.entries(m.files)) {
    assert.match(entry.hash, /^[a-f0-9]+$/, `${rel} has a usable hash`);
    assert.ok(['framework', 'project'].includes(entry.kind), `${rel} has a kind`);
  }
});

test('init detects the stack and pre-fills PROJECT_CONTEXT.md', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  const ctx = h.read(dir, '.ai/PROJECT_CONTEXT.md');
  assert.match(ctx, /acme-checkout/, 'project name filled from package.json');
  assert.match(ctx, /\|\s*Language\(s\)\s*\|\s*TypeScript\s*\|/, 'language row filled');
  assert.match(ctx, /Next\.js/, 'framework detected');
  assert.match(ctx, /Prisma|PostgreSQL/, 'datastore detected');
  assert.match(ctx, /Vitest/, 'test framework detected');
  assert.match(ctx, /Docker/, 'infrastructure detected');

  // Every detected value must be marked unverified. A wrong fact stated
  // confidently is the exact failure PROJECT_CONTEXT.md exists to prevent.
  assert.match(ctx, /detected by gatecraft — verify/, 'detected values are flagged for review');
});

test('init --no-detect leaves the template untouched', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes', '--no-detect']);

  const ctx = h.read(dir, '.ai/PROJECT_CONTEXT.md');
  assert.doesNotMatch(ctx, /detected by gatecraft/, 'nothing was pre-filled');
});

test('init is refused on an existing install and does not damage it', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  h.write(dir, '.ai/STANDARDS.md', 'MY RULES\n');
  const r = h.run(dir, ['init', '--yes']);

  assert.notStrictEqual(r.code, 0, 'a second init fails');
  assert.match(r.all, /upgrade/, 'and points at the command that is safe');
  assert.strictEqual(h.read(dir, '.ai/STANDARDS.md'), 'MY RULES\n', 'the edit survived');
});

test('init refuses to install over a .ai/ it did not create', (t) => {
  const dir = h.project({ ...h.NODE_PROJECT, '.ai/notes.md': 'someone else lives here\n' });
  t.after(() => h.cleanup(dir));

  const r = h.run(dir, ['init', '--yes']);
  assert.notStrictEqual(r.code, 0, 'refused');
  assert.strictEqual(h.read(dir, '.ai/notes.md'), 'someone else lives here\n', 'untouched');
});

test('init is idempotent in .gitignore — no duplicate block on --force', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);
  h.run(dir, ['init', '--yes', '--force']);

  const gi = h.read(dir, '.gitignore');
  assert.strictEqual((gi.match(/>>> gatecraft >>>/g) || []).length, 1, 'exactly one managed block');
});

test('init --track ignores nothing', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes', '--track']);

  const gi = h.read(dir, '.gitignore');
  assert.doesNotMatch(gi, /^\.ai\/$/m, '.ai/ is not ignored');
});

test('init --share keeps project-owned files visible to git', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes', '--share']);

  const gi = h.read(dir, '.gitignore');
  assert.match(gi, /!.*PROJECT_CONTEXT\.md/, 'context is negated back in');
});

test('init --no-bootstrap writes no AGENTS.md', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes', '--no-bootstrap']);

  assert.ok(!h.exists(dir, 'AGENTS.md'), 'no bootstrap file');
  assert.ok(h.exists(dir, '.ai/SYSTEM.md'), 'framework still installed');
});

test('init merges into an existing AGENTS.md without losing its content', (t) => {
  const dir = h.project({
    ...h.NODE_PROJECT,
    'AGENTS.md': '# My Project\n\nOur house rule: never force-push main.\n',
  });
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  const b = h.read(dir, 'AGENTS.md');
  assert.match(b, /never force-push main/, 'existing instructions kept');
  assert.match(b, />>> gatecraft >>>/, 'our block added');
  assert.match(b, /\.ai\/SYSTEM\.md/, 'and it points at the framework');
});

test('init works in an empty directory with no git and no manifest of any kind', (t) => {
  const dir = h.project({}, { git: false });
  t.after(() => h.cleanup(dir));

  const r = h.run(dir, ['init', '--yes']);
  assert.strictEqual(r.code, 0, r.all);
  assert.ok(h.exists(dir, '.ai/SYSTEM.md'));
  assert.ok(h.exists(dir, 'AGENTS.md'));
});

test('init --all-agents writes the tool-specific pointers', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes', '--all-agents']);

  assert.ok(h.exists(dir, 'CLAUDE.md'), 'CLAUDE.md');
  assert.ok(h.exists(dir, '.github/copilot-instructions.md'), 'copilot instructions');
  assert.ok(h.exists(dir, '.cursor/rules/gatecraft.mdc'), 'cursor rule');
});
