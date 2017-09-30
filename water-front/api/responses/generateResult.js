/**
 * 200 (OK) Response - Generate Result , Include html & json etc.
 *
 * Usage:
 * return res.generateResult(data,wantType,cacheKey);
 *
 * @param  {Object} data
 * @param  {Object} option
 *              {
 *                  wantType: {enum} desktop/mobile/json/xml
 *                  desktopView: {string}
 *                  cacheKey: {string}
 *              }
 */
const utility = require('../services/utility.js')
const Cache = require('../services/Cache.js')

module.exports =  async function generateResult(data, option) {
    
        var  ctx = this;
        // sails.log.silly('res.ok() :: Sending 200 ("OK") response');
        console.log('ctx.ok() :: Sending 200 ("OK") response');
        // Set status code
        ctx.status = 200;
    
        if(!option || !_.isObject(option)){
            return ctx.serverError('结果生成初始化失败:预期外参数');
        }
    
        switch (ctx.wantType.param) {
            // ctx.wantType.param
    //        case 'xml':
    //            var html = json2xml(data);
    //            html = '<?xml version="1.0" encoding="UTF-8"?><root>' + html + '</root>';
    //            sails.services.cache.set(req.cacheKey, html);
    //            res.set('Content-Type','text/xml');
    //            res.send(200, html);
    //            break;
    
            case 'json':
                Cache.set(req.cacheKey, data);
                return ctx.body = data;
                break;
    
            case 'mobile':
                await ctx.render(option.mobileView, data);
                Cache.set(ctx.cacheKey, ctx.body);
                break;
    
            case 'desktop':
            default :
                // Cache.set(ctx.cacheKey, html);
                await ctx.render(option.desktopView, data);
                Cache.set(ctx.cacheKey, ctx.body);
                // console.log(ctx.body)
                break;
        }
    
    };
    