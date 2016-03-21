/*global require, module */

var Bb = require ('backbone');
var Mn = require('backbone.marionette');

var _ = require('lodash');

var NavView = require('./nav');
var HomeView = require('./home');
var ContactsView = require('./contacts');
var AddContactView = require('./add_contact');
var DetailView = require('./detail');
var SignupView = require('./signup');
var LoginView = require('./login');

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
    if (!this.getOption('contacts')) {
      throw new Error("missing 'contacts' option");
    }
  },

  childEvents: {
    'show:home': 'onShowHome',
    'show:contacts': 'onShowContacts',
    'show:addContact': 'onShowAddContact',
    'show:detail': 'onShowDetail',
    'show:signup': 'onShowSignup',
    'show:login': 'onShowLogin'
  },

  onShow: function () {
    var nav_view = new NavView({
      model: this.getOption('user')
    });
    this.showChildView('nav', nav_view);
  },

  onShowHome: function () {
    var home_view = new HomeView();
    this.showChildView('content', home_view);
    Bb.history.navigate('home/');
  },

  onShowContacts: function () {
    var contacts_view = new ContactsView({
      contacts: this.getOption('contacts')
    });
    this.showChildView('content', contacts_view);
    Bb.history.navigate('contacts/');
  },

  onShowAddContact: function () {
    var add_contacts_view = new AddContactView({
      collection: this.getOption('contacts')
    });
    this.showChildView('content', add_contacts_view);
    Bb.history.navigate('add/');
  },

  onShowDetail: function (child_view, contact_or_id) {
    var contacts = this.getOption('contacts');
    var contact;
    if (child_view) {
      contact = contact_or_id;
    } else {
      contact = contacts.get(contact_or_id);
    }
    var detail_view = new DetailView({
      model: contact
    });
    this.showChildView('content', detail_view);
    Bb.history.navigate('contacts/' + contact.id + '/');
  },

  onShowSignup: function () {
    var signup_view = new SignupView({
      model: this.getOption('user')
    });
    // abbreviation for `this.getRegion('content').show(signup_view)`
    this.showChildView('content', signup_view);
    Bb.history.navigate('signup/');
  },

  onShowLogin: function () {
    var login_view = new LoginView({
      model: this.getOption('user')
    });
    this.showChildView('content', login_view);
    Bb.history.navigate('login/');
  }

});

module.exports = MainView;
