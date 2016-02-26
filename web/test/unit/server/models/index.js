/*global require, module */

var fs = require('fs');

const tmp = require('tmp');

const models = require(
  '../../../../core/server/api/models');
const MyBookshelf = models.MyBookshelf;

// MyBookshelf instance
var my_bookshelf;
// 'tmp' module file object.  has attributes:
// * name: path string
// * fd: file descriptor int
// * removeCallback: function
var tmp_file_sqlite;

const setup = function (t) {
  tmp_file_sqlite = tmp.fileSync();
  my_bookshelf = new MyBookshelf(tmp_file_sqlite.name);
  Promise.resolve().then(function () {
    return my_bookshelf.init_db();
  }).then(function () {
    t.end();
  }).catch(t.error);
};

const teardown = function (t) {
  Promise.resolve().then(function () {
    return my_bookshelf.destroy();
  }).then(function () {
    fs.closeSync(tmp_file_sqlite.fd);
    fs.unlinkSync(tmp_file_sqlite.name);
    t.end();
  }).catch(t.error);
};

const tests = function (t) {
  const models = my_bookshelf.models;
  if (!models) {
    t.error("my_bookshelf.models not defined");
  }
  t.test("User", require('./user')(models.User));
  t.test("Contact", require('./contact')(models.User, models.Contact));
  // t.test("Contact", require('./contact')(models.Contact));
  t.end();
};

const tests_main = function (t) {
  t.test("setup", setup);
  t.test("tests", tests);
  t.test("teardown", teardown);
  t.end();
};

tmp.setGracefulCleanup();

var exports = tests_main;

module.exports = exports;
