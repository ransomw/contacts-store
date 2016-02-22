/*global require, module */

var Bb = require ('backbone');
var Mn = require('backbone.marionette');

var HomeView = require('./home');
// var DetailView = require('./detail');


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


  onShowHome: function () {
    var home_view = new HomeView();
    // abbreviation for
    // `this.getRegion('home').show(home_view)`
    this.showChildView('content', home_view);
    /* todo: duplicate string */
    Bb.history.navigate('home/');
  },

  onShowDetail: function () {
    var detail_view = new DetailView({model: undefined});
    this.showChildView('content', detail_view);
    /* todo: duplicate string */
    Bb.history.navigate('detail/');
  }

});

module.exports = MainView;
