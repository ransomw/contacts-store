/*global require, module */

const setup = function (t) {
  t.end();
};

const teardown = function (t) {
  t.end();
};

const tests = function (t) {
  t.test("server", require('./server'));
  t.test("client", require('./client'));
  t.end();
};

const tests_main = function (t) {
  t.test("setup", setup);
  t.test("tests", tests);
  t.test("teardown", teardown);
  t.end();
};

var exports = tests_main;

module.exports = exports;
