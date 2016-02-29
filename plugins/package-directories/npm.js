'use strict';
const npm = require('npm');
const shell = require('shelljs');


const plugin = {
	name: 'npm',
	init: function (done) { var app = this;
		npm.load(app.npm_options, function (err) {
			npm.prefix = app.npm_options.prefix;
			done(err);
		});
	},
	attach: function (options) { var app = this;
		options = options || {};
		app.npm = npm;

		app.on('repl.context', (context) => {
			context.npm = npm;
		});

		options.prefix = options.prefix || app.temp.mkdirSync();

		app.npm_options = options;

		app.install_module = (pkg, callback) => {
			npm.commands.install([pkg], (error, data) => {
				let path = data.slice(-1)[0][1];

				callback(error, path);
			});			
		};

		app.require = (pkg, callback) => {
			if (require('fs').existsSync(`${options.prefix}/node_modules/${pkg}`)){
				let path = `${options.prefix}/node_modules/${pkg}`;
				callback(null, (path && require(path)));
			} else {
				app.install_module(pkg, (error, path) => {
					callback(error, (path && require(path)));
				});
			}
		};
	}
};

module.exports = plugin;