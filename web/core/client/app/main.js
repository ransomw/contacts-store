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

var User = require('./browser_models').User;
var Contacts = require('./browser_models').Contacts;

var Application = Mn.Application.extend({
  onStart: function (opt_args) {

    console.log("Mn app onStart");

    var opts = opt_args || {};
    if (!opts.user) {
      throw new Error("missing user object");
    }
    if (!opts.contacts) {
      throw new Error("missing contacts object");
    }
    var router = new Router({
      user: opts.user,
      contacts: opts.contacts
    });
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
  return Promise.all([user, user.fetch()]);
}).then(_.spread(function (user) {
  var contacts = new Contacts();
  var promise_fetch_contacts = undefined;
  if (user.get('username')) {
    promise_fetch_contacts = contacts.fetch();
  }
  return Promise.all([user, contacts, promise_fetch_contacts]);
})).then(_.spread(function (user, contacts) {
  app.start({
    user: user,
    contacts: contacts
  });
})).catch(function (err) {
  console.log("startup error");
  console.log(err);
});
