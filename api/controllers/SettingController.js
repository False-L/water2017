/**
 * SettingController
 *
 * @module      :: Controller
 * @description    :: 系统配置
 */

exports.index = async function (ctx,next) {
    await ctx.render('system/setting/index',{
        page:{
            name:'系统配置',
            desc:'System Settings'
        }
    })
}

exports.update = async function (ctx,next) {
    var map = []
    for(var key in ctx.request.body){
        if(typeof H.settings[key] == 'undefined'){
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
            });
        }
    }
}