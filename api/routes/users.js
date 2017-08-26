const router = require('koa-router')()
var UserController = require('../controllers/UserController.js')

router.prefix('/user')

router.get('/', UserController.index)

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
