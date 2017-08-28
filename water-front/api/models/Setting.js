/**
 * Setting
 *
 * @module      :: Model
 * @description :: 系统配置
 */

const Sequelize = require('sequelize')

const sequelize = require('../../utils/dbpool.js')

sequelize.define('setting',{
  key:{
    type:Sequelize.STRING,
    primaryKey: true
  },
  value:Sequelize.STRING,
  name:{
    type:Sequelize.STRING
  },
  description:{
    type:Sequelize.STRING
  }
},{      
  freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
  tableName: 'setting',       
  timestamps: false     
})
var SettingModel = sequelize.models.setting

SettingModel.exportToGlobal = async function (){
    let res = await SettingModel.findAll()
    res = JSON.stringify(res)
    rawSettings = JSON.parse(res)

    let handledSettings = {};
    if(rawSettings&&rawSettings.length>0){
      for (var i in rawSettings) {
        var item = rawSettings[i];
        handledSettings[item.key] = item.value;
      }
    }
    // console.log(rawSettings)
    return handledSettings
}



module.exports = SettingModel