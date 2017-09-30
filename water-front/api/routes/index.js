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
const siteStatus = require('../policies/siteStatus.js')
router.use(siteStatus)

/**
 * 首页
 */
router.get('/', HomepageController.index)
router.get('/:format?', HomepageController.index)
router.get('/homepage/menu/:format?',HomepageController.menu)
router.get('/homepage/ref/:format?',ThreadsController.ref)
router.get('/homepage/isManager',HomepageController.isManager)
router.get('/search/:format?',HomepageController.search)
router.get('/homepage/switchType',HomepageController.switchType)

/** 
 * 串
 */
router.get('/t/:tid/:format?',ThreadsController.index)
router.post('/t/:tid/create/:format?',koaBody,ThreadsController.create)

/**
 * 版块
 */
router.get('/f/:forum',ForumController.index)
router.post('/f/:forum/create',koaBody,ThreadsController.create)
/**
 * 功能
 */

module.exports = router
