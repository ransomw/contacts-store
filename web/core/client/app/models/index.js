/*global require, module */

var exports = function (url_base) {
  var User = require('./user')(url_base);
  var Contacts = require('./contacts')(url_base);

  return {
    User: User,
    Contacts: Contacts
  };
};

module.exports = exports;
