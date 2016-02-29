'use strict';
const express = require('express');
const http = require('http');
const WebSocketServer = require('websocket').server;
const io = require('socket.io');

const plugin = {
	init: function (done) { var app = this;
		var port = parseInt(app.http_options.port || process.env.PORT || 3000);
		app.http.listen(port, () => {
			app.log.debug(`[web]: listening on ${port}`);
			done();
		});
	},
	attach: function (options) { var app = this;
		app.http_options = options;
		app.web = express();
		app.http = new http.createServer(app.web);
		app.io = io(app.http);

		app.web_socket_rpc = () => {
			app.ws = new WebSocketServer({ httpServer: app.http, autoAcceptConnections: false });
			app.ws.on('request', (connection) => {
				var socket = connection.accept();

				socket.on('message', (message) => {
					if (message.type === 'utf8') {
						message = message.utf8Data;
						app.interpret(message, (error, result) => {
							if (error) {
								socket.send(error.stack);
							} else {
								result = typeof(result) === 'string' ? result : (
									(result instanceof Buffer) ? 
										result : require('cson').stringify(result)
								);
								socket.send(result);
							}
						});
					}

				});
			});
		};
	},
	detach: function () {

	}
}

module.exports = plugin;