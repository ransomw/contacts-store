/*global require, module */

const app = require('../../../core');

const setup = function (t) {
  t.end();
};

const teardown = function (t) {
  t.end();
};

const crud_tests = function (t) {
  t.test("create", require('./create'));
  t.test("read", require('./read'));
  t.test("update", require('./update'));
  t.test("delete", require('./delete'));
  t.end();
};

const tests_main = function (t) {
  t.test("setup", setup);
  t.test("tests", crud_tests);
  t.test("teardown", teardown);
  t.end();
};

var exports = tests_main;

module.exports = exports;
