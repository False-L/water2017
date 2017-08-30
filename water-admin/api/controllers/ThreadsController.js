/**
 * ThreadsController
 *
 * @description :: 贴子
 */
const ForumModel = require('../models/Forum.js')
const ThreadsModel = require('../models/Threads.js')

exports.index = async function (ctx,next) {

    let selectList = await ForumModel.findAll()
    selectList = JSON.stringify(selectList)
    selectList = JSON.parse(selectList)
    selectList=selectList.map(item=>{
        let select= {}
        select.key = item.name
        select.value = item.id
        return select
    })

    var page = ctx.query.page || 1
    var pagesize = ctx.query.pagesize || 20

    var map = {};
    var sort = {}; 
    if (ctx.query.keyword) {
        map['$or'] = [
            {name: { 
                '$like':ctx.query.keyword }
            },
            {title: { 
                '$like':ctx.query.keyword
                }
            },
            {content: {
                '$like':ctx.query.keyword
            }},
            {uid: ctx.query.keyword}
        ]
    }
    if(ctx.query.forum){
        map['forum'] = ctx.query.forum
    }
        
    if (ctx.query.ip) {
        map['ip'] =  ctx.query.ip
    }

    if (ctx.query.parent) {
        map['parent'] = ctx.query.parent
    }

    if (ctx.query.lock) {
        map['lock'] = true;
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
    let threads = await ThreadsModel.findAndCount({
        // order:sort,
        where: map,
        offset: parseInt(pagesize)*(page-1),
        limit: parseInt(pagesize)
    })
    threads = JSON.stringify(threads)
    threads = JSON.parse(threads)

    let count = threads.count
    threads = threads.rows

    if(ctx.query.parent){
       let parentThreads = await ThreadsModel.findById(ctx.query.parent)
       //console.log('parentThreads',parentThreads)
       return ctx.render('content/threads/index',{
        page: {
            name: '贴子管理',
            desc: '串',
            count: count
        },
        parent: parentThreads,
        data: threads,
        selectList:selectList
       })
    }else{
        return ctx.render('content/threads/index',{
            page: {
                name: '贴子管理',
                desc: '全站通用式内容管理',
                count: count
            },
            data: threads,
            req:ctx.request,
            selectList:selectList 
        })
    }
 }
exports.create = async function (ctx,next) {
    
    var body = ctx.request.body || {}
    body = JSON.stringify(body)
    body = JSON.parse(body)
    let data = body.fields || {}

    let selectList = await ForumModel.findAll()
    selectList = JSON.stringify(selectList)
    selectList = JSON.parse(selectList)
    selectList=selectList.map(item=>{
        let select= {}
        select.key = item.name
        select.value = item.id
        return select
    })
    //console.log(selectList)
    var output = {
        page: {
            name: '创建贴子',
            desc: '创建一个新帖'
        },
        data: data,
        req: ctx.request,
        selectList:selectList 
     } 

    if (ctx.method != 'POST') {
        return ctx.render('content/threads/edit', output);
    }

    let parentThreads = await ThreadsModel.findAll({
        where:{
            parent:data.parent
        }
    })
    console.log(parentThreads)
    //ip 
    // data.ip = ctx.headers['x-forwarded-for'] ||
    // ctx.connection.remoteAddress ||
    // ctx.socket.remoteAddress ||
    // ctx.connection.socket.remoteAddress ||'0.0.0.0'
    data.ip=ctx.ip

    data.content = data.content || ''
    data.content = data.content
        .replace(/<[^>]+>/gi, '')
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\n/g, "<br>")
        .replace(/(\>\>No\.\d+)/g, "<font color=\"#789922\">$1</font>")
        .replace(/(\>\>\d+)/g, "<font color=\"#789922\">$1</font>")

    if (parentThreads && parentThreads.forum) {
        data.forum = parentThreads.forum
    }

    var forum = await ForumModel.findById(data.forum)
    forum = JSON.stringify(forum)
    forum = JSON.parse(forum)

    if (!forum) {
        //req.flash('danger', '版块不存在');
        return ctx.response.redirect('back');
    }

    if (forum.lock) {
        //req.flash('danger', '版块已经被锁定');
        return ctx.response.redirect('back');
    }
    let res = await ThreadsModel.create({
        uid: data.uid || '',
        name: data.name || '',
        email: data.email || '',
        title: data.title || '',
        content: data.content || '',
        image: data.image || '',
        thumb: data.thumb || '',
        lock: data.lock || false,
        sage: data.sage || false,
        ip: data.ip || '0.0.0.0',
        forum: data.forum,
        parent: data.parent || '0',
    }).then(res=>{
        console.log('success')
        return true
    }).catch(err=>{
        console.log('error')
        return false
    })
    if(res){
        return ctx.response.redirect('back');
    }else{
        return ctx.response.redirect('back');
    }
}
exports.update = async function (ctx,next) {
   let threads =await ThreadsModel.findById(ctx.params.id)
   threads = JSON.stringify(threads)
   threads = JSON.parse(threads)
   if(!threads) return

   var body = ctx.request.body || {}
   body = JSON.stringify(body)
   body = JSON.parse(body)
   let data = body.fields || threads || {}

   let selectList = await ForumModel.findAll()
   selectList = JSON.stringify(selectList)
   selectList = JSON.parse(selectList)

   selectList = selectList.map(item=>{
       let select= {}
       select.key = item.name
       select.value = item.id
       return select
   })
  
   if(ctx.method !== 'POST'){
        return ctx.render('content/threads/edit', {
            page: {
                name: '编辑串',
                desc: '编辑一个串'
            },
            data: data,
            req: ctx.request,
            selectList:selectList
        })
    }
    let parentThreads = await ThreadsModel.findAll({
        where:{
            id:data.parent
        }
    })
    parentThreads = JSON.stringify(parentThreads)
    parentThreads = JSON.parse(parentThreads)

    data.ip=ctx.ip

    data.content = data.content || ''
    data.content = data.content
        .replace(/<[^>]+>/gi, '')
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\n/g, "<br>")
        .replace(/(\>\>No\.\d+)/g, "<font color=\"#789922\">$1</font>")
        .replace(/(\>\>\d+)/g, "<font color=\"#789922\">$1</font>")

    if (parentThreads && parentThreads.forum) {
        data.forum = parentThreads.forum
    }

    var forum = await ForumModel.findById(data.forum)
    forum = JSON.stringify(forum)
    forum = JSON.parse(forum)
    console.log('forum',forum)

    if (!forum) {
        //req.flash('danger', '版块不存在');
        return ctx.response.redirect('back');
    }

    if (forum.lock) {
        //req.flash('danger', '版块已经被锁定');
        return ctx.response.redirect('back');
    }
    let res = await ThreadsModel.update({
        uid: data.uid || '',
        name: data.name || '',
        email: data.email || '',
        title: data.title || '',
        content: data.content || '',
        image: data.image || '',
        thumb: data.thumb || '',
        lock: data.lock || false,
        sage: data.sage || false,
        forum: data.forum
    },{
        where:{
            id:threads.id
        }
    }).then(res=>{
        console.log('success')
        return true
    }).catch(err=>{
        console.log('error')
        return false
    })
    if(res){
        return ctx.response.redirect('/content/threads');
    }else{
        return ctx.response.redirect('back');
    }
}

