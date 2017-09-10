/**
 * userAuth
 *
 * @module      :: Policy
 * @description :: 用户有效性检查
 *
 */

// var signature = require('cookie-signature');
var FilterModel = require('../models/Filter.js')

// 饼干验证
function parseCookie(str){

    var secret = sails.config.session.secret;

    return str.substr(0, 2) === 's:'
        ? signature.unsign(str.slice(2), secret)
        : str;
}



// 本篇
module.exports = async function (ctx,next) {

    // 0. 字符串传值
    if (ctx.query.userId ){

    }


    // 1. 是否有饼干
    if (ctx.cookies.get(signedCookies) && ctx.signedCookies.userId) {

        if(ctx.signedCookies.userId.length > 8 ){
            ctx.clearCookie('userId')
            // return res.forbidden('没有权限')
            return 
        }

        // 饼干续费
        ctx.cookies.set('userId', ctx.signedCookies.userId, { maxAge: Number(H.settings.cookieExpires) || 900000, signed: true });

    } else if (H.settings.cookieSignup == 'true' || (ctx.signedCookies && ctx.signedCookies.managerId)) {

        // 生成饼干
        var char = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
        var seed = new Date().getTime();
        var userId = "";
        for (var i = 0; i < 8; i++) {
            userId += char.charAt(Math.ceil(Math.random() * seed) % char.length);
        }

        ctx.cookies.set('userId', userId, { maxAge: Number(H.settings.cookieExpires) || 900000, signed: true });
        ctx.signedCookies.userId = userId

    } else {

        // 没有饼干
        // return res.forbidden('没有饼干');
        return 
    }

    // 2. userId/IP 是否被封禁
    // var ip = req.headers['x-forwarded-for'] ||
    //     req.connection.remoteAddress ||
    //     req.socket.remoteAddress ||
    //     req.connection.socket.remoteAddress ||
    //     '0.0.0.0';
    var ip = ctx.ip || '0.0.0.0'

    if(FilterModel.test.ip(ip) || FilterModel.test.userId(ctx.signedCookies.userId)){

        // 自动注销饼干
        ctx.clearCookie('userId');

        // return ctx.forbidden('没有权限');
        return 
    }

    return next()

};
