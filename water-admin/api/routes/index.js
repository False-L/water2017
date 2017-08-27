const router = require('koa-router')()

var HomepageController = require('../controllers/HomepageController.js')

router.get('/', HomepageController.index)
router.get('/signin',HomepageController.signin)
router.post('/signin',HomepageController.signin)
router.get('/signout',HomepageController.signout)


router.get('/posts', async (ctx, next) => {
  
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
