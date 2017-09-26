/**
 * recentReply
 *
 * @module      :: Model
 * @description :: 
 */

const Sequelize = require('sequelize')
const sequelize = require('../../utils/dbpool.js')

sequelize.define('recentreply',{
  id:{
    type:Sequelize.STRING,
    primaryKey: true
  },
  uid:{
    type:Sequelize.STRING,
  }
},{      
  freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
  tableName: 'recentreply',       
  timestamps: false     
})