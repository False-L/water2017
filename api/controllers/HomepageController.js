'use strict'

exports.index= async function (ctx,next) {
    await ctx.render('homepage/index',{
        page: {
            name: '首页',
            desc: '顺猴者昌，逆猴者亡'
        }
    })
}