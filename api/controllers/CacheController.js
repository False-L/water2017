/**
 * CacheController
 *
 * @description :: 缓存控制器
 */


exports.index = async function (ctx,next) {
    let count 
    let result = await redis.dbsize(function(err,count){
        if(err){
            return false
        }
       count = count
    })
    console.log('result',result)
    await ctx.render('system/cache/index', {
        page: {
            name: '缓存管理',
            desc: '全站通用缓存管理'
        },
        count:count
    })
}