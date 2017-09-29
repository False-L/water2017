var redis = require("redis")

const SettingModel = require('../api/models/Setting.js')
const development = require('../config/env/development.js')
const ForumModel = require('../api/models/Forum.js')
const FilterModel = require('../api/models/Filter.js')

module.exports =  function bootstrap () {
    
    // 将常用依赖导入全局
    global._ = require('lodash');
    global.Promise = require('bluebird');
    global.md5 = require('md5');
    global.ipm2 = require('pm2');
    // var pm2 = require('pm2');
    global.untility= require('../api/services/utility.js');
    // console.log('bootstrap')
    global.H = {
        settings:{
        }
    }
    // Redis 初始化
    client = redis.createClient( development.redisServer.port, development.redisServer.host)
    client.select(development.redisServer.database, async function(){
        global.redis = client;
        //配置与缓存初次同步
        console.log('bootstarp');
        syncSetting();
        FilterModel.exportToGlobal();
        ForumModel.initialize().then(res=>{
            console.log("同步成功");

            // PM2 进程间RPC通讯初始化
            if (process.send) {
                                
                // sails.log.info('使用了PM2 RPC进行通讯，完成连接后将会自动启动程序。');
                console.log('使用了PM2 RPC进行通讯，完成连接后将会自动启动程序。');
                process.on('message',function(message){
                    if(message && _.isObject(message)){
                        switch(message.type){
                                
                            case 'h:update:setting':
                                syncSetting();
                                break;
                                
                            case 'h:update:filter':
                                FilterModel.exportToGlobal();
                                break;
                                
                            case 'h:update:forum':
                                ForumModel.initialize();
                                break;
                                
                            case 'h:update:forum:topicCount':
                                if(message.forum){
                                    if(ForumModel.list[ForumModel.findForumById(message.forum)])
                                        ForumModel.list[ForumModel.findForumById(message.forum)]['topicCount']++;
                                    }
                                    break;
                                
                                }
                             }
                         });
                                
                    // cb();
                                
            } else {
                // sails.log.info('没有通过PM2启动程序，如果采用了多进程启动方式，那么数据缓存和配置可能不会同步生效。');
                console.log('没有通过PM2启动程序，如果采用了多进程启动方式，那么数据缓存和配置可能不会同步生效。')
                // cb();
            }
        }).catch(err=>{
            console.log(err)
            console.log("同步失败");
        })
    })
}
// 同步配置
function syncSetting() {
    SettingModel.exportToGlobal()
    .then(function(settings){
        // console.log('setting',settings)
        H.settings = settings 
    }).catch(err=>{
        console.log(err)
    })
}

// 同步过滤器
async function syncFilter() {
    FilterModel.exportToGlobal()
        .catch(function (err) {
           console.error(err);
        });
}