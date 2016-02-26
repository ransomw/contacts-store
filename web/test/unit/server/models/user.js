/*global require, module */

var User;

var user_id;

const USERNAME = 'alice';
const PASSWORD = 'pass';

const setup = function (t) {
  t.end();
};

const teardown = function (t) {
  t.end();
};

const test_create = function (t) {
  const user = new User({
    username: USERNAME,
    password: PASSWORD
  });
  Promise.resolve().then(function () {
    return user.save();
  }).then(function (new_user) {
    if (!new_user) {
      t.end();
      t.error("new user promise save didn't return user model");
    }
    t.equal(typeof new_user.id, 'number',
            "new user model has id attr");
    user_id = new_user.id;
    t.end();
  }).catch(t.error);
};

const test_read_username = function (t) {
  if (typeof User.where !== 'function') {
    t.error("User model missing 'where' function");
    t.end();
  }
  Promise.resolve().then(function () {
    return User.where({username: USERNAME}).fetch();
  }).then(function (user) {
    if (!user) {
      t.error("couldn't find user model");
      t.end();
      return;
    }
    if (typeof user.check_pass !== 'function') {
      t.error("user model instance missing 'check_pass' function");
      t.end();
      return;
    }
    t.ok(user.check_pass(PASSWORD), "user password checks out");
    t.deepEqual(user.serialize(), {
      username: USERNAME
    }, "user.serialize() contains exactly desired information");
    t.end();
  }).catch(t.error);
};

const test_read_id = function (t) {
  if (typeof User.where !== 'function') {
    t.error("User model missing 'where' function");
    t.end();
  }
  Promise.resolve().then(function () {
    return User.where({id: user_id}).fetch();
  }).then(function (user) {
    if (!user) {
      t.error("couldn't find user model");
      t.end();
      return;
    }
    if (typeof user.check_pass !== 'function') {
      t.error("user model instance missing 'check_pass' function");
      t.end();
      return;
    }
    t.ok(user.check_pass(PASSWORD), "user password checks out");
    t.deepEqual(user.serialize(), {
      username: USERNAME
    }, "user.serialize() contains exactly desired information");
    t.end();
  }).catch(t.error);
};

const test_delete = function (t) {
  if (typeof User.where !== 'function') {
    t.error("User model missing 'where' function");
    t.end();
    return;
  }
  Promise.resolve().then(function () {
    return User.where({username: USERNAME}).fetch();
  }).then(function (user) {
    if (!user) {
      t.error("couldn't find user model");
      t.end();
      return undefined;
    }
    if (typeof user.destroy !== 'function') {
      t.error("user model instance missing 'destroy' function");
      t.end();
      return undefined;
    }
    return user.destroy();
  }).then(function () {
    return User.where({username: USERNAME}).fetch();
  }).then(function (user) {
    t.equal(user, null, "user delete successful");
    t.end();
  }).catch(t.error);
};

const tests = function (t) {
  if (!User) {
    t.error("User model undefined");
    t.end();
  }
  t.test("create", test_create);
  t.test("read by username", test_read_username);
  t.test("read by id", test_read_id);
  t.test("delete", test_delete);
  t.end();
};

const make_tests_main = function (UserModel) {
  User = UserModel;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

module.exports = exports;
