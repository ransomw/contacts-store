/*global require, module, __dirname
 */

const server = require('./server');
const client = require('./client');

const run_server = function (port, client_build_dir, sqlite_path) {
  const app = server.make_app(client_build_dir, sqlite_path);
  return new Promise(function (resolve, reject) {
    const server = app.listen(port, function () {
      resolve({server: server, close_db: app.close_db});
    });
    server.on('error', function (err) {
      reject(err);
    });
  });
};

const init_db = function (sqlite_path) {
  // choice __dirname is indicental:  any path will do
  const app = server.make_app(__dirname, sqlite_path);
  return Promise.resolve().then(function () {
    return app.init_db();
  }).then(function () {
    return app.close_db();
  });
};

var exports = {};

exports.build_client = client.build_client;
exports.run_server = run_server;
exports.init_db = init_db;

module.exports = exports;
