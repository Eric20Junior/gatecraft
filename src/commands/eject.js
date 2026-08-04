'use strict';

const path = require('path');
const ui = require('../lib/ui.js');
const fsx = require('../lib/fsx.js');
const paths = require('../lib/paths.js');
const manifest = require('../lib/manifest.js');
const gitignore = require('../lib/gitignore.js');

function help() {
  ui.out(`${ui.color.bold('gatecraft eject')} — stop managing the install; keep the files

${ui.color.bold('USAGE')}
  gatecraft eject [--dir <path>] [--yes]

Removes the install manifest and the managed .gitignore block, leaving \`.ai/\` as
ordinary files in your repository. After this the CLI no longer knows about the
install: ${ui.color.cyan('upgrade')} will not work, and neither will ${ui.color.cyan('uninstall')}.

${ui.color.bold('WHEN THIS IS THE RIGHT CALL')}
  You have customized the framework documents heavily enough that upgrades are more
  disruptive than useful, and you would rather own them outright. That is a
  legitimate end state — the framework is Markdown, not a runtime dependency.

${ui.color.bold('WHEN IT IS NOT')}
  You just want your standards to survive upgrades. They already do: put them in
  ${ui.color.cyan('.ai/standards/')} and upgrades will never touch them. Ejecting to protect
  customizations you could have kept in an override file trades every future
  improvement for a problem you did not have.
`);
  return 0;
}

async function run({ flags }) {
  const root = flags.dir ? path.resolve(flags.dir) : paths.findProjectRoot();
  const p = paths.paths(root);

  const m = manifest.load(root);
  if (!m) {
    ui.info(`nothing to eject at ${root} — no gatecraft install found`);
    return 1;
  }

  const d = manifest.diff(root, m);

  ui.step(`Ejecting gatecraft v${m.version}`);
  ui.table([
    ['project', root],
    ['files kept', String(d.unchanged.length + d.modified.length + d.unknown.length)],
    ['your edits', String(d.modified.length + d.unknown.length)],
  ]);

  if (!flags.yes) {
    ui.out('');
    ui.warn('after ejecting, `gatecraft upgrade` will not work on this project');
    ui.out(`  ${ui.color.dim('Re-run with --yes to confirm.')}`);
    return 1;
  }

  fsx.rimraf(p.manifest);
  ui.ok('manifest removed — the install is no longer managed');

  const g = gitignore.remove(root);
  if (g.changed) ui.ok('.gitignore block removed — .ai/ is now visible to git');

  ui.out('');
  ui.info('`.ai/` is yours now. Commit it:');
  ui.out(`  ${ui.color.cyan('git add .ai AGENTS.md && git commit -m "Adopt Gatecraft"')}`);
  ui.out('');
  ui.out(`  ${ui.color.dim('To come back under management later, run `npx gatecraft init --force`,')}`);
  ui.out(`  ${ui.color.dim('which will overwrite framework documents but keep .ai/memory/ intact')}`);
  ui.out(`  ${ui.color.dim('only if you move it aside first. Back it up before you do that.')}`);
  ui.out('');
  return 0;
}

module.exports = { run, help };
