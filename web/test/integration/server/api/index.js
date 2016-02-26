/*global require, module, process */

const nets = require('nets');

const api = require('../../../../core/server/api/');

const APP_PORT = process.env.PORT || 5000;
const API_URL = 'http://localhost:' + APP_PORT;

var app_server;

const setup = function (t) {
  const app = api.make_app();
  Promise.resolve().then(function () {
    return new Promise(function (resolve, reject) {
      const server = app.listen(APP_PORT, function () {
        resolve(server);
      });
      server.on('error', function (err) {
        reject(err);
      });
    });
  }).then(function (new_server) {
    t.ok(new_server, "got new server instance");
    app_server = new_server;
    t.end();
  }).catch(t.error);
};

const teardown = function (t) {
  Promise.resolve().then(function () {
    return new Promise(function (resolve, reject) {
      app_server.close(function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }).then(function () {
    t.ok(true, "closed app server");
    t.end();
  }).catch(t.error);
};

const test_hello = function (t) {
  var req_url = API_URL + '/hi';
  nets({
    url: req_url,
    encoding: undefined,
    json: true
  }, function(err, resp, body) {
    t.notOk(err, "hello world endpoint returns without error");
    t.equal(body.msg, "hiya!", "hello endpoint says the right thing");
    t.end();
  });
};


const tests = function (t) {
  t.test("hello world", test_hello);
  t.test("login", require('./login')(API_URL));
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
