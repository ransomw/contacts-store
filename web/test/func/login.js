/*global require, module, process */

var fs = require('fs');
var url = require('url');

const _ = require('lodash');
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
var tmp_file_sqlite;
var cb_close_db;

const setup = function (t) {
  tmp_file_sqlite = tmp.fileSync();
  Promise.resolve().then(function () {
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

const test_login_page_els = function (t) {
  Promise.resolve().then(function () {
    return wd_client.getHTML('div#application');
  }).then(function (str_div_application) {
    const div_application = jsdom.jsdom(str_div_application);
    const $ = jquery(div_application.defaultView);
    const el_application = $(div_application);
    const el_h3 = el_application.find('#view-content h3');
    const el_form = el_application.find('#view-content form');
    const el_a_signup = el_application.find('#view-content a');
    const el_form_button = el_form.find('button');
    t.equal(el_h3.text(), 'login', "header text");
    t.equal(el_form.length, 1, "found form");
    t.deepEqual(
      el_form.find('div').toArray().map(function (div_form_field) {
        const el_form_div = $(div_form_field);
        return {
          label: el_form_div.find('label').text(),
          input_type: el_form_div.find('input').attr('type')
        };
      }), [{
        label: 'username',
        input_type: 'text'
      }, {
        label: 'password',
        input_type: 'password'
      }],
      "correct form inputs");
    t.equal(el_form_button.text(), 'login', "button text");
    t.equal(el_a_signup.text(), 'signup', "signup link text");
    t.end();
  }).catch(t.end);
};

const test_signup_page_els = function (t) {
  Promise.resolve().then(function () {
    return wd_client.getHTML('div#application');
  }).then(function (str_div_application) {
    const div_application = jsdom.jsdom(str_div_application);
    const $ = jquery(div_application.defaultView);
    const el_application = $(div_application);
    const el_h3 = el_application.find('#view-content h3');
    const el_form = el_application.find('#view-content form');
    const el_form_button = el_form.find('button');
    t.equal(el_h3.text(), 'signup', "header text");
    t.equal(el_form.length, 1, "found form");
    t.deepEqual(
      el_form.find('div').toArray().map(function (div_form_field) {
        const el_form_div = $(div_form_field);
        return {
          label: el_form_div.find('label').text(),
          input_type: el_form_div.find('input').attr('type')
        };
      }), [{
        label: 'username',
        input_type: 'text'
      }, {
        label: 'password',
        input_type: 'password'
      }, {
        label: 'confirm password',
        input_type: 'password'
      }],
      "correct form inputs");
    t.equal(el_form_button.text(), 'signup', "button text");
    t.end();
  }).catch(t.end);
};

const test_login_redirect = function (t) {
  Promise.resolve().then(function () {
    return wd_client.url(APP_URL).getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/login/',
            "root url redirects to login");
    t.test("login page elements after redirect", test_login_page_els);
    t.end();
  }).catch(t.end);
};

const test_login_navigate = function (t) {
  Promise.resolve().then(function () {
    return wd_client.url(APP_URL + '/login/').getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/login/',
            "url correct after navigate to login");
    t.test("login page elements after navigate", test_login_page_els);
    t.end();
  }).catch(t.end);
};

const test_signup_click = function (t) {
  Promise.resolve().then(function () {
    return wd_client.url(APP_URL + '/login/').getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/login/',
            "url correct after navigate to login");
    return wd_client.click('div#application #view-content a').getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/signup/',
            "url correct after signup click");
    t.test("signup page elements after click", test_signup_page_els);
  });
};

const test_signup_navigate = function (t) {
  Promise.resolve().then(function () {
    return wd_client.url(APP_URL + '/signup/').getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/signup/',
            "url correct after signup navigate");
    t.test("signup page elements after navigate", test_signup_page_els);
  });
};

const login_tests = function (t) {
  t.test("redirect from root", test_login_redirect);
  t.test("navigate to /login/", test_login_navigate);
  t.test("click signup", test_signup_click);
  t.test("navigate to /signup/", test_signup_navigate);
  t.end();
};

const make_tests_main = function (client, dir_client) {
  wd_client = client;
  dir_client_build = dir_client;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", login_tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

tmp.setGracefulCleanup();

module.exports = exports;
