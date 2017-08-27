'use strict'

exports.index= async function (ctx,next) {
    await ctx.render('homepage/index',{
        page: {
            name: '首页',
            desc: '顺猴者昌，逆猴者亡'
        }
    })
}
exports.signin=async function (ctx,next) {
    if(ctx.req.method !='POST'){
        await ctx.render('homepage/signin',{
                page: {
                    name: '登陆',
                    desc: '权限者认证'
                }
        })
    }
    var body=ctx.req.body
    
}

/** 
 * 登出
 */ 
exports.signout=async function (ctx,next) {
    console.log('signout')
}