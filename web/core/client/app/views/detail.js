/*global require, module */

var Bb = require('backbone');
var Mn = require('backbone.marionette');

var ContactDetailView = Mn.LayoutView.extend({
  template: require('../templates/detail.html'),
  tagName: 'div',

  templateHelpers: {
    formatPhone: function (phone) {
      return phone.replace(
          /^(\d{3}) (\d{3}) (\d{4})$/,
        '($1) $2-$3');
    }
  },

  onShow: function () {
    console.log("contact detail on show");
  }
});

module.exports = ContactDetailView;
