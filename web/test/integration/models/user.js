/*global require, module */

const _ = require('lodash');

const app = require('../../../core');

const USERNAME = 'bob';
const PASSWORD = 'pass';

var User;

const setup = function (t) {
  t.end();
};

const teardown = function (t) {
  t.end();
};

const test_no_user = function (t) {
  Promise.resolve().then(function () {
    var user = new User();
    return user.fetch();
  }).then(function (fetch_data) {
    t.notOk(fetch_data.username, "username falsy");
    t.end();
  }).catch(t.end);
};

const test_create_invalid_username = function (t) {
  t.end("unimplemented");
};

const test_create_password_mismatch = function (t) {
  t.end("unimplemented");
};

const test_create_username_exists = function (t) {
  t.end("unimplemented");
};

const test_create = function (t) {
  t.skip(test_create_invalid_username, "invalid username");
  t.skip(test_create_password_mismatch, "password mismatch");
  Promise.resolve().then(function () {
    var user = new User({
      username: USERNAME,
      password: PASSWORD,
      password_confirm: PASSWORD
    });
    return user.save();
  }).then(function (save_data) {
    t.equal(save_data.username, USERNAME, "got expected username");
    t.skip(test_create_username_exists, "username exists");
    t.end();
  }).catch(t.end);
};

const test_read = function (t) {
  Promise.resolve().then(function () {
    var user = new User();
    return user.fetch();
  }).then(function (fetch_data) {
    t.equal(fetch_data.username, USERNAME, "got expected username");
    t.end();
  }).catch(t.end);
};

const test_logout = function (t) {
  Promise.resolve().then(function () {
    var user = new User();
    return Promise.all([user, user.fetch({return_model: true})]);
  }).then(_.spread(function (user, fetch_data) {
    t.equal(user.get('username'), USERNAME, "got expected username");
    t.equal(typeof user.logout, 'function',
            "user model has logout function");
    return user.logout();
  })).then(function (logout_res) {
    var user = new User();
    t.ok(true, "user logout return w/o error");
    t.deepEqual(logout_res, {}, "logout resolved with empty object");
    return user.fetch();
  }).then(function (user) {
    t.notOk(user.username, "username falsy");
    t.end();
  }).catch(t.end);
};

const test_login = function (t) {
  Promise.resolve().then(function () {
    var user = new User({
      username: USERNAME,
      password: PASSWORD
    });
    return Promise.all([user, user.save()]);
  }).then(_.spread(function (user, res_login) {
    t.ok(true, "user login returned without error");
    t.ok(user, "user login returned object");
    t.ok(user instanceof User, "object is instance of User model");
    t.equal(res_login.username, USERNAME,
            "expected username from server");
    t.equal(user.get('username'), USERNAME,
            "expected username on model");
    t.end();
  })).catch(t.end);
};

const user_tests = function (t) {
  t.test(test_no_user, "no user created");
  t.test(test_create, "create");
  t.test(test_read, "read");
  t.test(test_logout, "logout");
  t.test(test_login, "login");
  t.test(test_read, "read");
  t.test(test_logout, "logout");
  t.end();
};

const make_tests_main = function (_User) {
  User = _User;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", user_tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

module.exports = exports;
