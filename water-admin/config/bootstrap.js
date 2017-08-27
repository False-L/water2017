var redis = require("redis")

const SettingModel = require('../api/models/Setting.js')
const development = require('../config/env/development.js')


module.exports =  function bootstrap () {
    // console.log('bootstrap')
    global.H = {
        settings:{
        }
    }
    // ctx.state ={
    //     H:{
    //         settings:{
    //         }
    //     }
    // }
    // Redis 初始化
    client = redis.createClient( development.redisServer.port, development.redisServer.host)
    client.select(development.redisServer.database, async function(){
        global.redis = client
        //配置与缓存初次同步
        H.settings = await syncSetting()
    })
    // await next()
}
// 同步配置
async function syncSetting() {
    let settings = await SettingModel.findAll()
    settings = JSON.stringify(settings)
    settings = JSON.parse(settings)
    let results = {}
    for(var i in settings){
        var item = settings[i]
        results[item.key] = item.value
    }
    return results
}

// 同步过滤器
async function syncFilter() {
    await sails.models.filter.exportToGlobal()
        .fail(function (err) {
            sails.log.error(err);
        });
}