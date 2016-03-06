/*global require, module */

const _ = require('lodash');

var User;
var Contact;
var user_inst;
var contact_id;

const USERNAME = 'alice';
const PASSWORD = 'pass';

const USER_ID_NONEXISTANT = 123;
const NAME = 'bob';
const EMAIL = 'bob@example.com';
const PHONE = '555-555-5555';


// create a user model for to for contacts to reference
const setup = function (t) {
  Promise.resolve().then(function () {
    const user = new User({
      username: USERNAME,
      password: PASSWORD
    });
    return user.save();
  }).then(function (new_user) {
    if (!new_user) {
      t.end();
      t.error("new user promise save didn't return user model");
    }
    t.equal(typeof new_user.id, 'number',
            "new user model has id attr");
    user_inst = new_user;
    t.end();
  }).catch(t.end);
};

const teardown = function (t) {
  Promise.resolve().then(function () {
    return user_inst.destroy();
  }).then(function () {
    t.ok(true, "user_inst destroy without errors");
    t.end();
  }).catch(t.end);
};

// do not allow creating contacts for user ids that don't exist
const test_create_no_user = function (t) {
  Promise.resolve().then(function () {
    return User.where({id: USER_ID_NONEXISTANT}).fetch();
  }).then(function (user) {
    if (user) {
      throw new Error("user record with for intended nonexistant id " +
                      USER_ID_NONEXISTANT + " found");
    };
  }).then(function () {
    const contact = new Contact({
      user_id: USER_ID_NONEXISTANT,
      name: NAME,
      email: EMAIL,
      phone: PHONE
    });
    return contact.save();
  }).then(function (new_contact) {
    t.notOk(new_contact,
            "contacts shouldn't be created for nonexistant user id");
    t.end();
  }).catch(function (err) {
    t.ok(err,
         "error on attempt to create contact with nonexistant user id");
    t.end();
  });
};

const test_create = function (t) {
  Promise.resolve().then(function () {
    const contact = new Contact({
      user_id: user_inst.id,
      name: NAME,
      email: EMAIL,
      phone: PHONE
    });
    return contact.save();
  }).then(function (new_contact) {
    if (!new_contact) {
      t.error("new contact promise save didn't return contact model");
      t.end();
      return;
    }
    t.equal(typeof new_contact.id, 'number',
            "new contact model has id attr");
    contact_id = new_contact.id;
    t.equal(new_contact.get('user_id'), user_inst.id,
            "new contact has correct user id");
    t.end();
    return;
  }).catch(t.end);
};

const test_read_from_user = function (t) {
  var contacts;
  Promise.resolve().then(function () {
    if (typeof user_inst.contacts !== 'function') {
      t.skip("User.contacts() unimplemented");
      /*
       t.notOk(true, "User.contacts() unimplemented");
       */
      return user_inst.hasMany(Contact);
    } else {
      return user_inst.contacts();
    }
  }).then(function (contacts_collection) {
    contacts = contacts_collection;
    t.ok(contacts, "got contacts collection");
    // ??? error message prints `expected: undefined`
    // even though an empty array is expected
    t.skip("prepopulated contacts collection from user");
    /*
    t.notDeepEqual(contacts_collection.serialize(), [],
                   "prepopulated contacts collection from user");
     */
    return contacts.count();
  }).then(function (num_contacts) {
    t.equal(num_contacts, 1, "found one contact");
    return contacts.fetch();
  }).then(function (contacts_fetch_collection) {
    if (typeof contacts_fetch_collection.serialize !== 'function') {
      throw new Error("fetched contacts collection " +
                      "has no serialize function");
    }
    t.deepEqual(
      contacts_fetch_collection.serialize()
        .map(function (contact_json) {
          return _.pick(contact_json, [
            'name', 'email', 'phone']);
        }), [{
          name: NAME,
          email: EMAIL,
          phone: PHONE
        }], "contacts collection seralize() " +
        "contains desired information");
    t.deepEqual(
      contacts_fetch_collection.serialize(), [{
        name: NAME,
        email: EMAIL,
        phone: PHONE
      }], "contacts collection seralize() " +
        "contains exactly desired information");
    t.end();
  }).catch(t.end);
};

const test_read = function (t) {
  Promise.resolve().then(function () {
    return Contact.where({id: contact_id}).fetch();
  }).then(function (contact) {
    t.ok(contact, "found contact");
    t.deepEqual(_.pick(contact.serialize(), [
      'name', 'email', 'phone']), {
        name: NAME,
        email: EMAIL,
        phone: PHONE
      }, "contact contains desired information");
    t.deepEqual(contact.serialize(), {
      name: NAME,
      email: EMAIL,
      phone: PHONE
    }, "contact contains exactly desired information");
    t.end();
  }).catch(t.end);
};

const test_delete = function (t) {

  Promise.resolve().then(function () {
    return Contact.where({id: contact_id}).fetch();
  }).then(function (contact) {
    t.ok(contact, "found contact");
    return contact.destroy();
  }).then(function () {
    t.ok(true, "contact.destroy() returns w/o errors");
    return Contact.where({id: contact_id}).fetch();
  }).then(function (contact) {
    t.notOk(contact, "no contact found after destroy");
    t.end();
  }).catch(t.end);
};

const test_validation = function (t) {
  // todo:
  //       - email, phone valid formats
  //       - non-empty name string
  //       - what do do about duplicate names?
  t.notOk(true, "validation test unimplemented");
  t.end();
};

const tests = function (t) {

  if (!User) {
    t.error("User model undefined");
    t.end();
    return;
  }

  if (!Contact) {
    t.error("Contact model undefined");
    t.end();
    return;
  }

  // t.test("get user", test_get_user);

  t.skip("no user create", test_create_no_user);
  t.test("create", test_create);
  t.test("read from user", test_read_from_user);
  t.test("read", test_read);
  t.test("delete", test_delete);
  t.skip("validation", test_validation);
  t.end();
};

const make_tests_main = function (
  UserModel,
  ContactModel
) {
  User = UserModel;
  Contact = ContactModel;
  return function (t) {
    t.test("setup", setup);
    t.test("tests", tests);
    t.test("teardown", teardown);
    t.end();
  };
};

var exports = make_tests_main;

module.exports = exports;
