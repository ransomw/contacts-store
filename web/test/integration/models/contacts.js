/*global require, module */

const _ = require('lodash');
const app = require('../../../core');

// should match user.js
const USERNAME = 'bob';
const PASSWORD = 'pass';

const CONTACT_A = {
  name: 'alice',
  email: 'a@a.org',
  phone: '555-555-5555'
};

const EMAIL_UPDATE = 'alice@a.org';

const CONTACT_B = {
  name: 'carl',
  email: 'c@c.com',
  phone: '555-555-5551'
};

var User;
var Contacts;

const setup = function (t) {
  t.end();
};

const teardown = function (t) {
  t.end();
};

const test_no_login = function (t) {
  Promise.resolve().then(function () {
    var contacts = new Contacts();
    return contacts.fetch();
  }).then(function (fetch_data) {
    t.error("contacts.fetch() returned success before login");
    t.end();
  }, function (err) {
    t.equal(err.status_code, 401, "got error with correct status code");
    t.end();
  });
};

// from user.js
const test_login = function (t) {
  Promise.resolve().then(function () {
    var user = new User({
      username: USERNAME,
      password: PASSWORD
    });
    return Promise.all([user, user.save()]);
  }).then(_.spread(function (user, res_login) {
    t.ok(true, "user login returned without error");
    t.ok(user, "user login returned object");
    t.ok(user instanceof User, "object is instance of User model");
    t.equal(res_login.username, USERNAME,
            "expected username from server");
    t.equal(user.get('username'), USERNAME,
            "expected username on model");
    t.end();
  })).catch(t.end);
};

const test_none = function (t) {
  Promise.resolve().then(function () {
    var contacts = new Contacts();
    return contacts.fetch();
  }).then(function (fetch_data) {
    t.ok(Array.isArray(fetch_data), "fetch data is array");
    t.deepEqual(fetch_data, [], "fetched empty list");
    t.end();
  }).catch(t.end);
};

const test_create_in_collection = function (t) {
  Promise.resolve().then(function () {
    var contacts = new Contacts();
    var promise_sync = new Promise(function (resolve, reject) {
      contacts.on('sync', resolve);
    });
    return Promise.all([
      contacts,
      contacts.create(CONTACT_A),
      promise_sync
    ]);
  }).then(_.spread(function (contacts, new_contact, sync_result) {
    t.pass("contacts.create() triggered sync event without error");
    t.deepEqual(contacts.toJSON().map(function (contact) {
      return _.omit(contact, ['id']);
    }),
                [CONTACT_A],
                "collection has correct data");
    t.deepEqual(_.omit(new_contact.toJSON(), ['id']), CONTACT_A,
                "contacts create returns model with correct data");
    t.end();
  })).catch(t.error);
};

const test_create_outside_collection = function (t) {
  Promise.resolve().then(function () {
    var contact = new Contacts.model(CONTACT_A);
    Promise.all([contact, contact.save()]);
  }).then(_.spread(function (contact, res_save) {
    t.pass("contact.save() without error");
    t.deepEqual(res_save, CONTACT_A,
                "save returns correct data");
    var contacts = new Contacts();
    return Promise.all([contacts, contacts.fetch()]);
  })).then(_.spread(function (contacts, fetch_res) {
    t.deepEqual(contacts.toJSON(), [CONTACT_A],
                "collection has correct data");
    t.end();
  })).catch(t.error);
};

const test_create = function (t) {
  t.skip("validate fields");
  t.test(test_create_in_collection, "in collection");
  t.skip(test_create_outside_collection, "outside collection");
  t.skip("duplicate names, emails, or phones");
  t.end();
};

const test_read_collection = function (t) {
  Promise.resolve().then(function () {
    var contacts = new Contacts();
    return Promise.all([
      contacts,
      contacts.fetch()
    ]);
  }).then(_.spread(function (contacts, fetch_res) {
    t.pass("contacts.fetch() without error");
    t.deepEqual(contacts.toJSON().map(function (contact) {
      return _.omit(contact, ['id']);
    }),
                [CONTACT_A],
                "collection has correct data");
    t.end();
  })).catch(t.error);
};

const test_read = function (t) {
  t.test(test_read_collection, "collection as a whole");
  t.end();
};

const test_update = function (t) {
  Promise.resolve().then(function () {
    var contacts = new Contacts();
    return Promise.all([
      contacts,
      contacts.fetch()
    ]);
  }).then(_.spread(function (contacts, fetch_res) {
    var contact = contacts.at(0);
    t.ok(contact, "have contact from server");
    t.notEqual(contact.get('email'), EMAIL_UPDATE,
               "email is not equal to planned updated value");
    contact.set({email: EMAIL_UPDATE});
    return Promise.all([contacts, contact, contact.save()]);
  })).then(_.spread(function (contacts, contact, save_res) {
    t.pass("contact.save() w/o error");
    t.equal(contact.get('email'), EMAIL_UPDATE,
               "email equal to planned updated value");
  })).then(function () {
    var contacts = new Contacts();
    return Promise.all([
      contacts,
      contacts.fetch()
    ]);
  }).then(_.spread(function (contacts, fetch_res) {
    var contact = contacts.at(0);
    t.ok(contact, "have contact from server");
    t.equal(contact.get('email'), EMAIL_UPDATE,
            "email equal to planned updated value");
    t.end();
  })).catch(t.error);
};

const test_delete = function (t) {
  Promise.resolve().then(function () {
    var contacts = new Contacts();
    return Promise.all([
      contacts,
      contacts.fetch()
    ]);
  }).then(_.spread(function (contacts, fetch_res) {
    var contact = contacts.at(0);
    t.ok(contact, "have contact from server");
    return contact.destroy();
  })).then(function () {
    t.pass("contact.destroy() return w/o error");
  }).then(function () {
    var contacts = new Contacts();
    return Promise.all([
      contacts,
      contacts.fetch()
    ]);
  }).then(_.spread(function (contacts, fetch_res) {
    var contact = contacts.at(0);
    t.notOk(contact, "no contact fetched from server after delete");
    t.end();
  })).catch(t.error);
};


const contacts_tests = function (t) {
  t.test(test_no_login, "not logged in");
  t.test(test_login, "login");
  t.test(test_none, "no models");
  t.test(test_create, "create");
  t.test(test_read, "read");
  t.test(test_update, "update");
  t.test(test_delete, "delete");
  t.end();
};

const make_tests_main = function (_User, _Contacts) {
  User = _User;
  Contacts = _Contacts;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", contacts_tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

module.exports = exports;
