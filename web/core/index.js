/*global require, module
 */

const server = require('./server');
const client = require('./client');

const run_server = function (port, client_build_dir) {
  const app = server.make_app(client_build_dir);
  return new Promise(function (resolve, reject) {
    const server = app.listen(port, function () {
      resolve(server);
    });
    server.on('error', function (err) {
      reject(err);
    });
  });
};

var exports = {};

exports.build_client = client.build_client;
exports.run_server = run_server;

module.exports = exports;
