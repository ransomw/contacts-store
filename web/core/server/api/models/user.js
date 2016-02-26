/*global require, module */

const base = require('./base');

const make_model = function (my_bookshelf) {
  const Base = base.make_model(my_bookshelf);
  return Base.extend({
    instance: {
      tableName: 'users'
    },
    static: {}
  });
};

var exports = {};

exports.make_model = make_model;

module.exports = exports;
