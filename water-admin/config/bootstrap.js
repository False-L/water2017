var redis = require("redis")

const SettingModel = require('../api/models/Setting.js')
const development = require('../config/env/development.js')
const ForumModel = require('../api/models/Forum.js')

module.exports =  function bootstrap () {
    
    // 将常用依赖导入全局
    global.Promise = require('bluebird')
    global._ = require('lodash')
    // console.log('bootstrap')
    global.H = {
        settings:{
        }
    }
    // Redis 初始化
    client = redis.createClient( development.redisServer.port, development.redisServer.host)
    client.select(development.redisServer.database, async function(){
        global.redis = client
        //配置与缓存初次同步
        // console.log('bootstarp')
        syncSetting()
        ForumModel.initialize().then(res=>{
            console.log("同步成功")
        }).catch(err=>{
            console.log("同步失败")
        })
    })


}
// 同步配置
function syncSetting() {
    SettingModel.exportToGlobal()
    .then(function(settings){
        // console.log(settings)
        H.settings = settings 
    }).catch(err=>{
        // console.log(err)
    })
}

// 同步过滤器
async function syncFilter() {
    await sails.models.filter.exportToGlobal()
        .fail(function (err) {
            sails.log.error(err);
        });
}