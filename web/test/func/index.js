/*global require, module, process */

const execFile = require('child_process').execFile;

const webdriverio = require('webdriverio');

const app = require('../../core');

const CD_PATH = require('chromedriver').path;
const WD_PORT = process.env.WD_PORT || 7999;

// webdriver process, a `ChildProcess` object
// https://nodejs.org/api/child_process.html#child_process_class_childprocess
var wd_proc;

const wd_client = webdriverio.remote({
  host: 'localhost',
  port: WD_PORT,
  desiredCapabilities: { browserName: 'chrome' }
});

const setup = function (t) {
  wd_proc = execFile(
    CD_PATH, ['--url-base=/wd/hub',
              '--port=' + WD_PORT.toString()]);
  t.ok(wd_proc.pid, "browser process started");
  t.end();
};

const teardown = function (t) {
  const close_signal = 'SIGKILL';
  t.plan(2);
  t.ok(wd_proc.pid, "webdriver process running");
  wd_proc.on(
    'exit',
    (code, signal) => {
      t.equal(signal, close_signal,
              "webdriver process exit on expected signal");
    });
  wd_proc.kill(close_signal);
};

const func_tests = function (t) {
  t.test("home page", require('./home')(wd_client));
  t.test("CRUD", require('./crud'));
  t.end();
};

const tests_main = function (t) {
  t.test("setup", setup);
  t.test("tests", func_tests);
  t.test("teardown", teardown);
  t.end();
};

var exports = tests_main;

module.exports = exports;
