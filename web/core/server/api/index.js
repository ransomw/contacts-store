/*global require, module
 */

const koa = require('koa');


const make_app = function () {
  const app = koa();

  // XXX

  return app;
};

var exports = {};

exports.make_app = make_app;

module.exports = exports;
