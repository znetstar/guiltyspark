'use strict';
const App = require('broadway').App;

var app = new App()
global.app = app


process.on('uncaughtException', (error) => {
	(app.log || console).error(`[fatal]: ${error.stack}`)
	process.exit(1)
})

app.config.defaults(JSON.parse(require('fs').readFileSync(`${__dirname}/../config/default.json`)));

app.use(require('./url_resolver.js'), app.config.get('url_resolver'));
app.use(require('./plugins.js'), app.config.get('plugins'));
app.use(require('./temp.js'), app.config.get('temp'));
app.use(require('./repl.js'), app.config.get('repl'));
app.use(require('./fs.js'), app.config.get('fs'));
app.use(require('./interpreters.js'), app.config.get('interpreters'));
app.use(require('./web.js'), app.config.get('web'));

app.on('repl.context', (context) => {
	context.app = app;
});

app.init((error) => {
	if (!error) {
		app.log.info('started guilty spark');
		app.emit('classify');
		setTimeout(function () {
			app.classifier.train();
			app.Repl(app.interpret);
		}, 1000);
	} else {

	}
})
