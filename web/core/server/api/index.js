/*global require, module
 */

const _ = require('lodash');
const koa = require('koa');
const koa_router = require('koa-router');
const koa_json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');

const MyBookshelf = require('./models').MyBookshelf;

// login required middleware
const mw_login_req = function* (next) {
  if (this.session.user_id) {
    yield* next;
    return;
  }
  this.status = 401;
  this.body = {};
};

const make_app = function (sqlite_path, opt_args) {
  const opts = opt_args || {};
  const my_bookshelf = new MyBookshelf(sqlite_path);
  const User = my_bookshelf.models.User;
  const Contact = my_bookshelf.models.Contact;

  const app = koa();
  const router = koa_router();
  const body_parser = bodyParser({
    // requested encoding. Default is utf-8 by co-body
    encode: 'utf-8',
    // limit of the urlencoded body. If the body ends up being larger
    // than this limit, a 413 error code is returned. Default is 56kb
    formLimit: '56kb',
    // limit of the json body. Default is 1mb
    jsonLimit: '1mb',
    // when set to true, JSON parser will only accept arrays and
    // objects. Default is true. See strict mode in co-body
    strict: true,
    // custom json request detect function. Default is null
    // function (ctx) { return /\.json$/i.test(ctx.path); }
    detectJSON: null,
    // support extend types
    // {json: ['application/x-javascript']}
    // will parse application/x-javascript type body as a JSON string
    extendTypes: {}
    // support custom error handle
    // onerror: function (err, ctx) {ctx.throw('body parse error', 422);}
  });
  const mw_json = koa_json({
    // default to pretty response [true]
    pretty: true,
    // JSON spaces [2]
    spaces: 2
    // optional query-string param for pretty responses [none]
    // param:
  });

  const signup = function () {
    return function* (next) {
      var user;
      var new_user;
      if (this.request.body.password_confirm !==
          this.request.body.password) {
        this.status = 400;
        this.body = {msg: "passwords don't match"};

        console.log("signup with password mismatch: request.body, next");
        console.log(this.request.body);
        console.log(next);

        yield* next;
        return;
      }
      user = new User({
        username: this.request.body.username,
        password: this.request.body.password
      });
      new_user = yield user.save();
      if (!new_user) {
        this.status = 500;
        this.body = {msg: "user create failed at persistance layer"};
        yield* next;
        return;
      }
      this.session.user_id = new_user.id;
      this.body = new_user.serialize();
    };
  };

  const login = function () {
    return function* (next) {
      var user = yield User.where({username: this.request.body.username})
        .fetch();
      if (!user) {
        this.status = 400;
        this.body = {
          msg: "unknown username",
          data: this.request.body.username
        };
        yield* next;
        return;
      }
      this.session.user_id = user.id;
      this.body = user.serialize();
    };
  };

  router.get('/hi', function *(next) {
    this.body = {msg: "hiya!"};
  });

  router.post('/login', function *(next) {
    const USERNAME = 'alice';
    const PASSWORD = 'pass';
    if (this.request.body.username === USERNAME &&
        this.request.body.password === PASSWORD) {
      this.session.user_id = 1;
    } else {
      this.status = 401;
    }
    this.body = {};
  });

  router.get('/secret', mw_login_req, function* (next) {
    this.body = {some_secret: "sssh!"};
  });

  router.get('/user', function* (next) {
    var user;
    if (!this.session.user_id) {
      this.body = {};
      yield* next;
      return;
    }
    user = yield User.where({id: this.session.user_id}).fetch();
    if (!user) {
      this.status = 500;
      this.body = {msg: "couldn't find user model"};
      return;
    }
    this.body = user.serialize();
  });

  router.post('/user', function* (next) {
    var user;
    var new_user;
    if (this.request.body.password_confirm) {
      yield signup();
      yield next;
      return;
    }
    if (this.request.body.logout) {
      this.session.user_id = undefined;
      this.body = {username: null};
      yield next;
      return;
    }
    yield login();
    yield next;
  });

  router.get('/contacts', mw_login_req, function* (next) {
    var user = yield User.where({id: this.session.user_id}).fetch();
    var contacts = yield user.hasMany(Contact).fetch();
    this.body = contacts.map(function (contact) {
      var contact_json = contact.serialize();
      contact_json.id = contact.id;
      return contact_json;
    });
  });

  router.get('/contacts/:id', mw_login_req, function* (next) {
    console.log("contacts get got id");
    console.log(this.params.id);
    this.status = 500;
    this.body = {msg: "individual contact read unimplemented"};
  });

  router.post('/contacts', mw_login_req, function* (next) {
    var contact;
    var new_contact;
    if (Array.isArray(this.request.body)) {
      this.status = 400;
      this.body = {msg: "bulk create unsupported"};
      yield* next;
      return;
    }
    contact = new Contact(_.merge(_.cloneDeep(this.request.body),
                                  {user_id: this.session.user_id}));
    new_contact = yield contact.save();
    if (!new_contact) {
      this.status = 500;
      this.body = {msg: "contact create failed at persistance layer"};
      yield* next;
      return;
    }
    this.body = new_contact.serialize();
    this.body.id = new_contact.id;
  });

  router.put('/contacts/:id', mw_login_req, function* (next) {
    const contact = yield Contact.where({id: this.params.id}).fetch();
    var saved_contact;
    if (!contact) {
      this.status = 500;
      this.body = {msg: "couldn't find user model"};
      return;
    }
    if (contact.get('user_id') !== this.session.user_id) {
      this.status = 400;
      this.body = {msg: "may not modify other users' contacts"};
      return;
    }
    contact.set(this.request.body);
    saved_contact = yield contact.save();
    this.body = saved_contact.serialize();
    this.body.id = saved_contact.id;
  });

  router.del('/contacts/:id', mw_login_req, function* (next) {
    const contact = yield Contact.where({id: this.params.id}).fetch();
    var destroyed_contact;
    if (!contact) {
      this.status = 500;
      this.body = {msg: "couldn't find user model"};
      return;
    }
    if (contact.get('user_id') !== this.session.user_id) {
      this.status = 400;
      this.body = {msg: "may not delete other users' contacts"};
      return;
    }
    destroyed_contact = yield contact.destroy();
    this.body = destroyed_contact.serialize();
    this.body.id = destroyed_contact.id;
  });

  // required for koa-session
  // todo: not for deploy
  app.keys = ['some secret'];

  // ??? missing koa-session/koa-mount interop?
  if (!opts.session_upstream) {
    app.use(session(app));
  }

  app
    .use(body_parser)
    .use(mw_json)
    .use(router.routes())
    .use(router.allowedMethods())
  ;

  // add database functions to koa application api
  const db_fns = (function () {
    var db_initialized = false;
    return {
      init_db: function () {
        if (db_initialized) {
          throw new Error("more than one db init for this app instance");
        }
        return my_bookshelf.init_db();
      },
      close_db: function () {
        return my_bookshelf.destroy();
      }
    };
  }());

  if (app.init_db) {
    throw new Error("init_db already defined");
  }
  app.init_db = db_fns.init_db;
  if (app.close_db) {
    throw new Error("close_db already defined");
  }
  app.close_db = db_fns.close_db;

  return app;
};

var exports = {};

exports.make_app = make_app;

module.exports = exports;
