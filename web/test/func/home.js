/*global require, module, process */

var fs = require('fs');

const tmp = require('tmp');
const fse = require('fs-extra');
const jsdom = require('jsdom');
const jquery = require('jquery');

const app = require('../../core');

const APP_PORT = process.env.PORT || 5000;
const APP_URL = 'http://localhost:' + APP_PORT;

// a node http server
// https://nodejs.org/api/http.html#http_class_http_server
var app_server;
// webdriverio client
var wd_client;
var dir_client_build;

const setup = function (t) {
  Promise.resolve().then(function () {
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
    t.end();
  }).catch(t.error);
};

const test_title = function (t) {
  Promise.resolve().then(function () {
    return wd_client.getTitle();
  }).then(function (page_title) {
    t.equal(page_title, 'contacts', "got page title");
    t.end();
  }).catch(t.error);
};

const test_content = function (t) {
  Promise.resolve().then(function () {
    return wd_client.getHTML('div#application');
  }).then(function (str_div_application) {
    const div_application = jsdom.jsdom(str_div_application);
    const $ = jquery(div_application.defaultView);
    const el_application = $(div_application);
    const el_h1 = el_application.find('#view-content h1');
    t.equal(el_h1.text(), 'home view', "header text");
    t.end();
  }).catch(t.error);
};

const home_tests = function (t) {
  Promise.resolve().then(function () {
    return wd_client.url(APP_URL + '/home/');
  }).then(function (page_title) {
    t.test("title", test_title);
    t.test("content", test_content);
    t.end();
  }).catch(t.error);
};

const make_tests_main = function (client, dir_client) {
  wd_client = client;
  dir_client_build = dir_client;
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
