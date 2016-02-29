'use strict';

const plugin = {
	name: 'screensaver',
	modules: [
		'shelljs'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		
		app.on('classify', function () {
			app.classifier.addDocument('turn on the screen', 'x.screen.on');
			app.classifier.addDocument('wake up', 'x.screen.on');
			app.classifier.addDocument('turn off the screen', 'x.screen.off');
			app.classifier.addDocument('lock this screen', 'gnome.screensaver.lock');
			app.classifier.addDocument('unlock this screen', 'gnome.screensaver.unlock');
		});

		app.on('x.screen.on', (args, context, callback) => {
			shelljs.exec('xset dpms force on', { async: true, silent: true }, (code, output) => {
				if (!code) 
					context.push(`The screen has been turned on`);
				else
					context.push(`Turning on the screen has failed`);
				callback(null, context)
			});
		});

		app.on('x.screen.off', (args, context, callback) => {
			shelljs.exec('xset dpms force off', { async: true, silent: true }, (code, output) => {
				if (!code) 
					context.push(`The screen has been turned off`);
				else
					context.push(`Turning off the screen has failed`);
				callback(null, context)
			});
		});

		app.on('gnome.screensaver.lock', (args, context, callback) => {
			shelljs.exec('gnome-screensaver-command -l', { async: true, silent: true }, (code, output) => {
				if (!code) 
					context.push(`The screen has been locked`);
				else
					context.push(`Failed to lock the screen`);
				callback(null, context)
			});
		});

		app.on('gnome.screensaver.unlock', (args, context, callback) => {
			shelljs.exec('gnome-screensaver-command -d', { async: true, silent: true }, (code, output) => {
				if (!code) 
					context.push(`The screen has been unlocked`);
				else
					context.push(`Failed to unlock the screen`);
				callback(null, context)
			});
		});
	}
}

module.exports = plugin;