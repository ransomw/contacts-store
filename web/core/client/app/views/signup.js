/*global require, module */

var Bb = require('backbone');
var Mn = require('backbone.marionette');


var SignupView = Mn.LayoutView.extend({
  template: require('../templates/signup.html'),
  tagName: 'div',

  regions: {

  },

  onShow: function () {
    console.log("signup view onShow");
  }
});

module.exports = SignupView;
