/**
 * Filter.js
 *
 * @description :: 过滤器
 */

const Sequelize = require('sequelize')
const sequelize = require('../../utils/dbpool.js')
const ThreadsModel = require('./Threads.js')
const Promise = require('bluebird')

var FilterModel = sequelize.define('filter',{
    type:{
        type:Sequelize.STRING,
        allowNull:false
    },
    rule:{
        type:Sequelize.STRING,
        allowNull:false
    },
    expires:{
        type:Sequelize.DATE,
        allowNull:false
    }
},{      
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
    tableName: 'filter',       
    timestamps: false     
})


/**
 * 初始化过滤器
 */    
FilterModel.exportToGlobal =  function(){
    return new Promise(function(resolve,reject){
        sequelize.models.filter.findAll()
        .then(rules=>{
            var rulesList = {}
            
            for(var i in rules){
                var rule = rules[i];

                if(rulesList[rule.type]){
                    rulesList[rule.type].push(rule.rule)
                } else {
                    rulesList[rule.type] = [rule.rule]
                }
            }
            sequelize.models.filter.rulesList = rulesList
            // console.log("rulesList0",rulesList)
            resolve(rulesList)
        }).catch(err=>{
            reject(err)
        })
    })
}

/**
 *  检查是否被过滤
 */

FilterModel.test={ 
    ip: function (data) {
        var ruleList =  FilterModel.rulesList.ip;
        if(!data){
            return false;
        }
        var data = data.toString()
        if(!ruleList){
            return false;
        }
        for(var i in ruleList){
            var rule = ruleList[i];
            rule = RegExp(rule.replace(/\./g,'\\.').replace(/\*/g,'\\d+'));
            if(rule.test(data)){
                return true;
            }
        }
        return false;
    },  
    userId: function (data) {
        var ruleList = sequelize.models.filter.rulesList.userId;
        if(!data){
            return false;
        }
        var data = data.toString();
        if(!ruleList){
            return false;
        }
        for(var i in ruleList){
            var rule = ruleList[i];
            if(data == rule){
                return true;
            }
        }
        return false;
    },
    word: function (data) {
        var ruleList = sequelize.models.filter.rulesList.word;
        if(!data){
            return false;
        }
        var data = data.toString().replace(/\s/g, "");
        if(!ruleList){
            return false;
        }
        for(var i in ruleList){
            var rule = ruleList[i];
            if(data.indexOf(rule) >= 0){
                return true;
            }
        }
        return false;
    },
    location: function (data) {
        return false;
    },
    imagemd5 : function(data){
        
        var ruleList =  sequelize.models.filter.rulesList.imagemd5;
        
        if(!data){
            return false
        }
        var data = data.toString();
        
        if(!ruleList){
            return false
        }
        
        for(var i in ruleList){
            var rule = ruleList[i];
            if(data == rule){
                return true
            }
        
        }
        return false
    },
     /**
     * 通知集群版块已更新
     */
    afterCreate: function(newlyInsertedRecord, cb) {
        
        sequelize.models.filter.noticeUpdate();
        
        cb();
    },
        
    afterUpdate: function(updatedRecord, cb) {
        
        sequelize.models.filter.noticeUpdate();
        
        cb();
    },
        
    afterDestroy: function(destroyedRecords, cb) {
        
        sequelize.models.filter.noticeUpdate();
        
        cb();
    },
        
    noticeUpdate:function(){
        if(ipm2.rpc.msgProcess){
            // sails.log.silly('try send message to process(h.acfun.tv.front)');
            console.log('try send message to process(h.acfun.tv.front)');
            ipm2.rpc.msgProcess({name:"h.acfun.tv.front", msg:{type:"h:update:filter"}}, function (err, res) {
                if(err){
                   console.error(err);
                }
            });
        }
    }
}

console.log("filter===================", sequelize.models.filter)
module.exports = FilterModel
