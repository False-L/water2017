const router = require('koa-router')()

var HomepageController = require('../controllers/HomepageController.js')

router.get('/', HomepageController.index)
// router.get('/', async (ctx, next) => {
//   await ctx.render('homepage/index', {
//     title: 'Hello Koa 2!'
//   })
// })

router.get('/posts', async (ctx, next) => {
  
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
