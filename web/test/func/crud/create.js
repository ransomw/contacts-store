/*global require, module, setTimeout */

var url = require('url');

const _ = require('lodash');
const jsdom = require('jsdom');
const jquery = require('jquery');

const app = require('../../../core');

var wd_client;

const NAME = 'bob';
const EMAIL = 'b@b.com';
const PHONE = '555 555 5555';

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

const test_nav = function (t) {
  Promise.resolve().then(function () {
    return wd_client.click('nav a[href="/add/"]');
  }).then(dumb_timeout(500)).then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/add/', "correct url");
    t.end();
  }).catch(t.end);
};

const test_page_els = function (t) {
  Promise.resolve().then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/add/', "correct url");
    return wd_client.getHTML('div#application');
  }).then(function (str_div_application) {
    const div_application = jsdom.jsdom(str_div_application);
    const $ = jquery(div_application.defaultView);
    const el_application = $(div_application);
    const el_h3 = el_application.find('#view-content h3');
    const el_form = el_application.find('#view-content form');
    const el_form_button = el_form.find('button');
    t.ok(el_h3, "got header");
    t.ok(el_form, "got form");
    t.ok(el_form_button, "got form button");
    t.equal(el_h3.text(), 'add contact', "correct header text");
    t.deepEqual(
      el_form.find('div').toArray().map(function (div_form_field) {
        const el_form_div = $(div_form_field);
        return {
          label: el_form_div.find('label').text(),
          input_type: el_form_div.find('input').attr('type'),
          input_name: el_form_div.find('input').attr('name')
        };
      }), [{
        label: 'name',
        input_name: 'name',
        input_type: 'text'
      }, {
        label: 'phone',
        input_name: 'phone',
        input_type: 'tel'
      }, {
        label: 'email',
        input_name: 'email',
        input_type: 'email'
      }],
      "correct form inputs");
    t.equal(el_form.find('div input[name="phone"]').attr('pattern'),
            '^\\s*\\d{3}\\s*\\d{3}\\s*\\d{4}\\s*$',
            "got expected regexp for phone number");
    t.equal(el_form_button.text(), 'add', "button text");
    t.end();
  }).catch(t.end);
};

const test_add_invalid = function (t) {
  t.error("unimplemented");
  t.end();
};

const test_add = function (t) {
  const form_sel = '#view-content form';
  const make_input_sel = function (input_name) {
    return form_sel + ' input[name="' + input_name + '"]';
  };
  Promise.resolve().then(function () {
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/add/', "correct url");
    return wd_client.setValue(make_input_sel('name'), NAME);
  }).then(function () {
    return wd_client.setValue(make_input_sel('email'), EMAIL);
  }).then(function () {
    return wd_client.setValue(make_input_sel('phone'), PHONE);
  }).then(function () {
    return wd_client.click(form_sel + ' button');
  }).then(dumb_timeout(750)).then(function () {
    t.pass("add form submitted without webdriver errors");
    return wd_client.getUrl();
  }).then(function (str_url) {
    t.equal(url.parse(str_url).path, '/home/',
            "redirect after add");
    t.end();
  }).catch(t.end);
};

const tests = function (t) {
  t.test("navigate", test_nav);
  t.test("page elements", test_page_els);
  t.skip("test validation", test_add_invalid);
  t.test("add correct contact info", test_add);
  t.end();
};

const make_tests_main = function (client, app_url) {
  wd_client = client;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

module.exports = exports;
