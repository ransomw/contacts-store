/*global require, module */

var nets = require('nets');
var Bb = require('backbone');


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
    }, function(err, resp, body) {
      var xhr_placeholder = {xhr_placeholder: true};
      if (err) {
        error(xhr_placeholder, null, err);
        reject(err);
      } else {
        success(body, null, xhr_placeholder);
        resolve(body);
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
