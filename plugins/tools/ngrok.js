'use strict';

const plugin = {
	name: 'time',
	modules: [
		'moment'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		app.on('classify', function () {
			app.classifier.addDocument("expose port qqq", 'time.now');
		});

		app.on('time.now', (args, context, callback) => {
				context.push(`${moment().format('h:mm:ssa')}`);
				callback(null, context);
		});

		app.on('date.now', (args, context, callback) => {
				context.push(`${moment().format('MMMM Do YYYY')}`);
				callback(null, context);
		});

		app.on('datetime.now', (args, context, callback) => {
				context.push(`${moment().format('MMMM Do YYYY, h:mm:ssa')}`);
				callback(null, context);
		});
	}
}

module.exports = plugin;