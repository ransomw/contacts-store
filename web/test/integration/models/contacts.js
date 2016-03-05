/*global require, module */

const app = require('../../../core');

const setup = function (t) {
  t.end();
};

const teardown = function (t) {
  t.end();
};

const test_none = function (t) {
  t.notOk(true, "unimplemented");
  t.end();
};

const test_create = function (t) {
  t.notOk(true, "unimplemented");
  t.end();
};

const test_read = function (t) {
  t.notOk(true, "unimplemented");
  t.end();
};

const test_update = function (t) {
  t.notOk(true, "unimplemented");
  t.end();
};

const test_delete = function (t) {
  t.notOk(true, "unimplemented");
  t.end();
};


const contacts_tests = function (t) {
  t.test(test_none, "no models");
  t.test(test_create, "create");
  t.test(test_read, "read");
  t.test(test_update, "update");
  t.test(test_delete, "delete");
  t.end();
};

const tests_main = function (t) {
  t.test("setup", setup);
  t.test("tests", contacts_tests);
  t.test("teardown", teardown);
  t.end();
};

var exports = tests_main;

module.exports = exports;
