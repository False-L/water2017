/**
 * Threads.js
 *
 * @description :: 贴子
 */
const Sequelize = require('sequelize')
var fs = require('fs'),
path = require('path'),
gm = require('gm').subClass({ imageMagick: true })
const Promise = require('bluebird')

const sequelize = require('../../utils/dbpool.js')

sequelize.define('threads',{
    uid:Sequelize.BIGINT,
    name:{
        type:Sequelize.STRING,
        //is:/^[a-z]+$/i,
    },
    email:{
        type:Sequelize.STRING,
        isEmail: true
    },
    title: Sequelize.STRING,
    content: Sequelize.STRING(1234),
    image: Sequelize.STRING,
    thumb: Sequelize.STRING,
    lock: Sequelize.BOOLEAN,
    sage: Sequelize.BOOLEAN,
    ip: {
        type:Sequelize.STRING,
        isIP:true
    },
    forum: Sequelize.STRING,
    parent: Sequelize.BIGINT,
    //updatedAt: new Date()
},{      
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
    tableName: 'threads',       
    timestamps: true,
})

var ThreadsModel = sequelize.models.threads

ThreadsModel.list = function (forumId, page) {
    var promise = new Promise()

    // 页数
    page = Math.ceil(page)
    let threads = ThreadsModel.findAll({
       where:{
            forum: forumId, 
            parent: 0 
       },
       order:'updatedAt DESC',
       offset:(page-1)*limit,
       limit:limit
   }).then(threads=>{
        var result = {}
        result.threads = threads
        result.replys = {}
        var replyIds = []
        for( var i in threads){
            var item = threads[i]
            if (item.recentReply && item.recentReply.length > 0) {
            replyIds = replyIds.concat(item.recentReply);
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
            }).then(replys=>{
                    for (var i in replys) {
                        result.replys['t' + replys[i].id] = replys[i];
                    }
                    promise.resolve(result)
                }).catch(err=>{
                    promise.reject(err)
                })
        } else {
            promise.resolve(result)            
        }
    return promise
   })
}
/**
 * 获取回复列表
 * @param {int} threadsId 贴子ID
 * @param {int} page=1 页数
 */
ThreadsModel.getReply = async function (threadsId, page){
    // 页数
    page = Math.ceil(page)
    let threads = await ThreadsModel.findAll({
        where:{parent:threadsId},
        order:'updatedAt ASC',
        offset:(page-1)*limit,
        limit:limit
    }).then(threads=>{
        return threads
    }).catch(err=>{
        return err
    })
}
ThreadsModel.uploadAttachment = async function (uploadError, uploadedFiles) {
    
    if (uploadError) {
        return 
    }
    // 0. 如果没有上传文件则直接pass
    if (!uploadedFiles || uploadedFiles.length == 0) {
        deferred.resolve({image: '', thumb: ''});
        return deferred.promise;
    }

}

module.exports = ThreadsModel