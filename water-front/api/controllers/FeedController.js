/**
 * FeedController
 *
 * @description :: 订阅
 */

const FeedModel = require('../models/Feed.js');

module.exports = {
    
    index: async (ctx,next)=> {
    
            ctx.wantType = utility.checkWantType(ctx.params.format);
    
            var page = parseInt(ctx.query.page) || 1;
            var pagesize = parseInt(ctx.query.pagesize) || 20;
    
            if(ctx.query.deviceToken && ctx.query.deviceToken.length < 8){
                return ctx.badRequest('参数错误:自定义令牌至少得9个字符');
            }
    
            var deviceToken = ctx.query.deviceToken || ctx.session.userId;
    
            if (!deviceToken) {
                return ctx.badRequest('缺少签名参数:没有饼干或者没有令牌');
            }
            try{
                feedThreads = await FeedModel.findAll({
                    where:{
                        deviceToken:deviceToken
                    },
                    limit:pagesize,
                    offset: (page - 1) * pagesize
                })
            }catch(err){

            }
            feedThreads =  await FeedModel
                .query(
                "select feed.`id` as `feedId`, feed.`threadsId` as `threadsId`, threads.`uid` as `uid`, threads.`name` as `name`, threads.`email` as `email`, threads.`title` as `title`, threads.`content` as `content`, threads.`image` as `image`, threads.`thumb` as `thumb`, threads.`lock` as `lock`, threads.`sage` as `sage`, threads.`forum` as `forum`, threads.`parent` as `parent`, threads.`replyCount` as `replyCount`, threads.`createdAt` as `createdAt`, threads.`updatedAt` as `updatedAt` from feed left join threads on feed.`threadsId` = threads.`id` where feed.`deviceToken` = ? order by `updatedAt` desc limit ?,?",
                [
                    deviceToken,
                    (page - 1) * pagesize,
                    pagesize
                ],
                function (err, feedThreads) {
    
                    if (err) {
                        return res.serverError(err);
                    }
    
                    sails.models.feed.count()
                        .where({
                            deviceToken: deviceToken
                        })
                        .then(function(count){
                            // 对订阅进行处理
                            for (var i in feedThreads) {
                                var data = feedThreads[i];
                                data['createdAt'] = (data['createdAt']) ? new Date(data['createdAt']).getTime() : null;
                                data['updatedAt'] = (data['updatedAt']) ? new Date(data['updatedAt']).getTime() : null;
                            }
    
                            var output = {
                                code:200,
                                success:true,
                                threads:feedThreads,
                                total:count,
                                page: {
                                    title: '我的订阅',
                                    size: Math.ceil(count/ pagesize),
                                    page: page
                                }
                            };
    
                            return res.generateResult(output, {
                                desktopView: 'desktop/feed/index',
                                mobileView: 'mobile/feed/index'
                            });
    
                        })
                        .fail(function(){
                            return res.serverError(err);
                        });
    
    
                }
            );
    
    },
    
    create: async (ctx, next) => {
    
            var deviceToken = ctx.query.deviceToken || ctx.session.userId;
    
            if (!deviceToken) {
                return ctx.badRequest('缺少签名参数:没有饼干或者没有令牌');
            }
    
            var threadsId = ctx.query.threadsId;
    
            if (!threadsId) {
                return ctx.badRequest('缺少必填项:串ID');
            }
            try{
                await FeedModel.findOrCreate({where:{
                    deviceToken: deviceToken,
                    threadsId: threadsId
                }}).then(res=>{

                })
                return ctx.ok('订阅成功');
            }catch(err){
                return ctx.serverError(err);
            }
        },
    
    remove: async (ctx, next) => {
    
            var map = {};
            var deviceToken = ctx.query.deviceToken || ctx.session.userId;
    
            if (!deviceToken) {
                return ctx.badRequest('缺少签名参数:没有饼干或者没有令牌');
            }
    
            map['deviceToken'] = deviceToken;
    
            var threadsId = ctx.query.threadsId;
            var id = ctx.query.id;
    
            if (threadsId) {
                map['threadsId'] = threadsId;
            } else if(id){
                map['id'] = id;
            } else {
                return ctx.badRequest('缺少必填项:串ID');
            }
            try{
                await FeedModel.destroy({
                    where:map
                });
                return ctx.ok('取消订阅成功:' + (threadsId || id));
            }catch(err){
                return ctx.serverError(err);
            }
    },
    
    check: async (ctx,next) => {
    
            var map = {};
            var deviceToken = ctx.query.deviceToken || ctx.session.userId;
    
            if (!deviceToken) {
                return ctx.badRequest('缺少签名参数:没有饼干或者没有令牌');
            }
    
            map['deviceToken'] = deviceToken;
    
            var threadsId = ctx.query.threadsId;
    
            if (threadsId) {
                map['threadsId'] = threadsId;
            } else {
                return ctx.badRequest('缺少必填项:串ID');
            }
            try{
                var data = await FeedModel.findOne({
                    where:map
                }).then(res=>{
                    res = JSON.stringify(res);
                    res = JSON.parse(res);
                    return res
                });
                if(data){
                    return ctx.body = {code:200,success:true,isChecked:true};
                } else {
                    return ctx.body ={code:200,success:true,isChecked:false};
                }
            }catch(err){
                return ctx.serverError(err);
            }
    }
    
};
    
    