'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const h = require('./helpers.js');

test('uninstall removes everything it added and nothing else', (t) => {
  const dir = h.project({
    ...h.NODE_PROJECT,
    'README.md': '# My Project\n\nExisting content.\n',
  });
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  const r = h.run(dir, ['uninstall', '--yes']);
  assert.strictEqual(r.code, 0, r.all);

  assert.ok(!h.exists(dir, '.ai'), '.ai/ removed');
  assert.ok(!h.exists(dir, 'AGENTS.md'), 'AGENTS.md removed');

  const gi = h.read(dir, '.gitignore');
  assert.doesNotMatch(gi, /gatecraft/, '.gitignore block removed');
  assert.match(gi, /node_modules/, 'existing .gitignore preserved');

  assert.strictEqual(h.read(dir, 'README.md'), '# My Project\n\nExisting content.\n', 'unrelated file untouched');
});

test('uninstall backs up memory by default', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  h.write(dir, '.ai/memory/decisions-log.md', '- We chose Postgres.\n');
  const r = h.run(dir, ['uninstall', '--yes']);

  assert.strictEqual(r.code, 0, r.all);
  assert.ok(!h.exists(dir, '.ai'), '.ai/ removed');
  assert.ok(h.exists(dir, '.ai-memory-backup'), 'memory backed up');
  assert.match(h.read(dir, '.ai-memory-backup/decisions-log.md'), /Postgres/, 'content preserved');
});

test('uninstall --purge skips the memory backup', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);
  h.write(dir, '.ai/memory/decisions-log.md', '- content\n');

  h.run(dir, ['uninstall', '--purge', '--yes']);
  assert.ok(!h.exists(dir, '.ai'));
  assert.ok(!h.exists(dir, '.ai-memory-backup'), 'no backup created');
});

test('uninstall keeps user content in AGENTS.md when the file is not ours alone', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  const b = h.read(dir, 'AGENTS.md');
  h.write(dir, 'AGENTS.md', `# Project rules\n\nNever force-push.\n\n${b}`);

  h.run(dir, ['uninstall', '--yes']);

  const after = h.read(dir, 'AGENTS.md');
  assert.match(after, /Never force-push/, 'user content kept');
  assert.doesNotMatch(after, /gatecraft/, 'our block removed');
});

test('uninstall is a no-op in a directory with no install', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));

  const r = h.run(dir, ['uninstall', '--yes']);
  assert.strictEqual(r.code, 0, r.all);
  assert.match(r.out, /nothing to uninstall/i);
});
