/*global require, module */

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
  }).then(function (user) {
    t.notOk(user.username, "username falsy");
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
  }).then(function (user) {
    t.equal(user.username, USERNAME, "got expected username");
    t.skip(test_create_username_exists, "username exists");
    t.end();
  }).catch(t.end);
};

const test_read = function (t) {
  Promise.resolve().then(function () {
    var user = new User();
    return user.fetch();
  }).then(function (user) {
    t.equal(user.username, USERNAME, "got expected username");
    t.end();
  }).catch(t.end);
};

const user_tests = function (t) {
  t.test(test_no_user, "no user created");
  t.test(test_create, "create");
  t.test(test_read, "read");
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
