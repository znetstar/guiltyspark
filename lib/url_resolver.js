'use strict';
const URL = require('url');
const qs = require('qs');
const EventEmitter = require('events').EventEmitter;

const plugin = {
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		app.drivers = new EventEmitter();
		app.resolve_url = (url) => {
			url = URL.parse(url);
			if (url.query) {
				url.query = qs.parse(url.query);
			}
			return url;
		};
	}
}

module.exports = plugin;