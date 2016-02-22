/*global require, module, process */

var fs = require('fs');

const tmp = require('tmp');
const fse = require('fs-extra');

const app = require('../../core');

const APP_PORT = process.env.PORT || 5000;
const APP_URL = 'http://localhost:' + APP_PORT;

// returned by `tmp` module
// https://github.com/raszi/node-tmp
var dir_client_build;
// a node http server
// https://nodejs.org/api/http.html#http_class_http_server
var app_server;
// webdriverio client
var wd_client;

const setup = function (t) {
  dir_client_build = tmp.dirSync().name;
  Promise.resolve().then(function () {
    return app.build_client(dir_client_build);
  }).then(function () {
    return app.run_server(APP_PORT, dir_client_build);
  }).then(function (new_server) {
    app_server = new_server;
    return wd_client.init();
  }).then(function () {
    t.end();
  }).catch(t.error);
};

const teardown = function (t) {
  Promise.resolve().then(function () {
    return wd_client.end();
  }).then(function () {
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
    fse.removeSync(dir_client_build);
    t.end();
  }).catch(t.error);
};

const home_tests = function (t) {
  Promise.resolve().then(function () {
    return wd_client.url(APP_URL)
      .getTitle();
  }).then(function (page_title) {
    t.equal(page_title, 'contacts', "got page title");
    t.end();
  }).catch(t.error);
};

const make_tests_main = function (client) {
  wd_client = client;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", home_tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

tmp.setGracefulCleanup();

module.exports = exports;
