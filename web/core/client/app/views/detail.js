/*global require, module */

var Bb = require('backbone');
var Mn = require('backbone.marionette');


var DetailView = Mn.LayoutView.extend({
  template: require('../templates/detail.html'),
  tagName: 'div',

  regions: {

  },

  onShow: function () {
    console.log("detail view onShow");
  }
});

module.exports = DetailView;
