#!/usr/bin/env node
'use strict';

// Release gate for the framework payload.
//
// The payload is 16k lines of prose that no test exercises. Everything that can
// silently rot in it — a broken cross-reference, a version that drifted out of
// sync, an unreplaced placeholder shipped as if it were content — is checked
// here, because the alternative is a user discovering it.
//
// Run: npm run verify:payload

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const payloadDir = path.join(root, 'payload');

const problems = [];
const warnings = [];
let checks = 0;

const fail = (file, msg) => problems.push({ file, msg });
const warn = (file, msg) => warnings.push({ file, msg });

const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const c = {
  bold: (s) => (tty ? `[1m${s}[0m` : s),
  dim: (s) => (tty ? `[2m${s}[0m` : s),
  red: (s) => (tty ? `[31m${s}[0m` : s),
  green: (s) => (tty ? `[32m${s}[0m` : s),
  yellow: (s) => (tty ? `[33m${s}[0m` : s),
};

function walk(dir, base = dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(abs, base));
    else out.push(path.relative(base, abs).split(path.sep).join('/'));
  }
  return out.sort();
}

// ------------------------------------------------------------- structure ----

const REQUIRED_DOCS = [
  'README.md', 'SYSTEM.md', 'AGENTS.md', 'WORKFLOW.md', 'STANDARDS.md',
  'CHECKLISTS.md', 'PROMPTS.md', 'KNOWLEDGE.md', 'TEMPLATES.md', 'PLAYBOOKS.md',
  'DECISIONS.md', 'PROJECT_CONTEXT.md', 'GLOSSARY.md', 'VERSION.md', 'CHANGELOG.md',
];

const REQUIRED_DIRS = [
  'memory', 'architecture', 'workflows', 'standards', 'templates', 'checklists',
  'prompts', 'research', 'planning', 'reviews', 'metrics', 'evaluation',
];

if (!fs.existsSync(payloadDir)) {
  console.error(c.red(`payload/ is missing at ${payloadDir}`));
  process.exit(1);
}

const files = walk(payloadDir);

for (const doc of REQUIRED_DOCS) {
  checks++;
  if (!files.includes(doc)) fail(doc, 'required top-level document is missing');
}

for (const dir of REQUIRED_DIRS) {
  checks++;
  const abs = path.join(payloadDir, dir);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
    fail(`${dir}/`, 'required directory is missing');
  } else if (!files.includes(`${dir}/README.md`)) {
    // Without a README the directory is just an empty folder an agent will not
    // know what to put in.
    fail(`${dir}/README.md`, 'directory has no README explaining what belongs in it');
  }
}

// --------------------------------------------------------------- content ----

