/**
 * Filter.js
 *
 * @description :: 过滤器
 */

const Sequelize = require('sequelize')
const sequelize = require('../../utils/dbpool.js')
const ThreadsModel = require('./Threads.js')
const Promise = require('bluebird')

sequelize.define('filter',{
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
var FilterModel = sequelize.models.filter

/**
 * 初始化过滤器
 */    
FilterModel.exportToGlobal =  function(){
    return new Promise(function(resolve,reject){
        FilterModel.findAll()
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
            resolve(rulesList)
        }).catch(err=>{
            reject(err)
        })
    })
}

/**
 *  检查是否被过滤
 */
FilterModel.prototype.test = {
    ip: function (data) {
        var ruleList = FilterModel.rulesList.ip;
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
        return false
    },
    userId: function (data) {
        var ruleList = FilterModel.rulesList.userId;
        if(!data){
            return false
        }
        var data = data.toString();
        if(!ruleList){
            return false;
        }
        for(var i in ruleList){
            var rule = ruleList[i];
            if(data == rule){
                return true
            }
        }
        return false
    },
    word: function (data) {
        var ruleList = FilterModel.rulesList.word;
        if(!data){
            return false
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
        return false
    },
    imagemd5 : function(data){
        
        var ruleList = FilterModel.rulesList.imagemd5
        
        if(!data){
            return false
        }
        var data = data.toString();
        
        if(!ruleList){
            return false;
        }
        
        for(var i in ruleList){
            var rule = ruleList[i];
            if(data == rule){
                return true
            }
        
        }
        return false
    }
}

module.exports = FilterModel