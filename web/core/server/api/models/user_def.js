/*global require, module */

const _ = require('lodash');

const base = require('./base_def');

const user = {
  extends: base,
  instance: {
    tableName: 'users',

    // todo: salt password ...
    //       but maybe in another function or an event handler?
    //       in any case, encryption ought happen here, not routes

    /*
     set: function(key, val, options) {
      var password;
      var opts;
      this.Parent.prototype.set.apply(this, arguments);
      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key === 'password') {
        password = val;
        opts = options;
      }
      if (typeof key === 'object') {
        password = key.password;
        opts = val;
      }
      if (password) {
      }
      return this;
    },
     */

    serialize: function () {
      return _.pick(this.Parent.prototype.serialize.apply(
        this, arguments),
                    ['username']);
    },

    check_pass: function (password) {
      return password === this.get('password');
    }

  },

  static: {}
};

var exports = user;

module.exports = exports;
