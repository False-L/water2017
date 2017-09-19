/**
 * userAuth
 *
 * @module      :: Policy
 * @description :: 用户有效性检查
 *
 */
const sequelize = require('../../utils/dbpool.js')

var FilterModel = require('../models/Filter.js')
var config = require('../../config/index.js')
// console.log("configsssssss=======",config)
// 饼干验证
function parseCookie(str){

    var secret = config.session.secret;

    return str.substr(0, 2) === 's:'
        ? signature.unsign(str.slice(2), secret)
        : str;
}



// 本篇
module.exports = async (ctx,next) =>{
    // console.log("ctx==========session---",ctx.session)
    // 0. 字符串传值
    if (ctx.query.userId ){

    }


    // 1. 是否有饼干
    if (ctx.session.userId ) {

        if(ctx.session.userId.length > 8 ){
            ctx.session.userId = null
            // return res.forbidden('没有权限')
            return 
        }

        // 饼干续费
        ctx.session.userId = ctx.session.userId
        // ('userId', ctx.signedCookies.userId, { maxAge: Number(H.settings.cookieExpires) || 900000, signed: true });

    } else if (H.settings.cookieSignup == 'true' || (ctx.signedCookies && ctx.signedCookies.managerId)) {

        // 生成饼干
        var char = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
        var seed = new Date().getTime();
        var userId = "";
        for (var i = 0; i < 8; i++) {
            userId += char.charAt(Math.ceil(Math.random() * seed) % char.length);
        }

        ctx.cookies.set('userId', userId, { maxAge: Number(H.settings.cookieExpires) || 900000, signed: true });
        ctx.session.userId = userId

    } else {

        // 没有饼干
        // return res.forbidden('没有饼干');
        return 
    }

    // 2. userId/IP 是否被封禁
    var ip = ctx.ip || '0.0.0.0'
    // console.log('ip=================',ip)

    // try{
    //   let result =  await FilterModel.test.ip(ip)
    //   let testuserid = await FilterModel.test.userId(ctx.session.userId)
    //   if( result || testuserid){
    //       ctx.session.userId =null;
    //       return 
    //   }
    // }catch(e){
    //     console.log(e,"sssssss")
    // }
    if(FilterModel.test.ip(ip) || FilterModel.test.userId(ctx.session.userId)){

        // 自动注销饼干
        ctx.session.userId = null;

        // return ctx.forbidden('没有权限');
        return 
    }
    await next()
};
