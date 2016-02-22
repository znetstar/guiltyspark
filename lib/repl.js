'use strict';

const Repl = require('repl');

const plugin = {
	name: 'repl',
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		app.ConsoleRepl = function () {
			process.stdin.resume()
			app.Repl(null, process.stdin, process.stdout)
		}
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
			  	processor.call(app, cmd, callback);
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