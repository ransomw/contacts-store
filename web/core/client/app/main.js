/*global require, __dirname */

var path = require('path');

// todo: move marionette setup to seperate file as per gitbook

window._ = require('underscore');
// ensure backbone is loaded before marionette
var Bb = require('backbone');
var Mn = require('backbone.marionette');

// todo: pass template id rather than string template as first arg
Mn.TemplateCache.prototype.loadTemplate = function (str_t, options){
  return str_t;
};

var Router = require('./router');
var User = require('./models')('/api').User;

var Application = Mn.Application.extend({
  onStart: function (opt_args) {
    var router = new Router({});
    var curr_route;
    var user = new User();
    Bb.history.start({pushState: true});
    curr_route = Bb.history.getFragment();

    console.log("curr_route");
    console.log("'" + curr_route + "'");

    /*
    console.log("getting user information");
    user.fetch();
     */

    if (curr_route === '' ) {
      // trigger option equivalent to calling .loadUrl after .navigate
      router.navigate('login/', {trigger: true});
    }
  }
});

var app = new Application({});

app.start();
