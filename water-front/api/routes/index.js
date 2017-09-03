const router = require('koa-router')()

var HomepageController = require('../controllers/HomepageController.js')
var ForumController = require('../controllers/ForumController.js')
var ThreadsController = require('../controllers/ThreadsController.js')


router.get('/', HomepageController.index)
router.get('/:format?', HomepageController.index)
router.get('/homepage/menu/:format?',HomepageController.menu)
// router.get('/homepage/ref/:format?',HomepageController.ref)
router.get('/homepage/isManager',HomepageController.isManager)
// router.get('/search/:format?',HomepageController.search)
// router.get('/homepage/switchType',HomepageController.switchType)

router.get('/f/:forum?',ForumController.index)
router.get('/:forum/create.:format?',ThreadsController.create)


module.exports = router
