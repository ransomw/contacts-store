/*global require, module
 */

const koa = require('koa');
const koa_router = require('koa-router');
const koa_json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');

// login required middleware
const mw_login_req = function* (next) {
  if (this.session.user_id) {
    yield* next;
    return;
  }
  this.status = 401;
  this.body = {};
};

const make_app = function () {
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

  // todo: not for deploy
  app.keys = ['some secret'];

  app
    .use(session(app))
    .use(body_parser)
    .use(mw_json)
    .use(router.routes())
    .use(router.allowedMethods())
  ;

  return app;
};

var exports = {};

exports.make_app = make_app;

module.exports = exports;
