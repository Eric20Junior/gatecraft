'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const h = require('./helpers.js');

const sections = require(path.join(h.ROOT, 'src', 'lib', 'sections.js'));

// The point of `standard` and `prompt` is that an agent can pull one section
// instead of reading a whole reference document. Two things have to hold for that
// to be worth anything: the slice must be the right slice, and it must be small.

// ---------------------------------------------------------------- parsing ----

test('parseNumbered splits `## N. Title` and strips the suffix from the slug', () => {
  const all = sections.parseNumbered(
    '# Doc\n\n## 1. Architecture standards\n\nbody a\n\n---\n\n## 2. Coding standards\n\nbody b\n',
    { stripSuffix: /\s+standards$/i },
  );
  assert.strictEqual(all.length, 2);
  assert.strictEqual(all[0].slug, 'architecture');
  assert.strictEqual(all[0].number, 1);
  assert.strictEqual(all[0].body, 'body a', 'trailing rule is not content');
  assert.strictEqual(all[1].slug, 'coding');
  assert.strictEqual(all[0].anchor, '1-architecture-standards');
});

test('parseNumbered ignores headings inside fenced code', () => {
  const all = sections.parseNumbered('## 1. Real standards\n\n```\n## 2. Fake standards\n```\n', {
    stripSuffix: /\s+standards$/i,
  });
  assert.strictEqual(all.length, 1, 'a heading inside a fence is sample output');
});

test('parseEntries groups `### Name` under its `## N. Category`', () => {
  const all = sections.parseEntries('# Lib\n\n## 1. Planning\n\n### First one\n\nbody\n\n### Second one\n\nbody\n');
  assert.strictEqual(all.length, 2);
  assert.strictEqual(all[0].category, 'Planning');
  assert.strictEqual(all[0].slug, 'first-one');
  assert.strictEqual(all[1].slug, 'second-one');
});

// -------------------------------------------------------------- resolving ----

test('resolve prefers exact slug, then prefix, then substring', () => {
  const all = [
    { number: 1, title: 'Testing standards', slug: 'testing' },
    { number: 2, title: 'Test data standards', slug: 'test-data' },
    { number: 3, title: 'Unit testing standards', slug: 'unit-testing' },
  ];
  assert.strictEqual(sections.resolve(all, 'testing').found.number, 1, 'exact slug wins over substring');
  assert.strictEqual(sections.resolve(all, 'test-data').found.number, 2);
  assert.strictEqual(sections.resolve(all, 'unit').found.number, 3, 'unique prefix resolves');
  assert.strictEqual(sections.resolve(all, '2').found.number, 2, 'number resolves');
});

test('resolve reports every match rather than guessing when ambiguous', () => {
  const all = [
    { number: 1, title: 'Audit one', slug: 'audit-one' },
    { number: 2, title: 'Audit two', slug: 'audit-two' },
  ];
  const r = sections.resolve(all, 'audit');
  assert.strictEqual(r.found, null, 'an ambiguous query must not silently pick the first');
  assert.strictEqual(r.matches.length, 2);
});

// ------------------------------------------------------------------- CLI -----

test('standard prints one section and lists all of them', () => {
  const dir = h.project();
  assert.strictEqual(h.run(dir, ['init', '--yes']).code, 0);

  const list = h.run(dir, ['standard']);
  assert.strictEqual(list.code, 0);
  assert.ok(list.out.includes('security'), 'listing names the security standard');

  const one = h.run(dir, ['standard', 'security', '--md']);
  assert.strictEqual(one.code, 0);
  assert.ok(one.out.startsWith('## 10. Security standards'), 'md output is the raw section heading');
  assert.ok(!one.out.includes('Architecture standards'), 'no neighbouring section leaks in');
});

test('standard by number matches the same section as by name', () => {
  const dir = h.project();
  h.run(dir, ['init', '--yes']);
  const byName = h.run(dir, ['standard', 'security', '--md']).out;
  const byNumber = h.run(dir, ['standard', '10', '--md']).out;
  assert.strictEqual(byName, byNumber);
});

