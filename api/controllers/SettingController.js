/**
 * SettingController
 *
 * @module      :: Controller
 * @description    :: 系统配置
 */

var _async = require('async')
const SettingModel = require('../models/Setting.js')

exports.index = async function (ctx,next) {
    await ctx.render('system/setting/index',{
        page:{
            name:'系统配置',
            desc:'System Settings'
        }
    })
}

exports.update = async function (ctx,next) {

    var body = ctx.request.body || {}
    body = JSON.stringify(body)
    body = JSON.parse(body)
    let data = body.fields || {}
    var map = []
    //console.log('data',data)
    console.log(H.settings)
    for(var key in data){
        var value = data[key]
        if(typeof H.settings[key] == 'undefined' ){
            map.push({
                action:'create',
                key:key,
                value:value
            })
        } else if(H.settings[key] != value) {
            map.push({
                action:'update',
                key:key,
                value:value
            })
        }
    }
    
    map.map(async item=>{
       // console.log('item.item')
        let result
        if(item.action == 'create'){
           result = await SettingModel.create({
                key:item.key,
                value:item.value
            })
        }else if(item.action == 'update'){
           result = await SettingModel.update({
                value:item.value
            },{
                where:{
                    key:item.key
                }
            })
        }
        if(!result){
            return ctx.redirect('back')
        }
    })
    return ctx.redirect('/system/setting')
    // // 处理参数
    // var handle = function(item,callback){
    //     if(item.action == 'create'){
    //        await SettingModel.create({
    //             key:item.key,
    //             value:item.value
    //         })
    //     } else if(item.action == 'update'){
    //         await SettingModel.update({
    //             key:item.key
    //         },{
    //             value:item.value
    //         }).exec(callback);
    //     } else {
    //         callback();
    //     }
    // }

    // _async.map(map, handle, function(err, results){
    //     if(err){
    //         // return ctx.serverError(err)
    //         return ctx.redirect('back')
    //     }
    //     return ctx.redirect('/system/setting')
    // })
}