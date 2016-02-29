'use strict';

const dnode = require('dnode');

const plugin = {
	name: 'rpc',
	init: function (done) { var app = this;
		app.rpc_io = app.io.of('/rpc');

		app.rpc_io.use((socket, next) => {
			socket.on('interpret', (command) => {
				app.interpret(command, (error ,result) => {
					if (result) socket.emit('response', result, command);
					else socket.emit('error', error.message, command);
				})
			});
			next();
		});
		done();
	},
	attach: function (options) { var app = this;
		var port = parseInt(options.port || process.env.RPC_PORT || 4343);
	
		app.on('classify', function () {
			app.classifier.addDocument('remotely on qqq', '$rpc.interpret');
			app.classifier.addDocument('login to qqq', '$rpc.interpret');
			app.classifier.addDocument('on server qqq', '$rpc.interpret');
			app.classifier.addDocument('on machine qqq', '$rpc.interpret');
		});

		app.on('$rpc.interpret', (args, statements, callback) => {
			args = app.strip_args(args, [
				'on',
				'using',
				'remotely',
				'server',
				'login',
				'to',
				'machine'
			]);
			
			var uri = require('url').parse(args[0]);
			const handler = ($343) => {
				let command = statements.slice(0).join(' and ');
				$343.interpret(command, callback);
			};

			if (uri.protocol === 'unix:')
				dnode.connect(uri.path, handler);
			else {
				var rpc_socket = (app.listeners(`rpc.${uri.protocol}`).legnth && app.listeners(`rpc.${uri.protocol}`)) || dnode.connect;
				if (uri.host && uri.port)
					rpc_socket(uri.port, uri.hostname, handler);
				else
					callback(new Error('invalid host or port'));
			}
		});

		app.rpc = dnode({
			interpret: (cmd, cb) => {
				app.log.debug(`[rpc]: running command: ${cmd}`);
				app.interpret(cmd, cb);
			}
		});

		app.rpc.listen(port);
	}
}

module.exports = plugin;