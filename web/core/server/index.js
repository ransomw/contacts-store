/*global require, module, __dirname
 */

var path = require('path');

const mount = require('koa-mount');
const koa = require('koa');

const ui = require('./ui');
const api = require('./api');

const make_app = function (client_build_dir) {
  const app = koa();

  app.use(mount('/index', ui.make_app(client_build_dir)));
  app.use(mount('/api', api.make_app()));

  app.use(function* (next) {
    // ??? why does this print twice?
    // console.log("hit default route");
    this.redirect('/index');
  });

  return app;
};

var exports = {};

exports.make_app = make_app;

module.exports = exports;
