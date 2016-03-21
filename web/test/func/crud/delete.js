/*global require, module */

const app = require('../../../core');

const setup = function (t) {
  t.end();
};

const teardown = function (t) {
  t.end();
};

const tests = function (t) {
  t.end();
};

const make_tests_main = function (client, app_url) {
  // wd_client = client;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

module.exports = exports;
