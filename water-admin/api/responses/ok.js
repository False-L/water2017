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

module.exports = async function sendOK(data,options) {
        
        var ctx = this;

        // Set status code
        ctx.status = 200;
       // If appropriate, serve data as JSON(P)
        if (ctx.wantsJSON) {
            return ctx.body = data ;
        }

        
        // sails.log.silly('res.ok() :: Sending 200 ("OK") response');
        console.log('ctx.ok() :: Sending 200 ("OK") response');

        options = (typeof options === 'string') ? { view: options } : options || {};

        // If a view was provided in options, serve it.
        // Otherwise try to guess an appropriate view, or if that doesn't
        // work, just send JSON.
        if (options.view) {
            return ctx.render(options.view, { data: data });
        }

        // If no second argument provided, try to serve the implied view,
        // but fall back to sending JSON(P) if no view can be inferred.
        else {
            return ctx.body = {data:data};
        }
};
    