'use strict';

const plugin = {
	name: 'nlp',
	modules: [
		'natural'
	],
	init: function (done) { var app = this;
		app.emit('classify')
		done();
	},
	attach: function (options) { var app = this;
		app.classifier = new natural.BayesClassifier();

		app.on('repl.context', (context) => {
			context.natural = natural;
		});

		app.interpretor = (cmd) => { return app.classifier.classify(cmd); }
	}
}

module.exports = plugin;