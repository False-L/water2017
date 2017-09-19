const Koa = require('koa')
const app = new Koa()
const session = require('koa-session')
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const koaBody = require('koa-body')
const RedisStore = require('./middleware/redisStore.js')
const Store = require('./middleware/store.js')
const logUtil = require('./utils/log_util.js')
const bootstrap = require('./config/bootstrap.js')
const userAuth = require('./api/policies/userAuth.js')
const index = require('./api/routes/index')
// const users = require('./api/routes/users')
// const content = require('./api/routes/content')
// const system = require('./api/routes/system')

// error handler
onerror(app)

//全局参数导入
bootstrap()

var store = RedisStore({
  host: '127.0.0.1',
  port: 6379,
  database: 7
})
// middlewares
app.keys = ['d38f989e2dbd315793cb2675d29099a8']
const CONFIG = {
  key: 'sess:', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
  store:new Store()
}

app.use(session(CONFIG,app))


app.use(koaBody(),{multipart:true})

app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))


app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

console.log('已经启动')

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  var ms
  try{
      await next()
      ms = new Date() - start
      console.log(ms+'ms')
      logUtil.logResponse(ctx,ms)
  } catch(error){
      ms = new Date()-start
      //await next()
      console.log(error)
      logUtil.logError(ctx,error,ms)
  }
})

// app.use(bootstrap)

// console.log('H')
 app.use(userAuth)
// routes
app.use(index.routes(), index.allowedMethods())
//auth
// app.use(userAuth)

module.exports = app
