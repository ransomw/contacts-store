/*global require, module, process */

const execFile = require('child_process').execFile;

const fse = require('fs-extra');
const tmp = require('tmp');
const webdriverio = require('webdriverio');

const app = require('../../core');

const PHANTOM_PATH = require('phantomjs-prebuilt').path;
const CD_PATH = require('chromedriver').path;
const WD_PORT = process.env.WD_PORT || 7999;

// returned by `tmp` module
// https://github.com/raszi/node-tmp
var dir_client_build;
// webdriver process, a `ChildProcess` object
// https://nodejs.org/api/child_process.html#child_process_class_childprocess
var wd_proc;

/* If tests end w/o exiting, the correct client (chrome/phantom) doesn't
 * get used, or other webdriver weirdness appears, make certain there
 * isn't a webdriver process already running before the test starts.
 */

const wd_client = webdriverio.remote({
  host: 'localhost',
  port: WD_PORT,
  desiredCapabilities: { browserName: 'chrome' }
});

const make_setup_webdriver = function (wd_impl) {
  return function (t) {
    if (wd_impl === 'chromedriver') {
      wd_proc = execFile(
        CD_PATH, ['--url-base=/wd/hub',
                  '--port=' + WD_PORT.toString()]);
    } else if (wd_impl === 'phantomjs') {
      wd_proc = execFile(
        PHANTOM_PATH, [
          /* '--debug=true', */ // breakage
          '--webdriver=' + WD_PORT.toString(),
          '--webdriver-logfile=phantom.log',
          '--webdriver-loglevel=DEBUG'
        ]);
    } else {
      throw new Error("unknown webdriver implementation '" +
                      wd_impl + "'");
    }
    t.ok(wd_proc.pid, "browser process started");
    t.end();
  };
};

const setup_client = function (t) {
  dir_client_build = tmp.dirSync().name;
  Promise.resolve().then(function () {
    return app.build_client(dir_client_build);
  }).then(function () {
    t.ok(true, "build_client returned without errors");
    t.end();
  }).catch(t.end);
};

const make_setup = function (wd_impl) {
  return function (t) {
    t.test("webdriver setup", make_setup_webdriver(wd_impl));
    t.test("client setup", setup_client);
    t.end();
  };
};

const teardown_webdriver = function (t) {
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

const teardown_client = function (t) {
  fse.removeSync(dir_client_build);
  t.end();
};

const teardown = function (t) {
  t.test("teardown webdriver", teardown_webdriver);
  t.test("teardown client", teardown_client);
  t.end();
};

const func_tests = function (t) {
  t.skip("home page",
         require('./home')(wd_client, dir_client_build));
  t.skip("signup and login",
         require('./login')(wd_client, dir_client_build));
  t.test("CRUD",
         require('./crud')(wd_client, dir_client_build));
  t.end();
};

const make_tests_main = function (wd_impl) {
  return function (t) {
    t.test("setup", make_setup(wd_impl));
    t.test("tests", func_tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

module.exports = exports;
