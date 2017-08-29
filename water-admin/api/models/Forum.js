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
var ForumModel = sequelize.models.forum

/**
 * 初始化版块列表
 */
ForumModel.initialize = async function () {
    let rawForums = await ForumModel.findAll()
    rawForums = JSON.stringify(rawForums)
    rawForums = JSON.parse(rawForums)
    if(rawForums){
      var handledForum = {};
      var handledForumId = {};
      var forumSelectList = [
          {
              key: '未选择',
              value: ''
          }
      ]
      for (var i in rawForums) {
        
        var forum = rawForums[i]
        
        if (forum) {
            if(forum.header){
                forum.header = forum.header.replace('@time',forum.cooldown).replace('@name',forum.name);
            }
            forum.version = _.random(100, 999);
            handledForum[forum.name] = forum;
            handledForumId[forum.id] = forum.name;
            forumSelectList.push({
              key: forum.name,
              value: forum.id
            })
        }
      }


    }
}



module.exports = ForumModel