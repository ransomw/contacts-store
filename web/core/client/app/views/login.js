/*global require, module */

var Bb = require('backbone');
var Mn = require('backbone.marionette');


var LoginFormBehavior = Mn.Behavior.extend({
  ui: {
    form_login: 'form',
    input_username: 'form input[name="username"]',
    input_password: 'form input[name="password"]'
  },

  events: {
    'submit @ui.form_login': 'do_login'
  },

  do_login: function () {
    var user_data = this.get_user_data();
    this.view.model.save(user_data, {wait: true});
    console.log("login called save on user model");
  },

  get_user_data: function () {
    return {
      username: this.ui.input_username[0].value.trim(),
      password: this.ui.input_password[0].value.trim()
    };
  }
});


var LoginView = Mn.LayoutView.extend({
  template: require('../templates/login.html'),
  template_loading: require('../templates/loading.html'),
  tagName: 'div',

  regions: {

  },

  behaviors: {
    form: {
      behaviorClass: LoginFormBehavior
    }
  },

  modelEvents: {
    // immediately after model.save()
    'change': 'loggingIn',
    // after server-side return
    'sync': 'loggedIn'
  },

  ui: {
    signup: 'a.signup'
  },

  triggers: {
    'click @ui.signup': 'show:signup'
  },

  getTemplate: function () {
    if (this.loading) {
      return this.getOption('template_loading');
    }
    return this.getOption('template');
  },

  loggingIn: function () {
    this.loading = true;
    this.render();
  },

  loggedIn: function () {
    this.loading = false;
    this.triggerMethod('show:home');
  },

  onShow: function () {
    console.log("login view onShow");
  }
});

module.exports = LoginView;
