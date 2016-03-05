/*global require, module
 */

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


const make_app = function (sqlite_path) {
  const my_bookshelf = new MyBookshelf(sqlite_path);
  const User = my_bookshelf.models.User;


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
      if (this.request.body.password_confirm !==
          this.request.body.password) {
        this.status = 400;
        this.body = {msg: "passwords don't match"};
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
    } else {
      this.status = 500;
      this.body = {msg: "login unimplemented"};
    }
  });

  router.get('/contacts', mw_login_req, function* (next) {
    this.body = [];
  });

  router.get('/contacts/:id', mw_login_req, function* (next) {

    console.log("contacts get got id");
    console.log(this.params.id);

    this.body = {};
  });

  router.post('/contacts', mw_login_req, function* (next) {

    console.log("contacts post");

    this.body = this.request.body;
  });

  router.put('/contacts/:id', mw_login_req, function* (next) {

    console.log("contacts put got id");
    console.log(this.params.id);

    this.body = this.request.body;
  });

  router.del('/contacts/:id', mw_login_req, function* (next) {

    console.log("contacts del got id");
    console.log(this.params.id);

    this.body = this.request.body;
  });

  // todo: not for deploy
  app.keys = ['some secret'];

  app
    .use(session(app))
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
