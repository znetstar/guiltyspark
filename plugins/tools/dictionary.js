'use strict';

const plugin = {
	name: 'dictionary',
	modules: [
		'wordnet'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		app.on('classify', function () {
			app.classifier.addDocument('define qqq', 'dict.define');
		});

		app.on('dict.define', function (args, context, callback) {
			args = app.strip_args(args, ['define']);
			wordnet.lookup(args.join(' '), (err, res) => {
				let gloss = (res || []).map((def) => { return def.glossary }).filter(Boolean);
				context.push( gloss.length ? (gloss.length > 1 ? gloss : gloss[0]) : `Can't find a definition for ${args.join(' ')}` );
				callback(err, context);
			});
		});
	}
}

module.exports = plugin;