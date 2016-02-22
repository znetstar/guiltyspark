'use strict';

const plugin = {
	name: 'output',
	modules: [
		'native-dns'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		app.on('classify', function () {
			app.classifier.addDocument('resolve qqq', 'dns.resolve');
			app.classifier.addDocument("what's the ip of qqq?", 'dns.resolve');
		});

		app.on('dns.resolve', function (args, context, callback) {
			args = app.strip_args()
			let question = dns.Question({
				name: 'www.google.com',
				type: 'A',
			})
		});
	}
}

module.exports = plugin;