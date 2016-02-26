/*global require, module */

const make_model = function (my_bookshelf) {
  return my_bookshelf.Model.extend({
    idAttribute: 'id'
  });
};

var exports = {};

exports.make_model = make_model;

module.exports = exports;
