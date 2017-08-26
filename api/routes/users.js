const router = require('koa-router')()
var UserController = require('../controllers/UserController.js')
const koaBody = require('koa-body')({multipart: true})

router.prefix('/user')

router.get('/', UserController.index)
router.get('/create',koaBody,UserController.create)
router.post('/create',koaBody,UserController.create)
router.get('/:id/update',UserController.update)
router.post('/:id/update',koaBody,UserController.update)
router.get('/:id/remove',UserController.remove)
router.get('/remove',UserController.remove)

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
