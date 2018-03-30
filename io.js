var store = require('./store');
module.exports = function (app, server) {
    var io = require('socket.io')(server);
    var plcs = [];
    var consoles = [];
    var coms = [];
    io.on('connection', function (socket) {

        //控制台 登陆
        socket.on('userLogin', function (paraData) {
            var user = {};
            user.console = paraData.console;
            consoles[user.console] = user;
            console.log('后台登录成功: ', user.console);
            user.SocketId = socket.id;
            user.Socket = socket;
            //todo 保存到数据库
            socket.emit('userRes', {
                errcode: 0,
                errmsg: 'ok',
                console: user.console
            });
        });
        //plc 登陆
        socket.on('plcLogin', function (paraData) {
            var user = {};
            user.machineId = paraData.machineId;
            plcs[user.machineId] = user;
            console.log('PLC登录成功: ', user.machineId);
            user.SocketId = socket.id;
            user.Socket = socket;
            //todo 保存到数据库
            socket.emit('userRes', {
                errcode: 0,
                errmsg: 'ok',
                machineId: user.machineId
            });
            socket.broadcast.emit('broadcast', user.machineId + '上线！');
        });

        socket.on('comLogin', function (paraData) {
            var com = {};
            //user.machineId = paraData.machineId;
            com.SocketId = socket.id;
            com.Socket = socket;
            coms[com.SocketId] = com;
            //todo 保存到数据库
            for (var c in consoles) {
                consoles[c].Socket.emit('broadcast', '空气大师上线！');
            }
        });

        //接收PLC脉搏
        socket.on('pulse', function (data) {
            for (var plc in plcs) {
                if (plcs[plc].SocketId == socket.id) {
                    data.machineId = plcs[plc].machineId
                    //todo 保存到数据库
                    for (var key in consoles) {
                        consoles[key].Socket.emit('pulse', data); //给控制台发送脉搏
                    }
                }
            }

        });
        socket.on('air', function (data) {
            if(Object.keys(coms).length === 0) {
                for (var key in consoles) {
                    consoles[key].Socket.emit('broadcast', '空气大师离线'); 
                }
                return;
            }
            for (var com in coms) {
                coms[com].Socket.emit('comData'); 
            }
        });

        //接收控制台指令
        socket.on('action', function (data) {
            //todo 保存到数据库
            if (plcs[data.machineId]) plcs[data.machineId].Socket.emit('action', data); //给PLC发送指令
        });
        var recode = require('./app/controllers/record');
        socket.on('readSensor', function (data) {
            //todo 保存到数据库
            if(data)recode.add(data);
            for (var key in consoles) {
                consoles[key].Socket.emit('readSensor', data); //给控制台发送脉搏
            }
        });

        socket.on('disconnect', function () {
            for (var plc in plcs) {
                if (plcs[plc].SocketId == socket.id) {
                    delete plcs[plc];
                    socket.broadcast.emit('broadcast', plc + '下线！');
                    console.log(plc + " disconnect", "client-server connection is closed");
                    break;
                }

            }
            for (var c in consoles) {
                if (consoles[c].SocketId == socket.id) {
                    delete consoles[c];
                    console.log(c + " disconnect", "client-server connection is closed");
                    break;
                }
            }
            if (coms[socket.id]) {
                delete coms[socket.id];
                for (var c in consoles) {
                    consoles[c].Socket.emit('broadcast', '空气大师下线！');
                }
            }
        });
    });
};