const BANNED = [
  [/\bTODO\b(?![`'"])/, 'contains a bare TODO'],
  [/\bFIXME\b/, 'contains FIXME'],
  [/\bcoming soon\b/i, 'contains "coming soon"'],
  [/\bLorem ipsum\b/i, 'contains Lorem ipsum'],
  [/\[INSERT[^\]]*\]/i, 'contains an [INSERT ...] stub'],
];

// Lines that legitimately discuss these markers as subject matter rather than
// leaving one behind. Matched exactly so a real stray marker still trips.
const DISCUSSES_MARKERS = /`TODO`|"TODO|TODO: document this|placeholder, TODO, or/;

for (const rel of files) {
  if (!rel.endsWith('.md')) continue;
  const text = fs.readFileSync(path.join(payloadDir, rel), 'utf8');
  const lines = text.split(/\r?\n/);
  checks++;

  let fenced = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) fenced = !fenced;
    if (fenced) return;
    if (DISCUSSES_MARKERS.test(line)) return;
    for (const [re, msg] of BANNED) {
      if (re.test(line)) fail(`${rel}:${i + 1}`, `${msg} — ${line.trim().slice(0, 60)}`);
    }
  });

  if (!/^#\s+\S/m.test(text)) fail(rel, 'has no H1 heading');
  if (text.trim().length < 200) warn(rel, 'is suspiciously short for a framework document');
  if (/\r\n/.test(text)) fail(rel, 'has CRLF line endings — the payload must be LF only');
  if (text.length && !text.endsWith('\n')) fail(rel, 'does not end with a newline');
}

// ---------------------------------------------------------- placeholders ----

// `{{...}}` is the fill-in-me marker. It is correct in project-owned templates
// and wrong anywhere else: a framework document that ships with an unfilled slot
// is a document nobody finished.
const PLACEHOLDERS_ALLOWED = [
  /^PROJECT_CONTEXT\.md$/,
  /^CHANGELOG\.md$/,
  /^memory\//,
  /^architecture\//,
  /^templates\//,
  /^PROMPTS\.md$/, // prompt bodies are meant to be filled in before use
];

for (const rel of files) {
  if (!rel.endsWith('.md')) continue;
  checks++;
  if (PLACEHOLDERS_ALLOWED.some((re) => re.test(rel))) continue;
  const text = fs.readFileSync(path.join(payloadDir, rel), 'utf8');
  const m = text.match(/\{\{[^}]*\}\}/g);
  if (m) fail(rel, `has ${m.length} unfilled placeholder(s), first: ${m[0]}`);
}

// --------------------------------------------------------------- version ----

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
checks++;

const versionMd = fs.readFileSync(path.join(payloadDir, 'VERSION.md'), 'utf8');
const declared = versionMd.match(/\*\*Current version:\s*([0-9]+\.[0-9]+\.[0-9]+)\*\*/);
if (!declared) {
  fail('VERSION.md', 'has no "**Current version: x.y.z**" line to check against package.json');
} else if (declared[1] !== version) {
  fail('VERSION.md', `declares ${declared[1]} but package.json is ${version} — bump both`);
}

checks++;
const changelog = fs.readFileSync(path.join(payloadDir, 'CHANGELOG.md'), 'utf8');
if (!new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\]`, 'm').test(changelog)) {
  fail('CHANGELOG.md', `has no "## [${version}]" section — every release needs an entry`);
}

// Unreleased must not carry content into a release: if it does, either it
// belongs in this version's section or the version was not bumped.
const unreleased = changelog.match(/^## \[Unreleased\]\n([\s\S]*?)(?=^## \[)/m);
if (unreleased && /^\s*[-*]\s+\S/m.test(unreleased[1])) {
  warn('CHANGELOG.md', 'the [Unreleased] section has entries — fold them into the release before publishing');
}

// ----------------------------------------------------------------- links ----

const links = require(path.join(root, 'src', 'lib', 'links.js'));
const linkResult = links.check(payloadDir);
checks += linkResult.checked;
for (const b of linkResult.broken) {
  fail(`${b.file}:${b.line}`, `broken link ${b.target} — ${b.reason}`);
}

// --------------------------------------------------------------- packing ----

// Everything the CLI needs at runtime has to survive `npm pack`. A missing
// payload/ in the tarball is the single worst packaging bug available to us:
// it installs cleanly and then fails on first use.
checks++;
for (const needed of ['bin/', 'src/', 'payload/']) {
  if (!(pkg.files || []).some((f) => f === needed || f === needed.replace(/\/$/, ''))) {
    fail('package.json', `"files" does not include ${needed} — it would be absent from the published tarball`);
  }
}

checks++;
if (pkg.dependencies && Object.keys(pkg.dependencies).length) {
  fail('package.json', 'has runtime dependencies — gatecraft is meant to install with zero');
}

// ---------------------------------------------------------------- report ----

const stats = {
  files: files.length,
  docs: files.filter((f) => f.endsWith('.md')).length,
  lines: files
    .filter((f) => f.endsWith('.md'))
    .reduce((n, f) => n + fs.readFileSync(path.join(payloadDir, f), 'utf8').split('\n').length - 1, 0),
};

console.log('');
console.log(c.bold(`Verifying payload for gatecraft v${version}`));
console.log(c.dim(`  ${stats.docs} documents, ${stats.lines} lines, ${linkResult.checked} links, ${checks} checks`));
console.log('');

for (const w of warnings) {
  console.log(`${c.yellow('!')} ${c.bold(w.file)} ${w.msg}`);
}
if (warnings.length) console.log('');

if (problems.length === 0) {
  console.log(c.green('+ payload is release-ready'));
  console.log('');
  process.exit(0);
}

for (const p of problems) {
  console.log(`${c.red('x')} ${c.bold(p.file)} ${p.msg}`);
}
console.log('');
console.log(c.red(`${problems.length} problem(s) — not release-ready`));
console.log('');
process.exit(1);
