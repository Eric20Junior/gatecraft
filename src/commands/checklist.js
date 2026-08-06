'use strict';

const ui = require('../lib/ui.js');
const fsx = require('../lib/fsx.js');
const sections = require('../lib/sections.js');

// `gatecraft checklist <name>` exists so a gate can be run without opening a file.
//
// A checklist you have to go and find is a checklist that gets skipped at exactly
// the moment it matters — the end of a long day, in front of a release. One command
// that prints it, and pipes cleanly into an agent, removes that excuse.

const FILE = 'CHECKLISTS.md';
const SUFFIX = /\s+checklist$/i;

function help() {
  ui.out(`${ui.color.bold('gatecraft checklist')} — print a quality gate checklist

${ui.color.bold('USAGE')}
  gatecraft checklist                 # list them all
  gatecraft checklist security        # print one
  gatecraft checklist release --md    # raw markdown, for piping

${ui.color.bold('OPTIONS')}`);
  ui.table([
    ['--md', 'Raw markdown with no terminal formatting'],
    ['--dir <path>', 'Read from a specific project install'],
  ]);
  ui.out(`
${ui.color.bold('WHY A COMMAND')}
  ${ui.color.dim('A gate is binary: "mostly passed" is failed. That only holds if running the')}
  ${ui.color.dim('checklist is easier than skipping it. Record the run in .ai/checklists/runs/')}
  ${ui.color.dim('with evidence per item — an unevidenced pass is a memory of good intentions.')}
`);
  return 0;
}

async function run({ flags, args }) {
  const { file, source } = sections.locate(flags, FILE);
  const all = sections.parseNumbered(fsx.read(file), { stripSuffix: SUFFIX });

  if (!args[0]) {
    ui.step(`Checklists ${ui.color.dim(source === 'project' ? '(from this project)' : '(framework defaults)')}`);
    ui.table(all.map((c) => [`${String(c.number).padStart(2)}  ${c.slug}`, `${c.items} items — ${c.title}`]));
    ui.out(`\n  ${ui.color.dim('gatecraft checklist <name>   print one')}`);
    ui.out(`  ${ui.color.dim('gatecraft checklist <name> --md | pbcopy')}\n`);
    return 0;
  }

  const { found, matches } = sections.resolve(all, args[0]);

  if (!found) {
    if (matches.length > 1) {
      ui.fail(`"${args[0]}" matches ${matches.length} checklists`);
      ui.out('');
      ui.table(matches.map((c) => [c.slug, c.title]));
      return 1;
    }
    ui.fail(`no checklist named "${args[0]}"`);
    ui.out(`\nRun ${ui.color.cyan('gatecraft checklist')} to see all ${all.length}.`);
    return 1;
  }

  if (flags.md) {
    process.stdout.write(`## ${found.number}. ${found.title}\n\n${found.body}\n`);
    return 0;
  }

  ui.out('');
  ui.out(`${ui.color.bold(`${found.number}. ${found.title}`)}  ${ui.color.dim(`${found.items} items`)}`);
  ui.out('');
  for (const line of fsx.lines(found.body)) {
    if (/^- \[ \]/.test(line)) ui.out(`  ${ui.color.dim('[ ]')} ${line.slice(6)}`);
    else if (/^\*\*/.test(line)) ui.out(`  ${ui.color.bold(line.replace(/\*\*/g, ''))}`);
    else ui.out(line ? `  ${line}` : '');
  }
  ui.out('');
  ui.out(`  ${ui.color.dim('A gate is binary. Record the run with evidence in .ai/checklists/runs/.')}`);
  ui.out('');
  return 0;
}

module.exports = { run, help };
