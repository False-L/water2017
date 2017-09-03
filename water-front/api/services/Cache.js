/**
 * 缓存控制
 *
 * @key type:value:format:version
 *
 */

module.exports = {
        /**
         * 获取缓存
         */
        get: function (key) {
            var self =this 
            let promise = new Promise(function(resolve,reject){
    
                if(!self){
                    reject(null);
                    return promise
                }
        
                this.version(key)
                    .then(function (version) {
        
                        if (!version || version == null) {
                            reject(null);
                        } else {
                            // 获取最新缓存
                            redis.get(key + ':' + version, function (err, cache) {
                                if (err) {
                                    reject(err)
                                } else if (cache == null) {
                                    reject(null)
                                } else {
                                    resolve(cache)
                                }
                            });
                        }
                    })
                    .catch(function (err) {
                       reject(err)
                    });
            })
            return promise
        },
    
        /**
         * 设置缓存
         */
        set: function (key, value) {
    
            var promise = new Promise(function(resolve,reject){

                this.version(key)
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
                        reject(err);
                    })    
            })
            return promise
        },
    
        /**
         * 刷新缓存
         */
        flush: function (key) {
    
            var promise = new Promise(function(resolve,reject){
                if (key.indexOf('*') > 0) {
                    redis.eval("return redis.call('del', unpack(redis.call('keys', ARGV[1])))", 0, key, function (err, reply) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(reply);
                        }
                    });
                } else {
                    redis.del(key, function (err, reply) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(reply);
                        }
                    });
                }                  
        })
            return promise
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
            var promise = new Promise(function(resolve,reject){
                key =  this.prehandleKey(key)
                
                // 获取最新版本号
                redis.get(key + ':version', function (err, version) {
        
                    if (err) {
                        reject(err)
                    } else if (version == null) {
                        redis.set(key + ':version', 1);
                        resolve(1)
                    } else {
                        resolve(version);
                    }
                })                     
            })
            return promise;
        },
    
        /**
         * 更新版本
         */
        update: function (key) {
    
            var promise = new Promise(function(resolve,reject){
                key = this.prehandleKey(key);
                this.version(key)
                    .then(function (version) {
                        if (!version || version == null) {
                            version = 1;
                        } else {
                            version = Number(version) + 1;
                        }
        
                        redis.set(key + ':version', version);
        
                        promise.resolve(null);
        
                    })
                    .catch(function (err) {
                        promise.reject(err);
                    });
            })
            return promise
        }
}