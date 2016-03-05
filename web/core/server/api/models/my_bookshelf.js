/*global require, module */

const _ = require('lodash');
const knex = require('knex');
const bookshelf = require('bookshelf');

const user_def = require('./user_def');
const contact_def = require('./contact_def');

const make_user_model = require('./user').make_model;

const _drop_table = function (knex_inst, table_name) {
  return Promise.resolve().then(function () {
    return knex_inst.schema.hasTable(table_name);
  }).then(function (exists) {
    if (exists) {
      return knex_inst.schema.dropTable(table_name);
    }
    return undefined;
  });
};

const _create_table = function (knex_inst, table_name, cb_table_def) {
  return Promise.resolve().then(function () {
    return _drop_table(knex_inst, table_name);
  }).then(function () {
    return knex_inst.schema
      .createTable(table_name, function (table) {
        table.increments('id').primary();
        cb_table_def(table);
      });
  });
};

const _make_model = function (Model, model_def) {
  var Base;
  if (model_def.extends) {
    Base = _make_model(Model, model_def.extends);
  } else {
    Base = Model;
  }
  return Base.extend(
    _.merge(model_def.instance, {Parent: Base}),
    model_def.static);
};

const MyBookshelf = function (sqlite_path) {
  const _knex_inst = knex({
    client: 'sqlite',
    useNullAsDefault: true,
    connection: {
      filename: sqlite_path
    }
  });
  const bookshelf_inst = bookshelf.apply(null, [_knex_inst]);
  const models = {};
  _.merge(this, bookshelf_inst);

  // todo: trying to set up models in such a way that, for example,
  //       user.contacts may be defined in a way analogous to
  //       user.posts in examples section of bookshelfjs.com
  // models.User = make_user_model(this);

  models.User = _make_model(this.Model, user_def);
  models.Contact = _make_model(this.Model, contact_def);

  _.merge(this, {models: models});
};

MyBookshelf.prototype.destroy = function () {
  const self = this;
  return Promise.resolve().then(function () {
    return self.knex.destroy();
  });
};

MyBookshelf.prototype.init_db = function () {
  const self = this;

  return Promise.all([
    _create_table(self.knex, 'users', function (table) {
      table.string('username', 12)
        .unique()
        .notNullable()
      ;
      table.string('password', 12)
        .notNullable()
      ;
    }),

    _create_table(self.knex, 'contacts', function (table) {
      table.integer('user_id')
        .references('id')
        .inTable('users')
        .notNullable()
      ;
      table.string('name', 80)
        .notNullable()
      ;
      table.string('email', 255)
      ;
      table.string('phone', 16)
      ;
    }),
  ]);

};

var exports = {};

exports = MyBookshelf;

module.exports = exports;
