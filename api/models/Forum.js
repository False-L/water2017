/**
 * Forum.js
 *
 * @description :: 版块
 */
const Sequelize = require('sequelize')

const sequelize = require('../../utils/dbpool.js')

sequelize.define('forum',{
  name:Sequelize.STRING,
  header:Sequelize.STRING,
  cooldown:Sequelize.BIGINT,
  lock:Sequelize.BOOLEAN,
},{      
  freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
  tableName: 'forum',       
  timestamps: false     
})
var ForumModel=sequelize.models.forum

module.exports=ForumModel