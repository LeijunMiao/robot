process.env['DEBUG'] = 'server:*';
global.env = process.env.NODE_ENV || 'development';
var config = require('./config.json'),
  debug = {
    io: require('debug')('server:io'),
    app: require('debug')('server:app'),
    server: require('debug')('server:server'),
    config: require('debug')('server:config'),
    error: require('debug')('server:error')
  },

  http = require('http'),
  express = require('express'),
  app = express(),
  util = require('util'),
  socketio = require('socket.io'),
  // socketioWildcard = require('socket.io-wildcard'),
  server,
  // io,
  userArray = [],
  token = "qfefefedfwrfwefw4teryurtyewtwerwererererwe";
var async = require('async');
var api = require('./api');
var errorcode = require('../lib/errorcode');

webApi = require('./routes/api'),
  store = require('./store'); // cheap key-value stand-in for redis

// Splash Info
debug.config('');
debug.config('SocketIO4Net Sample Server\r\n');
debug.config('\tNodejs: %s', process.version);
debug.config('\tsocket.io: v%s', socketio.version);
debug.config('\tListening on port %d', config.web.port);
debug.config('');

// *******************************
// Configure Express
// *******************************
// app.configure('development', function () { // only in development
//   app.use(logErrors);
// });

app.configure(function () {
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.compress());
  app.use(express.methodOverride());
  // app.use(errorHandler);

  // serve static assets from these folder
  app.use('/scripts', express.static('scripts'));
  app.use('/content', express.static('content'));
  app.use('/app', express.static('app'));


  // basic usage logging
  app.use(function (req, res, next) {
    // console.log('%s %s', req.method, req.url);
    if (req.url.indexOf('/api') === 0) {
      store.incr('app.apiCount');
    }
    //watchBcast('log', { level: 5, zone: 'app', eventCode: 'request', message: 'url', data: { 'method': req.method, 'url': req.url, 'count': cnt } });
    next();
  });

});

//var socketio1 = io.listen(server);
server = http.createServer(app).listen(config.web.port, function () {
  console.log('listening on *:' + config.web.port);
});
//io = socketio.listen(server);
// io = socketioWildcard(socketio).listen(server);
var io = require('socket.io')(server);

// General Handlers
app.get('/api/:target', webApi.get);
app.get('/config', function (req, res) {
  res.send(config.clientConfiguration);
});
app.get('/', function (req, res) {
  store.incr('app.visits');
  res.sendfile(__dirname + '/index.html');
  // watchBcastAnalytics();
});

