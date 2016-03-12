/*global require, module, __dirname
 */

var path = require('path');

const mount = require('koa-mount');
const send = require('koa-send');
const koa = require('koa');
const session = require('koa-session');

const ui = require('./ui');
const api = require('./api');

const make_app = function (client_build_dir, sqlite_path) {
  const app = koa();
  const api_app = api.make_app(sqlite_path, {session_upstream: true});

  // required for koa-session
  // todo: not for deploy
  app.keys = ['some secret'];

  app.use(session(app));

  app.use(mount('/index', ui.make_app(client_build_dir)));

  app.use(mount('/api', api_app));

  app.use(function* (next) {
    if (this.url.match(/^\/api/)) {
      return;
    }
    if(this.url !== '/favicon.io') {
      yield send(this, 'index.html', {
        // Browser cache max-age in milliseconds. defaults to 0
        maxage: 0,
        // Allow transfer of hidden files. defaults to false
        hidden: false,
        // Root directory to restrict file access.  Required!
        root: client_build_dir,
        // Try to serve the gzipped version of a file automatically
        // when gzip is supported by a client and if the requested file
        // with .gz extension exists. defaults to true.
        gzip: false,
        // If not false (defaults to true), format the path to serve
        // static file servers and not require a trailing slash for
        // directories, so that you can do both /directory and /directory/
        format: true
      });
    }
  });

  if (app.init_db) {
    throw new Error("init_db already defined");
  }
  app.init_db = api_app.init_db;
  if (app.close_db) {
    throw new Error("close_db already defined");
  }
  app.close_db = api_app.close_db;

  return app;
};

var exports = {};

exports.make_app = make_app;

module.exports = exports;
