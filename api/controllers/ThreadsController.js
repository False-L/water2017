/**
 * ThreadsController
 *
 * @description :: 贴子
 */

 exports.index = async function (ctx,next) {

    var page = req.query.page || 1;
    var pagesize = req.query.pagesize || 20;

    var map = {};
    var sort = {}; 
    if (ctx.query.keyword) {
        map['or'] = [
            {name: {
                'contains': ctx.query.keyword
            }},
            {title: {
                'contains': ctx.query.keyword
            }},
            {content: {
                'contains': ctx.query.keyword
            }},
            {uid:ctx.query.keyword}
        ];
    }
 }