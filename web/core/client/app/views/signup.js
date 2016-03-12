/*global require, module */

var Bb = require('backbone');
var Mn = require('backbone.marionette');

var SignupFormBehavior = Mn.Behavior.extend({
  ui: {
    form_signup: 'form',
    input_username: 'form input[name="username"]',
    input_password: 'form input[name="password"]',
    input_password_confirm: 'form input[name="password-confirm"]'
  },

  events: {
    'submit @ui.form_signup': 'do_signup'
  },

  do_signup: function () {
    var user_data = this.get_user_data();
    this.view.model.save(user_data, {wait: true});
    console.log("signup called save on user model");
  },

  get_user_data: function () {
    return {
      username: this.ui.input_username[0].value.trim(),
      password: this.ui.input_password[0].value.trim(),
      password_confirm: this.ui.input_password_confirm[0].value.trim()
    };
  }
});


var SignupView = Mn.LayoutView.extend({
  template: require('../templates/signup.html'),
  template_loading: require('../templates/loading.html'),
  tagName: 'div',

  regions: {

  },

  behaviors: {
    form: {
      behaviorClass: SignupFormBehavior
    }
  },

  modelEvents: {
    // immediately after model.save()
    'change': 'signingUp',
    // after server-side return
    'sync': 'signedUp'
  },

  getTemplate: function () {
    if (this.loading) {
      return this.getOption('template_loading');
    }
    return this.getOption('template');
  },

  signingUp: function () {
    this.loading = true;
    this.render();
  },

  signedUp: function () {
    this.loading = false;
    this.triggerMethod('show:home');
  },

  onShow: function () {
    console.log("signup view onShow");
  }
});

module.exports = SignupView;
