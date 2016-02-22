/*global require, module, __dirname
 */

var path = require('path');

const koa = require('koa');


const make_app = function (client_build_dir) {
  const app = koa();

  app.use(require('koa-static')(client_build_dir, {
    // Browser cache max-age in milliseconds. defaults to 0
    maxage: 0,
    // Allow transfer of hidden files. defaults to false
    hidden: false,
    // Default file name, defaults to 'index.html'
    index: 'index.html',
    // If true, serves after yield next,
    // allowing any downstream middleware to respond first.
    defer: false,
    // Try to serve the gzipped version of a file automatically
    // when gzip is supported by a client and if the requested file
    // with .gz extension exists. defaults to true.
    gzip: true
  }));

  return app;
};

var exports = {};

exports.make_app = make_app;

module.exports = exports;
