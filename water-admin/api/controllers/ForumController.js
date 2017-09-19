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

exports.create = async function (ctx,next) {
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
exports.update = async function (ctx,next) {
    var forum = await ForumModel.findById(ctx.params.id)
    forum = JSON.stringify(forum)
    forum = JSON.parse(forum)
    // console.log('forum',forum)
    if(!forum) return 
    var reqBody=ctx.request.body||{}
    reqBody=JSON.stringify(reqBody)
    req=JSON.parse(reqBody)
    // console.log(req)
    var data = {}
    if(req.fields){
        data=req.fields  ||{}
    }else{
        data=forum
    }
    data=req.fields || forum || {}
    // console.log('data',data)
    if(ctx.method != 'POST'){
        return ctx.render('content/forum/edit', {
                page: {
                    name: '编辑版块',
                    desc: '编辑版块的版头和冷却时间'
                },
                data: data,
                url:ctx.url
            });
    }
    //console.log('data',data)
    let result=await ForumModel.update({
        name:data.name,
        header:data.header,
        cooldown:data.cooldown,
        lock:data.lock
    },{
        where:{
            id:forum.id
        }
    })
    //console.log('result',result)
    if(result.length>0&&result[0]===1){
        return ctx.response.redirect('/content/forum');
    }else{
        return ctx.response.redirect('back');
    } 
 }
exports.remove = async function (ctx,next) {
    var map = {}
    if(ctx.params.id){
        console.log('params',ctx.params.id)
        map['id'] = ctx.params.id
    }else if(ctx.query.ids){
        console.log('query',ctx.query.ids)
        map['id'] = ctx.query.ids;
    }else {
        return ;
    }
   let result = await ForumModel.destroy({
        where:{
            id:map.id
        }
    })
    console.log('result',result)
    if(result){
        return ctx.response.redirect('/content/forum');
    }else{
        return ctx.response.redirect('back');
    }
}
// 配置 解锁&锁定
exports.set = async function (ctx,next) {
    var map = {}
    map[ctx.query.key] = ctx.query.value
   let result = await ForumModel.update(map,{
        where:{
            id:ctx.params.id
        }
    })
    if(result){
        return ctx.response.redirect('/content/forum');
    }else{
        return ctx.response.redirect('back');
    }
}
