'use strict';

const plugin = {
	name: 'freebase',
	modules: [
		''
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		app.on('classify', function () {
			app.classifier.addDocument("what does a qqq look like?", 'freebase.image');
		});

		app.on('http.request', function (args, context, callback) {
			args = app.strip_args(args, ['download']);

			request(args[0], (error, res, body) => {
				context.push(body);

				callback(error, context);
			});
		});
	}
}

module.exports = plugin;