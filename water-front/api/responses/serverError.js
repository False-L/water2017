/**
 * 500 (Server Error) Response
 *
 * Usage:
 * return res.serverError();
 * return res.serverError(err);
 * return res.serverError(err, 'some/specific/error/view');
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`
 * automatically.
 */
const utility = require('../services/utility.js')

module.exports = async function serverError(data) {

        var ctx = this;

        ctx.wantType = utility.checkWantType(ctx.params.format);
    
        // Set status code
        ctx.status = 500;
    
        // Log error to console
        if (data !== undefined) {
            console.error('Sending 500 ("Server Error") response: \n', data);
        }
        else {    
            console.error('Sending empty 500 ("Server Error") response');
        }
        // if (config.environment === 'production') {
        //     data = undefined;
        // }
    
        var data = {
            data: data,
            msg:data,
            success: false,
            code: 500
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
            //     res.render('mobile/code/500', data, function (err, html) {
            //         if (err) {
            //             return res.serverError(err);
            //         }
            //         res.send(200, html);
            //     });
            //     break;
    
            case 'desktop':
            default :
                await ctx.render('desktop/code/500', data);
                break;
        }
    
    };
    
    