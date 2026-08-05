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

/**
 * Find a rule *outside* our block that excludes the whole `.ai/` directory.
 *
 * This matters only for share mode, and it matters absolutely. Git will not
 * re-include a file inside an excluded directory: once `.ai/` itself is
 * excluded, `!.ai/DECISIONS.md` is dead text. So a user who already had `.ai/`
 * in their .gitignore gets a `--share` install whose every negation is inert,
 * shares nothing, and says nothing about it — the failure this project is
 * supposed to prevent, arriving silently. gatecraft's own repository has such a
 * line, which is how this was found.
 *
 * Returns { line, text } for reporting, or null when there is no conflict.
 */
function conflictingRule(root) {
  const p = paths(root).gitignore;
  if (!fsx.exists(p)) return null;
  const text = fsx.read(p);
  const found = findBlock(text);

  return (
    fsx
      .lines(text)
      .map((raw, i) => ({ raw, i }))
      .filter(({ raw, i }) => {
        if (!found) return true;
        // Offsets are cheaper to compare than re-parsing: skip our own lines.
        const at = fsx.lines(text).slice(0, i).join('\n').length;
        return at < found.start || at >= found.end;
      })
      .map(({ raw, i }) => ({ t: raw.trim(), line: i + 1, raw }))
      // A directory exclusion, not a single-file one. `.ai/**` and `.ai/*` also
      // exclude the directory contents wholesale, so they belong here too.
      .filter(({ t }) => ['.ai', '.ai/', '/.ai', '/.ai/', '.ai/*', '.ai/**', '/.ai/*', '/.ai/**'].includes(t))
      .map(({ line, raw }) => ({ line, text: raw.trim() }))[0] || null
  );
}

module.exports = { BEGIN, END, ensure, remove, isIgnored, findBlock, conflictingRule };
