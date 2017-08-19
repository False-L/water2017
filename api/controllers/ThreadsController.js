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

    var page = ctx.query.page || 0;
    var pagesize = ctx.query.pagesize || 20;

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
        ]
    }
    if(ctx.query.forum){
        map['forum'] = ctx.query.forum
    }
        
    if (ctx.query.ip) {
        map['ip'] = {
            'contains': ctx.query.ip
        };
    }

    if (ctx.query.parent) {
        map['parent'] = ctx.query.parent;
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

    //let count = await ThreadsModel.count(map)
    //console.log('count',count)

    let threads = await ThreadsModel.findAndCount({
        // where:map,
        offset:page,
        limit:pagesize
    })
    threads = JSON.stringify(threads)
    threads = JSON.parse(threads)

    let count = threads.count
    threads = threads.rows

    if(ctx.query.parent){
       let parentThreads = await ThreadsModel.findById(ctx.query.parent)
       console.log('parentThreads',parentThreads)
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
    data = body.fields || {}

    console.log('data',data)
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
            id:data.parent
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
    console.log('forum',forum)

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
        //updatedAt: new Date()
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
    
}