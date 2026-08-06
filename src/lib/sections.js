'use strict';

const path = require('path');
const fsx = require('./fsx.js');
const paths = require('./paths.js');
const payload = require('./payload.js');
const links = require('./links.js');

// Addressing one section of a payload document from the command line.
//
// The framework is deliberately large, and every document in it is a reference
// work rather than something read front to back. STANDARDS.md is 976 lines and an
// agent implementing an endpoint needs section 13; PROMPTS.md is 2,804 lines and
// holds 62 independent prompts. Reading the whole file to reach one section costs
// thousands of tokens of context an agent could have spent on the actual work,
// and on a small context window it is the difference between fitting and not.
//
// So: one parser for the two shapes these documents use, and one resolver, shared
// by `checklist`, `standard`, and `prompt` so the three behave identically. The
// alternative — line offsets in the docs — rots the moment anything is inserted.

/** A heading turned into something typeable: `10. Security standards` -> `security`. */
function slugify(title, stripSuffix) {
  const base = stripSuffix ? title.replace(stripSuffix, '') : title;
  return base
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Trailing `---` rules separate sections in the payload; they are not content. */
function finish(section) {
  section.body = section.lines.join('\n').replace(/\n*---\s*$/, '').trim();
  section.items = (section.body.match(/^- \[ \]/gm) || []).length;
  delete section.lines;
  return section;
}

/**
 * Sections of the form `## N. Title` — the shape CHECKLISTS.md and STANDARDS.md
 * use. Fenced code is skipped, because a `## ` inside a fence is sample output,
 * not a heading.
 */
function parseNumbered(text, { stripSuffix = null } = {}) {
  const out = [];
  let current = null;
  let fenced = false;

  for (const line of fsx.lines(text)) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const m = !fenced && /^##\s+(\d+)\.\s+(.+?)\s*$/.exec(line);
    if (m) {
      current = {
        number: Number(m[1]),
        title: m[2],
        slug: slugify(m[2], stripSuffix),
        anchor: links.slug(`${m[1]}. ${m[2]}`),
        lines: [],
      };
      out.push(current);
      continue;
    }
    if (current) current.lines.push(line);
  }

  return out.map(finish);
}

/**
 * Entries of the form `### Name` grouped under `## N. Category` — the shape
 * PROMPTS.md, TEMPLATES.md, and PLAYBOOKS.md use. Each entry carries its parent
 * category so an ambiguous query can be disambiguated by where it lives.
 */
function parseEntries(text) {
  const out = [];
  let category = null;
  let categoryNumber = 0;
  let current = null;
  let fenced = false;

  for (const line of fsx.lines(text)) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;

    if (!fenced) {
      const cat = /^##\s+(?:(\d+)\.\s+)?(.+?)\s*$/.exec(line);
      if (cat && !line.startsWith('###')) {
        categoryNumber = cat[1] ? Number(cat[1]) : categoryNumber + 1;
        category = cat[2];
        current = null;
        continue;
      }
      const entry = /^###\s+(.+?)\s*$/.exec(line);
      if (entry) {
        current = {
          number: out.length + 1,
          title: entry[1],
          category,
          categoryNumber,
          slug: slugify(entry[1]),
          anchor: links.slug(entry[1]),
          lines: [],
        };
        out.push(current);
        continue;
      }
    }
    if (current) current.lines.push(line);
  }

  return out.map(finish);
}

/**
 * Find the one section a query means.
 *
 * Exact slug beats prefix beats substring, and a query matching several returns
 * them for the caller to print rather than guessing — silently picking the first
 * of four security standards is worse than asking again.
 */
function resolve(all, raw) {
  const query = String(raw || '').toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
  if (!query) return { query, found: null, matches: [] };

  if (/^\d+$/.test(query)) {
    const byNumber = all.find((s) => s.number === Number(query));
    if (byNumber) return { query, found: byNumber, matches: [byNumber] };
  }

  const exact = all.find((s) => s.slug === query);
  if (exact) return { query, found: exact, matches: [exact] };

  const prefix = all.filter((s) => s.slug.startsWith(query));
  const pool = prefix.length
    ? prefix
    : all.filter((s) => s.slug.includes(query) || s.title.toLowerCase().includes(query.replace(/-/g, ' ')));

  return { query, found: pool.length === 1 ? pool[0] : null, matches: pool };
}

/**
 * Prefer the copy installed in the project, since `.ai/standards/` overrides and
 * a pinned framework version both live there. Fall back to the packaged payload
 * so these commands still work outside an installed project.
 */
function locate(flags, file) {
  const root = flags.dir ? path.resolve(flags.dir) : paths.findProjectRoot();
  const installed = path.join(paths.paths(root).ai, file);
  if (fsx.exists(installed)) return { file: installed, source: 'project' };
  return { file: path.join(payload.source(), file), source: 'framework' };
}

module.exports = { slugify, parseNumbered, parseEntries, resolve, locate };
