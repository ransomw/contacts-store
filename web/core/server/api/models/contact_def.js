/*global require, module */

const _ = require('lodash');

const base = require('./base_def');

const contact = {
  extends: base,
  instance: {
    tableName: 'contacts',
    serialize: function () {
      return _.pick(this.Parent.prototype.serialize.apply(
        this, arguments),
                    ['name', 'email', 'phone']);
    }
  },
  static: {}
};

var exports = contact;

module.exports = exports;
