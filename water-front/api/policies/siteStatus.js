/**
 * siteStatus
 *
 * @module      :: Policy
 * @description :: 用户有效性检查
 *
 */
module.exports = async function (ctx, next) {
    
        if(H.settings.siteClose && H.settings.siteClose == 'true'){
            if(ctx.params.format && ctx.params.format == 'json'){
                return next();
            } else {
                return ctx.forbidden(H.settings.siteCloseMessage || '网站维护中');
            }
        }
    await next();
}
    