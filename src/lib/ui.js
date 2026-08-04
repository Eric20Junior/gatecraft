'use strict';

// Terminal output. No dependencies, and degrades to plain text when the stream is
// not a TTY, NO_COLOR is set, or the terminal claims to be dumb — CI logs and
// piped output should be readable, not full of escape codes.

const useColor =
  process.stdout.isTTY &&
  !process.env.NO_COLOR &&
  process.env.TERM !== 'dumb' &&
  !process.env.GATECRAFT_NO_COLOR;

const wrap = (code) => (s) => (useColor ? `[${code}m${s}[0m` : String(s));

const color = {
  bold: wrap('1'),
  dim: wrap('2'),
  red: wrap('31'),
  green: wrap('32'),
  yellow: wrap('33'),
  blue: wrap('34'),
  cyan: wrap('36'),
};

// Unicode marks are pleasant but not universal; fall back where they will not render.
const unicode = useColor || process.env.GATECRAFT_UNICODE === '1';
const mark = {
  ok: unicode ? '✓' : '+',
  no: unicode ? '✗' : 'x',
  warn: unicode ? '⚠' : '!',
  arrow: unicode ? '→' : '->',
  bullet: unicode ? '•' : '-',
};

let quiet = false;
const setQuiet = (v) => {
  quiet = Boolean(v);
};

const out = (s = '') => {
  if (!quiet) process.stdout.write(`${s}\n`);
};
const err = (s = '') => process.stderr.write(`${s}\n`);

const ok = (s) => out(`${color.green(mark.ok)} ${s}`);
const info = (s) => out(`${color.blue(mark.bullet)} ${s}`);
const warn = (s) => out(`${color.yellow(mark.warn)} ${s}`);
const fail = (s) => err(`${color.red(mark.no)} ${s}`);
const step = (s) => out(`\n${color.bold(s)}`);
const note = (s) => out(`  ${color.dim(s)}`);

// Left-aligned two-column table. Widths are computed, not guessed, so long
// values do not shear the layout.
function table(rows, indent = '  ') {
  const width = rows.reduce((m, r) => Math.max(m, String(r[0]).length), 0);
  for (const [k, v] of rows) {
    out(`${indent}${color.dim(String(k).padEnd(width))}  ${v}`);
  }
}

module.exports = { color, mark, out, err, ok, info, warn, fail, step, note, table, setQuiet };
