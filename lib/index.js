'use strict';
const App = require('broadway').App;
const ImageToAscii = require("image-to-ascii");

var app = new App()
global.app = app


process.on('uncaughtException', (error) => {
	(app.log || console).error(`[fatal]: ${error.stack}`)
	process.exit(1)
})

app.config.defaults(JSON.parse(require('fs').readFileSync(`${__dirname}/../config/default.json`)));

process.title = 'guiltyspark';

app.use(require('common'));

app.use(require('./url_resolver.js'), app.config.get('url_resolver'));
app.use(require('./plugins.js'), app.config.get('plugins'));
app.use(require('./temp.js'), app.config.get('temp'));
app.use(require('./repl.js'), app.config.get('repl'));
app.use(require('./fs.js'), app.config.get('fs'));
app.use(require('./interpreters.js'), app.config.get('interpreters'));
app.use(require('./web.js'), app.config.get('web'));
app.use(require('./rpc.js'), app.config.get('rpc'));

app.on('repl.context', (context) => {
	context.app = app;
});

app.on('cover art', (a,b, callback) => {
	ImageToAscii(`${__dirname}/../share/art/guiltyspark.png`, function(err, converted) {
		process.stdout.write("\x1Bc");
		process.stdout.write(converted)
		callback && callback(null, (b || []));
	});
});

app.on('classify', () => {
	app.classifier.addDocument('show cover art', 'cover art');
})

app.init((error) => {
	if (!error) {
		//app.emit('cover art');
		app.emit('classify');
		setTimeout(function () {
			app.classifier.train();
			app.Repl(app.interpret);
		}, 1000);
	} else {
		app.log.error(`[fatal]: ${error.stack}`);
		process.exit(1);
	}
})
