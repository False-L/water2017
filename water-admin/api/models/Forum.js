/**
 * Forum.js
 *
 * @description :: 版块
 */
// const Sequelize = require('sequelize')

// const sequelize = require('../../utils/dbpool.js')
// const ThreadsModel = require('./Threads.js')

// sequelize.define('forum',{
//   name:Sequelize.STRING,
//   header:Sequelize.STRING,
//   cooldown:Sequelize.BIGINT,
//   lock:Sequelize.BOOLEAN,
// },{      
//   freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
//   tableName: 'forum',       
//   timestamps: false     
// })
// var ForumModel = sequelize.models.forum

// /**
//  * 初始化版块列表
//  */
// ForumModel.initialize = async function () {
//     let rawForums = await ForumModel.findAll()
//     rawForums = JSON.stringify(rawForums)
//     rawForums = JSON.parse(rawForums)
//     if(rawForums){
//       var handledForum = {};
//       var handledForumId = {};
//       var forumSelectList = [
//           {
//               key: '未选择',
//               value: ''
//           }
//       ]
//       for (var i in rawForums) {
        
//         var forum = rawForums[i]
        
//         if (forum) {
//             if(forum.header){
//                 forum.header = forum.header.replace('@time',forum.cooldown).replace('@name',forum.name);
//             }
//             forum.version = _.random(100, 999);
//             handledForum[forum.name] = forum;
//             handledForumId[forum.id] = forum.name;
//             forumSelectList.push({
//               key: forum.name,
//               value: forum.id
//             })
//         }
//       }
//      let result = await ThreadsModel.count('forum',{attributes:['forum'], group:'forum'}).then(threadsCounts=>{
//         if(!threadsCounts){
//           return 
//         }
//         for (var i in threadsCounts) {
//           var threadsCount = threadsCounts[i];
//           if (handledForum[handledForumId[threadsCount.forum]])
//               handledForum[handledForumId[threadsCount.forum]]['topicCount'] = threadsCount.count;
//         }
        
//         ForumModel.list = handledForum
//         ForumModel.forum.idList = handledForumId
//         ForumModel.forum.selectList = forumSelectList
//         return handledForum
//       }).catch(err=>{
//         return false
//       })
//       return result
//     }
// }
// ForumModel.findForumById = function (id) {
//   return ForumModel.list[sails.models.forum.idList[id]];
// }
// ForumModel.findForumByName = function (name) {
//   return ForumModel.list[name];
// }
var ForumModel = require('../../../water-front/api/models/Forum')

module.exports = ForumModel