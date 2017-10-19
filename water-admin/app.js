const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const koaBody = require('koa-body')
const session = require('koa-session')
const flash = require('koa-flash-simple')


const logUtil = require('./utils/log_util.js')
const bootstrap = require('./config/bootstrap.js')

const index = require('./api/routes/index')
const users = require('./api/routes/users')
const content = require('./api/routes/content')
const system = require('./api/routes/system')

const responses = require('./middleware/responses.js')
// error handler
onerror(app)

//全局参数导入
bootstrap()


// middlewares

app.use(koaBody(),{multipart:true})

app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(session(app)) // Session middleware has to be added before flash
app.use(flash())

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


app.use(responses())
// app.use(bootstrap)

// console.log('H')

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(content.routes(), content.allowedMethods())
app.use(system.routes(),system.allowedMethods())

module.exports = app
