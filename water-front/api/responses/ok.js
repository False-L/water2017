/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 * return res.ok(data, 'auth/login');
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */
const utility = require('../services/utility.js')

module.exports = async function sendOK(data,etc) {
        
        var ctx = this;

    
        ctx.wantType = utility.checkWantType(ctx.params.format);
    
        // sails.log.silly('res.ok() :: Sending 200 ("OK") response');
    
        // Set status code
        ctx.status = 200;
    
        var data = {
            data:data,
            success:true,
            code:200
        };
    
        if(_.isObject(etc)){
            for(var i in etc){
                data[i] = etc[i];
            }
        } else if(etc) {
            data['etc'] = etc;
        }
    
        switch (ctx.wantType.param) {
    
    //        case 'xml':
    //            var html = json2xml(data);
    //            html = '<?xml version="1.0" encoding="UTF-8"?><root>' + html + '</root>';
    //            res.set('Content-Type','text/xml');
    //            res.send(200, html);
    //            break;
    
            // case 'json':
            //     sails.services.cache.set(req.cacheKey, data);
            //     sails.config.jsonp ? res.jsonp(data) : res.json(data);
            //     break;
    
            // case 'mobile':
            //     res.render('mobile/code/200', data, function (err, html) {
            //         if (err) {
            //             return res.serverError(err);
            //         }
            //         res.send(200, html);
            //     });
            //     break;
    
            case 'desktop':
            default :
                await ctx.render('desktop/code/200', data);
                break;
        }
    
    };
    