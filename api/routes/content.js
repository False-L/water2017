const router = require('koa-router')()

router.prefix('/content')

var ForumController = require('../controllers/ForumController.js')


router.get('/forum',ForumController.index)

module.exports = router