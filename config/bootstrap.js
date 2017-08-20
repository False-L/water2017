
module.exports = async function bootstrap (ctx,next) {
    console.log('bootstrap')
    global.H = {
        // settings:{
        //     siteName:'',
        //     siteClose:false,
        //     siteCloseMessage:false
        // }
    }
    ctx.state.H={
        settings:{
            siteName:'aicocico',
            siteClose:false,
            siteCloseMessage:false
        }
    }
    await next()
}