/**
 * Threads.js
 *
 * @description :: 贴子
 */
const Sequelize = require('sequelize')

const sequelize = require('../../utils/dbpool.js')

sequelize.define('threads',{
    uid:Sequelize.BIGINT,
    name:{
        type:Sequelize.STRING,
        //is:/^[a-z]+$/i,
    },
    email:{
        type:Sequelize.STRING,
        isEmail: true
    },
    title: Sequelize.STRING,
    content: Sequelize.STRING(1234),
    image: Sequelize.STRING,
    thumb: Sequelize.STRING,
    lock: Sequelize.BOOLEAN,
    sage: Sequelize.BOOLEAN,
    ip: {
        type:Sequelize.STRING,
        isIP:true
    },
    forum: Sequelize.STRING,
    parent: Sequelize.BIGINT,
    //updatedAt: new Date()
},{      
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
    tableName: 'threads',       
    timestamps: true,
})
var ThreadsModel = sequelize.models.threads

module.exports = ThreadsModel