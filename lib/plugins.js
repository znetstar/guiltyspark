'use strict';
const EventEmitter = require('events').EventEmitter;
const async = require('async');
const domain = require('domain');
const shell = require('shelljs');

const plugin = {
	init: function (done) { var app = this;
		app.on('repl.context', (ctx) => ctx.__dirname = process.cwd())

		async.waterfall([
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/package-directories/npm.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/processors/nlp.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/text-manipulation/color.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/text-manipulation/filter.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/text-manipulation/output.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/interfaces/voice.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/shells/shell.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/tools/stats.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/tools/dictionary.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/tools/time.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/tools/uuid.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/network/http.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/network/dns.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/interfaces/sms.js`, ((e) => $next(e)))),
			(($next) => app.load_plugin(`fs://${__dirname}/../plugins/desktop/screensaver.js`, ((e) => $next(e))))
		], done)
	},
	attach: function (options) { var app = this;
		global.System = app.System = require('systemjs');

		app.async = require('async')

		app.plugin_error = function (error) {
			app.log.error(`[plugins->${this.plugin.name}]: ${error.stack}`);
		};

		app.on('classify', function () {
			app.classifier.addDocument('load plugin qqq', 'plugins.load_plugin');
			app.classifier.addDocument('search for plugin qqq', 'plugins.search_plugins');
		});

		app.on('plugins.search_plugins', (args, context, callback) => {
			args = app.strip_args(args, [ 'search', 'for', 'plugins', 'plugin' ]);
			let results = app.filter_wildcard(shell.find(`${__dirname}/../plugins`)
				.filter((path) => (require('fs').lstatSync(path).isFile())), `*${args[0]}*`)
				.map((path) => path.split('plugins/').pop().split('.js').shift());
			
			context.push(results);
			callback(null, context);
		});

		app.on('plugins.load_plugin', function (args, context, callback){
			args = app.strip_args(args, [ 'load', 'plugin', 'plugins', 'a' ]);
			app.load_plugin(`fs://${__dirname}/../plugins/${args[0]}.js`, function (err, ctx) {
				if (err) 
					context.push(`loaded plugin ${ctx.plugin.name}`);
				else
					context.push(`failed to plugin ${ctx.plugin.name}:\n${err.stack}`);
				callback(err, context);
			});	
		});

		app.load_plugin = function (url, callback) {
			url = app.resolve_url(url);

			async.auto({
				driver: (cb, ctx) => {
					if (url.protocol === 'fs:') {	
						cb(null, require('./fs.js'));
					} else {
						app.load_plugin(url.href, cb);
					}
				},
				plugin_source: ['driver', (cb, ctx) => {
					let driver = url.protocol.split('').slice(0, -1).join('');
					let method = (url.query && url.query.method) || 'open';
					app.emit(`${driver}.${method}`, url.href, cb);					
				}],
				temp_stream: ['plugin_source', (cb, ctx) => {
					app.emit('temp.writeStream', {}, (err, stream) => {
						if (err) return cb(err);
						stream.on('finish', () => { cb(null, stream) })
						stream.on('error', cb)
						stream.end(ctx.plugin_source)
					});
				}],
				plugin: ['temp_stream', (cb, ctx) => {
					var plugin = require(ctx.temp_stream.path);
					app.log.debug(`[plugins]: installing plugin ${plugin.name}`)
					cb(null, plugin);
				}],
				modules: ['plugin', (cb, ctx) => {
					async.each((ctx.plugin.modules || []), (mod_obj, next) => {
						if (typeof(mod_obj) === 'string') {
							mod_obj = { name: mod_obj, require: true };
						}
						app.log.debug(`[plugins]: installing dependency ${mod_obj.name}`);
						if (mod_obj.require) {
							app.require(mod_obj.name, function (error, mod) {
								if (error) return next(error);

								global[mod_obj['as'] || mod_obj.name] = mod;
								next() 
							});
						} else {
							app.install_module(mod_obj.name, (error, path) => {
								next(error);
							});
						}
					}, cb);
				}],
				attach: ['plugin', 'modules', (cb, ctx) => {
					app[`${app.config.get(ctx.plugin.name)}_options`] = app.config.get(ctx.plugin.name);
					app.log.debug(`[plugins]: installing plugin ${ctx.plugin.name}`)
					ctx.plugin.attach.call(app, app.config.get(ctx.plugin.name));

					cb()
				}],
				init: ['plugin', 'attach', 'modules', (cb, ctx) => {
					var init_domain = domain.create();

					init_domain.on('error', app.plugin_error.bind(ctx));

					init_domain.run(() => {
						app.log.info(`[plugins]: loaded plugin ${ctx.plugin.name}`)
						ctx.plugin.init.call(app, (error) => {
							init_domain.exit();
							cb(error);
						});
					});
				}],
				detach: ['plugin', (cb, ctx) => {
					if (ctx.plugin.detach) {
						app.on('detach.plugins', function () {
							ctx.plugin.detach.call(app);
						});	
					}
					cb()
				}],
			}, function (error, context) {
				app.emit('repl.context:call_all')
				app.emit(`plugins.${context.plugin.name}.load`, context.plugin);
				callback(error, context)
			});
		};
	},
	detach: function () {
		var app = this;

		app.emit('detach.plugins');
	}
}

module.exports = plugin;