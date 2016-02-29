'use strict';
const domain = require('domain');

const plugin = {
	name: 'interpreters',
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		app.strip_args = function (args, reject) { reject = reject || [];
			return args.filter((x) => !reject.some((y) => y == x))
		};

		app.on('classify', function () {
			app.classifier.addDocument('say qqq', 'echo');
			app.classifier.addDocument('echo qqq', 'echo');
			app.classifier.addDocument('clear the console', 'clear');
			app.classifier.addDocument('clear the terminal', 'clear');
		});

		app.on('echo', function (args, ctx, cb) {
			args = app.strip_args(args, [ 'say', 'echo' ]);
			ctx.push(args.join(' '));
			cb(null, ctx);
		});

		app.on('clear', function (args, ctx, cb) {
			ctx.push("\x1Bc");
			cb(null, ctx);
		});

		app.interpret = function (command, callback) {
			command = command.trim();

			let dividers = options.dividers.map((d) => '\\s'+d+'\\s').join('|');

			var statements = command
				.replace(new RegExp(`(${dividers})`, 'gi'), '|')
				.split('|')
				.map((statement) => statement.trim());

			var methods = statements.map((statement) => app.interpretor(statement));

			if (options.modifiers.some((m) => (methods[0][0] === '$') && (methods[0].indexOf(m) !== -1))) {
				let statement = statements[0];
				statements = statements.slice(1);
				app.emit(methods[0], statement.split(' '), statements, callback);
			} else {
				app.async.auto({
					statements: function (cb, ctx) {
						app.async.map(statements, function (statement, next) {
							next(null, { method: app.interpretor(statement), statement: statement });
						}, cb);
					},
					result: ['statements', function (cb, ctx) {
						app.async.reduce(ctx.statements, [], function (context, block, next) {
							let command_domain = domain.create();
							command_domain.add(app);
							command_domain.on('error', (err) => {
								next && next(err);
								next = null
							});
							command_domain.run(() => {
								let args = block.statement.split(' ').slice(1).filter(Boolean);
								app.emit(block.method, args, context, (error, result) => {
									next && next(error, result);
									next = null;
									command_domain.exit();
								});
							});
						}, cb);
					}]
				}, function (error, context) {
					callback(error, (context.result || []).slice(-1)[0]);
				});
			}
		};
	}
}

module.exports = plugin;