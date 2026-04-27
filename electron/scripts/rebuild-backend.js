#!/usr/bin/env node
'use strict';

const { rebuild } = require('@electron/rebuild');
const path = require('path');

const electronVersion = require('../node_modules/electron/package.json').version;
const backendPath = path.resolve(__dirname, '../../backend');

console.log(`Rebuilding native modules for Electron ${electronVersion}...`);

rebuild({
  buildPath: backendPath,
  electronVersion,
  onlyModules: ['better-sqlite3'],
})
  .then(() => console.log('Native modules rebuilt successfully.'))
  .catch((err) => {
    console.error('Rebuild failed:', err);
    process.exit(1);
  });
