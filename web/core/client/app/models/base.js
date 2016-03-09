/*global require, module */

var nets = require('nets');
var Bb = require('backbone');

function AjaxError(message, status_code) {
  this.name = 'AjaxError';
  this.message = message || 'Backbone.ajax error';
  this.status_code = status_code;
  this.stack = (new Error()).stack;
}
AjaxError.prototype = Object.create(Error.prototype);
AjaxError.prototype.constructor = AjaxError;

Bb.ajax = function (settings) {
  var success = settings.success || function (data, textStatus, xhr) { };
  var error = settings.error ||
        function (xhr, textStatus, errorThrown) { };
  var beforeSend = settings.beforeSend || function (xhr) { };
  var method = settings.type || 'GET';
  var url = settings.url;
  var json;

  if (settings.data) {
    json = JSON.parse(settings.data);
  } else {
    json = true;
  }

  if (!url) {
    throw new Error("missing url in backbone custom ajax function");
  }

  return new Promise(function (resolve, reject) {
    nets({
      url: url,
      method: method,
      jar: true,
      json: json,
      encoding: undefined
    }, function(nets_err, resp, body) {
      var ajax_err;
      var xhr_placeholder = {xhr_placeholder: true};
      if (nets_err) {
        error(xhr_placeholder, null, nets_err);
        reject(nets_err);
      } else if (resp.statusCode === 200) {
        success(body, null, xhr_placeholder);
        resolve(body);
      } else {
        ajax_err = new AjaxError(undefined, resp.statusCode);
        error(xhr_placeholder, null, ajax_err);
        reject(ajax_err);
      }
    });
  });
};

var Model = Bb.Model.extend({
  idAttribute: 'id'
});

var Collection = Bb.Collection.extend({});

var exports = {};

exports.Model = Model;
exports.Collection = Collection;

module.exports = exports;
