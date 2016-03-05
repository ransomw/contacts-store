/*global require, module */

var base = require('./base');

var Contact = base.Model.extend({

});

var make_contacts = function (url_base) {
  var Contacts = base.Collection.extend({
    model: Contact,

    url: function () {
      return url_base + '/contacts';
    }
  });

  return Contacts;
};

var exports = make_contacts;

module.exports = exports;
