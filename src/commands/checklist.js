'use strict';

const path = require('path');
const ui = require('../lib/ui.js');
const fsx = require('../lib/fsx.js');
const paths = require('../lib/paths.js');
const payload = require('../lib/payload.js');
const links = require('../lib/links.js');

// `gatecraft checklist <name>` exists so a gate can be run without opening a file.
//
// A checklist you have to go and find is a checklist that gets skipped at exactly
// the moment it matters — the end of a long day, in front of a release. One command
// that prints it, and pipes cleanly into an agent, removes that excuse.

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

/** Split CHECKLISTS.md into its `## N. Name checklist` sections. */
function parse(text) {
  const out = [];
  const lines = fsx.lines(text);
  let current = null;
  let fenced = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const m = !fenced && /^##\s+(\d+)\.\s+(.+?)\s*$/.exec(line);
    if (m) {
      current = {
        number: Number(m[1]),
        title: m[2],
        slug: m[2].replace(/\s+checklist$/i, '').toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, ''),
        anchor: links.slug(`${m[1]}. ${m[2]}`),
        lines: [],
      };
      out.push(current);
      continue;
    }
    if (current) current.lines.push(line);
  }

  for (const c of out) {
    c.body = c.lines.join('\n').replace(/\n*---\s*$/, '').trim();
    c.items = (c.body.match(/^- \[ \]/gm) || []).length;
    delete c.lines;
  }
  return out;
}

function locate(flags) {
  const root = flags.dir ? path.resolve(flags.dir) : paths.findProjectRoot();
  const installed = path.join(paths.paths(root).ai, 'CHECKLISTS.md');
  if (fsx.exists(installed)) return { file: installed, source: 'project' };
  return { file: path.join(payload.source(), 'CHECKLISTS.md'), source: 'framework' };
}

async function run({ flags, args }) {
  const { file, source } = locate(flags);
  const all = parse(fsx.read(file));
  const query = (args[0] || '').toLowerCase().replace(/[^\w]+/g, '-');

  if (!query) {
    ui.step(`Checklists ${ui.color.dim(source === 'project' ? '(from this project)' : '(framework defaults)')}`);
    ui.table(all.map((c) => [`${String(c.number).padStart(2)}  ${c.slug}`, `${c.items} items — ${c.title}`]));
    ui.out(`\n  ${ui.color.dim('gatecraft checklist <name>   print one')}`);
    ui.out(`  ${ui.color.dim('gatecraft checklist <name> --md | pbcopy')}\n`);
    return 0;
  }

  const byNumber = /^\d+$/.test(query) ? all.find((c) => c.number === Number(query)) : null;
  const exact = all.find((c) => c.slug === query);
  const partial = all.filter((c) => c.slug.includes(query) || c.title.toLowerCase().includes(args[0].toLowerCase()));
  const found = byNumber || exact || (partial.length === 1 ? partial[0] : null);

  if (!found) {
    if (partial.length > 1) {
      ui.fail(`"${args[0]}" matches ${partial.length} checklists`);
      ui.out('');
      ui.table(partial.map((c) => [c.slug, c.title]));
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

module.exports = { run, help, parse };
