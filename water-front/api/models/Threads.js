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
    return  new Promise(function(resolve,reject){
    // 页数
    page = Math.ceil(page)
    let threads = ThreadsModel.findAll({
       where:{
            forum: forumId, 
            parent: 0 
       },
       order:[['updatedAt', 'DESC']],
       offset:(page-1)*20,
       limit:20
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
                    resolve(result)
                }).catch(err=>{
                    reject(err)
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
    return new Promise(function(resolve,reject){
         // 页数
        page = Math.ceil(page)

        ThreadsModel.findAll({
            where:{parent:threadsId},
            order:'updatedAt ASC',
            offset:(page-1)*20,
            limit:20
        }).then(threads=>{
            resolve(threads)
        }).catch(err=>{
            reject(err)
        })
    })
   
}
ThreadsModel.uploadAttachment = function (uploadError, uploadedFiles) {
    return new Promise(function(resolve,reject){
        if (uploadError) {
            reject(uploadError)
            return this
        }
        // 0. 如果没有上传文件则直接pass
        if (!uploadedFiles || uploadedFiles.length == 0) {
            resolve({image: '', thumb: ''});
            return this
        }
        if (H.settings.allowUpload && H.settings.allowUpload == 'false'){
            reject('系统暂时禁止了上传图片，请取消附件再重新发串。');
            return this
        }
        var uploadedFile = uploadedFiles[0]
        fs.readFile(uploadedFile.fd, function (readFileError, uploadedFileBuffer) {

        })
    })
}

module.exports = ThreadsModel