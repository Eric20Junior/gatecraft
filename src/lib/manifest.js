'use strict';

const fsx = require('./fsx.js');
const { paths, frameworkVersion } = require('./paths.js');

// The manifest is the whole reason upgrades are safe.
//
// For every file we install we record the hash of what we wrote. At upgrade time,
// a file whose current hash still matches the recorded one has not been touched by
// the user, so replacing it is safe. A file whose hash differs was edited, and we
// leave it alone and report it.
//
// Without this record the only options are "clobber the user's work" or "never
// update anything", and both are how framework installers earn their reputation.

const SCHEMA = 1;

function empty(version = frameworkVersion()) {
  return {
    schema: SCHEMA,
    name: 'gatecraft',
    version,
    installedAt: new Date().toISOString(),
    upgradedAt: null,
    // relative path -> { hash, kind }
    // kind: "framework" (ours, upgradeable) | "seed" (yours from first install, never touched)
    files: {},
    // Files the user has modified, recorded at the last upgrade so `status` can
    // report them without rehashing intent.
    modified: [],
    gitignore: { managed: false },
    bootstrap: { managed: false, hash: null },
  };
}

function load(root) {
  const p = paths(root).manifest;
  if (!fsx.exists(p)) return null;
  let data;
  try {
    data = JSON.parse(fsx.read(p));
  } catch (e) {
    throw new Error(
      `the install manifest at ${p} is not valid JSON (${e.message}).\n` +
        `  Repair it, or reinstall with: gatecraft init --force`
    );
  }
  if (data.schema > SCHEMA) {
    throw new Error(
      `this install was made by a newer gatecraft (manifest schema ${data.schema}, this CLI understands ${SCHEMA}).\n` +
        `  Upgrade the CLI: npm i -g gatecraft@latest`
    );
  }
  if (adopt(root, data)) save(root, data);
  return data;
}

/**
 * Backfill hashes for an install made by `install.sh`.
 *
 * The shell installer cannot compute sha256 portably — there is no one command
 * that exists on macOS, Alpine, and Debian — so it writes a manifest with an
 * empty file map. Left alone, every command would then report the entire
 * framework as "added by you", and upgrade would have no idea what is safe to
 * replace. So the first time a Node CLI touches such an install, we adopt it.
 *
 * A file whose content matches the pristine payload is recorded as pristine. A
 * file that differs is recorded with the *pristine* hash, which makes `diff()`
 * classify it as modified — and therefore preserve it. When the installed and
 * shipped versions differ we cannot know the original bytes, so this
 * over-preserves rather than under-preserves. That is the correct direction to
 * be wrong in.
 *
 * Returns true if anything changed.
 */
function adopt(root, manifest) {
  if (manifest.files && Object.keys(manifest.files).length > 0) return false;

  const path_ = require('path');
  const payload = require('./payload.js');
  const ai = paths(root).ai;
  if (!fsx.isDir(ai)) return false;

  let pristine;
  try {
    pristine = payload.hashes();
  } catch {
    return false; // no payload available; leave the manifest as we found it
  }

  const files = {};
  for (const [rel, hash] of Object.entries(pristine)) {
    if (!fsx.exists(path_.join(ai, rel))) continue;
    files[rel] = { hash, kind: payload.isProjectOwned(rel) ? 'project' : 'framework' };
  }
  if (Object.keys(files).length === 0) return false;

  manifest.files = files;
  manifest.adoptedAt = new Date().toISOString();
  return true;
}

function save(root, manifest) {
  const p = paths(root).manifest;
  fsx.writeAtomic(p, `${JSON.stringify(manifest, null, 2)}\n`);
}

function isInstalled(root) {
  return fsx.exists(paths(root).manifest);
}

/**
 * Classify every tracked file as unchanged, modified, or missing.
 * `unknown` covers files present in `.ai/` that the manifest never recorded —
 * usually the user's own notes, which is exactly what `.ai/` is for.
 */
function diff(root, manifest) {
  const path_ = require('path');
  const ai = paths(root).ai;
  const result = { unchanged: [], modified: [], missing: [], unknown: [] };

  for (const [rel, entry] of Object.entries(manifest.files)) {
    const abs = path_.join(ai, rel);
    if (!fsx.exists(abs)) {
      result.missing.push(rel);
      continue;
    }
    if (fsx.hashFile(abs) === entry.hash) result.unchanged.push(rel);
    else result.modified.push(rel);
  }

  if (fsx.isDir(ai)) {
    for (const rel of fsx.walk(ai)) {
      if (rel.startsWith('.gatecraft-manifest')) continue;
      if (!manifest.files[rel]) result.unknown.push(rel);
    }
  }

  return result;
}

module.exports = { SCHEMA, empty, load, save, isInstalled, diff, adopt };
