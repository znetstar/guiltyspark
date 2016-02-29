'use strict';

const Repl = require('repl');
const mmmagic = require('mmmagic');

const plugin = {
	name: 'repl',
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		app.on('classify', function () {
			app.classifier.addDocument('write to the console', 'console.log');
			app.classifier.addDocument('disable qqq logging', 'log.disable');
			app.classifier.addDocument('enable qqq logging', 'log.enable');
		});
		app.magic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);
		app.ConsoleRepl = function () {
			process.stdin.resume()
			app.Repl(null, process.stdin, process.stdout)
		}

		app.default_object_renderer = (obj) => require('cson').stringify(obj)

		app.on('log.disable', (args, context, callback) => {
			args = app.strip_args(args, [ 'disable', 'enable', 'logging' ]);
			app.log[`_${args[0]}`] = app.log[args[0]];
			app.log[args[0]] = () => { };
			callback(null, context.concat(`Disabled ${args[0]} logging`));
		});

		app.on('log.enable', (args, context, callback) => {
			args = app.strip_args(args, [ 'disable', 'enable', 'logging' ]);
			app.log[args[0]] = app.log[`_${args[0]}`];
			app.log[`_${args[0]}`] = void(0);
			callback(null, context.concat(`Enabled ${args[0]} logging`));
		});

		app.on('console.log', (args, context, callback) => {
			let res = context.slice(-1)[0];
			app.render_result(res, (err, result) => {
				process.stdout.write(`${result}\n`);
				callback(null, []);
			});
		});

		app.render_result = (result, callback) => {
			if (typeof(result) === 'string') { callback(null, result); }
			else if (typeof(result) === 'object') {
				if (result instanceof Buffer) {
					app.magic.detect(result, (error, mime) => {
						var handler = app.listeners(`render.${mime}`);
						
						if (handler) {
							app.emit(`render.${mime}`, result, callback);
						} else {
							callback(null, result.toString('utf8'));
						}
					});
				} else {
					callback(null, app.default_object_renderer(result));
				}
			}
			else if (typeof(result) === 'function') { 
				result.call(app, callback);
			}
		};

		app.Repl = (function (processor, input, output, terminal) {
			let repl_config = {
			  prompt: `343> `,
			  input: input,
			  output: output,
			  useGlobal: false,
			  terminal: terminal
			};
			if (processor)  {
				repl_config.eval = ((cmd, context, filename, callback) => {
			  	processor.call(app, cmd, (error, result) => {
			  		if (error) {
			  			process.stderr.write(`${error.stack}\n`);
			  		} else if (typeof(result) === 'string') {
	  					result = app.style_output(result);
			  			process.stdout.write(`${result}\n`);
			  		} else {
			  			app.render_result(result, (error, result) => {
	  						if (result)
	  							result = app.style_output(result);
			  				if (!error) process.stdout.write(`${result}\n`);
			  				else process.stderr.write(`${error.stack}\n`);
			  			});
			  		}
			  		callback();
			  	});
			  });
			}
			var repl = Repl.start(repl_config);
			Object.keys(app).forEach((key) => repl.context[key] = app[key]);
			repl.context.emit = app.emit;
			repl.context.on = app.on;
			app.emit('repl.context', repl.context);
			app.on('repl.context:call_all',  () => {
				app.emit('repl.context', repl.context);
			});
			return repl;
		}).bind(app);
	}
}

module.exports = plugin;