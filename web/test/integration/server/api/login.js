/*global require, module */

const _ = require('lodash');
const nets = require('nets');

const USERNAME = 'alice';
const PASSWORD = 'pass';

var API_URL;

const setup = function (t) {
  t.end();
};

const teardown = function (t) {
  t.end();
};

const _get_secret = function () {
  return new Promise(function (resolve, reject) {
    nets({
      url: API_URL + '/secret',
      jar: true,
      json: true,
      encoding: undefined
    }, function(err, resp, body) {
      if (err) {
        reject(err);
      } else {
        resolve([resp, body]);
      }
    });
  });
};

const test_logged_out = function (t) {
  _get_secret().then(_.spread(function (resp, body) {
    t.equal(resp.statusCode, 401, "gives 401 status code");
    t.notOk(body.secret, "secret not in response body");
    t.end();
  })).catch(t.end);
};

const test_logged_in = function (t) {
  _get_secret().then(_.spread(function (resp, body) {
    t.equal(resp.statusCode, 200, "gives 200 status code");
    t.equal(body.some_secret, "sssh!", "secret in response body");
    t.end();
  })).catch(t.end);
};

const test_bad_pass = function (t) {
  nets({
    url: API_URL + '/login',
    method: 'POST',
    json: {
      username: USERNAME,
      password: PASSWORD + 'asdf'
    },
    encoding: undefined
  }, function(err, resp, body) {
    t.notOk(err, "request without error");
    t.equal(resp.statusCode, 401, "login endpoint returns 401");
    t.end();
  });
};

const test_post = function (t) {
  nets({
    url: API_URL + '/login',
    method: 'POST',
    jar: true,
    json: {
      username: USERNAME,
      password: PASSWORD
    },
    encoding: undefined
  }, function(err, resp, body) {
    t.notOk(err, "request without error");
    t.equal(resp.statusCode, 200, "login endpoint returns 200");
    t.end();
  });
};

const tests = function (t) {
  t.test("logged out test (first pass)", test_logged_out);
  t.test("logged out test (second pass)", test_logged_out);
  t.test("post username bad pass", test_bad_pass);
  t.test("post username pass", test_post);
  t.test("logged in test", test_logged_in);
  t.end();
};

const make_tests_main = function (api_url) {
  API_URL = api_url;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

module.exports = exports;
