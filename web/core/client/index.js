/*global require, module, __dirname
 */

var path = require('path');
var fs = require('fs');

const fse = require('fs-extra');
const Handlebars = require('handlebars');
const less = require('less');
const browserify = require('browserify');
const stringify = require('stringify');
const watchify = require('watchify');

const PATHS = Object.freeze({
  template_index: path.join(__dirname, 'index.hbs'),
  client_js_main: path.join(__dirname, 'app', 'main.js'),
  less_styles_main: path.join(__dirname, 'styles', 'main.less')
});

const URL_ROOT = '/index';

// util

const read_file = function (file_path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(file_path, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const  write_file = function (file_path, file_str) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(file_path, file_str, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const do_build_step = function (fn_do_once, path_watch, cts) {
	return fn_do_once().then(function () {
		if (cts) {
			fs.watch(path_watch, {recursive: true}, () => {
				fn_do_once()
          .catch(function (err) {
            console.log("client build error");
            console.log(err);
          });
			});
		}
	});
};

// build steps

const build_index_html = function (path_out, opt_args) {
  const opts = opt_args || {};
  const cts = opts.cts || false;
	const path_src = PATHS.template_index;
	const do_once = function () {
		return read_file(path_src)
			.then(function (template_str) {
				const template = Handlebars.compile(template_str);
				const html_str = template({
          url_root: URL_ROOT
        });
				return write_file(path_out, html_str);
			});
	};
	return do_build_step(do_once, path_src, cts);
};

const build_styles = function (path_output, opt_args) {
	var opts = opt_args || {};
  const path_src_file = PATHS.less_styles_main;
	const dir_src = path.dirname(path_src_file);
	const do_once = function () {
    return read_file(path_src_file)
      .then(function (str_less_input) {
        return less.render(str_less_input, {
          paths: [
            dir_src,
            path.join(dir_src, 'vendor')
          ]
        });
      }).then(function (less_output) {
        var str_css = less_output.css;
        var str_sourcemap = less_output.sourcemap;
        var arr_imports = less_output.imports;
        return write_file(path_output, str_css);
      });
	};
  return do_build_step(do_once, dir_src, opts.cts);
};

const build_js = function (path_out, opt_args) {
	const opts = opt_args || {};
	const make_write_bundle = function (bfy, path_bundle) {
		return function () {
      return new Promise(function (resolve, reject) {
			  var stream_bundle = bfy.bundle();
			  stream_bundle.pipe(fs.createWriteStream(path_bundle));
			  stream_bundle.on('end', function () {
				  resolve();
			  });
      });
		};
	};
	const bfy = browserify({
    entries: [PATHS.client_js_main],
    cache: {},
    packageCache: {},
    debug: true, // source maps
    plugin: opts.cts ? [watchify] : [],
    transform: [stringify(['.html'])]
  });
  var write_bundle = make_write_bundle(bfy, path_out);
  if (opts.cts) {
    bfy.on('update', write_bundle);
  }
  return write_bundle();
};

const build_client = function (path_out, opts) {
	// clean before every build
  if (fs.existsSync(path_out)) {
    fse.removeSync(path_out);
  }
	fse.ensureDirSync(path_out);
  return Promise.all([
    build_index_html(path.join(path_out, 'index.html'), opts),
    build_js(path.join(path_out, 'bundle.js'), opts),
    build_styles(path.join(path_out, 'bundle.css'), opts)
  ]);
};

var exports = {};

exports.build_client = build_client;

module.exports = exports;
