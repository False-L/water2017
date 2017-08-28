'use strict'

// exports.index= async function (ctx,next) {
//     console.log('debugger')
//     // debugger
//     ctx.state={
//         H:{
//             settings:{

//             }
//         }
//     }
//     await ctx.render('desktop/homepage/index',{
//         page: {
//             name: '首页',
//             desc: '顺猴者昌，逆猴者亡'
//         },
//         code: 200,
//         success: true
//     })
// }
const CacheSerives = require('../services/Cache.js')
const utility = require('../services/utility.js')
module.exports = {
    
    index :async function (ctx,next) {

        ctx.request.wantType = utility.checkWantType(ctx.params.format)
        ctx.request.cacheKey ='homepage:index:' + ctx.request.wantType.suffix

        // // 0.1 确认是否需要跳转

        // if(ctx.query.switch){
        //     if(ctx.query.switch == 'true'){
        //         ctx.session.wantMobile = 'true';
        //         return res.redirect('/.mobile');
        //     } else if(ctx.query.switch == 'false'){
        //         ctx.session.wantMobile = 'false';
        //     }
        // }

        // // 提前判断mobile/desktop
        // if(
        //     ctx.request.wantType.isDesktop &&
        //     utility.isMobile(ctx.headers['user-agent'])
        // ){
        //     if(typeof ctx.session.wantMobile == 'undefined'){
        //         return ctx.redirect('/homepage/switchType');
        //     } else if(ctx.session.wantMobile == 'true') {
        //         return ctx.redirect('/.mobile');
        //     }
        // }
        // CacheSerives.get(ctx.request.cacheKey)


        await ctx.render('desktop/homepage/index',{
            page: {
                title: '首页'
            },
            code: 200,
            success: true
        })
    },

    /**
     * 版块列表
     * TODO：需要修改
     */
    menu: function (ctx, next) {
        
        var key = 'homepage:menu';
        
        //  API
        var isAPI = (ctx.params.format && ctx.params.format == 'json') ? true : false;
        
        if (isAPI) {
            key += ':api';
        }
        
        CacheSerives.get(key)
            .then(function (cache) {
        
                if(isAPI){
                    return res.json(JSON.parse(cache));
                }
        
                res.send(200, cache);
        
            })
            .fail(function () {
        
                if(isAPI){
        
                    var output = {
                        success:true,
                        forum:{}
                    };
        
                    sails.models.forum.find()
                        .then(function(rawForums){
        
                            for (var i in rawForums){
                                rawForums[i]['createdAt'] = (rawForums[i]['createdAt']) ? new Date(rawForums[i]['createdAt']).getTime() : null;
                                rawForums[i]['updatedAt'] = (rawForums[i]['updatedAt']) ? new Date(rawForums[i]['updatedAt']).getTime() : null;
                            }
        
                            output.forum = rawForums;
        
                            sails.services.cache.set(key, output);
                                return res.json(output);
        
                            })
                                .fail(function(err){
                                    return res.serverError(err);
                                });
        
                } else {
                    ctx.render('homepage/menu', {
                            page: {
                                    title: '版块列表'
                            }
                    }, function (err, html) {
                        if (err) {
                            // return ctx.serverError(err);
                        }
                        CacheSerives.set(key, html);
                            ctx.send(200, html);
                        });
                     }
        });
    },    
    /**
     * /homepage/isManager
     */
    isManager:function(ctx,next){
        
        var result = {
            success: false
        }
        
        // if (ctx.request.signedCookies.managerId) {
        //     result.success= true;
        // }
        ctx.body = {
            result
        }
    },
}