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
     var data=ctx.request.body ||{}
     //console.log(ctx)
     if(ctx.method !='POST'){
         await ctx.render('content/forum/edit',{
            page: {
                name: '创建版块',
                desc: '创建新的版块'
            },
            data: data
         })
     }
    data=JSON.stringify(data)
    result=JSON.parse(data)
    let res=await ForumModel.create({
        name:result.fields.name,
        header:result.fields.header,
        cooldown:result.fields.cooldown,
        lock:result.fields.lock
    }).then(function(result){
            return true
         }).catch(function(err){
            return false
        });
        if(res){
            return ctx.response.redirect('/content/forum');
        }else{
            return ctx.response.redirect('back');
        }
 }
 exports.update=async function (ctx,next) {
    ForumModel.forum.findOneById(ctx.req.params.id)
    .then(function(forum){
        if(!forum){
            
        }
    })

    ForumModel.update({

    },{

    })
 }