global.env = process.env.NODE_ENV || 'development';

global.config = require('./config/config');
var port = config.port || 3001;

var debug = {
    io: require('debug')('server:io'),
    app: require('debug')('server:app'),
    server: require('debug')('server:server'),
    config: require('debug')('server:config'),
    error: require('debug')('server:error')
};


var socketio = require('socket.io');


// Splash Info debug.config
console.log('');
console.log('Socket Server\r\n');
console.log('\tNodejs: %s', process.version);
// console.log('\tsocket.io: v%s', socketio.version);
console.log('\tListening on port %d', port);
console.log('');

// *******************************
// Configure Express
// *******************************
var http = require('http');
var express = require('express');
var app = express();


console.log(app.get('env'), __dirname);
app.use(express.favicon());
// app.use(express.bodyParser());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.compress());
app.use(express.methodOverride());

app.use(express.static(__dirname+ '/src'));
var swig = require('swig');
var cons = require('consolidate');
swig.setDefaults({
    varControls: ['{=', '=}']
  });
  app.engine('html', cons.swig);
  app.engine('ejs', cons.ejs);
  app.set('views', __dirname + '/src/views');
  app.set('view engine', 'html');
// serve static assets from these folder
// app.use('/scripts', express.static('scripts'));
// app.use('/content', express.static('content'));
// app.use('/app', express.static('app'));

// basic usage logging
// app.use(function (req, res, next) {
//     if (req.url.indexOf('/api') === 0) {
//         store.incr('app.apiCount');
//     }
//     next();
// });
var store = require('./store');
var server = http.createServer(app).listen(port, function () {
    console.log('listening on *:' + port);
});

require('./io')(app,server);

app.get('/', function (req, res) {
    store.incr('console.visits');
    res.render('console',{server: config.server});;
});

app.get('/plc', function (req, res) {
    store.incr('robot.visits');
    res.render('robot',{server: config.server});;
    // res.sendfile(__dirname + '/src/robot.html',{env: app.get('env')});
});

app.use(express.static(__dirname + '/src'));
