/**
 * UserController
 *
 * @description :: 用户
 */
const md5 = require('md5')
const UserModel = require('../models/User.js')

exports.index =  async function (ctx,next) {
    var page = ctx.query.page || 1
    var pagesize = ctx.query.pagesize || 20

    var map = {}
    var sort = {}

    if (ctx.query.name) {
        map['name'] = {
            '$like': ctx.query.name
        };
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
    let count =  await UserModel.count({
        where:map
    })
    let result = await UserModel.findAll({
        where:map,
        limit: pagesize,
        offset: (page-1) * pagesize
    })
    result = JSON.stringify(result)
    result = JSON.parse(result) 
    return ctx.render('user/index', {
        page: {
            name: '用户管理',
            desc: '权限狗列表',
            count: count
        },
        req: ctx.request,
        data: result
    })
}
exports.create = async function (ctx,next) {

    var body = ctx.request.body || {}
    body = JSON.stringify(body)
    body = JSON.parse(body)
    let data = body.fields || {}

    if (ctx.method != 'POST') {
        return ctx.render('user/edit', {
            data: data,
            req: ctx.request,
            page: {
                name: '添加用户',
                desc : '创建一个新用户',
            }
        });
    }
    var salt = new Date().getTime() + '_' + new Date().getFullYear();
    data.salt = salt;
    data.password = md5(salt + data.password);
    data.access = data.access ? data.access.split(',') : [];

    var map = {
        name: data.name,
        password: data.password,
        salt: data.salt,
        access: data.access
    }
    let res = await UserModel.create(map).then(function(result){
        console.log('result',result)
        return true
     }).catch(function(err){
        return false
    })
    if(res){
        return ctx.response.redirect('/user');
    }else{
        return ctx.response.redirect('back');
    }
}

exports.update = async function(ctx,next){
    let user = await UserModel.findById(ctx.params.id)
    
    user = JSON.stringify(user)
    user = JSON.parse(user)
    console.log(user)
    if(!user) return

    var body = ctx.request.body || {}
    body = JSON.stringify(body)
    body = JSON.parse(body)
    body = body.fields

    let data =  user || {}

    if(ctx.method != 'POST'){
        data.access = data.access
        delete data.password;
        return ctx.render('user/edit', {
                page: {
                        name: '编辑用户',
                        desc: '修改一个用户的信息'
                },
                req: ctx.request,
                data: data
        });
    }

    body.salt = data.salt;
    body.access = body.access
    var map = {
        name: body.name,
        access: body.access
    }
    console.log('body',body)
    console.log('data',data)
    if(body.password){
        map.password = md5(data.salt + body.password);
    }
    let res = await UserModel.update(map,{
        where:{
            id:data.id
        }
    }).then(res=>{
        console.log('success')
        return true
    }).catch(err=>{
        console.log('error')
        return false
    })
    if(res){
        return ctx.response.redirect('/user');
    }else{
        return ctx.response.redirect('back');
    }
}

exports.remove = async function(ctx,next){
    var map = {};
    
    if (ctx.query.ids) {
        map['id'] = ctx.query.ids;
      let res = await  UserModel.destroy({
            where:map
        }).then(result=>{
            return true
        }).catch(err=>{
            return false
        })
      if(res){
        return ctx.redirect('/user')
      } else{
        return ctx.redirect('/user');
      } 
    }else{
        return res.redirect('/user')
    }
}