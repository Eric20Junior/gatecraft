'use strict';

const ui = require('../lib/ui.js');
const fsx = require('../lib/fsx.js');
const sections = require('../lib/sections.js');

// `gatecraft prompt <name>` — print one prompt from the library.
//
// PROMPTS.md holds 62 independent prompts across ~28k tokens. Exactly one of them
// is relevant to any given task, and the whole point of a prompt is to be pasted,
// so the retrieval cost should be a command rather than a file read plus a search.

const FILE = 'PROMPTS.md';

function help() {
  ui.out(`${ui.color.bold('gatecraft prompt')} — print one prompt from the library

${ui.color.bold('USAGE')}
  gatecraft prompt                    # list all 62
  gatecraft prompt write-an-adr       # print one
  gatecraft prompt adr --md           # raw markdown, for piping
  gatecraft prompt --category backend # list one category

${ui.color.bold('OPTIONS')}`);
  ui.table([
    ['--md', 'Raw markdown with no terminal formatting'],
    ['--category <name>', 'Restrict the listing to one category'],
    ['--dir <path>', 'Read from a specific project install'],
  ]);
  ui.out(`
${ui.color.bold('WHY A COMMAND')}
  ${ui.color.dim('A prompt exists to be pasted. Reading 62 of them to reach one wastes the')}
  ${ui.color.dim('context the prompt was going to be used in. Project prompts go in')}
  ${ui.color.dim('.ai/prompts/ — this command reads the framework library.')}
`);
  return 0;
}

/** Prompts are mostly fenced blocks meant to be copied; keep them verbatim. */
function render(body) {
  let fenced = false;
  for (const line of fsx.lines(body)) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      ui.out(`  ${ui.color.dim(line)}`);
      continue;
    }
    if (!fenced && /^\*\*.+\*\*/.test(line)) ui.out(`  ${ui.color.bold(line.replace(/\*\*/g, ''))}`);
    else ui.out(line ? `  ${line}` : '');
  }
}

function list(all, source, category) {
  const shown = category
    ? all.filter((p) => sections.slugify(String(p.category || '')).includes(sections.slugify(String(category))))
    : all;

  if (!shown.length) {
    ui.fail(`no category matching "${category}"`);
    const names = [...new Set(all.map((p) => p.category).filter(Boolean))];
    ui.out(`\nCategories: ${names.map((n) => ui.color.cyan(n)).join(', ')}`);
    return 1;
  }

  ui.step(`Prompts ${ui.color.dim(source === 'project' ? '(from this project)' : '(framework defaults)')}`);

  // Width across every row, not per category, so the second column is a straight
  // edge down the whole listing. Padding is applied to the raw slug — colour codes
  // are invisible but not zero-length, and padding the coloured string shears it.
  //
  // Capped, because the longest slug is nearly twice the median: letting one
  // outlier set the column would push every title past 80 characters and wrap the
  // whole listing. Two names overflow the cap and take a single space instead.
  const MAX_COL = 44;
  const width = Math.min(MAX_COL, shown.reduce((m, p) => Math.max(m, p.slug.length), 0));

  let current = null;
  for (const p of shown) {
    if (p.category !== current) {
      current = p.category;
      ui.out(`\n  ${ui.color.bold(current || 'Uncategorised')}`);
    }
    const pad = ' '.repeat(Math.max(0, width - p.slug.length));
    ui.out(`    ${ui.color.cyan(p.slug)}${pad}  ${ui.color.dim(p.title)}`);
  }
  ui.out(`\n  ${ui.color.dim('gatecraft prompt <name>        print one')}`);
  ui.out(`  ${ui.color.dim('gatecraft prompt <name> --md   raw markdown')}\n`);
  return 0;
}

async function run({ flags, args }) {
  const { file, source } = sections.locate(flags, FILE);
  const all = sections.parseEntries(fsx.read(file));

  if (!args[0]) return list(all, source, typeof flags.category === 'string' ? flags.category : null);

  const { found, matches } = sections.resolve(all, args[0]);

  if (!found) {
    if (matches.length > 1) {
      ui.fail(`"${args[0]}" matches ${matches.length} prompts`);
      ui.out('');
      ui.table(matches.map((p) => [p.slug, `${p.title}${p.category ? ui.color.dim(`  (${p.category})`) : ''}`]));
      return 1;
    }
    ui.fail(`no prompt named "${args[0]}"`);
    ui.out(`\nRun ${ui.color.cyan('gatecraft prompt')} to see all ${all.length}.`);
    return 1;
  }

  if (flags.md) {
    process.stdout.write(`### ${found.title}\n\n${found.body}\n`);
    return 0;
  }

  ui.out('');
  ui.out(`${ui.color.bold(found.title)}${found.category ? `  ${ui.color.dim(found.category)}` : ''}`);
  ui.out('');
  render(found.body);
  ui.out('');
  ui.out(`  ${ui.color.dim('Fill every {{placeholder}} before sending. An unfilled prompt gets a')}`);
  ui.out(`  ${ui.color.dim('generic answer, which is the failure this library exists to prevent.')}`);
  ui.out('');
  return 0;
}

module.exports = { run, help };
