'use strict';

const path = require('path');
const ui = require('../lib/ui.js');
const fsx = require('../lib/fsx.js');
const paths = require('../lib/paths.js');
const payload = require('../lib/payload.js');
const manifest = require('../lib/manifest.js');
const bootstrap = require('../lib/bootstrap.js');
const detectLib = require('../lib/detect.js');

function help() {
  ui.out(`${ui.color.bold('gatecraft upgrade')} — update the framework, keeping your work

${ui.color.bold('USAGE')}
  gatecraft upgrade [options]

${ui.color.bold('WHAT IT PRESERVES')}
  Every file you have edited. The install manifest records a hash of each file as
  we wrote it, so a file that still matches is untouched and safe to replace, and a
  file that differs is yours and is left exactly alone.

  Files you deleted stay deleted — removing a document is a decision, and an
  upgrade that resurrected it would be overruling you.

  Everything under ${ui.color.cyan('.ai/memory/')}, your ${ui.color.cyan('PROJECT_CONTEXT.md')}, your ADRs, and every
  override in ${ui.color.cyan('.ai/standards/')}, ${ui.color.cyan('.ai/workflows/')} and ${ui.color.cyan('.ai/prompts/')} survive by the
  same rule: you edited them, so they are yours.

${ui.color.bold('OPTIONS')}`);
  ui.table([
    ['--dir <path>', 'Target directory'],
    ['--dry-run', 'Report what would change and write nothing'],
    ['--force, -f', 'Replace every framework document, discarding your edits to them'],
    ['--yes, -y', 'Do not prompt'],
  ]);
  ui.out(`
  ${ui.color.dim('--force never touches project-owned files: PROJECT_CONTEXT.md, DECISIONS.md,')}
  ${ui.color.dim('memory/, standards/, and the other directories you fill in. A flag meaning')}
  ${ui.color.dim('"give me the current framework" should not be able to erase your context.')}
`);
  return 0;
}

async function run({ flags }) {
  const version = paths.frameworkVersion();
  const root = flags.dir ? path.resolve(flags.dir) : paths.findProjectRoot();
  const p = paths.paths(root);

  const m = manifest.load(root);
  if (!m) {
    throw new Error(
      `no gatecraft install found at ${root}.\n` +
        `  Install it with: npx gatecraft init`
    );
  }

  const from = m.version;
  const dry = Boolean(flags['dry-run']);

  ui.step(`Upgrading gatecraft ${from} ${ui.mark.arrow} ${version}${dry ? ui.color.dim('  (dry run)') : ''}`);
  ui.table([['project', root]]);

  if (from === version && !flags.force) {
    // Nothing to upgrade to. Report integrity and stop — a same-version upgrade
    // that rewrote files would be doing work the user did not ask for.
    const d = manifest.diff(root, m);
    ui.ok(`already on v${version}`);
    if (d.modified.length) {
      ui.info(`${d.modified.length} file(s) modified locally — that is fine, they are yours`);
    }
    if (d.missing.length) {
      ui.out('');
      ui.warn(`${d.missing.length} document(s) recorded in the manifest are absent:`);
      for (const f of d.missing.slice(0, 8)) ui.note(f);
      if (d.missing.length > 8) ui.note(`… and ${d.missing.length - 8} more`);
      ui.out('');
      ui.out(`  ${ui.color.dim('If you deleted them on purpose, nothing is wrong — upgrades will keep')}`);
      ui.out(`  ${ui.color.dim('leaving them out. If they went missing by accident, restore them with:')}`);
      ui.out(`  ${ui.color.cyan('gatecraft upgrade --force')}  ${ui.color.dim('(this also discards your edits to framework docs)')}`);
      ui.out('');
    }
    return 0;
  }

  // Always the "upgrade" path, even with --force: it is the only mode that knows
  // which files are the project's and must survive regardless.
  const result = payload.install(p.ai, {
    mode: 'upgrade',
    previous: m.files,
    force: Boolean(flags.force),
  });

  if (dry) {
    ui.out('');
    ui.table([
      ['would replace', String(result.written.length)],
      ['would add', String(result.added.length)],
      ['would preserve', String(result.skippedModified.length + result.skippedProject.length)],
      ['would leave deleted', String(result.skippedDeleted.length)],
    ]);
    if (result.skippedModified.length) {
      ui.out('');
      ui.info('preserved (edited by you):');
      for (const f of result.skippedModified.slice(0, 20)) ui.note(f);
      if (result.skippedModified.length > 20) ui.note(`… and ${result.skippedModified.length - 20} more`);
    }
    if (result.skippedProject.length) {
      ui.out('');
      ui.info(`preserved (yours to fill in): ${result.skippedProject.length} project file(s)`);
    }
    ui.out('');
    ui.info('nothing was written');
    return 0;
  }

  ui.ok(`${result.written.length} framework document(s) updated`);
  if (result.added.length) ui.ok(`${result.added.length} new document(s) added in v${version}`);
  if (result.skippedProject.length) {
    ui.ok(`${result.skippedProject.length} project file(s) untouched — their content is yours`);
  }
  if (result.skippedModified.length) {
    ui.ok(`${result.skippedModified.length} framework file(s) preserved — you edited them`);
    for (const f of result.skippedModified.slice(0, 8)) ui.note(f);
    if (result.skippedModified.length > 8) ui.note(`… and ${result.skippedModified.length - 8} more`);
  }
  if (result.skippedDeleted.length) {
    ui.info(`${result.skippedDeleted.length} file(s) stayed deleted — you removed them`);
  }

  // Refresh the bootstrap block only; anything the user wrote around it is untouched.
  if (m.bootstrap && m.bootstrap.managed) {
    const detected = detectLib.detect(root);
    const b = bootstrap.ensure(root, { version, detected });
    m.bootstrap.hash = fsx.exists(b.file) ? fsx.hashFile(b.file) : null;
    if (b.action !== 'current') ui.ok(`AGENTS.md — bootstrap block refreshed to v${version}`);
  }

  // Re-hash: files we replaced now match the new payload; files we preserved keep
  // their current hash, so the next upgrade still recognises them as the user's.
  const nextFiles = {};
  for (const [rel, hash] of Object.entries(payload.hashes())) {
    const abs = path.join(p.ai, rel);
    if (!fsx.exists(abs)) continue; // deleted on purpose — do not track it back in
    nextFiles[rel] = {
      hash: fsx.hashFile(abs),
      kind: payload.isProjectOwned(rel) ? 'project' : 'framework',
      pristine: fsx.hashFile(abs) === hash,
    };
  }
  m.files = nextFiles;
  m.modified = result.skippedModified;
  m.version = version;
  m.upgradedAt = new Date().toISOString();
  manifest.save(root, m);

  ui.step('Done');
  if (from !== version) {
    ui.out(`  Read what changed: ${ui.color.cyan('.ai/CHANGELOG.md')}`);
    ui.out(`  ${ui.color.dim('Breaking changes and the compatibility matrix are in .ai/VERSION.md.')}`);
  }
  if (result.skippedModified.length) {
    ui.out(`  ${ui.color.dim('Your edits to framework documents were kept. If you meant them as')}`);
    ui.out(`  ${ui.color.dim('project rules, move them to .ai/standards/ so upgrades stop skipping')}`);
    ui.out(`  ${ui.color.dim('the framework file — see .ai/standards/README.md.')}`);
  }
  ui.out('');
  return 0;
}

module.exports = { run, help };
