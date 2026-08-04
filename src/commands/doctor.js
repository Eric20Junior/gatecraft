'use strict';

const path = require('path');
const ui = require('../lib/ui.js');
const fsx = require('../lib/fsx.js');
const paths = require('../lib/paths.js');
const payload = require('../lib/payload.js');
const manifest = require('../lib/manifest.js');
const gitignore = require('../lib/gitignore.js');
const bootstrap = require('../lib/bootstrap.js');
const links = require('../lib/links.js');

function help() {
  ui.out(`${ui.color.bold('gatecraft doctor')} — check the install and fix what is safe to fix

${ui.color.bold('USAGE')}
  gatecraft doctor [--fix] [--dir <path>] [--json]

${ui.color.bold('CHECKS')}`);
  ui.table([
    ['payload', 'Every framework file present and readable'],
    ['integrity', 'Which files drifted from the version they were installed as'],
    ['links', 'Every relative link and anchor inside .ai/ resolves'],
    ['bootstrap', 'AGENTS.md exists and carries a current gatecraft block'],
    ['visibility', '.ai/ is ignored as the manifest says it should be'],
    ['git', '.ai/ is not accidentally staged when it is meant to be hidden'],
  ]);
  ui.out(`
${ui.color.cyan('--fix')} restores missing framework files, repairs the .gitignore block, and
rewrites the AGENTS.md bootstrap. It never touches a file you have edited.
`);
  return 0;
}

function checkGitStaged(root) {
  try {
    const { execFileSync } = require('child_process');
    const out = execFileSync('git', ['-C', root, 'ls-files', '--cached', '--', '.ai'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 4000,
    });
    return out.trim() ? out.trim().split('\n') : [];
  } catch {
    return null; // not a git repo, or git unavailable — not a failure
  }
}

async function run({ flags }) {
  const root = flags.dir ? path.resolve(flags.dir) : paths.findProjectRoot();
  const p = paths.paths(root);
  const version = paths.frameworkVersion();
  const fix = Boolean(flags.fix);

  const m = manifest.load(root);
  if (!m) {
    ui.fail(`no gatecraft install at ${root}`);
    ui.out(`\nInstall it: ${ui.color.cyan('npx gatecraft init')}`);
    return 1;
  }

  const problems = [];
  const fixed = [];
  const add = (severity, msg, hint) => problems.push({ severity, msg, hint });

  // 1. Payload integrity.
  const d = manifest.diff(root, m);
  if (d.missing.length) {
    if (fix) {
      const restored = payload.install(p.ai, { mode: 'upgrade', previous: {}, force: false });
      fixed.push(`restored ${d.missing.length} missing file(s)`);
      void restored;
    } else {
      add('error', `${d.missing.length} framework file(s) missing`, 'gatecraft doctor --fix');
    }
  }

  // 2. Link integrity across the whole installed tree, including anything the user
  //    added. A broken link in a document an agent is told to follow is a dead end
  //    it will silently route around.
  const linkReport = links.check(p.ai);
  if (linkReport.broken.length) {
    add(
      'warn',
      `${linkReport.broken.length} broken link(s) inside .ai/`,
      'run with --json to list them, or fix the file they point from'
    );
  }

  // 3. Bootstrap.
  if (!fsx.exists(p.bootstrap)) {
    if (fix) {
      bootstrap.ensure(root, { version, detected: null });
      fixed.push('recreated AGENTS.md');
    } else {
      add('error', 'AGENTS.md is missing — no agent will discover .ai/', 'gatecraft doctor --fix');
    }
  } else {
    const text = fsx.read(p.bootstrap);
    if (!bootstrap.findBlock(text)) {
      if (fix) {
        bootstrap.ensure(root, { version, detected: null });
        fixed.push('re-inserted the gatecraft block into AGENTS.md');
      } else {
        add('error', 'AGENTS.md has no gatecraft block — the framework is installed but unreachable', 'gatecraft doctor --fix');
      }
    } else if (!text.includes(`v${version}`) && m.version === version) {
      if (fix) {
        bootstrap.ensure(root, { version, detected: null });
        fixed.push('refreshed the AGENTS.md block');
      } else {
        add('warn', 'the AGENTS.md block is from an older version', 'gatecraft doctor --fix');
      }
    }
  }

  // 4. Visibility matches intent.
  const shouldHide = m.gitignore && m.gitignore.managed && m.mode !== 'track';
  if (shouldHide && !gitignore.isIgnored(root) && !gitignore.findBlock(fsx.exists(p.gitignore) ? fsx.read(p.gitignore) : '')) {
    if (fix) {
      const { ignoreLines } = require('./init.js');
      gitignore.ensure(root, ignoreLines(m.mode || 'hidden'));
      fixed.push('restored the .gitignore block');
    } else {
      add('warn', '.ai/ was installed hidden but is no longer ignored', 'gatecraft doctor --fix');
    }
  }

  // 5. Accidentally committed.
  const staged = checkGitStaged(root);
  if (shouldHide && staged && staged.length) {
    add(
      'warn',
      `${staged.length} file(s) under .ai/ are tracked by git despite being installed hidden`,
      'git rm -r --cached .ai   # then commit'
    );
  }

  // 6. Version skew.
  if (m.version !== version) {
    add('info', `installed v${m.version}, CLI ships v${version}`, 'gatecraft upgrade');
  }

  if (flags.json) {
    ui.out(JSON.stringify({ root, version: m.version, problems, fixed, links: linkReport }, null, 2));
    return problems.some((x) => x.severity === 'error') ? 1 : 0;
  }

  ui.step(`Checking gatecraft v${m.version}`);
  ui.table([['project', root]]);
  ui.out('');

  ui.ok(`payload — ${d.unchanged.length + d.modified.length} of ${Object.keys(m.files).length} files present`);
  ui.ok(
    `links — ${linkReport.checked} checked, ${linkReport.broken.length ? ui.color.yellow(`${linkReport.broken.length} broken`) : 'all resolve'}`
  );

  for (const f of fixed) ui.ok(`fixed: ${f}`);

  const errors = problems.filter((x) => x.severity === 'error');
  const warns = problems.filter((x) => x.severity === 'warn');
  const infos = problems.filter((x) => x.severity === 'info');

  for (const x of errors) {
    ui.fail(x.msg);
    if (x.hint) ui.note(x.hint);
  }
  for (const x of warns) {
    ui.warn(x.msg);
    if (x.hint) ui.note(x.hint);
  }
  for (const x of infos) {
    ui.info(x.msg);
    if (x.hint) ui.note(x.hint);
  }

  if (linkReport.broken.length && !flags.json) {
    ui.out('');
    ui.info('broken links:');
    for (const b of linkReport.broken.slice(0, 12)) ui.note(`${b.file}:${b.line} ${ui.mark.arrow} ${b.target}`);
    if (linkReport.broken.length > 12) ui.note(`… and ${linkReport.broken.length - 12} more`);
  }

  ui.out('');
  if (!problems.length) ui.ok(ui.color.green('no problems found'));
  else if (!errors.length) ui.info(`${warns.length} warning(s), nothing broken`);

  return errors.length ? 1 : 0;
}

module.exports = { run, help };
