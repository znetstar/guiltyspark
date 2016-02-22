const temp = require('temp');


const plugin = {
	init: function (done) { var app = this;
		temp.track();

		done();
	},
	attach: function (options) { var app = this;
		app.temp = temp;
		app.on('temp.mkdir', function (options, callback) {
			temp.mkdir((options.prefix || app.unique_id()), callback);
		});

		app.on('temp.open', function (options, callback) {
			temp.open(options, callback);
		});

		app.on('temp.writeStream', function (options, callback) {	
			callback(null, temp.createWriteStream());
		});

	},
	detach: function () {
		temp.cleanup();
	}
}

module.exports = plugin;