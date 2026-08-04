'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const h = require('./helpers.js');

// `upgrade` is where the hash-based file preservation rules are load-bearing.
// A bug here can overwrite a user's PROJECT_CONTEXT.md.

test('upgrade replaces pristine files and preserves edited ones', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  // Simulate a version bump by editing the manifest.
  const m = JSON.parse(h.read(dir, '.ai/.gatecraft-manifest.json'));
  m.version = '0.9.0';
  h.write(dir, '.ai/.gatecraft-manifest.json', JSON.stringify(m, null, 2));

  // User edits one framework doc, deletes another, and adds their own.
  h.write(dir, '.ai/STANDARDS.md', 'MY RULES\n');
  h.rm(dir, '.ai/GLOSSARY.md');
  h.write(dir, '.ai/notes.md', 'team notes\n');

  const r = h.run(dir, ['upgrade', '--yes']);
  assert.strictEqual(r.code, 0, r.all);

  assert.match(r.out, /preserved/, 'reports preserved files');
  assert.strictEqual(h.read(dir, '.ai/STANDARDS.md'), 'MY RULES\n', 'edit survived');
  assert.ok(!h.exists(dir, '.ai/GLOSSARY.md'), 'deleted file stayed deleted');
  assert.strictEqual(h.read(dir, '.ai/notes.md'), 'team notes\n', 'user-created file kept');
});

test('upgrade never touches project-owned files, edited or not', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  // Append rather than edit a placeholder: the point is that a project-owned file
  // is protected by *ownership*, not by whether we can detect an edit.
  const ctx = h.read(dir, '.ai/PROJECT_CONTEXT.md');
  h.write(dir, '.ai/PROJECT_CONTEXT.md', `${ctx}\nWe are a payment service.\n`);
  h.write(dir, '.ai/memory/decisions-log.md', '- We chose Postgres.\n');

  // Simulate version change.
  const m = JSON.parse(h.read(dir, '.ai/.gatecraft-manifest.json'));
  m.version = '0.9.0';
  h.write(dir, '.ai/.gatecraft-manifest.json', JSON.stringify(m, null, 2));

  h.run(dir, ['upgrade', '--yes']);

  assert.match(h.read(dir, '.ai/PROJECT_CONTEXT.md'), /payment service/, 'context survived');
  assert.match(h.read(dir, '.ai/memory/decisions-log.md'), /Postgres/, 'memory survived');
});

test('a pristine project-owned file is still not replaced on upgrade', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  // Untouched since install — its hash matches, so a hash-only rule would replace
  // it and discard the stack we detected at install time.
  const before = h.read(dir, '.ai/PROJECT_CONTEXT.md');
  assert.match(before, /detected by gatecraft/, 'precondition: install pre-filled it');

  const m = JSON.parse(h.read(dir, '.ai/.gatecraft-manifest.json'));
  m.version = '0.9.0';
  h.write(dir, '.ai/.gatecraft-manifest.json', JSON.stringify(m, null, 2));
  h.run(dir, ['upgrade', '--yes']);

  assert.strictEqual(h.read(dir, '.ai/PROJECT_CONTEXT.md'), before, 'byte-identical after upgrade');
});

test('upgrade --force replaces framework files but still preserves project-owned ones', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  h.write(dir, '.ai/STANDARDS.md', 'EDITED\n');
  h.write(dir, '.ai/PROJECT_CONTEXT.md', 'OUR CONTEXT\n');

  const r = h.run(dir, ['upgrade', '--force', '--yes']);
  assert.strictEqual(r.code, 0, r.all);

  assert.notStrictEqual(h.read(dir, '.ai/STANDARDS.md'), 'EDITED\n', 'framework edit was clobbered');
  assert.strictEqual(h.read(dir, '.ai/PROJECT_CONTEXT.md'), 'OUR CONTEXT\n', 'project context kept even with --force');
});

test('upgrade leaves a user-deleted file deleted', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  h.rm(dir, '.ai/GLOSSARY.md');
  const m = JSON.parse(h.read(dir, '.ai/.gatecraft-manifest.json'));
  m.version = '0.9.0';
  h.write(dir, '.ai/.gatecraft-manifest.json', JSON.stringify(m, null, 2));

  const r = h.run(dir, ['upgrade', '--yes']);
  assert.strictEqual(r.code, 0, r.all);
  assert.match(r.out, /stayed deleted/, 'reports the deletion was respected');
  assert.ok(!h.exists(dir, '.ai/GLOSSARY.md'), 'deleted file stayed deleted');
});

test('upgrade --force restores a deleted framework file', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  h.rm(dir, '.ai/GLOSSARY.md');
  const r = h.run(dir, ['upgrade', '--force', '--yes']);

  assert.strictEqual(r.code, 0, r.all);
  assert.ok(h.exists(dir, '.ai/GLOSSARY.md'), '--force restored the missing framework file');
});

test('upgrade --dry-run reports changes without writing them', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  h.write(dir, '.ai/STANDARDS.md', 'EDITED\n');
  const m = JSON.parse(h.read(dir, '.ai/.gatecraft-manifest.json'));
  m.version = '0.9.0';
  h.write(dir, '.ai/.gatecraft-manifest.json', JSON.stringify(m, null, 2));

  const r = h.run(dir, ['upgrade', '--dry-run']);
  assert.strictEqual(r.code, 0, r.all);
  assert.match(r.out, /would replace/, 'reports what would change');
  assert.match(r.out, /STANDARDS\.md/, 'names the preserved file');
  assert.strictEqual(h.read(dir, '.ai/STANDARDS.md'), 'EDITED\n', 'nothing was actually written');
});
