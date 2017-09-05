/**
 * ForumController
 *
 * @description :: 版块
 */
const ForumModel = require('../models/Forum.js')
const ThreadsModel = require('../models/Threads.js')
const CacheService = require('../services/Cache.js')
const utility = require('../services/utility.js')

module.exports = {

    index: async function (ctx,next) {
         console.log('forum',ctx.params.forum)
        // 版块
        var forum =  ForumModel.findForumByName(ctx.params.forum)
        console.log('forum')

        if (!forum) {
            return 
        }

        // 翻页
        var pageIndex = Number(ctx.query.page) || 1
        var pageCount = Math.ceil(ForumModel.list[forum.name]['topicCount'] / 10)

        ctx.request.wantType = utility.checkWantType(ctx.params.format)
        ctx.cacheKey = 'forum:' + forum.id + ':' + pageIndex + ':' + ctx.request.wantType.suffix
        try{
            let cache = await CacheService.get(req.cacheKey)
            if (ctx.wantType.param == 'json') {
                // return sails.config.jsonp ? ctx.jsonp(JSON.parse(cache)) : ctx.json(JSON.parse(cache))
            } else if (ctx.wantType.param == 'xml') {
                // ctx.set('Content-Type', 'text/xml');
            }
            // ctx.send(200, cache);
        }
        catch(err){
            try{
                var data = await ThreadsModel.list(forum.id, pageIndex)
                console.log('data',data)
                var output = {
                    utility: utility,
                    forum: forum,
                    data: data,
                    page: {
                        title: forum.name,
                        size: pageCount,
                        page: pageIndex
                    },
                    code: 200,
                    success: true
                }
                // 删除不需要的数据 & 转换时间戳
                if (forum) {
                    forum['createdAt'] = (forum['createdAt']) ? new Date(forum['createdAt']).getTime() : null;
                    forum['updatedAt'] = (forum['updatedAt']) ? new Date(forum['updatedAt']).getTime() : null;
                }
                for (var i in output['data']['threads']) {
                    if (output['data']['threads'][i]) {
                        var data = output['data']['threads'][i];
                        delete data['ip'];
                        delete data['parent'];
                        data['createdAt'] = (data['createdAt']) ? new Date(data['createdAt']).getTime() : null;
                        data['updatedAt'] = (data['updatedAt']) ? new Date(data['updatedAt']).getTime() : null;
                    }
                }
                for (var i in output['data']['replys']) {
                    if (output['data']['replys'][i]) {
                        var data = output['data']['replys'][i];
                        delete data['ip'];
                        delete data['parent'];
                        delete data['recentReply'];
                        data['createdAt'] = (data['createdAt']) ? new Date(data['createdAt']).getTime() : null;
                        data['updatedAt'] = (data['updatedAt']) ? new Date(data['updatedAt']).getTime() : null;
                    }
                }
                return ctx.render('desktop/forum/index',output)
            }catch(err){
                console.log(err)
                return 
            }
        }
    }
}





