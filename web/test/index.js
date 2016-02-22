/*global require, module, process
 */

const tape = require('tape');
const tap_spec = require('tap-spec');

const tests = function (t) {
  t.test("unit", require('./unit'));
  t.test("functional", require('./func'));
  t.end();
};

const run_tests = function () {
  return new Promise(function (resolve, reject) {
    tape.createStream()
      .pipe(tap_spec())
      .pipe(process.stdout);
    tape.test("all tests", tests);
    tape.onFinish(function () {
      resolve();
    });
  });
};


var exports = {};

exports.run_tests = run_tests;

module.exports = exports;
