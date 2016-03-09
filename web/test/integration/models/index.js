/*global require, module, process */

var fs = require('fs');

const tmp = require('tmp');

const api = require('../../../core/server/api/');

const APP_PORT = process.env.PORT || 5000;
const API_URL = 'http://localhost:' + APP_PORT;

const models = require('../../../core/client/app/models')(API_URL);

var app_server;
var tmp_file_sqlite;
var app_inst;

const setup_server = function (t) {
  app_inst = api.make_app((tmp_file_sqlite = tmp.fileSync()).name);
  Promise.resolve().then(function () {
    return app_inst.init_db();
  }).then(function () {
    return new Promise(function (resolve, reject) {
      const server = app_inst.listen(APP_PORT, function () {
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
  }).catch(t.end);
};

const setup = function (t) {
  t.test("setup server", setup_server);
  t.end();
};

const teardown_server = function (t) {
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
    return app_inst.close_db();
  }).then(function () {
    fs.closeSync(tmp_file_sqlite.fd);
    fs.unlinkSync(tmp_file_sqlite.name);
    t.ok(true, "closed and removed database");
    t.end();
  }).catch(t.end);
};

const teardown = function (t) {
  t.test("teardown server", teardown_server);
  t.end();
};

const tests = function (t) {
  t.test("User", require('./user')(models.User));
  t.test("Contacts", require('./contacts')(
    models.User, models.Contacts));
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