exports.remove = async function (ctx,next) {
    var map = {};
    
    if(ctx.params.id){
        map['id'] =  ctx.params.id
    } else if(ctx.query.ids){
        map['id'] = ctx.query.ids
    } else if(ctx.query.ip) {
        map['ip'] = ctx.query.ip
    } else if(ctx.query.uid) {
        map['uid'] = ctx.query.uid
    } else {
        return 
    }
    let result = await ThreadsModel.destroy({
        where:{
            id:map.id
        }
    })
    if(result){
        return ctx.response.redirect('/content/threads');
    }else{
        return ctx.response.redirect('back');
    }
}
//配置
exports.set = async function (ctx,next) {

    var map = {}
    map[ctx.query.key] = ctx.query.value

   let result = await ForumModel.update(map,{
        where:{
            id:ctx.params.id
        }
    })
    if(result){
        return ctx.response.redirect('/content/threads');
    }else{
        return ctx.response.redirect('back');
    }
}
exports.removeImages = async function (ctx,next) {
    var map = {};
    map['image'] = ''
    map['thumb'] = ''

    let result = await ForumModel.update(map,{
        where:{
            id:ctx.params.id
        }
    })
    if(result){
        return ctx.response.redirect('/content/threads');
    }else{
        return ctx.response.redirect('back');
    }
}