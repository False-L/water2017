const router = require('koa-router')()
const koaBody = require('koa-body')({multipart: true})


router.prefix('/content')

var ForumController = require('../controllers/ForumController.js')


router.get('/forum',ForumController.index)
router.get('/forum/create',ForumController.create)
router.post('/forum/create',koaBody,ForumController.create)
router.get('/forum/:id/update',ForumController.update)
router.post('/forum/:id/update',koaBody,ForumController.update)
router.get('/forum/remove',ForumController.remove)
router.get('/forum/:id/remove',ForumController.remove)
router.get('/forum/:id/set',ForumController.set)

module.exports = router