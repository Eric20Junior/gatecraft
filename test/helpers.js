'use strict';

// Shared harness for the CLI tests.
//
// Every test runs the real binary in a real temp directory, because the things
// most worth testing here are filesystem effects on someone's repository. A test
// that stubs fs would pass while `upgrade` ate a user's PROJECT_CONTEXT.md.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'gatecraft.js');

/** Make an isolated project directory. `files` maps relative path -> contents. */
function project(files = {}, { git = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gatecraft-test-'));
  for (const [rel, contents] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, contents);
  }
  if (git) {
    try {
      execFileSync('git', ['init', '-q'], { cwd: dir, stdio: 'ignore' });
    } catch {
      // git absent — the CLI must still work, which is itself worth not failing on
    }
  }
  return dir;
}

/** Run the CLI. Never throws on a non-zero exit; the exit code is the assertion. */
function run(cwd, args, { env = {} } = {}) {
  const res = require('child_process').spawnSync(process.execPath, [BIN, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1', ...env },
  });
  return {
    code: res.status,
    out: res.stdout || '',
    err: res.stderr || '',
    all: `${res.stdout || ''}${res.stderr || ''}`,
  };
}

const read = (dir, rel) => fs.readFileSync(path.join(dir, rel), 'utf8');
const exists = (dir, rel) => fs.existsSync(path.join(dir, rel));
const write = (dir, rel, s) => fs.writeFileSync(path.join(dir, rel), s);
const rm = (dir, rel) => fs.rmSync(path.join(dir, rel), { recursive: true, force: true });
const cleanup = (dir) => fs.rmSync(dir, { recursive: true, force: true });

/** Fixture: a plausible Node project the detector should recognise. */
const NODE_PROJECT = {
  'package.json': JSON.stringify(
    {
      name: 'acme-checkout',
      dependencies: { next: '14.0.0', '@prisma/client': '5.0.0', ioredis: '5.0.0' },
      devDependencies: { typescript: '5.0.0', vitest: '1.0.0' },
    },
    null,
    2
  ),
  'tsconfig.json': '{}',
  Dockerfile: 'FROM node:20\n',
  '.github/workflows/ci.yml': 'name: ci\n',
  '.gitignore': 'node_modules\ndist\n',
};

module.exports = { ROOT, BIN, project, run, read, exists, write, rm, cleanup, NODE_PROJECT };
