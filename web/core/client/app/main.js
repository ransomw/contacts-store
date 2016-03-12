/*global require, __dirname */

console.log("top of client main");

/// Mn setup
// todo: move marionette setup to seperate file as per gitbook

window._ = require('underscore');
// ensure backbone is loaded before marionette
var Bb = require('backbone');
var Mn = require('backbone.marionette');

// todo: pass template id rather than string template as first arg
Mn.TemplateCache.prototype.loadTemplate = function (str_t, options){
  return str_t;
};

/// polyfills

var _es6_promise = require('es6-promise');

if (!Promise) {
  _es6_promise.polyfill();
}

//////////////

var _ = require('lodash');

var Router = require('./router');
var User = require('./models')('/api').User;

var Application = Mn.Application.extend({
  onStart: function (opt_args) {

    console.log("Mn app onStart");

    var opts = opt_args || {};
    if (!opts.user) {
      throw new Error("missing user object");
    }
    var router = new Router({user: opts.user});
    var curr_route; // debug
    Bb.history.start({pushState: true});
    curr_route = Bb.history.getFragment();

    console.log("curr_route");
    console.log("'" + curr_route + "'");

    if (curr_route === '' ) {
      // trigger option equivalent to calling .loadUrl after .navigate
      router.navigate('login/', {trigger: true});
    }
  }
});

var app = new Application({});

console.log("starting frontend...");

Promise.resolve().then(function () {
  var user = new User(); // singleton (consider enforcing w/ opt arg)
  console.log("getting user information");
  return Promise.all([user, user.fetch()]);
}).then(_.spread(function (user, res_fetch) {
  console.log("fetched user information");
  console.log(user);
  app.start({user: user});
})).catch(function (err) {
  console.log("startup error");
  console.log(err);
});
