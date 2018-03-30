var Sequelize = require('sequelize')
const Record = sequelize.define('record', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    value: Sequelize.STRING,
    createdAt: Sequelize.STRING,
    updatedAt: Sequelize.STRING
},{
    timestamps: false,
    freezeTableName: true
  });

exports.add = function (body) {
    Record.create({
        value: JSON.stringify(body),
        createdAt: new Date(Date.now()).toISOString(),
        updatedAt: new Date(Date.now()).toISOString()
    }).then(task => {
    })
};