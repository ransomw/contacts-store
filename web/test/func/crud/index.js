/*global require, module, process, setTimeout */

var fs = require('fs');
var url = require('url');

const _ = require('lodash');
const tmp = require('tmp');
const fse = require('fs-extra');
const jsdom = require('jsdom');
const jquery = require('jquery');

const app = require('../../../core');

const TIMEOUT_LOAD = 10000;

const APP_PORT = process.env.PORT || 5000;
const APP_URL = 'http://localhost:' + APP_PORT;

const USERNAME = 'alice';
const PASSWORD = 'pass';

// a node http server
// https://nodejs.org/api/http.html#http_class_http_server
var app_server;
// webdriverio client
var wd_client;
var dir_client_build;
var tmp_file_sqlite;
var cb_close_db;

const dumb_timeout = function (ms_dur) {
  return function () {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, ms_dur);
    });
  };
};

const setup = function (t) {
  tmp_file_sqlite = tmp.fileSync();
  Promise.resolve().then(function () {
    return app.init_db(tmp_file_sqlite.name);
  }).then(function () {
    t.pass("initialized database");
    return app.run_server(
      APP_PORT, dir_client_build, tmp_file_sqlite.name);
  }).then(function (run_server_ret) {
    return _.at(run_server_ret, ['server', 'close_db']);
  }).then(_.spread(function (new_server, close_db) {
    t.ok(new_server, "got server instance");
    t.equal(typeof close_db, 'function', "got close database callback");
    cb_close_db = close_db;
    app_server = new_server;
    return wd_client.init();
  })).then(function () {
    t.end();
  }).catch(t.end);
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
    return cb_close_db();
  }).then(function (){
    t.ok(true, "close database without error");
    fs.closeSync(tmp_file_sqlite.fd);
    fs.unlinkSync(tmp_file_sqlite.name);
    t.ok(true, "remove sqlite file without error");
    t.end();
  }).catch(t.end);
};

const test_signup_navigate = function (t) {
  Promise.resolve().then(function () {
    return wd_client.url(APP_URL + '/signup/').getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/signup/',
            "url correct after signup navigate");
    t.end();
  }).catch(t.end);
};

const test_signup = function (t) {
  const form_sel = '#view-content form';
  const make_input_sel = function (input_name) {
    return form_sel + ' input[name="' + input_name + '"]';
  };
  Promise.resolve().then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/signup/',
            "at signup page");
    return wd_client.setValue(make_input_sel('username'), USERNAME);
  }).then(function () {
    return wd_client.setValue(make_input_sel('password'), PASSWORD);
  }).then(function () {
    return wd_client.setValue(
      make_input_sel('password-confirm'), PASSWORD);
  }).then(function () {
    return wd_client.click(form_sel + ' button');
  }).then(dumb_timeout(1000)).then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/home/',
            "redirect home");
    t.end();
  }).catch(t.end);
};

const test_read_none = function (t) {
  Promise.resolve().then(function () {
    return wd_client.click('nav a[href="/contacts/"]');
  }).then(dumb_timeout(500)).then(function () {
    t.pass("clicked contacts nav el");
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/contacts/',
            "nav to correct url");
    return wd_client.getHTML('div#application');
  }).then(function (str_div_application) {
    const div_application = jsdom.jsdom(str_div_application);
    const $ = jquery(div_application.defaultView);
    const el_application = $(div_application);
    const el_h3 = el_application.find('#view-content h3');
    const el_span_none = el_application.find(
      '#view-content span.empty-coll');
    t.ok(el_h3, "got header element");
    t.ok(el_span_none, "got empty span");
    t.equal(el_h3.text(), 'all contacts', "header text");
    t.equal(el_span_none.text(), 'no contacts added', "empty text");
    t.end();
  }).catch(t.end);
};

const crud_tests = function (t) {
  t.test("navigate to /signup/", test_signup_navigate);
  t.test("signup", test_signup);
  t.test("read with no contacts added", test_read_none);
  t.test("create", require('./create')(wd_client, APP_URL));
  t.test("read", require('./read')(wd_client, APP_URL));
  t.test("update", require('./update')(wd_client, APP_URL));
  t.test("delete", require('./delete')(wd_client, APP_URL));
  t.end();
};

const make_tests_main = function (client, dir_client) {
  wd_client = client;
  dir_client_build = dir_client;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", crud_tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

tmp.setGracefulCleanup();

module.exports = exports;