test('prompt prints one entry, and every prompt in the library is addressable', () => {
  const dir = h.project();
  h.run(dir, ['init', '--yes']);

  const one = h.run(dir, ['prompt', 'write-an-adr', '--md']);
  assert.strictEqual(one.code, 0);
  assert.ok(one.out.startsWith('### Write an ADR'));

  const list = h.run(dir, ['prompt']);
  assert.strictEqual(list.code, 0);
  assert.ok(list.out.includes('write-an-adr'), 'listing includes a known prompt');

  // Uniqueness is asserted against the parser rather than the rendered table:
  // a duplicate slug makes a prompt permanently unreachable by name, and that is
  // a property of the library, not of how it happens to be printed.
  const fs = require('fs');
  const all = sections.parseEntries(fs.readFileSync(path.join(dir, '.ai', 'PROMPTS.md'), 'utf8'));
  assert.ok(all.length >= 60, `expected the full library, parsed ${all.length}`);
  const slugs = all.map((p) => p.slug);
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  assert.deepStrictEqual(dupes, [], 'a duplicate slug is an unreachable prompt');

  // And every one of them must actually resolve to itself.
  for (const p of all) {
    assert.strictEqual(sections.resolve(all, p.slug).found?.slug, p.slug, `${p.slug} does not resolve`);
  }
});

test('the prompt listing aligns on one column and does not wrap at 80 chars', () => {
  const dir = h.project();
  h.run(dir, ['init', '--yes']);
  const lines = h.run(dir, ['prompt']).out.split('\n').filter((l) => /^ {4}[a-z0-9-]+ {2,}\S/.test(l));
  assert.ok(lines.length >= 60, `expected the listing, matched ${lines.length} rows`);

  // One shared column, so the titles form a straight edge. A couple of slugs are
  // longer than the cap and set their own; everything else agrees.
  const cols = lines.map((l) => l.length - l.replace(/^ {4}[a-z0-9-]+ +/, '').length);
  const common = cols.sort((a, b) => cols.filter((c) => c === a).length - cols.filter((c) => c === b).length).pop();
  const aligned = cols.filter((c) => c === common).length;
  assert.ok(aligned >= lines.length - 3, `only ${aligned} of ${lines.length} rows share a column`);
  assert.ok(common <= 52, `title column at ${common} leaves too little room in an 80-col terminal`);
});

test('an unknown name fails loudly instead of printing the wrong section', () => {
  const dir = h.project();
  h.run(dir, ['init', '--yes']);
  for (const cmd of [['standard', 'nonexistent'], ['prompt', 'nonexistent']]) {
    const res = h.run(dir, cmd);
    assert.strictEqual(res.code, 1, `${cmd[0]} exits non-zero`);
    assert.ok(/no \w+ named/.test(res.out + res.err), 'says what went wrong');
  }
});

test('the slice is materially smaller than the document it came from', () => {
  const dir = h.project();
  h.run(dir, ['init', '', '--yes']);
  const fs = require('fs');

  const whole = fs.readFileSync(path.join(dir, '.ai', 'STANDARDS.md'), 'utf8').length;
  const slice = h.run(dir, ['standard', 'security', '--md']).out.length;
  assert.ok(slice * 4 < whole, `slice ${slice} should be far under the ${whole}-byte document`);
});

test('commands read the project copy, so project edits win over the packaged payload', () => {
  const dir = h.project();
  h.run(dir, ['init', '--yes']);
  const fs = require('fs');
  const file = path.join(dir, '.ai', 'STANDARDS.md');
  fs.writeFileSync(file, '# S\n\n## 1. Local standards\n\nOur own rule.\n');

  const res = h.run(dir, ['standard', 'local', '--md']);
  assert.strictEqual(res.code, 0);
  assert.ok(res.out.includes('Our own rule.'), 'the installed copy is the source of truth');
});
