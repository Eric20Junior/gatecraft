#!/usr/bin/env node
'use strict';

// Fail fast and legibly on old Node rather than dying inside a syntax error.
const major = Number(process.versions.node.split('.')[0]);
if (major < 18) {
  process.stderr.write(
    `gatecraft requires Node 18 or newer (found ${process.versions.node}).\n` +
      `Install a current Node, or use the standalone installer:\n` +
      `  curl -fsSL https://raw.githubusercontent.com/Eric20Junior/gatecraft/main/install.sh | sh\n`
  );
  process.exit(1);
}

require('../src/cli.js')
  .run(process.argv.slice(2))
  .then((code) => process.exit(typeof code === 'number' ? code : 0))
  .catch((err) => {
    const { fail } = require('../src/lib/ui.js');
    fail(err && err.message ? err.message : String(err));
    if (process.env.GATECRAFT_DEBUG) process.stderr.write(`\n${err && err.stack}\n`);
    process.exit(1);
  });
