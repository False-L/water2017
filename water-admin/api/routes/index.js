const router = require('koa-router')()

var HomepageController = require('../controllers/HomepageController.js')

router.get('/', HomepageController.index)
router.get('/signin',HomepageController.signin)
router.post('/signin',HomepageController.signin)
router.get('/signout',HomepageController.signout)

module.exports = router
