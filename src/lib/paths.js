'use strict';

const fs = require('fs');
const path = require('path');

// Where things live, and how we decide what "the project" is.

const DIR = '.ai'; // the hidden payload directory
const MANIFEST = '.ai/.gatecraft-manifest.json'; // install record, inside the payload
const BOOTSTRAP = 'AGENTS.md'; // the one visible, committed file

// Markers that indicate the root of a project, in no particular order. Presence of
// any one is enough; `.git` wins when several are found at different depths.
const ROOT_MARKERS = [
  '.git',
  'package.json',
  'pyproject.toml',
  'requirements.txt',
  'setup.py',
  'go.mod',
  'Cargo.toml',
  'pom.xml',
  'build.gradle',
  'build.gradle.kts',
  'Gemfile',
  'composer.json',
  'mix.exs',
  'pubspec.yaml',
  'Package.swift',
  'CMakeLists.txt',
  'Makefile',
  'deno.json',
  'bun.lockb',
  '.hg',
  '.svn',
];

/**
 * Find the project root by walking up from `start`.
 *
 * Preference order matters: a monorepo package has its own `package.json`, but the
 * repository root has `.git`. Installing into the wrong one produces an `.ai/` that
 * the agent finds from some directories and not others, so `.git` wins when both
 * exist. When nothing is found we use `start` rather than guessing — silently
 * installing three directories up would be worse than installing here.
 */
function findProjectRoot(start = process.cwd()) {
  let dir = path.resolve(start);
  let firstMarker = null;

  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    if (!firstMarker) {
      for (const m of ROOT_MARKERS) {
        if (fs.existsSync(path.join(dir, m))) {
          firstMarker = dir;
          break;
        }
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached the filesystem root
    dir = parent;
  }

  return firstMarker || path.resolve(start);
}

/** Root of the installed npm package (or the checked-out repo), which holds payload/. */
function packageRoot() {
  return path.resolve(__dirname, '..', '..');
}

function payloadDir() {
  return path.join(packageRoot(), 'payload');
}

function frameworkVersion() {
  return require(path.join(packageRoot(), 'package.json')).version;
}

const paths = (root) => ({
  root,
  ai: path.join(root, DIR),
  manifest: path.join(root, MANIFEST),
  bootstrap: path.join(root, BOOTSTRAP),
  gitignore: path.join(root, '.gitignore'),
  gitExclude: path.join(root, '.git', 'info', 'exclude'),
});

module.exports = {
  DIR,
  MANIFEST,
  BOOTSTRAP,
  ROOT_MARKERS,
  findProjectRoot,
  packageRoot,
  payloadDir,
  frameworkVersion,
  paths,
};
