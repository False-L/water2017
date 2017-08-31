/**
 * ForumController
 *
 * @description :: 版块
 */
const ForumModel = require('../models/Forum.js')
const CacheService = require('../service/utility.js')

module.exports = {
    index: async function (ctx,next) {
        // 版块
        var forum = ForumModel.findForumByName(ctx.params.forum)
        if (!forum) {
            return 
        }
        // 翻页
        var pageIndex = Number(ctx.query.page) || 1
        var pageCount = Math.ceil(ForumModel.list[forum.name]['topicCount'] / 10)
        ctx.wantType = utility.checkWantType(ctx.params.format)
        ctx.cacheKey = 'forum:' + forum.id + ':' + pageIndex + ':' + ctx.wantType.suffix

        CacheService.get(req.cacheKey)
        .then(function(cache){
            if (wantType.param == 'json') {
                return sails.config.jsonp ? ctx.jsonp(JSON.parse(cache)) : ctx.json(JSON.parse(cache))
            } else if (ctx.wantType.param == 'xml') {
                ctx.set('Content-Type', 'text/xml');
            }
            ctx.send(200, cache);
        }).catch(err=>{
            
        })
    }
}



// exports.index=async function (ctx,next) {
//     var map = {};
//     var sort = {};
//     if(ctx.query.rule){
//         map['rule']={
//             'contains':ctx.query.rule
//         }
//     }
//     if (ctx.query.order) {
//         if (ctx.query.sort == 'desc') {
//             sort[ctx.query.order] = 'desc';
//         } else {
//             sort[ctx.query.order] = 'asc';
//         }
//     } else {
//         sort['id'] = 'desc';
//     }
//     let results= await ForumModel.findAll()
//     results=JSON.stringify(results); 
//     if(results&&results.length>0){
//         ctx.body={
//             data:results
//         }
//         await ctx.render('content/forum/index', {
//             page: {
//                 name: '版块管理',
//                 desc: '版块'
//             },
//             data:JSON.parse(results)
//         })
//     }else{
//         ctx.body={
//             data:'error'
//         }
//     }
    
// }




