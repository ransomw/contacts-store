/*global require, module */

var Mn = require('backbone.marionette');

var MainView = require('./views/main');


var Controller = Mn.Object.extend({
  initialize: function () {
    var main_view = new MainView();
    main_view.render();
    this.options.main_view = main_view;
  },

  home: function () {
    var main_view = this.getOption('main_view');
    main_view.triggerMethod('show:home');
  },

  detail: function () {
    var main_view = this.getOption('main_view');
    main_view.triggerMethod('show:detail');
  }
});

var Router = Mn.AppRouter.extend({
  controller: new Controller(),
  appRoutes: {
    'home/': 'home',
    'detail/': 'detail'
  }
});

module.exports = Router;
