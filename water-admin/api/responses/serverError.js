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

module.exports = async function serverError(data) {

        var ctx = this;

    
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

        // If the user-agent wants JSON, always respond with JSON
        if (ctx.wantsJSON) {
            return ctx.body = data;
        }
        // If second argument is a string, we take that to mean it refers to a view.
        // If it was omitted, use an empty object (`{}`)
        options = (typeof options === 'string') ? { view: options } : options || {};
          // If a view was provided in options, serve it.
        // Otherwise try to guess an appropriate view, or if that doesn't
        // work, just send JSON.
        if (options.view) {
            return ctx.render(options.view, { data: data });
        }else{
            return ctx.render('500', { data: data });
        }
};
    
    