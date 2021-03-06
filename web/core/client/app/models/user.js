/*global require, module */

var base = require('./base');

var make_user = function (url_base) {
  var User = base.Model.extend({
    url: function () {
      return url_base + '/user';
    },
    logout: function () {
      return base.Model.prototype.save.call(this, {
        logout: true
      });
    }
  });

  return User;
};

var exports = make_user;

module.exports = exports;
