'use strict';

const plugin = {
	name: 'sms',
	modules: [
		'twilio',
		'express'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		app.twilio = new twilio.RestClient(options.sid, options.token)
		
		app.on('classify', function () {
			app.classifier.addDocument('alert me via text', 'sms.send');
			app.classifier.addDocument('notify me via text', 'sms.send');
			app.classifier.addDocument('let me know via text', 'sms.send');
			app.classifier.addDocument('let me know through text', 'sms.send');
			app.classifier.addDocument('let me know using text', 'sms.send');
			app.classifier.addDocument('let me know on text', 'sms.send');

			app.classifier.addDocument('let me know when done', 'sms.send');
			app.classifier.addDocument('let me know when complete', 'sms.send');
			app.classifier.addDocument("tell me when it's done", 'sms.send');
			app.classifier.addDocument('text me at', 'sms.send');
		});

		app.on('sms.send', function (args, context, callback) {
			args = app.strip_args(args, [
				'let',
				'me',
				'know',
				'using',
				'via',
				'on',
				'through',
				'notify',
				'text',
				'alert',
				'at'
			]);
			if (args[0].indexOf('+') === -1) 
				args[0] = `+1${args[0]}`;

			let content = context.slice(-1)[0];
			if (typeof(content) === 'string' && options.send_content) {
				content = content.length < 140 ? content : `${content.substr(0, 135)}...`;
			} else {
				content = `Task is complete`;
			}	
			context.push(content);
			callback(null, context);
		});

		const reply = (to, frm, msg, callback) => {
			app.twilio.sms.messages.create({
				to: to,
				from: frm,
				body: msg
			}, (callback || () => {  }));
		};

		app.web.get('/api/sms', function (req, res, next) {
			app.interpret(req.query.Body, (error, result) => {
				if (error) {
					reply(req.query.From, req.query.To, error.stack);
				} else {
					result = typeof(result) === 'string' ? result : (
						(result instanceof Buffer) ? 
							result.toString('utf8') : app.default_render(result)
					);

					result = result.length < 140 ? result : `${result.substr(0, 135)}...`

					reply(req.query.From, req.query.To, result);
				}

				res.status(200).end('');
			});
		});
	}
}

module.exports = plugin;