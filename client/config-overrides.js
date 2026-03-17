const path = require('path');

module.exports = function override(config) {
  config.resolve = config.resolve || {};

  // Disable all Node.js core module polyfills
  config.resolve.fallback = {
    path: false, fs: false, os: false, crypto: false,
    stream: false, buffer: false, http: false, https: false,
    net: false, tls: false, zlib: false, url: false,
    util: false, querystring: false, timers: false,
    assert: false, constants: false, events: false,
    string_decoder: false, dns: false, dgram: false,
    child_process: false, cluster: false,
  };

  // Force webpack to only look in client/node_modules
  config.resolve.modules = [
    path.resolve(__dirname, 'node_modules'),
    'node_modules',
  ];

  // Ignore server-only packages
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];

  return config;
};