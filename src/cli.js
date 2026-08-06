'use strict';

const ui = require('./lib/ui.js');
const { frameworkVersion } = require('./lib/paths.js');

const COMMANDS = {
  init: { file: './commands/init.js', blurb: 'Install the framework into a project' },
  upgrade: { file: './commands/upgrade.js', blurb: 'Update the framework, keeping your work' },
  status: { file: './commands/status.js', blurb: 'Show what is installed and how healthy it is' },
  doctor: { file: './commands/doctor.js', blurb: 'Check the install for problems and fix what is safe' },
  checklist: { file: './commands/checklist.js', blurb: 'Print a quality gate checklist to run' },
  standard: { file: './commands/standard.js', blurb: 'Print one section of the engineering standards' },
  prompt: { file: './commands/prompt.js', blurb: 'Print one prompt from the library' },
  uninstall: { file: './commands/uninstall.js', blurb: 'Remove the framework and everything it added' },
  eject: { file: './commands/eject.js', blurb: 'Stop managing the install; keep the files, commit them' },
};

const ALIASES = {
  install: 'init',
  i: 'init',
  update: 'upgrade',
  up: 'upgrade',
  check: 'doctor',
  st: 'status',
  remove: 'uninstall',
  rm: 'uninstall',
};

// Flags that take a value. Everything else is boolean, which keeps parsing honest:
// `--dir` without this list would silently swallow the next argument.
const VALUED = new Set(['dir', 'name', 'category']);

function parse(argv) {
  const flags = {};
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    if (a === '--') {
      positional.push(...argv.slice(i + 1));
      break;
    }
    if (a.startsWith('--')) {
      let key = a.slice(2);
      let value = true;
      const eq = key.indexOf('=');
      if (eq !== -1) {
        value = key.slice(eq + 1);
        key = key.slice(0, eq);
      } else if (VALUED.has(key)) {
        value = argv[++i];
        if (value === undefined) throw new Error(`--${key} needs a value`);
      } else if (key.startsWith('no-')) {
        key = key.slice(3);
        value = false;
      }
      flags[key] = value;
      continue;
    }
    if (a.startsWith('-') && a.length > 1) {
      const short = { h: 'help', v: 'version', y: 'yes', f: 'force', q: 'quiet', d: 'dir' };
      for (const ch of a.slice(1)) {
        const key = short[ch];
        if (!key) throw new Error(`unknown flag -${ch}`);
        if (key === 'dir') {
          flags.dir = argv[++i];
          if (flags.dir === undefined) throw new Error('-d needs a value');
        } else flags[key] = true;
      }
      continue;
    }
    positional.push(a);
  }

  return { flags, positional };
}

function help() {
  const v = frameworkVersion();
  ui.out(`${ui.color.bold('gatecraft')} ${ui.color.dim(`v${v}`)} — the AI Engineering Operating System

${ui.color.bold('USAGE')}
  gatecraft <command> [options]
  npx gatecraft init

${ui.color.bold('COMMANDS')}`);
  ui.table(Object.entries(COMMANDS).map(([name, c]) => [name, c.blurb]));
  ui.out(`
${ui.color.bold('COMMON OPTIONS')}`);
  ui.table([
    ['--dir <path>', 'Target project directory (default: nearest project root)'],
    ['--yes, -y', 'Do not prompt; take the documented default'],
    ['--force, -f', 'Overwrite instead of preserving. Destructive — read the docs'],
    ['--quiet, -q', 'Only errors'],
    ['--json', 'Machine-readable output (status, doctor)'],
    ['--help, -h', 'This, or help for a command'],
    ['--version, -v', 'Print the version'],
  ]);
  ui.out(`
${ui.color.bold('WHAT IT DOES')}
  Installs a complete engineering framework into ${ui.color.cyan('.ai/')} — hidden and
  git-ignored — plus one visible ${ui.color.cyan('AGENTS.md')} that points every coding agent
  at it. 35 documents, 16k lines: a twelve-stage engineering loop, 26 specialist
  roles, 16 workflows, 25 standards, 20 checklists, and a persistent memory the
  agent reads before it proposes anything.

${ui.color.dim('  https://github.com/Eric20Junior/gatecraft')}
`);
  return 0;
}

async function run(argv) {
  let parsed;
  try {
    parsed = parse(argv);
  } catch (e) {
    ui.fail(e.message);
    ui.out(`\nRun ${ui.color.cyan('gatecraft --help')} for usage.`);
    return 1;
  }

  const { flags, positional } = parsed;
  ui.setQuiet(flags.quiet);

  if (flags.version && !positional.length) {
    ui.out(frameworkVersion());
    return 0;
  }

  const raw = positional[0];
  if (!raw) return flags.help ? help() : help();

  const name = ALIASES[raw] || raw;
  const cmd = COMMANDS[name];

  if (!cmd) {
    ui.fail(`unknown command: ${raw}`);
    const near = Object.keys(COMMANDS).filter((c) => c.startsWith(raw[0]));
    if (near.length) ui.out(`\nDid you mean: ${near.map((c) => ui.color.cyan(c)).join(', ')}?`);
    ui.out(`Run ${ui.color.cyan('gatecraft --help')} for the full list.`);
    return 1;
  }

  const mod = require(cmd.file);
  if (flags.help) return mod.help ? mod.help() : help();
  return mod.run({ flags, args: positional.slice(1) });
}

module.exports = { run, parse, help, COMMANDS, ALIASES };
