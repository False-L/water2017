/**
 * Threads.js
 *
 * @description :: 贴子
 */
const Promise = require('bluebird')
const Sequelize = require('sequelize')
fs = Promise.promisifyAll(require("fs")),
path = require('path'),
gm = require('gm').subClass({ imageMagick: true })

const FtpServices = require('../services/Ftp.js')
const sequelize = require('../../utils/dbpool.js')
const FilterModel = require('./Filter.js')
const CacheSerives = require('../services/Cache.js')

sequelize.define('threads',{
    uid:{
       type:Sequelize.STRING,

    },
    name:{
        type:Sequelize.STRING,
        //is:/^[a-z]+$/i,
    },
    email:{
        type:Sequelize.STRING,
        isEmail: true
    },
    title:{
        type:Sequelize.STRING,
    },
    content: Sequelize.TEXT,
    image: Sequelize.STRING,
    thumb: Sequelize.STRING,
    lock: Sequelize.BOOLEAN,
    sage: Sequelize.BOOLEAN,
    ip: {
        type:Sequelize.STRING,
        isIP:true
    },
    forum: Sequelize.STRING,
    parent: Sequelize.STRING,
    replyCount:{
        type:Sequelize.BIGINT,
        defaultValue:0
    },
    recentReply:{
        type:Sequelize.TEXT,
        defaultValue:''
    }
},{      
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
    tableName: 'threads',       
    timestamps: true,
})

var ThreadsModel = sequelize.models.threads

ThreadsModel.list = function (forumId, page) {
    return  new Promise(function(resolve,reject){
    // 页数
    page = Math.ceil(page)
    let threads = ThreadsModel.findAll({
       where:{
            forum: forumId, 
            parent: 0 
       },
       order:[['updatedAt', 'DESC']],
       offset:(page-1)*10,
       limit:10
   }).then(res=>{
    //    console.log(res)
       res = JSON.stringify(res)
       res = JSON.parse(res)
    //    console.log(res)
       return res
   })
   .then(threads=>{
        var result = {}
        result.threads = threads
        result.replys = {}
        var replyIds = []
        for( var i in threads){
            var item = threads[i]
            if (item.recentReply && item.recentReply.length > 0) {
                console.log("recentReply",item.recentReply)

                replyIds = replyIds.concat(item.recentReply.split(","));
            }
        }
        if (replyIds && replyIds.length > 0) {
            
            // 将所有id转为字符串
            for (var i in replyIds) {
                replyIds[i] = replyIds[i].toString();
            }
            ThreadsModel.findAll({
                where:{
                    id: replyIds
                }
            }).then(res=>{
                res = JSON.stringify(res)
                res = JSON.parse(res)
             //    console.log(res)
                return res
            })
            .then(replys=>{
                    for (var i in replys) {
                        result.replys['t' + replys[i].id] = replys[i];
                    }
                    return resolve(result)
                }).catch(err=>{
                  return  reject(err)
                })
        } else {
            resolve(result)            
        }
    })
   })
}
/**
 * 获取回复列表
 * @param {int} threadsId 贴子ID
 * @param {int} page=1 页数
 */
ThreadsModel.getReply = function (threadsId, page){
         // 页数
        page = Math.ceil(page)

        var promise = new Promise(function(resolve,reject){
            ThreadsModel.findAll({
                where:{parent:threadsId},
                order:[['updatedAt','ASC']],
                offset:(page-1)*20,
                limit:20
            }).then(res=>{
                res = JSON.stringify(res);
                res = JSON.parse(res);
                return res
            })
            .then(threads=>{
                // console.log(threads)
               return resolve(threads);
            }).catch(err=>{
                return reject(err);
            })
    })
   return promise
}
ThreadsModel.uploadAttachment = function (uploadedFile) {

        // 0. 如果没有上传文件则直接pass
        if (!uploadedFile || uploadedFile.length == 0) {
            
            return Promise.resolve ({image: '', thumb: ''});
        }
        
        if (H.settings.allowUpload && H.settings.allowUpload == 'false'){
            
            return Promise.reject('系统暂时禁止了上传图片，请取消附件再重新发串。')
        }
        var promise = new Promise(function(resolve,reject){
            fs.readFileAsync(uploadedFile.path)
                .then(uploadedFileBuffer=>{
                    // 0. 就绪,删除原文件
                    fs.unlink(uploadedFile.path)
                    // 1. 初次检查文件类型是否合法
                    // console.log('uploadedFile.name',uploadedFile.name)
                    if (!/^.*?\.(jpg|jpeg|bmp|gif|png)$/g.test(uploadedFile.name.toLowerCase())) {
                        return reject('只能上传 jpg|jpeg|bmp|gif|png 类型的文件')
                    }
                    var imagemd5 = md5(uploadedFileBuffer)
                    // var imagemd5 = uploadedFileBuffer
                    // 2. 检查是否被屏蔽
                    
                    if (FilterModel.test && FilterModel.test.imagemd5(imagemd5)) {
                        // console.log("imagemd5",FilterModel.test.imagemd5(imagemd5))
                        return reject('没有权限')
                    }
                
                // 3. 准备好路径
                var now = new Date()
                var imageName = uploadedFile.name.toLowerCase()
                var remoteImagePath = '/image/' + now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + '/' + imageName
                // var remoteThumbPath = '/Users/web/Desktop/thumb/' + now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + '/' + imageName
                    console.log('remoteImagePath',remoteImagePath)

                // var uploadedFileGm = gm(uploadedFileBuffer, imageName)
                //     .autoOrient()
                //     .noProfile();

                // 4. 已经确认是图片，上传原图到FTP
                FtpServices.ready()
                    .then(function(ftpClient){
                        // 6.流程结束 上传到ftp后返回
                        ftpClient.mkdir(path.dirname(remoteImagePath), true)
                            .then(res=>{
                                    ftpClient.put(uploadedFileBuffer, remoteImagePath)
                                    .then(res=>{                                                                                               
                                            console.log('流程结束')
                                            ftpClient.end()
                                            return resolve({image: remoteImagePath, thumb: ''})                        
                                        }).catch(err=>{
                                            ftpClient.end();
                                            return reject(uploadImageError);
                                        })
                                })
                                .catch(uploadImageError=>{
                                        ftpClient.end()
                                       return reject(uploadImageError)
                                })
                            })
                            .catch(function (uploadImageError) {
                                return reject(uploadImageError)
                            })
            })
            .catch(readFileError=>{
                console.log('readFileError',readFileError)
                return reject(readFileError)
            })
        })
        return promise     
}
ThreadsModel.checkParentThreads = function (parent) {
    
    if (!parent || parent == 0) {
            return Promise.resolve(null)
    }
    var promise = new Promise(function(resolve,reject){

        ThreadsModel.findOne({
            where:{id:parent}
        })
        .then(res=>{
            res = JSON.stringify(res);
            res = JSON.parse(res);
            return res
        })
        .then(function (parentThreads) {
            console.log("parentThreads=====",parentThreads)
            if (!parentThreads) {
                return reject('回复的对象不存在')
            }
            
            if (parentThreads.lock) {
                return reject('主串已经被锁定')
            }  
            return resolve(parentThreads)
        })
        .catch(function (err) {
            reject(err)
        })
    })
    return promise
}

