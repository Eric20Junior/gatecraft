'use strict';

const path = require('path');
const fsx = require('./fsx.js');

// Link checking for the installed tree.
//
// The framework is a hypertext: SYSTEM.md sends you to WORKFLOW.md, which sends you
// to a checklist, which sends you to a standard. A broken link is not cosmetic —
// it is a dead end in a chain an agent was told to follow, and the agent will route
// around it silently rather than reporting it. So we verify them.

/**
 * GitHub's heading-to-anchor rules, which are what every renderer of these files
 * actually implements: lowercase, drop formatting, strip anything that is not a
 * word character, space, or hyphen, then turn each space into a hyphen. Note that
 * *each* space becomes a hyphen — "a / b" yields "a--b", not "a-b".
 */
function slug(heading) {
  return heading
    .trim()
    .replace(/`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // inline links -> their text
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/ /g, '-');
}

/** Headings in a file, with GitHub's -1/-2 disambiguation for repeats. */
function anchorsOf(text) {
  const seen = new Map();
  const set = new Set();
  let fenced = false;

  for (const line of fsx.lines(text)) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const m = /^(#{1,6})\s+(.*)$/.exec(line);
    if (!m) continue;
    const base = slug(m[2]);
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    set.add(n === 0 ? base : `${base}-${n}`);
  }
  return set;
}

const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;

/**
 * Check every relative link in a Markdown tree.
 * External links are not fetched — a link checker that hits the network is a link
 * checker nobody runs.
 */
function check(rootDir) {
  const report = { checked: 0, broken: [], files: 0 };
  if (!fsx.isDir(rootDir)) return report;

  const files = fsx.walk(rootDir).filter((f) => f.endsWith('.md'));
  report.files = files.length;

  const anchorCache = new Map();
  const anchorsFor = (abs) => {
    if (!anchorCache.has(abs)) {
      anchorCache.set(abs, fsx.exists(abs) ? anchorsOf(fsx.read(abs)) : null);
    }
    return anchorCache.get(abs);
  };

  for (const rel of files) {
    const abs = path.join(rootDir, rel);
    const text = fsx.read(abs);
    let fenced = false;
    const lines = fsx.lines(text);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        continue;
      }
      if (fenced) continue;

      LINK.lastIndex = 0;
      let m;
      while ((m = LINK.exec(line)) !== null) {
        const target = m[1];
        if (/^(https?:|mailto:|#!)/.test(target)) continue;
        report.checked++;

        const hash = target.indexOf('#');
        const filePart = hash === -1 ? target : target.slice(0, hash);
        const anchor = hash === -1 ? '' : target.slice(hash + 1);

        let targetAbs;
        if (filePart === '') {
          targetAbs = abs;
        } else {
          targetAbs = path.resolve(path.dirname(abs), filePart);
          if (!fsx.exists(targetAbs)) {
            report.broken.push({ file: rel, line: i + 1, target, reason: 'missing file' });
            continue;
          }
          if (fsx.isDir(targetAbs)) continue; // directory links are fine
        }

        if (!anchor) continue;
        const set = anchorsFor(targetAbs);
        if (!set || !set.has(anchor)) {
          report.broken.push({ file: rel, line: i + 1, target, reason: 'missing anchor' });
        }
      }
    }
  }

  return report;
}

module.exports = { slug, anchorsOf, check };
