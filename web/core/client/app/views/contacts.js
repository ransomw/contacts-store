/*global require, module */

var Mn = require('backbone.marionette');

var ContactsItemView = Mn.LayoutView.extend({
  template: require('../templates/contacts_item.html'),
  tagName: 'li',

  ui: {
    a_name: 'a',
    div_details: '.details'
  },

  triggers: {
    'click @ui.a_name': 'select:detail'
  },

  templateHelpers: {
    formatPhone: function (phone) {
      return phone.replace(
          /(\d{3})\s*(\d{3})\s*(\d{4})/,
        '($1) $2-$3');
    }
  }
});

var ContactsEmptyView = Mn.LayoutView.extend({
  template: require('../templates/contacts_none.html')
});

var ContactsListView = Mn.CollectionView.extend({
  tagName: 'ul',
  childView: ContactsItemView,
  emptyView: ContactsEmptyView,

  childEvents: {
    'select:detail': 'onItemviewSelectDetail'
  },

  onItemviewSelectDetail: function (item_view) {
    this.triggerMethod('show:detail', item_view.model);
  }
});

var ContactsView = Mn.LayoutView.extend({
  template: require('../templates/contacts.html'),
  tagName: 'div',

  regions: {
    contacts_list: '.view-contacts-list'
  },

  childEvents: {
    'show:detail': 'onChildviewShowDetail'
  },

  constructor: function (options) {
    Mn.LayoutView.prototype.constructor.call(this, options);
    if (!this.getOption('contacts')) {
      throw new Error("missing 'contacts' option");
    }
  },

  onChildviewShowDetail: function (child_view, contact) {
    this.triggerMethod('show:detail', contact);
  },

  onShow: function () {
    var self = this;
    var contacts = this.getOption('contacts');
    var view_contacts_list = new ContactsListView({
      collection: contacts
    });
    Promise.resolve().then(function () {
      return contacts.fetch();
    }).then(function () {
      self.showChildView('contacts_list', view_contacts_list);
    });
  }
});


module.exports = ContactsView;
