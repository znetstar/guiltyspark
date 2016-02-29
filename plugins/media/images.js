'use strict';
var fs = require('fs');

const plugin = {
	name: 'images',
	modules: [
		'image-to-ascii'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		app.on('classify', function () {
		});

		const render_image = (buffer, callback) => {
			var path = app.temp.path({ suffix: 'png' });
			fs.writeFileSync(path, buffer);
			(global['image-to-ascii'])(path, callback);
		};

		app.on('render.image/png', render_image);
		app.on('render.image/jpeg', render_image);
	}
}

module.exports = plugin;