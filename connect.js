
var Sequelize = require('sequelize');
global.sequelize = new Sequelize(config.db, config.username, config.pwd, config.mmsql);
