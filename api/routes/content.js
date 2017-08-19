const router = require('koa-router')()
const koaBody = require('koa-body')({multipart: true})


router.prefix('/content')

var ForumController = require('../controllers/ForumController.js')
var ThreadsController = require('../controllers/ThreadsController.js')

/**
 * 版块
 */
router.get('/forum',ForumController.index)
router.get('/forum/create',ForumController.create)
router.post('/forum/create',koaBody,ForumController.create)
router.get('/forum/:id/update',ForumController.update)
router.post('/forum/:id/update',koaBody,ForumController.update)
router.get('/forum/remove',ForumController.remove)
router.get('/forum/:id/remove',ForumController.remove)
router.get('/forum/:id/set',ForumController.set)

/**
 * 帖子
 */
router.get('/threads',ThreadsController.index)
router.get('/threads/create',ThreadsController.create)
router.post('/threads/create',koaBody,ThreadsController.create)
// router.get('/threads/:id/update',ThreadsController.update)
// router.remove('/threads/remove',ThreadsController.remove)

module.exports = router