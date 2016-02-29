'use strict';

const plugin = {
	name: 'output',
	modules: [
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};

		const dns = require('dns');

		app.on('classify', function () {
			app.classifier.addDocument('resolve qqq', 'dns.resolve');
			app.classifier.addDocument("what's the ip of qqq?", 'dns.resolve');
		});

		app.on('dns.resolve', function (args, context, callback) {
			args = app.strip_args(args, [ 'resolve', "what's", 'the', 'ip', 'of' ]);
			dns.resolve(args[0], (error, records) => {
				context = context.push(records);
				callback(error, records);
			});
		});
	}
}

module.exports = plugin;