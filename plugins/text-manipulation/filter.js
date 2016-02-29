'use strict';

const plugin = {
	name: 'wildcard',
	modules: [
		'minimatch'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		app.on('classify', function () {
			app.classifier.addDocument('filter qqq', 'filter.wildcard');
		});

		app.filter_wildcard = (arr, str) => {
			return arr.filter((path) => {
				return path.split(require('path').sep).some((comp) => {
					return minimatch(comp, str)
				});
			});
		};

		app.on('filter.wildcard', function (args, context, callback) {
			args = app.strip_args(args, [ 'filter' ])
			let results = app.filter_wildcard(context.slice(0)[0], args[0]);
			context.push(results);
			callback(null, context);
		});

	}
}

module.exports = plugin;