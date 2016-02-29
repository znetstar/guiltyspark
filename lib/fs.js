'use strict';
const fs = require('fs');

const plugin = {
	name: 'fs',
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		app.on('classify', function () {
			app.classifier.addDocument('write to qqq', 'fs.writeFile');
			app.classifier.addDocument('append to qqq', 'fs.appendFile');
			app.classifier.addDocument('read file qqq', 'fs.readFile');
		});


		app.on('fs.writeFile', function (args, context, callback) {
			args = app.strip_args(args, [ 'to', 'write' ]);
			let content = context.slice(-1)[0];
			fs.writeFile(args[0], content, (error) => {
				callback(error, context);
			});
		});

		app.on('fs.appendFile', function (args, context, callback) {
			args = app.strip_args(args, [ 'to' ]);
			let content = context.slice(-1)[0];

			fs.appendFile(args[0], content, (error) => {
				callback(error, context);
			});
		});

		app.on('fs.readFile', (args, context, callback) => {
			args = app.strip_args(args, [ 'read', 'file' ]);
			fs.readFile(args[0], (error, buf) => {
				context.push(buf);
				callback(error, context);
			});
		});

		var DriverFactory = function (proto, func) {
			return (url, callback) => {
				url = app.resolve_url(url);
				if (url.protocol.split('').slice(0, -1).join('') !== proto)
					return callback(new Error(`The URL ${url.href} does not use protocol ${url.protocol}`));
				func(url.path, callback);
			};
		};

		app.on('fs.open', DriverFactory('fs', fs.readFile))
	}
}

module.exports = plugin;