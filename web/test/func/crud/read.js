/*global require, module, setTimeout */

var url = require('url');


const _ = require('lodash');
const jsdom = require('jsdom');
const jquery = require('jquery');

const app = require('../../../core');

var wd_client;

const NAME = 'bob';
const EMAIL = 'b@b.com';
const PHONE_HREF = '555 555 5555';
const PHONE_FORMATTED = '(555) 555-5555';

var app_url;
var url_path_item;

const dumb_timeout = function (ms_dur) {
  return function () {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, ms_dur);
    });
  };
};

const setup = function (t) {
  t.end();
};

const teardown = function (t) {
  t.end();
};

const test_list_navigate = function (t) {
  Promise.resolve().then(function () {
    return wd_client.click('nav a[href="/contacts/"]');
  }).then(dumb_timeout(500)).then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/contacts/', "correct url");
    t.end();
  }).catch(t.end);
};

const test_list_resolve = function (t) {
  Promise.resolve().then(function () {
    return wd_client.url(app_url + '/contacts/');
  }).then(dumb_timeout(500)).then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/contacts/', "correct url");
    t.end();
  }).catch(t.end);
};

const test_list_els = function (t) {
  Promise.resolve().then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/contacts/', "correct url");
  }).then(dumb_timeout(500)).then(function () {
    return wd_client.getHTML('div#application');
  }).then(function (str_div_application) {
    const div_application = jsdom.jsdom(str_div_application);
    const $ = jquery(div_application.defaultView);
    const el_application = $(div_application);
    const el_h3 = el_application.find('#view-content h3');
    const el_ul = el_application.find('#view-content ul');
    t.ok(el_h3, "got header");
    t.ok(el_ul, "got list");
    t.equal(el_h3.text(), 'all contacts', "header text");
    t.equal(el_ul.find('li').toArray().length, 1,
            "list has expected number of contacts");
    const raw_el_a_detail = el_ul.find('li a').toArray() .filter(
      function (el) {
        return el.href.match(/^\/contacts\/\d+\/$/);
      })[0];
    t.ok(raw_el_a_detail, "got detail link");
    const el_a_detail = $(raw_el_a_detail);
    t.equal(el_a_detail.text(), NAME,
            "detail link has correct contact name");
    t.end();
  }).catch(t.end);
};

const test_item_navigate = function (t) {
  Promise.resolve().then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/contacts/', "at list url");
    return wd_client.click('div#application #view-content ul li a');
  }).then(dumb_timeout(500)).then(function () {
    t.pass("clicked (what was probably) the item link url");
    return wd_client.getUrl();
  }).then(function (str_url) {
    const url_path = url.parse(str_url).path;
    t.ok(url_path.match(/^\/contacts\/\d+\/$/),
         "at correct item detail url");
    url_path_item = url_path;
    t.end();
  }).catch(t.end);
};

const test_item_resolve = function (t) {
  Promise.resolve().then(function () {
    const item_url = app_url + url_path_item;
    return wd_client.url(item_url);
  }).then(dumb_timeout(750)).then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, url_path_item, "correct url");
    t.end();
  }).catch(t.end);
};

const test_item_els = function (t) {
  Promise.resolve().then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, url_path_item, "correct url");
    return wd_client.getHTML('div#application');
  }).then(function (str_div_application) {
    const div_application = jsdom.jsdom(str_div_application);
    const $ = jquery(div_application.defaultView);
    const el_application = $(div_application);
    const el_view = el_application.find('#view-content');
    const el_h3 = el_view.find('h3');
    const el_a_phone = el_view.find('a[href="tel:' + PHONE_HREF + '"]');
    const el_a_email = el_view.find('a[href="mailto:' + EMAIL + '"]');
    t.equal(el_h3.text(), NAME, "correct name");
    t.equal(el_a_phone.text(), PHONE_FORMATTED, "correct phone");
    t.equal(el_a_email.text(), EMAIL, "correct email");
    t.end();
  }).catch(t.end);
};

const tests = function (t) {
  t.test(test_list_navigate, "navigate to list by clicks");
  t.test(test_list_els, "list elements");
  t.test(test_list_resolve, "resolve list by url");
  t.test(test_list_els, "list elements");
  t.test(test_item_navigate, "navigate to item view");
  t.test(test_item_els, "item view elements");
  t.test(test_item_resolve, "resolve item view by url");
  t.test(test_item_els, "item view elements");
  t.end();
};

const make_tests_main = function (client, _app_url) {
  wd_client = client;
  app_url = _app_url;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

module.exports = exports;
