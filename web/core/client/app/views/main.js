/*global require, module */

var Bb = require ('backbone');
var Mn = require('backbone.marionette');

var SignupView = require('./signup');
var LoginView = require('./login');
var HomeView = require('./home');
var DetailView = require('./detail');


var MainView = Mn.LayoutView.extend({
  el: '#application',
  template: require('../templates/main.html'),

  regions: {
    content: '#view-content'
  },

  ui: {
    // todo: replace class with url selector
    a_home: 'nav .home a'
  },

  triggers: {
    'click @ui.a_home': 'show:home'
  },

  childEvents: {
    'show:signup': 'onShowSignup'
  },

  onShowSignup: function () {
    var signup_view = new SignupView();
    // abbreviation for `this.getRegion('content').show(signup_view)`
    this.showChildView('content', signup_view);
    Bb.history.navigate('signup/');
  },

  onShowLogin: function () {
    var login_view = new LoginView();
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