// *******************************
// socket.io handlers
// *******************************
io.on('connection', function (socket) { // initial connection from a client
  socket.on('userLogin', function (paraData) {  //用户登录（客户端与服务端（nodejs）服务连接入口） ， paraData 是客户登录时传过来的数据一个js对象
    var user = {};
    user.SocketId = socket.id;
    user.plc = paraData.plc;
    // user.UserName = paraData.UserName;
    user.Socket = socket;
    userArray[user.plc] = user;  //添加用户的登录
    console.log('用户登录成功: ', user.plc);
    socket.emit('userRes', { errcode: 0, errmsg: 'ok', plc: user.plc });
  });

  socket.on('clientBroadcast', function (message) {
    message.data.isError = false;
    var combinedMsg;
    try {
      if (message.event == 'switch_machine') {
        if (message.data.plc) {
          store.set(message.data.plc, message.data);
        }
        if (message.room) {
          combinedMsg = [message.room, message.event];
          socket.broadcast.to(message.room).emit(message.event, message.data); //emit to 'room' except this socket
        } else {
          combinedMsg = [message.event];
          socket.broadcast.emit(message.event, message.data); //emit to all sockets except this one
        }
      }
      else if (message.event == 'beyond') {
        if (message.data.plc) {
          store.set(message.data.plc, message.data);
        }
        if (message.data.type == 'close') {
          api.savePackagingBeyond({
            order: message.data.order,
            goodsBatch: message.data.batch,
            total: message.data.total,
          }, function (err, results) {
            var r;
            if (!err) {
              socket.broadcast.to(message.room).emit('switch_machine', message.data);
              userArray[message.data.plc].Socket.emit('beyond_message', {
                errcode: 0,
                errmsg: 'ok'
              });
            } else {
              if (err.errcode) r = err;
              else r = errorcode(err);
              userArray[message.data.plc].Socket.emit('beyond_message', r);
              // userArray[message.data.plc].Socket.emit('switch_machine', {
              //   plc: message.data.plc,
              //   key: 'switch_machine',
              //   code: 'fail',
              //   msg: 'close',
              //   error: r
              // }); //将消息推送到客户端
            }
          });
        }
        else {
          socket.broadcast.to(message.room).emit('switch_machine', message.data);
          userArray[message.data.plc].Socket.emit('beyond_message', {
            errcode: 0,
            errmsg: 'ok'
          });
        }
      }

    } catch (err) {
      debug.io('clientBroadcast error', message, err);
      store.incr('io.errors');
    }
  });
  socket.on('subscribe', function (room) {
    socket.join(room);
  });
  socket.on('unsubscribe', function (event) { socket.leave(event.room); });
  socket.on('disconnect', function () { // client-server connection is closed
    // store.decr('io.connection.' + key);
    for (var plc in userArray) {
      if (userArray[plc].SocketId == socket.id) {
        delete userArray[plc];
        console.log(plc + " disconnect", "client-server connection is closed");
        break;
      }
    }
  });
  socket.on('sendMsg', function (data) {  //发送消息给用户 data是通过(,net)后端发送过来的数据，经过此事件推送到客户端(用户)
    if (data.token == token) {
      if (data.plc != "0" && data.plc) { //推送给单个用户
        // for (var i = 0; i < userArray.length; i++) {
        if (userArray[data.plc]) {
          if (data.key == 'switch_machine') {
            if (data.iserror == 'True') {
              var runningError = store.get(data.plc + 'error');
              userArray[data.plc].Socket.broadcast.to('eventRoom').emit('msg_res', { plc: data.plc, data: runningError });
            }
            if (data.code == 'success' && data.msg == "close") {
              store.remove(data.plc);
              store.remove(data.plc + 'error');
            }
            userArray[data.plc].Socket.emit(data.key, data); //将消息推送到客户端
          }
          else if (!data.errcode) {
            var running = store.get(data.plc);
            async.auto({
              pk: function (cb_auto) {
                if (!running) {
                  return cb_auto(1001)
                }
                if (running.isQrcode) {
                  if (!data.packaging) return cb_auto(1002);
                  api.getPackaging({
                    packaging: data.packaging,
                    batch: running.batch
                  }, function (err, doc) {
                    if (err) return cb_auto(err);
                    // if (doc.goodsBatch != running.batch) {
                    //   return cb_auto(1004);
                    // }
                    doc.total = doc.quantity;
                    cb_auto(null, doc);
                  });
                } else {
                  cb_auto();
                }
              },
              save: ['pk', function (result, cb_auto) {
                var pk = result.pk || { goodsBatch: running.batch, total: data.quantity };

                if (!running.reverse) {
                  pk.outboundOrder = running.order;
                  api.savePackaging(pk, function (err, doc) {
                    pk.packingQty = 1;
                    if (err) return cb_auto(err, pk);
                    cb_auto(null, pk);
                  });
                } else {
                  pk.outboundOrder = null;
                  pk.order = running.order;
                  api.savePackagingReverse(pk, function (err, doc) {
                    pk.packingQty = 1;
                    if (err) return cb_auto(err, pk);
                    cb_auto(null, pk);
                  });
                }

              }]
            }, function (err, results) {
              var r;
              if (!err || (running.continue && err.errcode == 1005)) {
                r = {
                  errcode: 0,
                  errmsg: 'ok',
                  data: results.save
                };
                userArray[data.plc].Socket.broadcast.to('eventRoom').emit('msg_res', { plc: data.plc, data: r });
              } else {
                if (err.errcode) r = err;
                else r = errorcode(err);
                r.data = results.save;
                r.type = 'close';
                userArray[data.plc].Socket.broadcast.to('eventRoom').emit('switch_machine', {
                  plc: data.plc,
                  type: 'close',
                  order: running.order,
                  batch: running.batch,
                  isQrcode: running.isQrcode,
                  continue: running.continue,
                  reverse: running.reverse,
                  isError: true
                });
                store.set(data.plc + 'error', r);
                //console.log('close',data.plc);
              }
              
              //
              //console.log('error',data.plc,r);
              if (err != 1001) userArray[data.plc].Socket.emit(data.key, r); //将消息推送到客户端
            });
          }
          else {
            var running = store.get(data.plc);
            userArray[data.plc].Socket.broadcast.to('eventRoom').emit('switch_machine', {
              plc: data.plc,
              type: 'close',
              order: running.order,
              batch: running.batch,
              isQrcode: running.isQrcode,
              continue: running.continue,
              reverse: running.reverse,
              isError: true
            });
            store.set(data.plc + 'error', {
              errcode: 0,
              errmsg: data.errmsg
            });
            // userArray[data.plc].Socket.broadcast.to('eventRoom').emit('msg_res', {
            //   plc: data.plc, data: {
            //     errcode: 0,
            //     errmsg: data.errmsg
            //   }
            // });
            userArray[data.plc].Socket.emit(data.key, {
              errcode: data.errcode,
              errmsg: data.errmsg
            }); //将消息推送到客户端
          }
        }
        // }
      }
    } else {
      console.log('token Error!');
    }
  });
});
