'use strict';

const ui = require('../lib/ui.js');
const fsx = require('../lib/fsx.js');
const sections = require('../lib/sections.js');

// `gatecraft standard <topic>` — print one section of STANDARDS.md.
//
// STANDARDS.md is 25 sections and ~11k tokens. An agent about to write a database
// migration needs section 12, and reading the other 24 to find it is context spent
// on nothing. `--md` exists so the section can be piped straight into a prompt.

const FILE = 'STANDARDS.md';
const SUFFIX = /\s+standards$/i;

function help() {
  ui.out(`${ui.color.bold('gatecraft standard')} — print one section of the engineering standards

${ui.color.bold('USAGE')}
  gatecraft standard                  # list all 25
  gatecraft standard security         # print one
  gatecraft standard 12               # by number
  gatecraft standard api --md         # raw markdown, for piping

${ui.color.bold('OPTIONS')}`);
  ui.table([
    ['--md', 'Raw markdown with no terminal formatting'],
    ['--dir <path>', 'Read from a specific project install'],
  ]);
  ui.out(`
${ui.color.bold('WHY A COMMAND')}
  ${ui.color.dim('The standards are a reference work, not a document you read front to back.')}
  ${ui.color.dim('Reading all 25 sections to apply one costs context an agent needed for the')}
  ${ui.color.dim('work itself. Project overrides go in .ai/standards/, never in this file.')}
`);
  return 0;
}

/** Bold the `**Topic — MUST**` group headers; leave everything else as written. */
function render(body) {
  let fenced = false;
  for (const line of fsx.lines(body)) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      ui.out(`  ${ui.color.dim(line)}`);
      continue;
    }
    if (!fenced && /^\*\*.+\*\*\s*$/.test(line)) ui.out(`  ${ui.color.bold(line.replace(/\*\*/g, ''))}`);
    else ui.out(line ? `  ${line}` : '');
  }
}

async function run({ flags, args }) {
  const { file, source } = sections.locate(flags, FILE);
  const all = sections.parseNumbered(fsx.read(file), { stripSuffix: SUFFIX });

  if (!args[0]) {
    ui.step(`Standards ${ui.color.dim(source === 'project' ? '(from this project)' : '(framework defaults)')}`);
    ui.table(all.map((s) => [`${String(s.number).padStart(2)}  ${s.slug}`, s.title]));
    ui.out(`\n  ${ui.color.dim('gatecraft standard <topic>   print one')}`);
    ui.out(`  ${ui.color.dim('gatecraft standard <topic> --md   raw markdown')}\n`);
    return 0;
  }

  const { found, matches } = sections.resolve(all, args[0]);

  if (!found) {
    if (matches.length > 1) {
      ui.fail(`"${args[0]}" matches ${matches.length} standards`);
      ui.out('');
      ui.table(matches.map((s) => [s.slug, s.title]));
      return 1;
    }
    ui.fail(`no standard named "${args[0]}"`);
    ui.out(`\nRun ${ui.color.cyan('gatecraft standard')} to see all ${all.length}.`);
    return 1;
  }

  if (flags.md) {
    process.stdout.write(`## ${found.number}. ${found.title}\n\n${found.body}\n`);
    return 0;
  }

  ui.out('');
  ui.out(`${ui.color.bold(`${found.number}. ${found.title}`)}`);
  ui.out('');
  render(found.body);
  ui.out('');
  ui.out(`  ${ui.color.dim('MUST is not negotiable. Record a deliberate exception in')}`);
  ui.out(`  ${ui.color.dim('.ai/PROJECT_CONTEXT.md#12-overrides-and-exceptions with an owner and a reason.')}`);
  ui.out('');
  return 0;
}

module.exports = { run, help };
