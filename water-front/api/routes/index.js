const router = require('koa-router')()
const multer = require('koa-multer')
const koaBody = require('koa-body')({multipart: true})
const userAuth = require('../policies/userAuth.js')
//文件上传  
//配置  
var storage = multer.diskStorage({  
    //文件保存路径  
    destination: function (req, file, cb) {  
      cb(null, 'public/uploads/')  
    },  
    //修改文件名称  
    filename: function (req, file, cb) {  
      var fileFormat = (file.originalname).split(".");  
      cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);  
    }  
  })  
//加载配置  
const upload = multer({ storage: storage })

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

router.get('/f/:forum',ForumController.index)
router.post('/f/:forum/create',koaBody,ThreadsController.create)


module.exports = router
