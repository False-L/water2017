/**
 * Setting
 *
 * @module      :: Model
 * @description :: 系统配置
 */

const Sequelize = require('sequelize')

const sequelize = require('../../utils/dbpool.js')

sequelize.define('setting',{
  key:Sequelize.STRING,
  value:Sequelize.STRING,
},{      
  freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
  tableName: 'setting',       
  timestamps: false     
})
var SettingModel = sequelize.models.setting

module.exports = SettingModel