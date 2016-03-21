/*global require, module */

var Mn = require('backbone.marionette');

var _ = require('lodash');

var MainView = require('./views/main');

var Controller = Mn.Object.extend({
  initialize: function () {
    var main_view = new MainView({
      user: this.getOption('user'),
      contacts: this.getOption('contacts')
    });
    main_view.render();
    // call onShow directly since there's no region manager
    main_view.onShow();
    this.options.main_view = main_view;
  },

  home: function () {
    var main_view = this.getOption('main_view');
    main_view.triggerMethod('show:home');
  },

  contacts: function () {
    var main_view = this.getOption('main_view');
    main_view.triggerMethod('show:contacts');
  },

  addContact: function () {
    var main_view = this.getOption('main_view');
    main_view.triggerMethod('show:addContact');
  },

  detail: function (str_contact_id) {
    var main_view = this.getOption('main_view');
    main_view.triggerMethod('show:detail',
                            null, parseInt(str_contact_id));
  },

  signup: function () {
    var main_view = this.getOption('main_view');
    main_view.triggerMethod('show:signup');
  },

  login: function () {
    var main_view = this.getOption('main_view');
    main_view.triggerMethod('show:login');
  }
});

var routes_login_req = [
  'home/',
  'detail/'
];

var Router = Mn.AppRouter.extend({

  constructor: function (options) {
    var opts = options || {};
    var controller = new Controller({
      user: opts.user,
      contacts: opts.contacts
    });
    Mn.AppRouter.prototype.constructor.call(
      this,
      // don't expose controller outside of the module, and
      // delay Controller.initialize (hence MainView.render)
      // until new Router()
      _.merge(options, {
        controller: controller
      })
    );
    if (!this.getOption('user')) {
      // req by route function
      throw new Error("missing 'user' option");
    }
  },

  route: function (route, name, callback) {
    var router = this;
    var user = this.getOption('user');
    // middleware-like
    var mw_callback = function () {
      if (routes_login_req.indexOf(route) !== -1 &&
          !user.get('username')) {
        router.navigate('login/', {trigger: true});
      } else {
        callback.apply(router, arguments);
      }
    };
    Mn.AppRouter.prototype.route.call(this, route, name, mw_callback);
  },

  appRoutes: {
    'home/': 'home',
    'contacts/:id/': 'detail',
    'contacts/': 'contacts',
    'add/': 'addContact',
    'signup/': 'signup',
    'login/': 'login'
  }
});

module.exports = Router;
