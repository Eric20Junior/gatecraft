'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const h = require('./helpers.js');

// `eject` is the one command whose whole purpose is to stop the CLI from working.
// It must leave every document in place while removing the two things that make the
// install managed — the manifest and the .gitignore block — and it must be honest
// that upgrade and uninstall are gone afterwards. A bug here either deletes work the
// user chose to keep, or leaves a manifest behind so the install is only half-ejected.

test('eject refuses without --yes and changes nothing', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  const r = h.run(dir, ['eject']);
  assert.strictEqual(r.code, 1, 'an unconfirmed eject is a refusal, not a no-op success');
  assert.match(r.all, /upgrade.*will not work/i, 'says what is being given up');

  assert.ok(h.exists(dir, '.ai/.gatecraft-manifest.json'), 'manifest untouched');
  assert.match(h.read(dir, '.gitignore'), /gatecraft/, '.gitignore block untouched');
  assert.strictEqual(h.run(dir, ['status']).code, 0, 'the install still works');
});

test('eject --yes keeps every file and removes only the management', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  const before = h.read(dir, '.ai/SYSTEM.md');

  const r = h.run(dir, ['eject', '--yes']);
  assert.strictEqual(r.code, 0, r.all);

  assert.ok(!h.exists(dir, '.ai/.gatecraft-manifest.json'), 'manifest removed');
  assert.ok(h.exists(dir, '.ai/SYSTEM.md'), 'the framework is kept, not deleted');
  assert.ok(h.exists(dir, '.ai/STANDARDS.md'), 'every document is kept');
  assert.ok(h.exists(dir, 'AGENTS.md'), 'the bootstrap is kept');
  assert.strictEqual(h.read(dir, '.ai/SYSTEM.md'), before, 'contents are byte-identical');
});

test('eject makes .ai/ visible to git without disturbing the rest of .gitignore', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  h.run(dir, ['eject', '--yes']);

  const gi = h.read(dir, '.gitignore');
  assert.doesNotMatch(gi, /gatecraft/, 'our managed block is gone');
  assert.match(gi, /node_modules/, "the user's own rules survive");
  assert.match(gi, /dist/, 'all of them');
});

test('after ejecting, upgrade and uninstall no longer claim the install', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);
  h.run(dir, ['eject', '--yes']);

  const up = h.run(dir, ['upgrade']);
  assert.notStrictEqual(up.code, 0, 'upgrade must not silently operate on an ejected tree');
  assert.match(up.all, /no gatecraft install found/i, 'and says why');

  // The files are still there, so uninstall must not decide it can delete them.
  const un = h.run(dir, ['uninstall', '--yes']);
  assert.strictEqual(un.code, 1, 'uninstall no longer owns these files');
  assert.match(un.all, /not a managed install/i, 'and says so rather than deleting them');
  assert.ok(h.exists(dir, '.ai/SYSTEM.md'), 'the ejected framework survives an uninstall');
  assert.ok(h.exists(dir, 'AGENTS.md'), 'and so does the bootstrap');
});

test('eject preserves edits and reports them as files kept', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  h.write(dir, '.ai/STANDARDS.md', '# Ours now\n\nWe rewrote this.\n');
  h.write(dir, '.ai/memory/project-memory.md', '- Chose Postgres.\n');

  const r = h.run(dir, ['eject', '--yes']);
  assert.strictEqual(r.code, 0, r.all);

  assert.match(h.read(dir, '.ai/STANDARDS.md'), /We rewrote this/, 'a heavy edit is the reason to eject');
  assert.match(h.read(dir, '.ai/memory/project-memory.md'), /Postgres/, 'project memory kept');
  assert.match(r.out, /files kept/, 'the report names what is being kept');
});

test('eject reports nothing to do when there is no install', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));

  const r = h.run(dir, ['eject', '--yes']);
  assert.strictEqual(r.code, 1, 'exits non-zero so a script does not read it as success');
  assert.match(r.all, /nothing to eject/i);
});

test('eject is not reversible by itself, but init --force can re-adopt the tree', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);
  h.run(dir, ['eject', '--yes']);

  // The help text promises this path; if it stops working the promise is a lie.
  const again = h.run(dir, ['init', '--force', '--yes']);
  assert.strictEqual(again.code, 0, again.all);
  assert.ok(h.exists(dir, '.ai/.gatecraft-manifest.json'), 'management restored');
  assert.strictEqual(h.run(dir, ['status']).code, 0, 'and status works again');
});

test('eject --dir operates on the named project, not the working directory', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  const outside = h.project({}, { git: false });
  t.after(() => {
    h.cleanup(dir);
    h.cleanup(outside);
  });
  h.run(dir, ['init', '--yes']);

  const r = h.run(outside, ['eject', '--dir', dir, '--yes']);
  assert.strictEqual(r.code, 0, r.all);

  assert.ok(!h.exists(dir, '.ai/.gatecraft-manifest.json'), 'the named project was ejected');
  assert.ok(h.exists(dir, '.ai/SYSTEM.md'), 'and kept its files');
  assert.ok(!h.exists(outside, '.ai'), 'the working directory was not touched');
});
