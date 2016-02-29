'use strict';

const plugin = {
	name: 'color',
	modules: [
		'chalk'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options = app.config.get('colors');

		app.style_output = (output) => {
			Object.keys(options).forEach((key) => {
				if (key === 'colors') return;
				options[key].forEach((str) => {
					output = output.replace(new RegExp(`\s${str}\s`, 'ig'), chalk[options.colors[key]](str))
				});
			});
			return output;
		};
	}
}

module.exports = plugin;