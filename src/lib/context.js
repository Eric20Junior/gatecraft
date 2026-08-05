'use strict';

const path = require('path');
const { execFileSync } = require('child_process');
const fsx = require('./fsx.js');

// Pre-filling PROJECT_CONTEXT.md.
//
// The first thing an agent reads about a project should be true. A file full of
// `{{placeholder}}` teaches the agent that this file is decoration and it will stop
// reading it, so we fill in everything we can prove and leave everything we cannot.
//
// Detected values are marked `detected — verify`. Guessing silently would be worse
// than leaving a blank: a wrong fact stated confidently is exactly what
// PROJECT_CONTEXT.md exists to prevent.

const DETECTED = 'detected by gatecraft — verify';

function gitRemote(root) {
  try {
    return execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 3000,
    }).trim();
  } catch {
    return null;
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Replace the `{{}}` cells of a two-placeholder table row, matched by its label. */
function fillRow(text, label, value, note = DETECTED) {
  if (!value) return text;
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^(\\|\\s*${esc}\\s*\\|)\\s*\`\\{\\{\\}\\}\`\\s*\\|\\s*\`\\{\\{\\}\\}\`\\s*\\|$`, 'm');
  return text.replace(re, `$1 ${value} | *${note}* |`);
}

/** Replace a `| **Label** | `{{...}}` |` identity row. */
function fillIdentity(text, label, value, note) {
  if (!value) return text;
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^(\\|\\s*\\*\\*${esc}\\*\\*\\s*\\|)\\s*\`\\{\\{[^}]*\\}\\}\`\\s*\\|$`, 'm');
  return text.replace(re, `$1 ${value}${note ? ` *(${note})*` : ''} |`);
}

const join = (arr) => (arr && arr.length ? arr.join(', ') : null);

/**
 * Fill what we know into an installed PROJECT_CONTEXT.md.
 * Returns the number of fields filled; 0 means we learned nothing and left the
 * template untouched, which is a legitimate outcome for an empty repository.
 */
function prefill(aiDir, detected, root) {
  const file = path.join(aiDir, 'PROJECT_CONTEXT.md');
  if (!fsx.exists(file)) return 0;

  const before = fsx.read(file);
  let text = before;

  // §1 Identity — only the facts we can actually establish.
  text = fillIdentity(text, 'Project name', detected.name);
  text = fillIdentity(text, 'Repository', gitRemote(root) || null);
  text = fillIdentity(text, 'Last reviewed', today(), 'stamped at install; re-stamp when you fill this in');

  // §4 Technology.
  const frontend = detected.frameworks.filter((f) =>
    ['Next.js', 'Nuxt', 'Remix', 'Angular', 'SvelteKit', 'Svelte', 'Astro', 'Solid', 'Vue', 'React'].includes(f)
  );
  const mobile = detected.frameworks.filter((f) =>
    ['React Native', 'Expo', 'Flutter'].includes(f)
  );
  const backend = detected.frameworks.filter((f) => !frontend.includes(f) && !mobile.includes(f));
  const cache = detected.datastores.filter((d) => d === 'Redis');
  const db = detected.datastores.filter((d) => d !== 'Redis');

  text = fillRow(text, 'Language(s)', join(detected.languages));
  text = fillRow(text, 'Framework(s)', join(backend.length ? backend : detected.frameworks));
  text = fillRow(text, 'Database', join(db));
  text = fillRow(text, 'Cache', join(cache));
  text = fillRow(text, 'Frontend', join(frontend));
  text = fillRow(text, 'Mobile', join(mobile));
  text = fillRow(text, 'Infrastructure', join(detected.infra));
  text = fillRow(text, 'CI/CD', join(detected.ci));
  text = fillRow(text, 'Package manager', join(detected.packageManagers));
  text = fillRow(text, 'Test framework(s)', join(detected.testing));
  text = fillRow(text, 'Model provider(s) and pinned versions', join(detected.ai));

  if (text === before) return 0;
  fsx.writeAtomic(file, text);

  // Count filled cells by counting the marker we just inserted.
  return (text.match(new RegExp(DETECTED, 'g')) || []).length +
    (text.includes('stamped at install') ? 1 : 0);
}

/** How much of PROJECT_CONTEXT.md is still unfilled — used by `status` and `doctor`. */
function unfilled(aiDir) {
  const file = path.join(aiDir, 'PROJECT_CONTEXT.md');
  if (!fsx.exists(file)) return null;
  const text = fsx.read(file);
  const total = (text.match(/\{\{/g) || []).length;
  const sections = [];
  let current = null;
  for (const line of fsx.lines(text)) {
    const m = /^##\s+(\d+\.\s+.*)$/.exec(line);
    if (m) {
      current = { name: m[1].trim(), placeholders: 0 };
      sections.push(current);
    } else if (current) {
      current.placeholders += (line.match(/\{\{/g) || []).length;
    }
  }
  return { total, sections: sections.filter((s) => s.placeholders > 0) };
}

module.exports = { prefill, unfilled, gitRemote, today, DETECTED };
