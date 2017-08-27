const Sequelize = require('sequelize')
const development = require('../config/env/development.js')

var sequelize = new Sequelize(
    development.mysqlServer.database, 
    development.mysqlServer.user, 
    development.mysqlServer.password, 
    {
    host: development.mysqlServer.host,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
  
  });

  module.exports=sequelize