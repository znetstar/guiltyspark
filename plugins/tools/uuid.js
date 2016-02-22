'use strict';

const plugin = {
	name: 'output',
	modules: [
		'uuid'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		app.on('classify', function () {
			app.classifier.addDocument('create a uuid', 'uuid');
			app.classifier.addDocument('generate a uuid', 'uuid');
		});

		app.on('uuid', function (args, context, callback) {
			let arr = new Array(16);
			uuid.v4(null, arr, 0);

			context.push(
				Buffer(arr)
			);
			callback(null, context);
		});
	}
}

module.exports = plugin;