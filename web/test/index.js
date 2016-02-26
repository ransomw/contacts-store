/*global require, module, process
 */

const tape = require('tape');
const tap_spec = require('tap-spec');

const get_tests = function (test_type) {
  return function (t) {
    if (typeof test_type === 'undefined') {
      t.test("unit", require('./unit'));
      t.test("integration", require('./integration'));
      t.test("functional", require('./func'));
    } else if (test_type === 'unit') {
      t.test("unit", require('./unit'));
    } else if (test_type === 'int') {
      t.test("integration", require('./integration'));
    } else if (test_type === 'func') {
      t.test("func", require('./func'));
    } else {
      throw new Error("invalid test type '" + test_type + "'");
    }
    t.end();
  };
};

const run_tests = function (test_type) {
  return new Promise(function (resolve, reject) {
    tape.createStream()
      .pipe(tap_spec())
      .pipe(process.stdout);
    tape.test("all tests for this run", get_tests(test_type));
    tape.onFinish(function () {
      resolve();
    });
  });
};


var exports = {};

exports.run_tests = run_tests;

module.exports = exports;
