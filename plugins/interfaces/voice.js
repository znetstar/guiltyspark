'use strict';
const fs = require('fs');
const ui = require(`${process.cwd()}/node_modules/guiltyspark-ui`);


const plugin = {
	name: 'voice',
	modules: [
		'watson-developer-cloud',
		'event-stream',
		'shelljs'
	],
	init: function (done) { var app = this;
		app.web.use(ui());

		app.voice_io = app.io.of('/voice');
		
		app.voice_io.use((socket, next) => {
			socket.on('error', (err) => {
				app.log.error(`[voice -> socket]: ${err.stack}`);
			});
			var count = 0;
			socket.on('transcribe', function (blob){// blob = fs.readFileSync('/tmp/input.wav');
				let transcriber = app.speech_to_text().createRecognizeStream({ content_type: 'audio/l16; rate=44100' });
				app.log.debug(`[voice -> socket -> transcribe]: received blob`);
				var index = 0;
				transcriber.on('data', (transcription) => {
					console.log(count, index)
					if (++index > count) {
						let text = transcription.toString();
						app.log.debug(`[voice -> socket -> transcribe]: transcribed blob:\n${text}`);
						app.hash(transcription)
						app.interpret(text, (error, result) => {
							if (error) socket.emit('_error', ((error && error.message) || error), text);
							if (result) socket.emit('response', result, text);
						});
						index = 0;
						count++;
					}
				});
				transcriber.on('error', (err) => {
					socket.emit('error', (`An unknown error occured`));
				});
				app.log.debug(`[voice -> socket -> transcribe]: transcribing...`);
				transcriber.end(blob);
			});
			next();
		});

		done();
	},
	attach: function (options) { var app = this;
		options = options || {};
		//
		//	
		//});

		app.on('classify', function () {
			app.classifier.addDocument('test', 'test');
			app.classifier.addDocument('testing', 'test');
		});

		app.on('test', (a,r,c) => {
			r.push('test');
			c(null, r);
		});

		app.speech_to_text = () => require(`${app.npm_options.prefix}/node_modules/watson-developer-cloud`).speech_to_text(options.speech_to_text);
	}
}

module.exports = plugin;