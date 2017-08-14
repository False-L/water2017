/**
 * ForumController
 *
 * @description :: 版块
 */

 exports.index=async function (ctx,next) {
    var map = {};
    var sort = {};
    if(ctx.req.query.rule){

    }

 }

 exports.create=async function (ctx,next) {
     var data=ctx.req.body ||{}
     if(ctx.req.method !='POST'){
         await ctx.render('content/forum/edit',{
            page: {
                name: '创建版块',
                desc: '创建新的版块'
            },
            data: data
         })
     }
     ctx.body={
         data:'create'
     }
 }