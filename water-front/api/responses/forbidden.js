/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden(err);
 * return res.forbidden(err, 'some/specific/forbidden/view');
 *
 * e.g.:
 * ```
 * return res.forbidden('Access denied.');
 * ```
 */
const utility = require('../services/utility.js')

module.exports = async function forbidden(data) {

        var ctx = this;
        
        ctx.wantType = utility.checkWantType(ctx.params.format);
    
        // Set status code
        ctx.status  =  403;
    
        // Log error to console
        if (data !== undefined) {
            console.log('Sending 403 ("Forbidden") response: \n', data);
        }
        else {
            console.log('Sending 403 ("Forbidden") response');
        }
        var data = {
            data: data,
            msg:data,
            success: false,
            code: 403
        };
    
        switch (ctx.wantType.param) {
    
    //        case 'xml':
    //            var html = json2xml(data);
    //            html = '<?xml version="1.0" encoding="UTF-8"?><root>' + html + '</root>';
    //            res.set('Content-Type', 'text/xml');
    //            res.send(200, html);
    //            break;
    
            // case 'json':
            //     sails.services.cache.set(req.cacheKey, data);
            //     sails.config.jsonp ? res.jsonp(data) : res.json(data);
            //     break;
    
            // case 'mobile':
            //     res.render('mobile/code/403', data, function (err, html) {
            //         if (err) {
            //             return res.serverError(err);
            //         }
            //         res.send(200, html);
            //     });
            //     break;
    
            case 'desktop':
            default :
                await ctx.render('desktop/code/403', data);
                break;
        }
    
    };
    
    