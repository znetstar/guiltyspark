'use strict';

const plugin = {
	name: 'agenda',
	modules: [
		'agenda'
	],
	init: function (done) { var app = this;
		app.agenda.start();
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};

		app.agenda = new agenda(options);

		app.agenda.define('interpret', function (job, done) {
			app.interpret(job.attrs.data.command, function (error, result) {
				
			});
		});

		app.on('classify', function () {
			app.classifier.addDocument('schedule qqq', 'agenda.schedule');
		});

		app.on('agenda.schedule', function (args, statements, callback) {
			args = app.strip_args(args, ['schedule', 'in', 'to']);
			let job = {
				command: statements.join(' and ')
			};

			app.agenda.schedule(args.join(' '), 'interpret', job);
			callback(null);
		});
	}
}

module.exports = plugin;