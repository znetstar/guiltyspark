'use strict';

const plugin = {
	name: 'pushover',
	modules: [
		'pushover-notifications'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		app.pushover = new global['pushover-notifications'](options);
		app.on('classify', function () {
			app.classifier.addDocument('alert me via pushover', 'pushover.send');
			app.classifier.addDocument('notify me via pushover', 'pushover.send');
			app.classifier.addDocument('let me know via pushover', 'pushover.send');
			app.classifier.addDocument('let me know through pushover', 'pushover.send');
			app.classifier.addDocument('let me know using pushover', 'pushover.send');
			app.classifier.addDocument('let me know on pushover', 'pushover.send');
		});

		app.on('pushover.send', function (args, context, callback) {
			args = app.strip_args(args, [
				'let',
				'me',
				'know',
				'using',
				'via',
				'on',
				'through',
				'pushover',
				'notify',
				'alert'
			]);

			var message = {
				message: context.slice(-1)[0]
			};

			app.pushover.send(message, (error) => {
				callback(error, context);
			})
		});
	}
}

module.exports = plugin;