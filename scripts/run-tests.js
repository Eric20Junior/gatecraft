'use strict';

// Test runner entry point.
//
// `node --test test/` is not portable across the supported Node range: Node 18 and
// 20 accept a directory, Node 22 does not and reports it as a missing module. Node
// 22 accepts a glob, which Node 18 and 20 do not expand. Neither does cmd.exe, so
// leaning on the shell to expand `test/*.test.js` fails on Windows.
//
// Discovering the files here and passing them explicitly is the one form every
// supported version and platform agrees on.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const testDir = path.resolve(__dirname, '..', 'test');

const files = fs
  .readdirSync(testDir)
  .filter((f) => f.endsWith('.test.js'))
  .sort()
  .map((f) => path.join('test', f));

if (files.length === 0) {
  console.error('no test files found in test/');
  process.exit(1);
}

const res = spawnSync(process.execPath, ['--test', ...files], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
});

process.exit(res.status === null ? 1 : res.status);
