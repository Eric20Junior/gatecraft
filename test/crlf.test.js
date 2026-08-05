'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const h = require('./helpers.js');
const links = require('../src/lib/links.js');
const fsx = require('../src/lib/fsx.js');

// Regression test for the Windows CRLF bug.
//
// Git checks text files out as CRLF on Windows by default. The Markdown parsers
// were splitting on '\n' alone, leaving a trailing '\r' on every line. In JS,
// `.` excludes `\r` and `$` is not multiline, so `/^(#{1,6})\s+(.*)$/` never
// matched — every heading anchor silently vanished and all 1150 cross-references
// reported as broken.
//
// This reproduces the failure mode: convert some framework documents to CRLF,
// then verify that anchors, cross-references, and section parsing still work.

/** Convert LF to CRLF, as a Windows checkout would. */
function toCRLF(text) {
  return text.replace(/\r?\n/g, '\r\n');
}

test('link checker tolerates CRLF line endings', () => {
  const dir = h.project(h.NODE_PROJECT);
  h.run(dir, ['init', '--yes']);

  // Convert a few framework docs to CRLF.
  const toConvert = [
    '.ai/SYSTEM.md',
    '.ai/AGENTS.md',
    '.ai/CHECKLISTS.md',
    '.ai/PROJECT_CONTEXT.md',
  ];
  for (const rel of toConvert) {
    const text = h.read(dir, rel);
    h.write(dir, rel, toCRLF(text));
  }

  // The link checker must still find all anchors and resolve all references.
  const report = links.check(`${dir}/.ai`);
  assert.ok(report.checked > 0, 'some links were checked');
  assert.strictEqual(report.broken.length, 0, `${report.broken.length} broken links with CRLF`);

  h.cleanup(dir);
});

test('anchorsOf extracts headings from CRLF text', () => {
  // The regex that failed: `/^(#{1,6})\s+(.*)$/` with `$` as single-line anchor.
  // A line ending in `\r` never matches `$`, so every heading disappeared.
  const lf = '# First\n\nSome text.\n\n## Second heading\n\nMore text.\n';
  const crlf = toCRLF(lf);

  const lfAnchors = links.anchorsOf(lf);
  const crlfAnchors = links.anchorsOf(crlf);

  assert.ok(lfAnchors.has('first'), 'LF: first heading found');
  assert.ok(lfAnchors.has('second-heading'), 'LF: second heading found');
  assert.ok(crlfAnchors.has('first'), 'CRLF: first heading found');
  assert.ok(crlfAnchors.has('second-heading'), 'CRLF: second heading found');
  assert.strictEqual(lfAnchors.size, crlfAnchors.size, 'same anchor count');
});

test('fsx.lines splits CRLF correctly', () => {
  // The helper that every parser now uses.
  const lf = 'line one\nline two\nline three\n';
  const crlf = toCRLF(lf);

  const lfLines = fsx.lines(lf);
  const crlfLines = fsx.lines(crlf);

  assert.strictEqual(lfLines.length, crlfLines.length, 'same line count');
  assert.strictEqual(lfLines[0], 'line one', 'LF first line clean');
  assert.strictEqual(crlfLines[0], 'line one', 'CRLF first line clean (no trailing \\r)');
  assert.strictEqual(lfLines[1], 'line two', 'LF second line clean');
  assert.strictEqual(crlfLines[1], 'line two', 'CRLF second line clean');
});

test('checklist output carries no stray carriage returns', () => {
  // Unlike the link checker, the checklist section regex `/^##\s+(\d+)\.\s+(.+?)\s*$/`
  // was never broken by CRLF — `\s` matches `\r`, so the heading still matched.
  // What did leak was the body: splitting on '\n' left a '\r' on every printed
  // line, which a Windows terminal renders as a stray carriage return mid-output.
  const dir = h.project(h.NODE_PROJECT);
  h.run(dir, ['init', '--yes']);

  h.write(dir, '.ai/CHECKLISTS.md', toCRLF(h.read(dir, '.ai/CHECKLISTS.md')));

  const res = h.run(dir, ['checklist', '1']);
  assert.strictEqual(res.code, 0, 'checklist found the section despite CRLF');
  assert.ok(res.out.includes('Architecture checklist'), 'section title printed');
  assert.ok(!res.out.includes('\r'), 'no carriage returns leaked into the output');

  h.cleanup(dir);
});
