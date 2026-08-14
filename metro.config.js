const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude large non-source directories to avoid EMFILE watcher errors on macOS without Watchman
config.resolver = {
  ...config.resolver,
  blockList: [
    /node_modules\/.*\/node_modules/,
    /\.git\/.*/,
    /api\/.*/,
    /\.expo\/.*/,
  ],
};

module.exports = config;

