'use strict';

const plugin = {
	name: 'stats',
	modules: [
		'bytes',
		'public-ip',
		'internal-ip',
		'diskusage',
		'du',
		'stream-bandwidth',
		'request'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		options =  options || {};
		options.bandwidth = options.bandwidth || {};
		options.bandwidth.url = options.bandwidth.url || 'https://upload.wikimedia.org/wikipedia/commons/d/d9/CargoNet_El_14_on_Dovrebanen.jpg?download';
		app.on('classify', function () {
			app.classifier.addDocument('how much free space is on?', 'stats.diskusage');
			app.classifier.addDocument('how much available space is on?', 'stats.diskusage');
			app.classifier.addDocument('how much space is on?', 'stats.diskusage');
			app.classifier.addDocument('how much storage is on?', 'stats.diskusage');
			app.classifier.addDocument('how much memory is free?', 'stats.free_memory');
			app.classifier.addDocument('how much ram is free?', 'stats.free_memory');
			app.classifier.addDocument("what's my public ip address?", 'stats.public_ip');
			app.classifier.addDocument("what's my private ip address?", 'stats.private_ip');
			app.classifier.addDocument("what's the size of qqq?", 'stats.fileusage');
			app.classifier.addDocument('how much memory is on this qqq?', 'stats.memory');
			app.classifier.addDocument("what's the current bandwidth on this network?", 'stats.bandwidth');
		});

		app.on('stats.bandwidth', function (args, context, callback) {
			const Bandwidth = global['stream-bandwidth'];
			let bw = new Bandwidth();
			let nowhere = (require('fs')).createWriteStream('/dev/null')
			let req = request(options.bandwidth.url);

			var bytes_arr = [];
			bw.on('progress', (data) => {
				bytes_arr.push(data.bytes);
			});

			bw.on('done', () => {
				let avg = bytes_arr.reduce((a,b) => (a || 0)+(b || 0)) / bytes_arr.length;
				var bytes_per_second = bytes(avg);
				var str = `${bytes_per_second} per second`;
				context.push(str);
				callback(null, context);
			});

			req.pipe(bw).pipe(nowhere);
		});

		app.on('stats.free_memory', function (args, context, callback) {
			context.push(bytes(require('os').freemem()));
			callback(null, context);
		});

		app.on('stats.memory', function (args, context, callback) {
			context.push(bytes(require('os').totalmem()));
			callback(null, context);
		});

		app.on('stats.public_ip', function (args, context, callback) {
			global['public-ip'](function (err, ip) {
				context.push(ip)
				callback(null, context);
			});
		});

		app.on('stats.private_ip', function (args, context, callback) {
			let nets = require('os').networkInterfaces();
			nets = Object.keys(nets).map((inter) => { return { interface: inter, addresses: nets[inter].map((addr) => addr.address) } });
			context.push(nets);
			callback(null, context);
		});

		app.on('stats.diskusage', function (args, context, callback) {
			args = app.strip_args(args, ['is', 'on', 'how', 'much', 'space', 'free', 'available']);
			diskusage.check(args[0], function (err, info) {
				context.push(bytes(info.free));
				callback(null, context);
			});
		});

		app.on('stats.fileusage', function (args, context, callback) {
			args = app.strip_args(args, ['is', 'on', 'does', 'the', 'size', 'of', 'take', 'up', 'how', 'much', 'space', 'free', 'available']);
			var stat = require('fs').lstatSync(args[0]);
			if (stat.isDirectory()) {
				du(args[0], function (err, size) {
					context.push(bytes(size));
					callback(null, context);
				});
			} else {
				context.push(bytes(stat.size));
				callback(null, context);
			}
		});
	}
}

module.exports = plugin;