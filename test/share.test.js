'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const h = require('./helpers.js');

// Share mode is the answer to a question the hidden default cannot answer: a
// teammate clones the repository and gets AGENTS.md pointing at a `.ai/` that is
// not there, along with none of the context, decisions, or memory the first
// developer built up. Share mode commits the project-owned half and keeps the
// 13k-line framework half out of git.
//
// The pre-existing test asserted the .gitignore *text* contained a negation,
// which is not the guarantee anyone depends on. What matters is what `git` does
// with those rules, so these tests ask git directly.

/** What git would actually commit, which is the only claim worth testing. */
function tracked(dir) {
  execFileSync('git', ['add', '-A'], { cwd: dir, stdio: 'ignore' });
  const out = execFileSync('git', ['diff', '--cached', '--name-only'], {
    cwd: dir,
    encoding: 'utf8',
  });
  execFileSync('git', ['reset', '-q'], { cwd: dir, stdio: 'ignore' });
  return out.trim() ? out.trim().split('\n') : [];
}

test('share mode commits project knowledge and withholds the framework', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes', '--share']);

  const files = tracked(dir);
  const ai = files.filter((f) => f.startsWith('.ai/'));

  // The half a team needs to share.
  assert.ok(ai.includes('.ai/PROJECT_CONTEXT.md'), 'context is shared');
  assert.ok(ai.includes('.ai/DECISIONS.md'), 'decisions are shared');
  assert.ok(
    ai.some((f) => f.startsWith('.ai/memory/')),
    'memory is shared'
  );

  // The half that would bloat every diff. These are 13k of the 16k lines.
  for (const heavy of ['SYSTEM.md', 'KNOWLEDGE.md', 'PROMPTS.md', 'WORKFLOW.md', 'PLAYBOOKS.md']) {
    assert.ok(!ai.includes(`.ai/${heavy}`), `${heavy} stays out of git`);
  }
});

test('a teammate cloning a share-mode repo inherits the project knowledge', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes', '--share']);

  // The first developer records something only this project knows.
  h.write(dir, '.ai/DECISIONS.md', `${h.read(dir, '.ai/DECISIONS.md')}\n## Postgres over Mongo\n`);
  execFileSync('git', ['add', '-A'], { cwd: dir, stdio: 'ignore' });
  execFileSync(
    'git',
    ['-c', 'user.email=a@a', '-c', 'user.name=devA', 'commit', '-qm', 'context'],
    { cwd: dir, stdio: 'ignore' }
  );

  const clone = h.project({}, { git: false });
  t.after(() => h.cleanup(clone));
  execFileSync('git', ['clone', '-q', dir, clone], { stdio: 'ignore' });

  assert.match(h.read(clone, '.ai/DECISIONS.md'), /Postgres over Mongo/, 'decision travelled');
  assert.ok(h.exists(clone, 'AGENTS.md'), 'the pointer travelled');
  // The framework did not, by design — it is reinstalled, not cloned.
  assert.ok(!h.exists(clone, '.ai/SYSTEM.md'), 'the kernel is not in git');

  // And the teammate can restore it without losing what they just inherited.
  const res = h.run(clone, ['doctor', '--fix']);
  assert.strictEqual(res.code, 0, 'doctor --fix succeeds');
  assert.ok(h.exists(clone, '.ai/SYSTEM.md'), 'kernel restored');
  assert.match(h.read(clone, '.ai/DECISIONS.md'), /Postgres over Mongo/, 'decision survived the fix');
});

test('doctor does not flag shared project files as accidentally committed', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes', '--share']);
  execFileSync('git', ['add', '-A'], { cwd: dir, stdio: 'ignore' });

  // Before the fix this warned about all 13 shared files and advised
  // `git rm -r --cached .ai`, which would untrack precisely the files share
  // mode exists to share — turning the advice into the bug.
  const res = h.run(dir, ['doctor']);
  assert.doesNotMatch(res.out, /tracked by git despite being installed hidden/, 'no false alarm');
  assert.doesNotMatch(res.out, /git rm -r --cached \.ai/, 'does not advise untracking the share');
});

test('doctor still catches framework files leaked into a share-mode repo', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes', '--share']);

  // -f because .gitignore is doing its job; this is the user overriding it.
  execFileSync('git', ['add', '-f', '.ai/SYSTEM.md'], { cwd: dir, stdio: 'ignore' });

  const res = h.run(dir, ['doctor']);
  assert.match(res.out, /framework file\(s\) under \.ai\/ are tracked/, 'the real leak is reported');
  assert.match(res.out, /git rm --cached \.ai\/SYSTEM\.md/, 'and named precisely, not by wildcard');
});

test('share mode refuses to claim success when an existing rule defeats it', (t) => {
  // Found by installing gatecraft into gatecraft: this repository's own
  // .gitignore already had `/.ai/`, so --share wrote thirteen negations that git
  // ignored entirely and then reported "project memory shared".
  const dir = h.project({ ...h.NODE_PROJECT, '.gitignore': 'node_modules/\n/.ai/\n' });
  t.after(() => h.cleanup(dir));

  const res = h.run(dir, ['init', '--yes', '--share']);

  assert.match(res.out, /NOT shared/, 'the failure is stated, not glossed');
  assert.match(res.out, /line 2/, 'and located precisely');
  // The claim in the warning has to match what git actually does.
  assert.strictEqual(
    tracked(dir).filter((f) => f.startsWith('.ai/')).length,
    0,
    'git really does share nothing, as the warning says'
  );
});

test('conflictingRule ignores our own block and single-file rules', (t) => {
  const gitignore = require('../src/lib/gitignore.js');

  // Our own block contains `.ai/` by design; flagging it would warn on every
  // correct install.
  const clean = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(clean));
  h.run(clean, ['init', '--yes', '--share']);
  assert.strictEqual(gitignore.conflictingRule(clean), null, 'our own block is not a conflict');

  // A rule for one file inside .ai/ does not exclude the directory, so git can
  // still re-include its siblings.
  const narrow = h.project({ ...h.NODE_PROJECT, '.gitignore': '.ai/scratch.md\n' });
  t.after(() => h.cleanup(narrow));
  assert.strictEqual(gitignore.conflictingRule(narrow), null, 'a single-file rule is not a conflict');

  // But the wildcard forms exclude the contents wholesale and must be caught.
  for (const rule of ['.ai/', '/.ai', '.ai/*', '.ai/**']) {
    const dir = h.project({ ...h.NODE_PROJECT, '.gitignore': `${rule}\n` });
    t.after(() => h.cleanup(dir));
    const found = gitignore.conflictingRule(dir);
    assert.ok(found, `${rule} is detected as a conflict`);
    assert.strictEqual(found.text, rule, `${rule} is reported verbatim`);
  }
});

test('hidden mode still reports any tracked .ai/ file', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));
  h.run(dir, ['init', '--yes']);

  execFileSync('git', ['add', '-f', '.ai/DECISIONS.md'], { cwd: dir, stdio: 'ignore' });

  // Under the default there is no project/framework split: nothing belongs in
  // git, so a project-owned file being tracked is still worth saying.
  const res = h.run(dir, ['doctor']);
  assert.match(res.out, /tracked by git despite being installed hidden/, 'hidden mode unchanged');
});
