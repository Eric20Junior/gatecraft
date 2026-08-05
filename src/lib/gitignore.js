'use strict';

const fsx = require('./fsx.js');
const { paths } = require('./paths.js');

// Managing the user's ignore file.
//
// Everything we add goes between two markers so it can be removed exactly on
// uninstall. Editing a user's .gitignore without a way to reverse it is rude, and
// leaving orphaned lines behind after uninstall is worse.

const BEGIN = '# >>> gatecraft >>>';
const END = '# <<< gatecraft <<<';

function block(lines) {
  return [BEGIN, '# Managed by gatecraft. Remove with: gatecraft uninstall', ...lines, END].join('\n');
}

function findBlock(text) {
  const b = text.indexOf(BEGIN);
  if (b === -1) return null;
  const e = text.indexOf(END, b);
  if (e === -1) return null;
  return { start: b, end: e + END.length };
}

/**
 * Ensure the managed block exists with exactly `lines`. Idempotent: running init
 * twice does not produce two blocks, and changing the lines rewrites in place.
 */
function ensure(root, lines) {
  const p = paths(root).gitignore;
  const existing = fsx.exists(p) ? fsx.read(p) : '';
  const found = findBlock(existing);
  const next = block(lines);

  if (found) {
    const current = existing.slice(found.start, found.end);
    if (current === next) return { changed: false, created: false };
    const updated = existing.slice(0, found.start) + next + existing.slice(found.end);
    fsx.writeAtomic(p, updated);
    return { changed: true, created: false };
  }

  // Append, keeping exactly one blank line before the block and a trailing newline.
  const base = existing.replace(/\s*$/, '');
  const content = base ? `${base}\n\n${next}\n` : `${next}\n`;
  fsx.writeAtomic(p, content);
  return { changed: true, created: !existing };
}

/** Remove the managed block. Deletes the file if it becomes empty and we created it. */
function remove(root) {
  const p = paths(root).gitignore;
  if (!fsx.exists(p)) return { changed: false };
  const text = fsx.read(p);
  const found = findBlock(text);
  if (!found) return { changed: false };

  let updated = text.slice(0, found.start) + text.slice(found.end);
  updated = updated.replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '');
  if (updated.trim() === '') {
    fsx.rimraf(p);
    return { changed: true, removedFile: true };
  }
  fsx.writeAtomic(p, updated.replace(/\s*$/, '\n'));
  return { changed: true, removedFile: false };
}

/** Is the path ignored, by our block or by something the user already wrote? */
function isIgnored(root, needle = '.ai/') {
  const p = paths(root).gitignore;
  if (!fsx.exists(p)) return false;
  return fsx
    .read(p)
    .split(/\r?\n/)
    .some((l) => {
      const t = l.trim();
      return t === needle || t === needle.replace(/\/$/, '') || t === `/${needle}`;
    });
}

module.exports = { BEGIN, END, ensure, remove, isIgnored, findBlock };
