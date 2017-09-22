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
const FilterModel = require('../models/Filter.js')
const utility = require('../services/utility.js')
const CacheService = require('../services/Cache.js')

module.exports = {
    /**
     * 获取单个帖子列表
     */
    index : async  (ctx,next)=> {
        //ThreadsId 有效性
        var threadsId = Number(ctx.params.tid)
        if (!threadsId) {
            return ctx.forbidden('ID不合法');
        }
        //翻页
        var pageIndex = (ctx.query.page && ctx.query.page == 'last') ? 'last' : ( Number(ctx.query.page) || 1 )
        ctx.wantType = utility.checkWantType(ctx.params.format)
        ctx.cacheKey = 'threads:' + threadsId + ':' + pageIndex + ':' + ctx.wantType.suffix
        try{
            let cache = await CacheService.get(ctx.cacheKey)
            if(ctx.wantType.param == 'json'){
                // return sails.config.jsonp ? res.jsonp(JSON.parse(cache)) : res.json(JSON.parse(cache));
                return ctx.body = {
                    cache:JSON.parse(cache)
                }
            } else if(ctx.wantType.param == 'xml'){
                // res.set('Content-Type','text/xml');
            }

            // res.send(200, cache);
        }catch(err){
            try{
                // 首先通过threadsID获得主串信息
                let threads = await ThreadsModel.findById(threadsId)
                // console.log(threads)
                if (!threads) {
                    return ctx.notFound();
                }
                var forum = ForumModel.findForumById(threads.forum) || {}
                let replyCount = await ThreadsModel.count({where:{parent: threadsId}})
                var pageCount = Math.ceil(replyCount / 20)
                pageCount = (!pageCount) ? 1 : pageCount

                 // 获取回复信息
                let replys = await ThreadsModel.getReply(threadsId, (pageIndex == 'last') ? pageCount : pageIndex)
                console.log("replays========================",replys)
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
                return ctx.generateResult(output,{
                    desktopView: 'desktop/threads/index',
                    mobileView: 'mobile/threads/index'
                });
            }
            catch(err){
                console.log(err)
                return ctx.serverError(err);
            }
        }
    },
    //创建
    create : async function (ctx,next) {
        var body = ctx.request.body || {}
        // console.log('body',body)
        body = JSON.stringify(body)
        body = JSON.parse(body)
        let data = body.fields || {}
        console.log(data)
        if (ctx.method != 'POST') {
            return ctx.notFound();
        }

        const file = ctx.request.body.files.image

        if( file.size && file.size > 4194304){
            return
            // return ctx.redirect('back')
        }
        // console.log('file',file)

        try {
            let uploadedFilesPath = await ThreadsModel.uploadAttachment(file)

             console.log('uploadedFilesPath',uploadedFilesPath)
            if (uploadedFilesPath && uploadedFilesPath.image) {
                data.image = uploadedFilesPath.image
                data.thumb = uploadedFilesPath.image
            }
            
           let parentThreads = await ThreadsModel.checkParentThreads(ctx.params.tid)
            // console.log('parentThreads',parentThreads)
            // ip
            data.ip = ctx.ip || '0.0.0.0'

            // 饼干
            data.uid = ctx.session.userId;
            //  console.log('uid',data.uid)

            // 管理员回复
            if (data.isManager == 'true' && ctx.session.managerId) {
                data.color = (data.color) ? data.color : 'red';
                data.uid = '<font color="' + data.color + '">' + ctx.session.managerId + '</font>';
            }

            if (data.image && !data.content) {
                data.content = '无正文';
            } else if (!data.image && (!data.content || data.content.toString().trim().length < 1)) {
                return ctx.badRequest('正文至少1个字');
            }

            if (FilterModel.test.word(data.content) || FilterModel.test.word(data.name) || FilterModel.test.word(data.title)) {
                return ctx.badRequest('含有敏感词');
            }

            data.content = data.content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/ /g, "&nbsp;")
                .replace(/\'/g, "&#39;")
                .replace(/\"/g, "&quot;")
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")
                .replace(/\n/g, "<br>")
                .replace(/&gt;&gt;No\.(\d+)/g, "<font color=\"#789922\">>>No.$1</font>")
                .replace(/&gt;&gt;(\d+)/g, "<font color=\"#789922\">>>$1</font>")
                .replace(/&gt;(.*?)\<br\>/g, "<font color=\"#789922\">&gt;$1</font><br>");
        
            if (parentThreads && parentThreads.forum) {
                var forum = await ForumModel.findForumById(parentThreads.forum)
            } else if (ctx.params.forum) {
                var forum = await ForumModel.findForumByName(ctx.params.forum)
            } else {
                var forum = null
            }

            if (typeof data.email == 'string' && data.email.toLowerCase() == 'sage') {
                data.sage = true;
            }

            if (parentThreads && parentThreads.id) {
                data.parent = parentThreads.id
            }

            if (!forum) {
                return ctx.badRequest('版块不存在');
            }

            if (forum.lock) {
                return ctx.badRequest('版块已经被锁定');
            }

            if (ctx.session.lastPostAt && (new Date().getTime() - ctx.session.lastPostAt < forum.cooldown * 1000)) {
                if (!ctx.session.managerId) {
                    return ctx.badRequest('技能冷却中');
                }
            }
            let newThreads
            try{
                newThreads = await ThreadsModel
                .create({
                    uid: data.uid || '',
                    name: data.name || '',
                    email: data.email || '',
                    title: data.title || '',
                    content: data.content || '',
                    image: data.image || '',
                    thumb: data.thumb || '',
                    lock: false,
                    sage: data.sage || false,
                    ip: data.ip || '0.0.0.0',
                    forum: forum.id,
                    parent: data.parent || '0',
                    updatedAt: new Date()
                }).then(res=>{
                    res = JSON.stringify(res)
                    res = JSON.parse(res)
                    return res
                }).then(res=>{
                    console.log(res)
                    return res
                })
            }catch(err){
                console.log(err)
                return ctx.badRequest(err);
            }
            try{
                // 对父串进行处理
                await ThreadsModel.handleParentThreads(parentThreads, newThreads)
                // session CD时间更新
                ctx.session.lastPostAt = new Date().getTime()
                ctx.session.lastPostThreadsId = newThreads.id;

                return ctx.ok('成功',{threadsId:newThreads.id})
            }catch(err){
                // 事务回滚 删除之前创建的内容
                await ThreadsModel.destroy({where:{id: newThreads.id}})
                return ctx.serverError(err);
            }
        }catch(err){
            // console.log('err2222222',err)
            return ctx.serverError(err);
        }
    }
}