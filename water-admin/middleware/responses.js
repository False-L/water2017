var resobj = require('../api/responses/index.js');

function responses(){
    return async (ctx,next)=>{
        ctx.badRequest = resobj.badRequest;
        ctx.ok = resobj.ok;
        ctx.serverError = resobj.serverError;
        ctx.notFound = resobj.notFound;
        ctx.forbidden = resobj.forbidden;
        await next();
    }
}
module.exports = responses ;