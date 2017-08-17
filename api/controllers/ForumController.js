/**
 * ForumController
 *
 * @description :: 版块
 */
const ForumModel = require('../models/Forum.js')

 exports.index=async function (ctx,next) {
    var map = {};
    var sort = {};
    if(ctx.query.rule){
        map['rule']={
            'contains':ctx.query.rule
        }
    }
    if (ctx.query.order) {
        if (ctx.query.sort == 'desc') {
            sort[ctx.query.order] = 'desc';
        } else {
            sort[ctx.query.order] = 'asc';
        }
    } else {
        sort['id'] = 'desc';
    }
    let results= await ForumModel.findAll()
    results=JSON.stringify(results); 
    if(results&&results.length>0){
        ctx.body={
            data:results
        }
        await ctx.render('content/forum/index', {
            page: {
                name: '版块管理',
                desc: '版块'
            },
            data:JSON.parse(results)
        })
    }else{
        ctx.body={
            data:'error'
        }
    }
    
 }

 exports.create=async function (ctx,next) {
     var data=ctx.request ||{}
     console.log(ctx)
     if(ctx.method !='POST'){
         await ctx.render('content/forum/edit',{
            page: {
                name: '创建版块',
                desc: '创建新的版块'
            },
            data: data
         })
     }
     console.log(ctx.request.body);
    //  let results= await ForumModel.create({
    //     name:data.name,
    //     header:data.header,
    //     cooldown:data.cooldown,
    //     lock:data.lock
    //  })
    //  console.log(result)
 }