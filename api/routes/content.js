const router = require('koa-router')()
const koaBody = require('koa-body')()


router.prefix('/content')

var ForumController = require('../controllers/ForumController.js')


router.get('/forum',ForumController.index)
router.get('/forum/create',ForumController.create)
router.post('/forum/create',koaBody,ForumController.create)

module.exports = router