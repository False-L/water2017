/**
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
 * return res.notFound(err);
 * return res.notFound(err, 'some/specific/notfound/view');
 *
 * e.g.:
 * ```
 * return res.notFound();
 * ```
 *
 * NOTE:
 * If a request doesn't match any explicit routes (i.e. `config/routes.js`)
 * or route blueprints (i.e. "shadow routes", Sails will call `res.notFound()`
 * automatically.
 */
const utility = require('../services/utility.js')

module.exports = async function notFound(data) {
    
        //
        var ctx = this;
    
        ctx.wantType = utility.checkWantType(ctx.params.format);
    
        // Set status code
        ctx.status = 404;
    
        // Log error to console
        if (data !== undefined) {
            console.log('Sending 404 ("Not Found") response: \n', data);
        }
        else {
            console.log('Sending 404 ("Not Found") response');
        }
        var data = {
            data: data,
            msg:data,
            success: false,
            code: 404
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
            //     res.render('mobile/code/404', data, function (err, html) {
            //         if (err) {
            //             return res.serverError(err);
            //         }
            //         res.send(200, html);
            //     });
            //     break;
    
            case 'desktop':
            default :
                await ctx.render('desktop/code/404', data);
                break;
        }
    
    };
    
    