'use strict';

const path = require('path');
const fsx = require('./fsx.js');
const { payloadDir } = require('./paths.js');

// The payload is the `.ai/` tree that gets copied into a project. This module knows
// how to enumerate, hash, and install it — and, importantly, how to install it
// *again* over an existing install without destroying anything the user wrote.

/**
 * Paths inside `.ai/` that belong to the project rather than the framework.
 * They still ship as templates, but they are what a team fills in, so `--share`
 * keeps them tracked in git while the 16k lines of framework docs stay ignored.
 */
const PROJECT_OWNED = [
  'PROJECT_CONTEXT.md',
  'DECISIONS.md',
  'memory/',
  'architecture/',
  'standards/',
  'workflows/',
  'prompts/',
  'research/',
  'planning/',
  'reviews/',
  'metrics/',
  'evaluation/',
  'checklists/',
  'templates/',
];

function isProjectOwned(rel) {
  return PROJECT_OWNED.some((p) => (p.endsWith('/') ? rel.startsWith(p) : rel === p));
}

function source() {
  const dir = payloadDir();
  if (!fsx.isDir(dir)) {
    throw new Error(
      `the framework payload is missing from this gatecraft install (expected ${dir}).\n` +
        `  Reinstall the CLI: npm i -g gatecraft@latest`
    );
  }
  return dir;
}

/** Every payload file, relative and POSIX-separated, sorted for stable output. */
function list() {
  return fsx.walk(source()).sort();
}

/** rel -> short sha256 of the pristine payload file. */
function hashes() {
  const src = source();
  const out = {};
  for (const rel of list()) out[rel] = fsx.hashFile(path.join(src, rel));
  return out;
}

function readFile(rel) {
  return fsx.read(path.join(source(), rel));
}

/**
 * Install into `destDir`.
 *
 * `mode: "fresh"` writes everything.
 *
 * `mode: "upgrade"` is the careful path and follows four rules:
 *   - a project-owned file that exists is never overwritten, edited or not
 *   - a file the user modified is never overwritten (reported instead)
 *   - a file the user deleted is never resurrected — deletion is a choice
 *   - a file new in this version is installed
 * `previous` is the file map from the old manifest; without it we cannot tell
 * "user deleted this" from "this file is new", so upgrade requires it.
 *
 * `force` overrides the hash rules for framework documents only. It deliberately
 * does *not* override project ownership: a flag meaning "give me the current
 * framework" should never be able to erase a team's context, decisions, or memory.
 */
function install(destDir, { mode = 'fresh', previous = {}, force = false } = {}) {
  const src = source();
  const result = { written: [], skippedModified: [], skippedDeleted: [], skippedProject: [], added: [] };

  for (const rel of list()) {
    const from = path.join(src, rel);
    const to = fsx.assertInside(destDir, path.join(destDir, rel));
    const known = previous[rel];

    if (mode === 'upgrade') {
      if (!fsx.exists(to)) {
        // `--force` means "give me a complete, pristine install", so it restores
        // what is missing. Without it, a deleted file stays deleted.
        if (known && !force) {
          result.skippedDeleted.push(rel); // deliberately removed by the user
          continue;
        }
        fsx.copyFile(from, to);
        (known ? result.written : result.added).push(rel);
        continue;
      }

      // Project-owned and already on disk. Its content is the project's — our
      // own install-time prefill counts as content too, and a blank template
      // would be strictly worse than whatever is there now.
      if (isProjectOwned(rel)) {
        result.skippedProject.push(rel);
        continue;
      }

      if (force) {
        fsx.copyFile(from, to);
        result.written.push(rel);
        continue;
      }
      if (known && fsx.hashFile(to) !== known.hash) {
        result.skippedModified.push(rel);
        continue;
      }
      if (!known) {
        // Present on disk but never recorded: the user created it. Leave it.
        result.skippedModified.push(rel);
        continue;
      }
    }

    fsx.copyFile(from, to);
    result.written.push(rel);
  }

  return result;
}

/** The file map to record in the manifest after an install. */
function fileMap(destDir) {
  const out = {};
  for (const [rel, hash] of Object.entries(hashes())) {
    const abs = path.join(destDir, rel);
    out[rel] = {
      hash: fsx.exists(abs) ? fsx.hashFile(abs) : hash,
      kind: isProjectOwned(rel) ? 'project' : 'framework',
    };
  }
  return out;
}

function stats() {
  const src = source();
  const files = list();
  // "Documents" means the framework prose, so the count agrees with the README
  // and `verify:payload`. Files we ship alongside it — the licence, notably —
  // are installed and hashed like everything else, but nobody thinks of the
  // MIT licence as one of the framework documents, and counting it made the
  // headline number drift from every other number in the project.
  const docs = files.filter((rel) => rel.endsWith('.md'));
  let lines = 0;
  // Count newlines, not split segments. Every payload file ends with a trailing
  // newline, so splitting yields a phantom empty final element — one per file.
  // The number we print should agree with `wc -l`.
  for (const rel of docs) lines += fsx.read(path.join(src, rel)).split('\n').length - 1;
  return { files: files.length, docs: docs.length, lines, dirs: fsx.walkDirs(src).length };
}

module.exports = {
  PROJECT_OWNED,
  isProjectOwned,
  source,
  list,
  hashes,
  readFile,
  install,
  fileMap,
  stats,
};
