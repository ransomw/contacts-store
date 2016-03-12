/*global require, module */

var Bb = require('backbone');
var Mn = require('backbone.marionette');


var NavView = Mn.LayoutView.extend({
  template: require('../templates/nav_logged_in.html'),
  template_logged_out: require('../templates/nav_logged_out.html'),
  tagName: 'nav',

  ui: {
    a_home: 'a[href="/home/"]',
    a_logout: 'a[href="/logout/"]',
    a_login: 'a[href="/login/"]'
  },

  triggers: {
    'click @ui.a_home': 'show:home',
    'click @ui.a_logout': 'logout',
    'click @ui.a_login': 'show:login'
  },

  getTemplate: function () {
    var user = this.model;
    var username = user.get('username');
    console.log("in NavView.getTemplate: username");
    console.log(username);
    if (username) {
      return this.getOption('template');
    }
    return this.getOption('template_logged_out');
  },

  modelEvents: {
    'change': 'userChange'
  },

  userChange: function () {
    console.log("top of NavView.userChange");
    // this.triggerMethod('render');
    this.render();
  },

  onLogout: function () {
    var view = this;
    var user = this.model;
    user.logout().then(function () {
      view.triggerMethod('show:login');
    });
  },

  onShow: function () {
    console.log("nav view onShow");
  }
});

module.exports = NavView;
