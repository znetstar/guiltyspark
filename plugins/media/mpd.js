'use strict';

const plugin = {
	name: 'mpd',
	modules: [
		'mpd'
	],
	init: function (done) { var app = this;
		app.mpd = mpd.connect(app.mpd_options);
		app.mpd.on('ready', function() {
			done();
		});
	},
	attach: function (options) { var app = this;
		app.mpd_options = options || {
			host: 'localhost',
			port: 6600
		};

		app.mpd_cmd = mpd.cmd;

		app.on('classify', function () {
			app.classifier.addDocument('play music', 'mpd.play');
			app.classifier.addDocument('pause music', 'mpd.pause');

			app.classifier.addDocument('stop music', 'mpd.stop');
			app.classifier.addDocument('turn the volume up', 'mpd.volume.up');
			app.classifier.addDocument('louder', 'mpd.volume.up');
			app.classifier.addDocument('blast it!', 'mpd.volume.max');
			app.classifier.addDocument('turn the volume down', 'mpd.volume.down');
			app.classifier.addDocument('quieter', 'mpd.volume.down');

			app.classifier.addDocument('set the volume to', 'mpd.volume.set');

			app.classifier.addDocument("what's the status of the music player?", 'mpd.status');

			app.classifier.addDocument("how loud is the music player?", 'mpd.volume.get');
			app.classifier.addDocument("what's the volume of the music player?", 'mpd.volume.get');

			app.classifier.addDocument("repeat this song", 'mpd.repeat');

			app.classifier.addDocument("next song", 'mpd.next');
			app.classifier.addDocument("previous song", 'mpd.previous');
			app.classifier.addDocument("last song", 'mpd.previous');

		});


		const mpd_volume = (callback) => {
			app.mpd.sendCommand(app.mpd_cmd('status', []), (error, msg) => {
				callback(error, parseFloat(msg && msg.split('volume: ').pop().split("\n").shift().trim()));
			});
		};

		app.on('mpd.volume.get', (args, context, callback) => {
			mpd_volume((vol) => { 
				context.push(`${vol}%`);
				callback(error, context);
			});
		});

		app.on('mpd.volume.max', (args, context, callback) => {
			app.async.waterfall([
				($next) => {
					app.mpd.sendCommand(app.mpd_cmd('setvol', [ 100 ]), (err, msg) => {
						$next(null, `Blasting your music!`);
					});
				} 
			], (err, result) => {
				result && context.push(result);
				callback(err, context);
			});
		});

		app.on('mpd.volume.set', (args, context, callback) => {
			args = app.strip_args(args, "set the volume to".split(' '));

			app.async.waterfall([
				($next) => {
					let vol = parseFloat(args[0]);

					app.mpd.sendCommand(app.mpd_cmd('setvol', [ vol ]), (err, msg) => {
						$next(null, `Volume is currently set to ${vol}%`);
					});
				} 
			], (err, result) => {
				result && context.push(result);
				callback(err, context);
			});
		});


		app.on('mpd.volume.up', (args, context, callback) => {
			app.async.waterfall([
				mpd_volume,
				(vol, $next) => {
					vol = vol < 100 ? (vol + 5) : vol;

					app.mpd.sendCommand(app.mpd_cmd('setvol', [ vol ]), (err, msg) => {
						$next(null, `Volume is currently set to ${vol}%`);
					});
				} 
			], (err, result) => {
				result && context.push(result);
				callback(err, context);
			});
		});

		app.on('mpd.volume.down', (args, context, callback) => {
			app.async.waterfall([
				mpd_volume,
				(vol, $next) => {
					vol = vol > 0 ? (vol - 5) : vol;

					app.mpd.sendCommand(app.mpd_cmd('setvol', [ vol ]), (err, msg) => {
						$next(null, `Volume is currently set to ${vol}%`);
					});
				} 
			], (err, result) => {
				result && context.push(result);
				callback(err, context);
			});
		});


		app.on('mpd.status', (args, context, callback) => {
			args = app.strip_args(args, "what's the status of the music player ?".split(' '));

			app.mpd.sendCommand(app.mpd_cmd('status', []), (error, msg) => {
				context.push(msg);
				callback(error, context);
			});
		});


		app.on('mpd.play', (args, context, callback) => {
			args = app.strip_args(args, [
				'play', 'music'
			]);

			app.mpd.sendCommand(app.mpd_cmd('play', []), (error, msg) => {
				context.push((msg || 'Playing music'));
				callback(error, context);
			});
		});

		app.on('mpd.pause', (args, context, callback) => {
			args = app.strip_args(args, [
				'pause', 'music'
			]);

			app.mpd.sendCommand(app.mpd_cmd('pause', []), (error, msg) => {
				context.push((msg || 'Pausing music'));
				callback(error, context);
			});
		});

		app.on('mpd.next', (args, context, callback) => {
			app.mpd.sendCommand(app.mpd_cmd('next', []), (error, msg) => {
				context.push('Playing the next song');
				callback(error, context);
			});
		});

		app.on('mpd.previous', (args, context, callback) => {
			app.mpd.sendCommand(app.mpd_cmd('previous', []), (error, msg) => {
				context.push('Playing the last song');
				callback(error, context);
			});
		});

		app.on('mpd.stop', (args, context, callback) => {
			app.mpd.sendCommand(app.mpd_cmd('stop', []), (error, msg) => {
				context.push('Stopping all music');
				callback(error, context);
			});
		});
	}
}

module.exports = plugin;