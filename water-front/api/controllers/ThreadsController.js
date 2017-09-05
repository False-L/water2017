/**
 * ThreadsController
 *
 * @module      :: Controller
 * @description    :: 贴子
 */

var gm = require('gm')
, os = require('os') 
, fs = require('fs')
, path = require('path')
, imageMagick = gm.subClass({ imageMagick: true })

const ForumModel = require('../models/Forum.js')
const ThreadsModel = require('../models/Threads.js')
const utility = require('../services/utility.js')
const CacheService = require('../services/Cache.js')

module.exports = {
    /**
     * 获取单个帖子列表
     */
    index : async function (ctx,next) {
        //ThreadsId 有效性
        var threadsId = Number(ctx.params.tid)
        if (!threadsId) {
            return res.forbidden('ID不合法');
        }
        //翻页
        var pageIndex = (ctx.query.page && ctx.query.page == 'last') ? 'last' : ( Number(ctx.query.page) || 1 )
        ctx.request.wantType = utility.checkWantType(ctx.params.format)
        ctx.cacheKey = 'threads:' + threadsId + ':' + pageIndex + ':' + ctx.request.wantType.suffix
        try{
            let cache = await CacheService.get(req.cacheKey)
            if(ctx.wantType.param == 'json'){
                // return sails.config.jsonp ? res.jsonp(JSON.parse(cache)) : res.json(JSON.parse(cache));
            } else if(ctx.wantType.param == 'xml'){
                // res.set('Content-Type','text/xml');
            }

            // res.send(200, cache);
        }catch(err){
            try{
                // 首先通过threadsID获得主串信息
                let threads = await ThreadsModel.findById(threadsId)
                console.log(threads)
                if (!threads) {
                    return 
                }
                var forum = ForumModel.findForumById(threads.forum) || {}
                let replyCount = await ThreadsModel.count({where:{parent: threadsId}})
                var pageCount = Math.ceil(replyCount / 20)
                pageCount = (!pageCount) ? 1 : pageCount
                let replys = await ThreadsModel.getReply(threadsId, (pageIndex == 'last') ? pageCount : pageIndex)
                var output = {
                    threads: threads,
                    replys: replys,
                    forum: forum,
                    page: {
                        title: 'No.' + threads.id,
                        size: pageCount,
                        page: pageIndex
                    },
                    code: 200,
                    success: true
                }
                if (forum) {
                    forum['createdAt'] = (forum['createdAt']) ? new Date(forum['createdAt']).getTime() : null;
                    forum['updatedAt'] = (forum['updatedAt']) ? new Date(forum['updatedAt']).getTime() : null;
                }
                if (threads) {
                    delete threads['ip'];
                    threads['createdAt'] = (threads['createdAt']) ? new Date(threads['createdAt']).getTime() : null;
                    threads['updatedAt'] = (threads['updatedAt']) ? new Date(threads['updatedAt']).getTime() : null;
                }
                for (var i in replys) {
                    if (replys[i]) {
                        delete replys[i]['ip'];
                        delete replys[i]['parent'];
                        delete replys[i]['recentReply'];
                        replys[i]['createdAt'] = (replys[i]['createdAt']) ? new Date(replys[i]['createdAt']).getTime() : null;
                        replys[i]['updatedAt'] = (replys[i]['updatedAt']) ? new Date(replys[i]['updatedAt']).getTime() : null;
                    }
                }
                return ctx.render('desktop/threads/index',output)
            }
            catch(err){
                return ctx.body = {
                    msg :'err'
                }
            }
        }
    },
    //创建
    create : async function (ctx,next) {
        var body = ctx.request.body || {}
        console.log('body',body)
        body = JSON.stringify(body)
        body = JSON.parse(body)
        let data = body.fields || {}
        console.log(data)
        if (ctx.method != 'POST') {
            return await next()
        }
        // Skipper临时解决方案
        // if (req._fileparser.form.bytesExpected > 4194304) {
        //     // return res.badRequest('文件大小不能超过4M (4,194,304 Byte)');
        //     // 
        // }
        
        const file = ctx.request.body.files.image;
        if( file.size && file.size > 4194304){
            return
            // return ctx.redirect('back')
        }
        console.log('file',file)
        const reader = fs.createReadStream(file.path);
        const stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
        reader.pipe(stream)
        //originalname 文件名称，path上传后文件的临时路径，mimetype文件类型
        // const {originalname, path, mimetype,size} = ctx.req.file
        try {
           let uploadedFilesPath = await ThreadsModel.uploadAttachment(err,file)
        }catch(err){

        }
    }
}