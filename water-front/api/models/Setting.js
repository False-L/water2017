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

SettingModel.exportToGlobal = function (){
  var promise = new Promise(function(resolve,reject){
    SettingModel.findAll()
    .then(res=>{
      res = JSON.stringify(res)
      res = JSON.parse(res)
      return res 
    })
    .then(rawSettings=>{
      let handledSettings = {}
      if(rawSettings&&rawSettings.length>0){
        for (var i in rawSettings) {
          var item = rawSettings[i]
          handledSettings[item.key] = item.value;
        }
      }
      resolve(handledSettings)
    }).catch(err=>{
      reject(err)
    })
  })
  return promise 
}
SettingModel.afterUpdate = function(updatedRecord, cb) {
  SettingModel.exportToGlobal()
    .then(function (settings) {
        H.settings = settings;
    })
    .catch(function (err) {
        // sails.log.error(err);
    });
  
    // if(ipm2.rpc.msgProcess){
    //   // sails.log.silly('try send message to process(h.acfun.tv.front) - setting');
    //   ipm2.rpc.msgProcess({name:"h.acfun.tv.front", msg:{type:"h:update:setting"}}, function (err, res) {
    //     if(err){
    //         //sails.log.error(err);
    //     }
    //   });
    // }
  cb();
}

module.exports = SettingModel