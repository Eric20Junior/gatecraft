'use strict';

const path = require('path');
const ui = require('../lib/ui.js');
const fsx = require('../lib/fsx.js');
const paths = require('../lib/paths.js');
const manifest = require('../lib/manifest.js');
const gitignore = require('../lib/gitignore.js');
const context = require('../lib/context.js');

function help() {
  ui.out(`${ui.color.bold('gatecraft status')} — what is installed, and how healthy it is

${ui.color.bold('USAGE')}
  gatecraft status [--dir <path>] [--json]

Reports the installed version, local modifications, how much of PROJECT_CONTEXT.md
is still unfilled, and whether project memory is being written. The last one is the
signal that matters: a framework installed and never written to is a framework
nobody is using.
`);
  return 0;
}

const AGE_DAYS = (iso) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);

/** Has anything in memory/ actually been written, or is it all still template? */
function memoryActivity(aiDir) {
  const dir = path.join(aiDir, 'memory');
  if (!fsx.isDir(dir)) return null;
  const files = fsx.walk(dir).filter((f) => f.endsWith('.md') && f !== 'README.md');
  let written = 0;
  let newest = 0;
  for (const rel of files) {
    const abs = path.join(dir, rel);
    const text = fsx.read(abs);
    // A memory file still full of `{{...}}` and "No entries yet" is untouched.
    if (!/No entries yet/.test(text) || (text.match(/\{\{/g) || []).length < 4) written++;
    const mtime = require('fs').statSync(abs).mtimeMs;
    if (mtime > newest) newest = mtime;
  }
  return { total: files.length, written, newestDays: Math.floor((Date.now() - newest) / 86400000) };
}

async function run({ flags }) {
  const root = flags.dir ? path.resolve(flags.dir) : paths.findProjectRoot();
  const p = paths.paths(root);
  const current = paths.frameworkVersion();

  const m = manifest.load(root);
  if (!m) {
    if (flags.json) {
      ui.out(JSON.stringify({ installed: false, root }, null, 2));
      return 1;
    }
    ui.fail(`no gatecraft install at ${root}`);
    ui.out(`\nInstall it: ${ui.color.cyan('npx gatecraft init')}`);
    return 1;
  }

  const d = manifest.diff(root, m);
  const unf = context.unfilled(p.ai);
  const mem = memoryActivity(p.ai);
  const ignored = gitignore.isIgnored(root) || (m.gitignore && m.gitignore.managed);
  const hasBootstrap = fsx.exists(p.bootstrap);

  if (flags.json) {
    ui.out(
      JSON.stringify(
        {
          installed: true,
          root,
          version: m.version,
          latest: current,
          outdated: m.version !== current,
          installedAt: m.installedAt,
          upgradedAt: m.upgradedAt,
          mode: m.mode || 'hidden',
          files: {
            tracked: Object.keys(m.files).length,
            unchanged: d.unchanged.length,
            modified: d.modified.length,
            missing: d.missing.length,
            yours: d.unknown.length,
          },
          bootstrap: hasBootstrap,
          gitignored: Boolean(ignored),
          projectContext: unf ? { placeholders: unf.total, unfilledSections: unf.sections.length } : null,
          memory: mem,
        },
        null,
        2
      )
    );
    return 0;
  }

  ui.step(`gatecraft v${m.version}`);
  ui.table([
    ['project', root],
    ['framework', p.ai],
    ['installed', `${m.installedAt.slice(0, 10)} (${AGE_DAYS(m.installedAt)} days ago)`],
    ...(m.upgradedAt ? [['upgraded', m.upgradedAt.slice(0, 10)]] : []),
    ['visibility', m.mode === 'track' ? 'tracked in git' : m.mode === 'share' ? 'framework hidden, memory shared' : 'hidden and git-ignored'],
  ]);

  ui.step('Install');
  if (m.version !== current) {
    ui.warn(`v${current} is available — ${ui.color.cyan('gatecraft upgrade')}`);
  } else {
    ui.ok(`up to date`);
  }
  ui.out(
    `  ${ui.color.dim(`${d.unchanged.length} pristine, ${d.modified.length} edited by you, ${d.unknown.length} added by you`)}`
  );
  if (d.missing.length) {
    ui.warn(`${d.missing.length} framework file(s) missing — ${ui.color.cyan('gatecraft doctor --fix')} restores them`);
  }

  ui.step('Discoverability');
  if (hasBootstrap) ui.ok(`AGENTS.md present — agents will find .ai/`);
  else ui.fail(`AGENTS.md missing — nothing points agents at .ai/, so the framework is inert`);
  if (ignored) ui.ok('.ai/ is git-ignored — invisible in git status and diffs');
  else ui.info('.ai/ is tracked in git');

  ui.step('Project context');
  if (!unf) {
    ui.fail('PROJECT_CONTEXT.md is missing');
  } else if (unf.total === 0) {
    ui.ok('fully filled in');
  } else {
    const sev = unf.total > 60 ? ui.warn : ui.info;
    sev(`${unf.total} placeholders across ${unf.sections.length} section(s) still unfilled`);
    for (const s of unf.sections.slice(0, 5)) ui.note(`${s.name} — ${s.placeholders}`);
    if (unf.sections.length > 5) ui.note(`… and ${unf.sections.length - 5} more sections`);
    ui.out(`  ${ui.color.dim('Every unfilled section is a fact the agent will guess at instead.')}`);
  }

  ui.step('Memory');
  if (!mem) {
    ui.fail('.ai/memory/ is missing');
  } else if (mem.written === 0) {
    ui.warn(`nothing written yet (0 of ${mem.total} files)`);
    ui.out(`  ${ui.color.dim('An empty memory means every task starts from zero. Record the first')}`);
    ui.out(`  ${ui.color.dim('decision, bug class, or lesson and the compounding starts.')}`);
  } else {
    ui.ok(`${mem.written} of ${mem.total} memory files have content`);
    if (mem.newestDays > 60) {
      ui.warn(`last written ${mem.newestDays} days ago — memory is going stale`);
    }
  }

  ui.out('');
  return 0;
}

module.exports = { run, help };
