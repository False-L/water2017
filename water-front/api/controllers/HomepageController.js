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
const ForumModel = require('../models/Forum.js')

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
    menu: async function (ctx, next) {
        
        var key = 'homepage:menu';
        
        //  API
        var isAPI = (ctx.params.format && ctx.params.format == 'json') ? true : false;
        
        if (isAPI) {
            key += ':api';
        }
        try{
            let cache = await  CacheSerives.get(key)
            if(isAPI){
                return ctx.body = JSON.parse(cache)
            }
            ctx.body = {cache}
        }
        catch(err)
        {
            if(isAPI){
                var output = {
                    success:true,
                forum:{}
                }
                try{
                    rawForums = await ForumModel.findAll().then(res=>{
                        res = JSON.stringify(res)
                        res = JSON.parse(res)
                        return res
                    })
                    for (var i in rawForums){
                        rawForums[i]['createdAt'] = (rawForums[i]['createdAt']) ? new Date(rawForums[i]['createdAt']).getTime() : null;
                        rawForums[i]['updatedAt'] = (rawForums[i]['updatedAt']) ? new Date(rawForums[i]['updatedAt']).getTime() : null;
                    }

                    output.forum = rawForums
                    CacheSerives.set(key, output)
                    return ctx.body ={output}
                }
                catch(err){
                    console.log(err)
                    return ctx.body = {
                        msg:'err'
                    }
                }
            }else{
                await ctx.ender('homepage/menu', {
                    page: {
                        title: '版块列表'
                    }
                })
            }
        }
    },    
    /**
     * /homepage/isManager
     */
    isManager: async function(ctx,next){
        
        var result = {
            success: false
        }
    
        if (ctx.request.signedCookies.managerId) {
            result.success= true;
        }
        return  ctx.body = {result}
    },
    /**
     * 搜索
     */
    search: async function(ctx,next){
        ctx.request.wantType = utility.checkWantType(ctx.params.format)
        ctx.request.cacheKey ='homepage:search:' + ctx.request.wantType.suffix
        var data = {
            page: {
                title: '搜索'
            },
            code: 200,
            success: true
        }
        return ctx.render('desktop/homepage/search',data)
    }
}