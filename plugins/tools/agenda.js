'use strict';

const plugin = {
	name: 'agenda',
	modules: [
		'agenda', 'moment'
	],
	init: function (done) { var app = this;
		app.agenda.start();
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		options.defaultConcurrency = Infinity;
		app.agenda = new agenda(options);

		app.agenda.define('interpret',  function (job, done) {
			app.log.debug(`[agenda]: running command: ${job.attrs.data.command}`)
			app.interpret(job.attrs.data.command, function (error, result) {
				if (!job.attrs.repeatInterval) {
					done(error);
				} else {
					done(error);
				}
			});
		});

		app.on('classify', function () {
			app.classifier.addDocument('schedule qqq', '$agenda.schedule');
			app.classifier.addDocument('after qqq', '$agenda.schedule');
			app.classifier.addDocument('every qqq', '$agenda.every');
			app.classifier.addDocument('clear the agenda', 'agenda.clear');
			app.classifier.addDocument('the agenda', 'agenda.jobs');
			app.classifier.addDocument('show the agenda', 'agenda.jobs');
		});

		app.on('agenda.clear', (a,ctx,cb) => { app.agenda.cancel({}, () => { cb(null, ctx.concat(`Cleared the agenda`)); }); })

		app.on('$agenda.schedule', function (args, statements, callback) {
			args = app.strip_args(args, ['schedule', 'in', 'to']);
			let job = {
				id: uuid.v4(),
				command: statements.join(' and ')
			};
			app.agenda.schedule(args.join(' '), 'interpret', job);
			callback(null);
		});

		app.on('$agenda.every', function (args, statements, callback) {
			args = app.strip_args(args, ['every', 'in', 'to']);
			let job = {
				id: uuid.v4(),
				command: statements.join(' and ')
			};
			app.agenda.every(args.join(' '), 'interpret', job);
			callback(null);
		});

		app.on('agenda.jobs', function (args, context, callback) {
			app.agenda.jobs({}, (error, jobs) => {
				let summary = jobs.map((job) => {
					return `${moment(job.attrs.nextRunAt).fromNow()}: ${job.attrs.data.command}${ job.attrs.repeatInterval ? ' (running every '+job.attrs.repeatInterval+')' : '' }`
				}).join("\n");

				callback(null, context.concat(summary));
			});
		});
	}
}

module.exports = plugin;