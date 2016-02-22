'use strict';

const plugin = {
	name: 'shell',
	modules: [
		'shelljs'
	],
	init: function (done) { var app = this;
		done();
	},
	attach: function (options) { var app = this;
		app.on('classify', function () {
			// listing files
			app.classifier.addDocument('list files in qqq', 'shell.ls');
			// removing files
			app.classifier.addDocument('remove files from qqq', 'shell.rm');
			// making directories
			app.classifier.addDocument('make new directory qqq', 'shell.mkdir');
			// running commands
			app.classifier.addDocument('execute command qqq', 'shell.exec');
			app.classifier.addDocument('run command qqq', 'shell.exec');
			// copying files
			app.classifier.addDocument('copy file from qqq to qqq', 'shell.cp');
			// moving files 
			app.classifier.addDocument('move file from qqq to qqq', 'shell.mv');
			// finding files
			app.classifier.addDocument('find files in', 'shell.find');
			app.classifier.addDocument('find files', 'shell.find');
			// cat
			app.classifier.addDocument('read file qqq', 'shell.cat');
		});

		var shell_input = function (method, reject){
			reject = reject || [];
			return function (args, context, callback) {
				args = app.strip_args(args, reject);
				try {
					context.push(shelljs[method].apply(null, args));
					callback(null, context);
				} catch (e) {
					callback(e);
				}
			};
		};

		app.on('shell.ls', shell_input('ls', [ 'files', 'file', 'in' ]));
		app.on('shell.rm', shell_input('rm', [ 'remove', 'files', 'from' ]));
		app.on('shell.mkdir', shell_input('mkdir', [ 'make', 'new', 'directory' ]));
		app.on('shell.cp', shell_input('cp', [ 'copy', 'file', 'from', 'to' ]));
		app.on('shell.mv', shell_input('mv', [ 'move', 'file', 'from', 'to' ]));
		app.on('shell.find', shell_input('find', [ 'find', 'files', 'in' ]));
		app.on('shell.cat', shell_input('cat', [ "file", "files" ]));
		
		app.on('shell.exec', function (args, context, callback) {
			shelljs.exec(args.join(' '), { async: true, silent: true }, function (code, output) {
				if (code === 0){
					context.push(null, output);
					callback(null, context);
				}
				else
					callback(new Error(`Program exited with code ${code}:\n${output}`));
			});
		});
	}
}

module.exports = plugin;