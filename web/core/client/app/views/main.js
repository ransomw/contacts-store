/*global require, module */

var Bb = require ('backbone');
var Mn = require('backbone.marionette');

var NavView = require('./nav');
var SignupView = require('./signup');
var LoginView = require('./login');
var HomeView = require('./home');
var DetailView = require('./detail');

var MainView = Mn.LayoutView.extend({
  el: '#application',
  template: require('../templates/main.html'),

  regions: {
    nav: '#view-nav',
    content: '#view-content'
  },

  constructor: function (options) {
    Mn.LayoutView.prototype.constructor.call(this, options);
    if (!this.getOption('user')) {
      throw new Error("missing 'user' option");
    }
  },

  childEvents: {
    'show:signup': 'onShowSignup',
    'show:login': 'onShowLogin',
    'show:home': 'onShowHome'
  },

  onShow: function () {
    var nav_view = new NavView({model: this.getOption('user')});
    this.showChildView('nav', nav_view);
  },

  onShowSignup: function () {
    var signup_view = new SignupView({model: this.getOption('user')});
    // abbreviation for `this.getRegion('content').show(signup_view)`
    this.showChildView('content', signup_view);
    Bb.history.navigate('signup/');
  },

  onShowLogin: function () {
    var login_view = new LoginView({model: this.getOption('user')});
    this.showChildView('content', login_view);
    Bb.history.navigate('login/');
  },

  onShowHome: function () {
    var home_view = new HomeView();
    this.showChildView('content', home_view);
    Bb.history.navigate('home/');
  },

  onShowDetail: function () {
    var detail_view = new DetailView({model: undefined});
    this.showChildView('content', detail_view);
    Bb.history.navigate('detail/');
  }

});

module.exports = MainView;
