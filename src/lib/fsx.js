'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Filesystem helpers shared by every command. Two rules run through all of them:
// never write outside the resolved project root, and never overwrite something the
// user authored without being told to.

/** Every file under `dir`, as paths relative to `dir`, with POSIX separators. */
function walk(dir, base = dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, acc);
    else if (entry.isFile()) acc.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return acc;
}

/** Directories under `dir`, relative and POSIX-separated. */
function walkDirs(dir, base = dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    acc.push(path.relative(base, full).split(path.sep).join('/'));
    walkDirs(full, base, acc);
  }
  return acc;
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

function hashFile(file) {
  return sha256(fs.readFileSync(file));
}

function exists(p) {
  return fs.existsSync(p);
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function write(p, content) {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
}

function copyFile(from, to) {
  mkdirp(path.dirname(to));
  fs.copyFileSync(from, to);
}

function rimraf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

/**
 * Guard against writing outside the project root. Every destination path passes
 * through here. An installer that can be talked into writing to an arbitrary path
 * is a vulnerability, not a convenience — and `..` in a relative path is the usual
 * way in.
 */
function assertInside(root, target) {
  const r = path.resolve(root);
  const t = path.resolve(target);
  if (t !== r && !t.startsWith(r + path.sep)) {
    throw new Error(`refusing to write outside the project root: ${t}`);
  }
  return t;
}

/**
 * Atomic-ish write: write a sibling temp file, then rename over the target.
 * A crash mid-write leaves the original intact rather than a truncated file.
 */
function writeAtomic(p, content) {
  mkdirp(path.dirname(p));
  const tmp = `${p}.gatecraft-tmp-${process.pid}`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, p);
}

/** Remove now-empty directories from `dir` upwards, stopping at `stopAt`. */
function pruneEmpty(dir, stopAt) {
  let cur = path.resolve(dir);
  const stop = path.resolve(stopAt);
  while (cur.startsWith(stop) && cur !== stop) {
    try {
      if (fs.readdirSync(cur).length > 0) return;
      fs.rmdirSync(cur);
    } catch {
      return;
    }
    cur = path.dirname(cur);
  }
}

/**
 * Split text into lines, tolerating CRLF.
 *
 * Git checks these files out with CRLF endings on Windows by default, and a bare
 * `split('\n')` leaves a trailing `\r` on every line. That `\r` is invisible in
 * output but defeats any regex anchored with `$` — `/^(#{1,6})\s+(.*)$/` matches
 * nothing, so every heading, anchor, and checklist section silently disappears
 * rather than erroring. Splitting on both is what keeps the parsers honest.
 */
function lines(text) {
  return text.split(/\r?\n/);
}

module.exports = {
  walk,
  walkDirs,
  sha256,
  hashFile,
  exists,
  isDir,
  mkdirp,
  read,
  write,
  writeAtomic,
  copyFile,
  rimraf,
  assertInside,
  pruneEmpty,
  lines,
};
