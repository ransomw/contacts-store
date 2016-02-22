/*global require, module */

var Bb = require('backbone');
var Mn = require('backbone.marionette');


var HomeView = Mn.LayoutView.extend({
  template: require('../templates/home.html'),
  tagName: 'div',

  regions: {

  },

  onShow: function () {
    console.log("home view onShow");
  }
});

module.exports = HomeView;
