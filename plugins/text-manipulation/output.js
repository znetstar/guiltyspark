'use strict';

const plugin = {
	name: 'output',
	modules: [
		'cson',
		'base32'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		app.on('classify', function () {
			app.classifier.addDocument('render as pretty json', 'prettyjson.stringify');
			app.classifier.addDocument('render as json', 'json.stringify');
			app.classifier.addDocument('render as cson', 'cson.stringify');
			app.classifier.addDocument('render as base64', 'base64.encode');
			app.classifier.addDocument('render as base32', 'base32.encode');
			app.classifier.addDocument('render as hex', 'hex.encode');
			app.classifier.addDocument('summarize', 'summarize');
		});

		app.on('prettyjson.stringify', function (args, context, callback) {
			context.push(
				JSON.stringify(context.slice(-1)[0], null, 4)
			);
			callback(null, context);
		});

		app.on('json.stringify', function (args, context, callback) {
			context.push(
				JSON.stringify(context.slice(-1)[0])
			);
			callback(null, context);
		});

		app.on('cson.stringify', function (args, context, callback) {
			context.push(
				cson.stringify(context.slice(-1)[0])
			);
			callback(null, context);
		});

		app.on('summarize', function (args, context, callback) {
			let last = context.slice(-1)[0];
			context.push(
				last ? 'Task completed successfully' : 'Task failed'
			);
			callback(null, context);
		});

		app.default_render = cson.stringify;

		const buffer_as = (encoding) => {
			return function (args, context, callback) {
				context.push(
					new Buffer(context.slice(-1)[0]).toString(encoding)
				);
				callback(null, context);
			};
		}

		app.on('base64.encode', buffer_as('base64'));
		app.on('hex.encode', buffer_as('hex'));
		app.on('utf8.encode', buffer_as('utf8'));
		app.on('base32.encode',  (args, ctx, cb) => { ctx.push(base32.encode(new Buffer(ctx.slice(-1)[0]))); cb(null, ctx);});
	}
}

module.exports = plugin;