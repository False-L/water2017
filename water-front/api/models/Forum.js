/**
 * Forum.js
 *
 * @description :: 版块
 */
const Sequelize = require('sequelize')
const sequelize = require('../../utils/dbpool.js')
const ThreadsModel = require('./Threads.js')
const Promise = require('bluebird')

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
ForumModel.initialize = function () {
    var promise = new Promise(function(resolve,reject){
    sequelize.models.forum.findAll().then(res=>{
      res = JSON.stringify(res)
      res = JSON.parse(res)
      return res
    })
    .then(rawForums=>{
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
            forum.version = Math.random(100, 999);
            handledForum[forum.name] = forum;
            handledForumId[forum.id] = forum.name;
            forumSelectList.push({
              key: forum.name,
              value: forum.id
            })
        }
      }
      ThreadsModel.findAll({attributes:['forum',[sequelize.fn('count', sequelize.col('forum')),'count']], group:'forum'})
      .then(res=>{
        res = JSON.stringify(res)
        res = JSON.parse(res)
        return res
      })
      .then(threadsCounts=>{
        for (var i in threadsCounts) {
          var threadsCount = threadsCounts[i];
          if (handledForum[handledForumId[threadsCount.forum]])
              handledForum[handledForumId[threadsCount.forum]]['topicCount'] = threadsCount.count;
        }
        sequelize.models.forum.list = handledForum
        sequelize.models.forum.idList = handledForumId
        sequelize.models.forum.selectList = forumSelectList
        // console.log('handledForum',handledForum)
        resolve(handledForum)
      }).catch(err=>{
        // console.log(err)
        reject(err)
      })
    }).catch(err=>{
      // console.log(err)
      reject(err)
    })
  }) 
    return promise
}


ForumModel.findForumById = function (id) {
  return ForumModel.list[sequelize.models.forum.idList[id]];
}
ForumModel.findForumByName = function (name) {
  return ForumModel.list[name];
}


module.exports = ForumModel