ThreadsModel.handleParentThreads = function (parentThreads, newThreads) {

        if (!parentThreads) {
            return Promise.resolve(null);
        }
        // console.log("parentThreads",parentThreads)
        var recentReply = parentThreads.recentReply;
        if(!recentReply){
            recentReply = [];
        }else{
            recentReply = recentReply.split(",");
        }
        // recentReply = recentReply.split(',');

        // if (!_.isArray(recentReply)) {
        //     recentReply = []
        // }
        if (recentReply.length > 4) {
            recentReply.pop()
        }
        
        recentReply.unshift(String(newThreads.id));

        recentReply = recentReply.toString();

        var map = {};
        map['recentReply'] = recentReply;
        map['replyCount'] = Number(Number(parentThreads['replyCount']) + 1);

        if (parentThreads.sage || newThreads.sage) {
            map['updatedAt'] = parentThreads.updatedAt
        } else {
            map['updatedAt'] = new Date()
        }
        var promise = new Promise(function(resolve,reject){
            ThreadsModel.update(map,{
               where:{ id: parentThreads.id}
            }).then(function (res) {
                return resolve(null)
            }).catch(function (err) {
               reject(err)
            })
         })
        return promise
}
ThreadsModel.afterCreate = function (newlyInsertedRecord, cb) {

    //通知清除缓存
    if (newlyInsertedRecord.parent != 0) {
        CacheSerives.update('threads:' + newlyInsertedRecord.parent);
    }
    CacheSerives.update('forum:' + newlyInsertedRecord.forum);
    
    if(newlyInsertedRecord.parent == 0){
        ThreadsModel.noticeUpdate(newlyInsertedRecord.forum);
    }
}
ThreadsModel.afterUpdate = function (updatedRecord, cb) {
    
    //通知清除缓存
    if (updatedRecord.parent != 0) {
        CacheSerives.update('threads:' + updatedRecord.parent);
    }
    if (updatedRecord.parent == 0) {
        CacheSerives.update('threads:' + updatedRecord.id);
    }
    CacheSerives.update('forum:' + updatedRecord.forum);
    
    cb();
    
},
ThreadsModel.afterDestroy = function (destroyedRecords, cb) {
    
    if (!Array.isArray(destroyedRecords)) {
        destroyedRecords = [destroyedRecords];
    }
    
    for (var i in destroyedRecords) {
    
        var destroyedRecord = destroyedRecords[i];
    
                //通知清除缓存
        if (destroyedRecord.parent != 0) {
            CacheSerives.update('threads:' + destroyedRecord.parent);
        }
        if (destroyedRecord.parent == 0) {
            CacheSerives.update('threads:' + destroyedRecord.id);
        }
        CacheSerives.update('forum:' + destroyedRecord.forum);
    }
    
    cb();

},
ThreadsModel.noticeUpdate = function(forum){
    if(ipm2.rpc.msgProcess){
        // sails.log.silly('try send message to process(h.acfun.tv.front) - threads++ ');
        console.log('try send message to process(h.acfun.tv.front) - threads++ ');
        ipm2.rpc.msgProcess({name:"h.acfun.tv.front", msg:{type:"h:update:forum:topicCount",forum:forum}}, function (err, res) {
            if(err){
                console.error(err);
            }
        });
    }
}

module.exports = ThreadsModel