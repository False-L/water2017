'use strict'
const redis =require('ioredis')

class Store {
    constructor(){
        this.redis = new redis()
    }
    getId(length){
        return 
    }
    get(sid,maxAge,{rolling}){
        return this.redis.get(`session-${sid}`).then(res=>{
            try{
                return Promise.resolve(JSON.parse(res))
            }catch(e){
                return Promise.reject({})
            }
        })
    }
    set(sid,sess,maxAge,{}){
        // if(!opts.sid){
        //     opts.sid =this.getId(24)
        // }
        return this.redis.set(`session-${sid}`,JSON.stringify(sess))
        .then(()=>{
            return Promise.resolve(sid)
        })
    }
    destroy(sid){
        return this.redis.del('session-${sid}')
    }
}
module.exports = Store