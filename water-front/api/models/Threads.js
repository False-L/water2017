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
ThreadsModel.uploadAttachment = function (uploadError, uploadedFiles) {
    return new Promise(function(resolve,reject){
        if (uploadError) {
            reject(uploadError)
            return 
        }
        // 0. 如果没有上传文件则直接pass
        if (!uploadedFiles || uploadedFiles.length == 0) {
            resolve({image: '', thumb: ''});
            return 
        }
        if (H.settings.allowUpload && H.settings.allowUpload == 'false'){
            reject('系统暂时禁止了上传图片，请取消附件再重新发串。');
            return 
        }
        
        fs.readFileAsync(uploadedFiles.path,"utf8").then(uploadedFile=>{

            // 0. 就绪,删除原文件
            fs.unlink(uploadedFile.path)
            // 1. 初次检查文件类型是否合法
            if (!/^.*?\.(jpg|jpeg|bmp|gif|png)$/g.test(uploadedFiles.name.toLowerCase())) {
                reject('只能上传 jpg|jpeg|bmp|gif|png 类型的文件')
                return this
            }
            if (readFileError) {
                reject(readFileError);
                return this
            }
            var imagemd5 = md5(uploadedFileBuffer)
            
            // 2. 检查是否被屏蔽
            if (FilterModel.test.imagemd5(imagemd5)) {
                reject('没有权限');
                return 
            }
            // 3. 准备好路径
            var now = new Date();
            var imageName = path.basename(uploadedFile.name.toLowerCase());
            var remoteImagePath = '/image/' + now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + '/' + imageName
            var remoteThumbPath = '/thumb/' + now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + '/' + imageName
            
            var uploadedFileGm = gm(uploadedFileBuffer, imageName)
                .autoOrient()
                .noProfile()

            uploadedFileGm.size(function (readFileSizeError, uploadedFileSize) {

                if (readFileSizeError) {
                    reject(readFileSizeError);
                    return 
                }
                // 4. 已经确认是图片，上传原图到FTP
                FtpServices.ready()
                    .then(function (ftpClient) {
                        // 尝试创建文件夹
                        ftpClient.mkdir(path.dirname(remoteImagePath), true)
                            .then(res=>{
                                ftpClient.put(uploadedFileBuffer, remoteImagePath)
                                    .then(res=>{
                                        // 5. resize图片
                                        if (uploadedFileSize.width > 250 || uploadedFileSize.height > 250) {
                                            uploadedFileGm = uploadedFileGm.resize(250, 250);
                                        }
                                        uploadedFileGm.toBuffer(function (thumbToBufferError, thumbBuffer) {
                                            if (thumbToBufferError) {
                                                ftpClient.end()
                                                reject(thumbToBufferError)
                                                return 
                                            }
                                            // 6.流程结束 上传到ftp后返回
                                            ftpClient.mkdir(path.dirname(remoteThumbPath), true).catch(err=>{
                                                ftpClient.put(thumbBuffer, remoteThumbPath)
                                                    .then(res=>{
                                                        ftpClient.end()
                                                        resolve({image: remoteImagePath, thumb: remoteThumbPath})
                                                    }).catch(uploadThumbError=>{ 
                                                        reject(uploadThumbError)
                                                    })
                                            })
                                        })
                                    }).catch(uploadImageError=>{
                                        ftpClient.end()
                                        reject(uploadImageError)
                                        return 
                                    })
                            })
                    })
                    .catch(err=>{
                        reject(uploadImageError)
                        return 
                    })
            })
        })
    })
}
ThreadsModel.checkParentThreads = function (parent) {
    var promise = new Promise(function(resolve,reject){
        if (!parent || parent == 0) {
            resolve(null)
            return 
        }
        ThreadsModel.findOne({
            where:{id:parent}
        })
        .then(function (parentThreads) {
            
            if (!parentThreads) {
                reject('回复的对象不存在')
                return 
            }
            
            if (parentThreads.lock) {
                reject('主串已经被锁定')
                return 
            }  
            resolve(parentThreads)
        })
        .catch(function (err) {
            reject(err)
        })
    })
    return promise
}

ThreadsModel.handleParentThreads = function (parentThreads, newThreads) {
    var promise = new Promise(function(resolve,reject){
        if (!parentThreads) {
            resolve(null);
            return 
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
            resolve(null)
        }).catch(function (err) {
            reject(err)
        })
    })
    return promise
}



module.exports = ThreadsModel