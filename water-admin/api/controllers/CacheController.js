/**
 * CacheController
 *
 * @description :: 缓存控制器
 */

module.exports = {
    //首页
    index : async function (ctx,next) {
        // console.log(redis)
        let count 
        let result = await redis.dbsize(function(err,count){
            if(err){
                return false
            }
        count = count
        })
        return ctx.render('system/cache/index', {
            page: {
                name: '缓存管理',
                desc: '全站通用缓存管理'
            },
            count:count
        })
    },
    /**
     * 清除缓存
     */
    flush: async function (ctx,next){
        var promise = new Promise(function(resolve,reject){
            if (!key) {
                reject('ILLEGAL KEY');
            } else {
                if (key.indexOf('*') > 0) {
                    redis.eval("return redis.call('del', unpack(redis.call('keys', ARGV[1])))", 0, key, function (err, reply) {
                        if (err) {
                            reject(err.toString())
                        } else {
                            resolve(reply)
                        }
                    });
                } else {
                    redis.del(key, function (err, reply) {
                        if (err) {
                            reject(err.toString())
                        } else {
                            resolve(reply)
                        }
                    });
                }
            }
        })
        return promise
    },
    flushCache: function (ctx, next) {
        
        var key = ctx.query.key
        
        // ctx.flash.set(key)
        
        this.flush(key)
            .then(function(){
                // ctx.flash.set('success', '删除成功。')
            })
            .catch(function(err){
                // ctx.flash.set('danger', err)
            })
            .finally(function(){
                // return ctx.redirect('/system/cache')
            })
        
    }
}