var dnode = require('dnode');

var d = dnode.connect(3001);
d.on('remote', function ($343) {
    $343.interpret('echo hi and text 9175442895', function (e,s) {
      console.log(s); 
      d.end();
    });
});