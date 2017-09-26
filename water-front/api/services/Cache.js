/**
 * 缓存控制
 *
 * @key type:value:format:version
 *
 */

var Cache = module.exports = {
        /**
         * 获取缓存
         */
        get: function (key) {   
            if(!key){
                return Promise.reject(null)
            }
            var promise = new Promise(function(resolve,reject){
                Cache.version(key)
                    .then(function (version) {
        
                        if (!version || version == null) {
                            return reject(null)
                        } else {
                            // 获取最新缓存
                            redis.get(key + ':' + version, function (err, cache) {
                                if (err) {
                                   return reject(err);
                                } else if (cache == null) {
                                    return reject(null);
                                } else {
                                    return resolve(cache);
                                }
                            });
                        }
                    })
                    .catch(function (err) {
                       return reject(err)
                    });                    
            })
            return promise;
        },
    
        /**
         * 设置缓存
         */
        set: function (key, value) {

                Cache.version(key)
                    .then(function (version) {
        
                        if(!version){
                            version = 1;
                        }
        
                        if (_.isObject(value)) {
                            value = JSON.stringify(value);
                        }
        
                        redis.set(key + ':' + version, value);
                        redis.expire(key + ':' + version, 600);
        
                    })
                    .catch(function (err) {
                       return Promise.reject(err);
                    })    
        },
    
        /**
         * 刷新缓存
         */
        flush: function (key) {

                if (key.indexOf('*') > 0) {
                    redis.eval("return redis.call('del', unpack(redis.call('keys', ARGV[1])))", 0, key, function (err, reply) {
                        if (err) {
                            return Promise.reject(err);
                        } else {
                            return Promise.resolve(reply);
                        }
                    });
                } else {
                    redis.del(key, function (err, reply) {
                        if (err) {
                            return Promise.reject(err);
                        } else {
                            return Promise.resolve(reply);
                        }
                    });
                }                  
        },
    
        /**
         * 预处理
         * @param key
         * @returns {*}
         */
        prehandleKey:function(rawKey){
            // 如果是 forum: 或者 threads: 先去除页数
            if (rawKey && (rawKey.indexOf('forum:') >= 0 || rawKey.indexOf('threads:') >= 0)) {
                handledKey = /((threads|forum)\:\d+)/g.exec(rawKey);
                if (handledKey != null) {
                    return handledKey[1]
                } else {
                    return rawKey;
                }
            }
    
            return rawKey;
        },
    
        /**
         * 获取版本
         */
        version:  function (key) {  
                key =  Cache.prehandleKey(key)
                var promise =new Promise(function(resolve,reject){
                    // 获取最新版本号
                    redis.get(key + ':version', function (err, version) {
            
                        if (err) {
                          return  reject(err);
                        } else if (version == null) {
                            redis.set(key + ':version', 1);
                            return resolve(1)
                        } else {
                            return resolve(version);
                        }
                    }) 
                })
                return promise;                    
        },
    
        /**
         * 更新版本
         */
        update: function (key) {
    
                key = Cache.prehandleKey(key);
                Cache.version(key)
                    .then(function (version) {
                        if (!version || version == null) {
                            version = 1;
                        } else {
                            version = Number(version) + 1;
                        }
        
                        redis.set(key + ':version', version);
        
                       return promise.resolve(null);
        
                    })
                    .catch(function (err) {
                       return promise.reject(err);
                    });
        }
}