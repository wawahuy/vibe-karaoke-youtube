#!/usr/bin/env node
'use strict';

const { rebuild } = require('@electron/rebuild');
const path = require('path');

const args = process.argv.slice(2);
const getArg = (name) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];

const targetPlatform = getArg('platform') || process.platform;
const targetArch = getArg('arch') || process.arch;
const electronVersion = require('../node_modules/electron/package.json').version;
const backendPath = path.resolve(__dirname, '../../backend');

console.log(
  `Rebuilding native modules for Electron ${electronVersion} ` +
  `[${targetPlatform}/${targetArch}]...`,
);

rebuild({
  buildPath: backendPath,
  electronVersion,
  onlyModules: ['better-sqlite3'],
  platform: targetPlatform,
  arch: targetArch,
  forceABI: true,
})
  .then(() => console.log('Native modules rebuilt successfully.'))
  .catch((err) => {
    console.error('Rebuild failed:', err);
    process.exit(1);
  });
