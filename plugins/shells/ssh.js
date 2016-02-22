'use strict';

const plugin = {
	name: 'ssh',
	modules: [
		'shelljs'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		app.on('classify', function () {
			app.classifier.addDocument('on server qqq run', 'ssh.exec');
			app.classifier.addDocument('remotely on qqq run', 'ssh.exec');
			app.classifier.addDocument('on qqq run', 'ssh.exec');
		});

		app.on('ssh.exec', (args, context, callback) => {
			args = app.strip_args(args, [
				'on',
				'server',
				'run',
				'remotely'
			]);

			shelljs.exec(`ssh ${args[0]} ${args.slice(1).join(' ')}`, { async: true, silent: true }, function (code, output) {
				context.push(output);
				callback(null, context)
			});
		});

	}
}

module.exports = plugin;