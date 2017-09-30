/**
 * Feed
 *
 * @module      :: Model
 * @description :: 订阅
 */

const Sequelize = require('sequelize')
const sequelize = require('../../utils/dbpool.js')

var FeedModel = sequelize.define('feed',{
    deviceToken:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    threadsId:{
        references: {
            model:'threads',
            key: 'id'
        }
    },
},{      
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
    tableName: 'feed',       
    timestamps: false     
})

/**
* 检查是否已经订阅
* @param deviceToken
* @param threadsId
*/
FeedModel.exist = function(deviceToken,threadsId){
    FeedModel.findAll({
        where:{
            deviceToken:deviceToken,
            threadsId:threadsId
        }
    })
    .then(res=>{
        res = JSON.stringify(res);
        res = JSON.parse(res);
        return res
    })
    .then(data=>{
        if(data){
            return Promise.resolve(true);
        }else{
            return Promise.resolve(false);
        }
    }).catch(err=>{
        return Promise.reject(err);
    })
}
module.exports = FeedModel