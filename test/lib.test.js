'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const h = require('./helpers.js');

const links = require(path.join(h.ROOT, 'src', 'lib', 'links.js'));
const detect = require(path.join(h.ROOT, 'src', 'lib', 'detect.js'));
const payload = require(path.join(h.ROOT, 'src', 'lib', 'payload.js'));
const context = require(path.join(h.ROOT, 'src', 'lib', 'context.js'));

// ------------------------------------------------------------------ links ----

test('slug follows GitHub anchor rules', () => {
  assert.strictEqual(links.slug('Security Standards'), 'security-standards');
  assert.strictEqual(links.slug('10. Security Standards'), '10-security-standards');
  assert.strictEqual(links.slug('**Bold** heading'), 'bold-heading');
  assert.strictEqual(links.slug('`code` heading'), 'code-heading');

  // Each space becomes a hyphen — GitHub does not collapse runs. This exact rule
  // caused false positives in an earlier verifier, so it is pinned here.
  assert.strictEqual(links.slug('Cache-aside / write-through'), 'cache-aside--write-through');
  assert.strictEqual(links.slug("Hyrum's Law — the law"), 'hyrums-law--the-law');
});

test('anchorsOf disambiguates repeated headings and skips fenced code', () => {
  const anchors = links.anchorsOf('# Same\n\n## Same\n\n```\n# Not a heading\n```\n');
  assert.ok(anchors.has('same'));
  assert.ok(anchors.has('same-1'));
  assert.ok(!anchors.has('not-a-heading'), 'headings inside code fences are ignored');
});

test('every cross-reference in the shipped payload resolves', () => {
  const result = links.check(payload.source());
  assert.ok(result.checked > 500, `expected many links, checked ${result.checked}`);
  assert.deepStrictEqual(
    result.broken.map((b) => `${b.file}:${b.line} -> ${b.target} (${b.reason})`),
    [],
    'no broken links'
  );
});

// ----------------------------------------------------------------- detect ----

test('detect reads a Node project without executing it', (t) => {
  const dir = h.project(h.NODE_PROJECT);
  t.after(() => h.cleanup(dir));

  const f = detect.detect(dir);
  assert.strictEqual(f.name, 'acme-checkout');
  assert.ok(f.languages.includes('TypeScript'), `languages: ${f.languages}`);
  assert.ok(f.frameworks.includes('Next.js'), `frameworks: ${f.frameworks}`);
  assert.ok(f.testing.includes('Vitest'), `testing: ${f.testing}`);
  assert.ok(f.infra.includes('Docker'), `infra: ${f.infra}`);
  assert.ok(f.ci.includes('GitHub Actions'), `ci: ${f.ci}`);
});

test('detect reads a Python project', (t) => {
  const dir = h.project({
    'pyproject.toml': '[project]\nname = "billing"\ndependencies = ["fastapi", "sqlalchemy"]\n',
  });
  t.after(() => h.cleanup(dir));

  const f = detect.detect(dir);
  assert.ok(f.languages.includes('Python'), `languages: ${f.languages}`);
  assert.ok(f.frameworks.includes('FastAPI'), `frameworks: ${f.frameworks}`);
});

test('detect returns empty results rather than throwing on an empty directory', (t) => {
  const dir = h.project({}, { git: false });
  t.after(() => h.cleanup(dir));

  const f = detect.detect(dir);
  assert.deepStrictEqual(f.languages, []);
  assert.deepStrictEqual(f.frameworks, []);
});

test('detect survives a malformed package.json', (t) => {
  const dir = h.project({ 'package.json': '{ this is not json' });
  t.after(() => h.cleanup(dir));

  assert.doesNotThrow(() => detect.detect(dir), 'a broken manifest must not crash init');
});

// ---------------------------------------------------------------- payload ----

test('payload ships every required document', () => {
  const files = payload.list();
  for (const doc of ['SYSTEM.md', 'AGENTS.md', 'WORKFLOW.md', 'STANDARDS.md', 'CHECKLISTS.md']) {
    assert.ok(files.includes(doc), `${doc} is in the payload`);
  }
  assert.ok(files.length >= 30, `expected the full framework, got ${files.length} files`);
});

test('project-owned paths are classified correctly', () => {
  assert.ok(payload.isProjectOwned('PROJECT_CONTEXT.md'));
  assert.ok(payload.isProjectOwned('memory/decisions-log.md'));
  assert.ok(payload.isProjectOwned('standards/README.md'));
  assert.ok(!payload.isProjectOwned('SYSTEM.md'));
  assert.ok(!payload.isProjectOwned('STANDARDS.md'));
});

test('payload hashes are stable across calls', () => {
  assert.deepStrictEqual(payload.hashes(), payload.hashes());
});

test('the licence ships inside the payload and installs with it', () => {
  // MIT obliges anyone who redistributes the framework to include the copyright
  // and permission notice. A team that runs `init --track` and commits `.ai/` is
  // redistributing, so shipping the licence inside the payload is what keeps them
  // compliant without having to think about it.
  const files = payload.list();
  assert.ok(files.includes('LICENSE'), 'payload carries LICENSE');

  const text = require('fs').readFileSync(
    require('path').join(payload.source(), 'LICENSE'),
    'utf8'
  );
  assert.match(text, /^MIT License/, 'it is the MIT licence');
  assert.match(text, /Copyright \(c\) 2026 Gatecraft/, 'it carries our copyright line');
});

test('the licence is framework-owned, so upgrades keep it current', () => {
  // If it were project-owned an edited or stale copy would persist forever.
  assert.ok(!payload.isProjectOwned('LICENSE'));
});

test('stats counts framework documents, not every shipped file', () => {
  // The headline number in `init` output has to agree with the README and
  // `verify:payload`; counting the licence as a "document" drifted it by one.
  const s = payload.stats();
  const docs = payload.list().filter((f) => f.endsWith('.md')).length;
  assert.strictEqual(s.docs, docs, 'docs counts only .md files');
  assert.ok(s.files > s.docs, 'files includes the non-markdown licence');
  assert.ok(s.lines > 10000, `expected the full framework, got ${s.lines} lines`);
});

// ---------------------------------------------------------------- context ----

test('unfilled counts placeholders in sections, not the preamble explaining them', (t) => {
  const fs = require('fs');
  const dir = h.project({}, { git: false });
  t.after(() => h.cleanup(dir));
  const ai = path.join(dir, '.ai');
  fs.mkdirSync(ai, { recursive: true });
  const file = path.join(ai, 'PROJECT_CONTEXT.md');

  // The template's own instructions contain a `{{placeholder}}` as an example of
  // what a placeholder looks like. Counting it made a fully-filled context report
  // one unfilled field forever, with no edit the user could make to clear it.
  const preamble = 'An agent reading `{{placeholder}}` will stop, or guess.\n\n';

  fs.writeFileSync(file, `${preamble}## 1. Identity\n\nName: gatecraft\n\n## 4. Technology\n\nRuntime: Node 18\n`);
  const done = context.unfilled(ai);
  assert.strictEqual(done.total, 0, 'a filled context reports zero, not one');
  assert.deepStrictEqual(done.sections, [], 'and names no section to go and fix');

  fs.writeFileSync(file, `${preamble}## 1. Identity\n\nName: {{}}\n\n## 4. Technology\n\nRuntime: Node 18\n`);
  const partial = context.unfilled(ai);
  assert.strictEqual(partial.total, 1, 'a genuinely unfilled field still counts');
  assert.strictEqual(partial.sections.length, 1, 'and is attributed to its section');
  assert.match(partial.sections[0].name, /Identity/);
});
