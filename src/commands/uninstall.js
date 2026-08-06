'use strict';

const path = require('path');
const readline = require('readline');
const ui = require('../lib/ui.js');
const fsx = require('../lib/fsx.js');
const paths = require('../lib/paths.js');
const manifest = require('../lib/manifest.js');
const gitignore = require('../lib/gitignore.js');
const bootstrap = require('../lib/bootstrap.js');

function help() {
  ui.out(`${ui.color.bold('gatecraft uninstall')} — remove the framework and everything it added

${ui.color.bold('USAGE')}
  gatecraft uninstall [options]

${ui.color.bold('WHAT IT REMOVES')}
  .ai/, the managed .gitignore block, the gatecraft block in AGENTS.md, and any tool
  pointers it wrote. Nothing else is touched.

${ui.color.bold('OPTIONS')}`);
  ui.table([
    ['--keep-memory', 'Move .ai/memory/ to .ai-memory-backup/ before removing (default when memory has content)'],
    ['--purge', 'Remove everything including memory, without a backup'],
    ['--yes, -y', 'Do not prompt'],
    ['--dir <path>', 'Target directory'],
  ]);
  ui.out(`
${ui.color.dim('Prefer `gatecraft eject` if you want to keep the files but stop having them managed.')}
`);
  return 0;
}

function confirm(question) {
  if (!process.stdin.isTTY) return Promise.resolve(false);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} [y/N] `, (a) => {
      rl.close();
      resolve(/^y(es)?$/i.test(a.trim()));
    });
  });
}

/** Does memory hold anything worth not throwing away? */
function memoryHasContent(aiDir) {
  const dir = path.join(aiDir, 'memory');
  if (!fsx.isDir(dir)) return false;
  return fsx
    .walk(dir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .some((rel) => {
      const text = fsx.read(path.join(dir, rel));
      return !/No entries yet/.test(text) && (text.match(/\{\{/g) || []).length < 6;
    });
}

async function run({ flags }) {
  const root = flags.dir ? path.resolve(flags.dir) : paths.findProjectRoot();
  const p = paths.paths(root);

  const m = manifest.load(root);
  if (!m && !fsx.isDir(p.ai)) {
    ui.info(`nothing to uninstall at ${root}`);
    return 0;
  }

  // A `.ai/` with no manifest was either ejected or never installed by this CLI.
  // Either way we have no record of what we put there, so every file in it has to
  // be assumed to be the user's — `eject` exists precisely to make them so, and it
  // promises uninstall will no longer touch them. Deleting the tree here would take
  // heavily customized documents with it and leave nothing to restore from.
  if (!m) {
    ui.fail(`.ai/ at ${root} is not a managed install — nothing to uninstall`);
    ui.out('');
    ui.out(`  ${ui.color.dim('There is no install manifest, so this was ejected or created by hand.')}`);
    ui.out(`  ${ui.color.dim('Those files are yours: remove them with `rm -rf .ai` if that is what')}`);
    ui.out(`  ${ui.color.dim('you want, or run `gatecraft init --force` to manage them again.')}`);
    ui.out('');
    return 1;
  }

  const hasMemory = memoryHasContent(p.ai);
  const keepMemory = flags.purge ? false : flags['keep-memory'] !== false && hasMemory;

  ui.step('Uninstalling gatecraft');
  ui.table([['project', root]]);

  if (hasMemory && !keepMemory && !flags.purge) {
    ui.warn('project memory has content and would be lost');
  }

  if (!flags.yes) {
    const what = keepMemory
      ? 'Remove .ai/ (memory will be backed up first)?'
      : 'Remove .ai/ and everything in it?';
    const okToGo = await confirm(what);
    if (!okToGo) {
      ui.info('cancelled — nothing was removed');
      return 1;
    }
  }

  // Back up memory before anything is deleted, so a failure part-way through
  // cannot cost the one thing here that is genuinely irreplaceable.
  if (keepMemory) {
    const src = path.join(p.ai, 'memory');
    const dest = fsx.assertInside(root, path.join(root, '.ai-memory-backup'));
    if (fsx.exists(dest)) fsx.rimraf(dest);
    fsx.mkdirp(dest);
    for (const rel of fsx.walk(src)) fsx.copyFile(path.join(src, rel), path.join(dest, rel));
    ui.ok(`memory backed up to ${ui.color.cyan('.ai-memory-backup/')}`);
  }

  if (fsx.isDir(p.ai)) {
    fsx.rimraf(p.ai);
    ui.ok('.ai/ removed');
  }

  const g = gitignore.remove(root);
  if (g.changed) ui.ok(g.removedFile ? '.gitignore removed (it was ours alone)' : '.gitignore block removed');

  const b = bootstrap.remove(root);
  if (b.action === 'removed-file') ui.ok('AGENTS.md removed');
  else if (b.action === 'removed-block') ui.ok('AGENTS.md — gatecraft block removed, your content kept');

  for (const rel of (m && m.pointers) || []) {
    const f = path.join(root, rel);
    if (fsx.exists(f) && fsx.read(f).includes('gatecraft')) {
      fsx.rimraf(f);
      fsx.pruneEmpty(path.dirname(f), root);
      ui.ok(`${rel} removed`);
    }
  }

  ui.out('');
  if (keepMemory) {
    ui.info(`Your project memory is in ${ui.color.cyan('.ai-memory-backup/')} — reinstall with`);
    ui.info(`${ui.color.cyan('npx gatecraft init')} and copy it back into .ai/memory/.`);
  }
  ui.out('');
  return 0;
}

module.exports = { run, help };
