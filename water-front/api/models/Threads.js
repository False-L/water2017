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
   }).then(res=>{
       res = JSON.stringify(res)
       res = JSON.parse(res)
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
            order:[['updatedAt ASC']],
            offset:(page-1)*20,
            limit:20
        }).then(res=>{
            res = JSON.stringify(res)
            res = JSON.parse(res)
            return res
        })
        .then(threads=>{
            resolve(threads)
        }).catch(err=>{
            reject(err)
        })
    })
   
}
ThreadsModel.uploadAttachment = function (uploadedFile) {

        // 0. 如果没有上传文件则直接pass
        if (!uploadedFile || uploadedFile.length == 0) {
            console.log('111111')
            return Promise.resolve ({image: '', thumb: ''});
        }
        console.log('222222')
        if (H.settings.allowUpload && H.settings.allowUpload == 'false'){
            console.log('333333')
            return Promise.reject('系统暂时禁止了上传图片，请取消附件再重新发串。')
        }
        
        fs.readFileAsync(uploadedFile.path,"utf-8")
            .then(uploadedFileBuffer=>{
                // console.log('fs.readFileAsync')
                 // 0. 就绪,删除原文件
                 fs.unlink(uploadedFile.path)
                // 1. 初次检查文件类型是否合法
                // console.log('uploadedFile.name',uploadedFile.name)
                if (!/^.*?\.(jpg|jpeg|bmp|gif|png)$/g.test(uploadedFile.name.toLowerCase())) {
                    return Promise.reject('只能上传 jpg|jpeg|bmp|gif|png 类型的文件')
                }
                var imagemd5 = md5(uploadedFileBuffer)
                // 2. 检查是否被屏蔽
                
                if (FilterModel.test && FilterModel.test.imagemd5(imagemd5)) {
                    // console.log("imagemd5",FilterModel.test.imagemd5(imagemd5))
                    return Promise.reject('没有权限')
                }
                
                // 3. 准备好路径
                var now = new Date()
                var imageName = uploadedFile.name.toLowerCase()
                var remoteImagePath = '/c/Users/lin/Desktop/github/image/' + now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + '/' + imageName
                // var remoteThumbPath = '/Users/web/Desktop/thumb/' + now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + '/' + imageName
                    console.log('remoteImagePath',remoteImagePath)

                // var uploadedFileGm = gm(uploadedFileBuffer, imageName)
                //     .autoOrient()
                //     .noProfile();

                // 4. 已经确认是图片，上传原图到FTP
                FtpServices.ready()
                    .then(function(ftpClient){
                        //// 6.流程结束 上传到ftp后返回
                        ftpClient.mkdir(path.dirname(remoteImagePath), true)
                            .then(res=>{
                                ftpClient.put(uploadedFileBuffer, remoteImagePath)
                                    .then(res=>{                                                                                               
                                            console.log('流程结束')
                                            ftpClient.end()
                                            return Promise.resolve({image: remoteImagePath, thumb: ''})                        
                                        })
                                    })
                                    .catch(uploadImageError=>{
                                        ftpClient.end()
                                       return Promise.reject(uploadImageError)
                                    })
                            })
                            .catch(function (uploadImageError) {
                                return Promise.reject(uploadImageError)
                            })
            })
            .catch(readFileError=>{
                console.log('readFileError',readFileError)
                return Promise.reject(readFileError)
            })
}
ThreadsModel.checkParentThreads = function (parent) {
    
        if (!parent || parent == 0) {
            return Promise.resolve(null)
        }
        ThreadsModel.findOne({
            where:{id:parent}
        })
        .then(function (parentThreads) {
            
            if (!parentThreads) {
                return Promise.reject('回复的对象不存在')
            }
            
            if (parentThreads.lock) {
                return Promise.reject('主串已经被锁定')
            }  
            return Promise.resolve(parentThreads)
        })
        .catch(function (err) {
            return Promise.reject(err)
        })
}

ThreadsModel.handleParentThreads = function (parentThreads, newThreads) {
        if (!parentThreads) {
            return Promise.resolve(null);
           
        }
        var recentReply = parentThreads.recentReply
        if (!_.isArray(recentReply)) {
            recentReply = []
        }
        if (recentReply.length > 4) {
            recentReply.pop()
        }
        recentReply.unshift(newThreads.id)

        var map = {}
        map['recentReply'] = recentReply
        map['replyCount'] = Number(Number(parentThreads['replyCount']) + 1)

        if (parentThreads.sage || newThreads.sage) {
            map['updatedAt'] = parentThreads.updatedAt
        } else {
            map['updatedAt'] = new Date()
        }

        ThreadsModel.update({
            where:map
        },{
            id: parentThreads.id
        }).then(function () {
            Promise.resolve(null)
        }).catch(function (err) {
            Promise.reject(err)
        })
}

module.exports = ThreadsModel