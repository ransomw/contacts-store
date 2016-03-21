/*global require, module */

var Bb = require('backbone');
var Mn = require('backbone.marionette');

var PHONE_INPUT_REGEXP = /^\s*(\d{3})\s*(\d{3})\s*(\d{4})\s*$/;

var AddContactFormBehavior = Mn.Behavior.extend({
  ui: {
    form_add_contact: 'form',
    input_name: 'form input[name="name"]',
    input_phone: 'form input[name="phone"]',
    input_email: 'form input[name="email"]'
  },

  events: {
    'submit @ui.form_add_contact': 'do_add_contact'
  },

  do_add_contact: function () {
    var contact_data = this.get_contact_data();
    this.view.collection.create(contact_data, {wait: true});
  },

  get_contact_data: function () {
    return {
      name: this.ui.input_name[0].value.trim(),
      phone: this.ui.input_phone[0].value.trim(),
      email: this.ui.input_email[0].value.trim()
    };
  }
});


var AddContactView = Mn.LayoutView.extend({
  template: require('../templates/add_contact.html'),
  template_loading: require('../templates/loading.html'),
  tagName: 'div',

  behaviors: {
    form: {
      behaviorClass: AddContactFormBehavior
    }
  },

  collectionEvents: {
    'add': 'addingContact',
    'sync': 'contactAdded'
  },

  ui: {
    signup: '.signup'
  },

  triggers: {
    'click @ui.signup': 'show:signup'
  },

  templateHelpers: {
    phone_pattern: PHONE_INPUT_REGEXP.source
      .replace(/\(/g, '').replace(/\)/g, '')
  },

  getTemplate: function () {
    if (this.loading) {
      return this.getOption('template_loading');
    }
    return this.getOption('template');
  },

  addingContact: function () {
    this.loading = true;
    this.render();
  },

  contactAdded: function () {
    this.loading = false;
    this.triggerMethod('show:home');
  },

  onShow: function () {
    console.log("add contact view onShow");
  }
});

module.exports = AddContactView;
