/*global require, module */

var Bb = require('backbone');
var Mn = require('backbone.marionette');


var LoginView = Mn.LayoutView.extend({
  template: require('../templates/login.html'),
  tagName: 'div',

  regions: {

  },

  ui: {
    signup: '.signup'
  },

  triggers: {
    'click @ui.signup': 'show:signup'
  },

  onShow: function () {
    console.log("login view onShow");
  }
});

module.exports = LoginView;
