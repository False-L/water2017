
module.exports = async function bootstrap (ctx,next) {
    console.log('bootstrap')
    global.H = {
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