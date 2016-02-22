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

var Application = Mn.Application.extend({
  onStart: function (opt_args) {
    var router = new Router({});
    Bb.history.start({pushState: true});
    // Bb.history.loadUrl('search/');
  }
});

var app = new Application({});

app.start();
