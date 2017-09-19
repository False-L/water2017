const router = require('koa-router')()
const koaBody = require('koa-body')({multipart: true})

const multer = require('koa-multer')
const upload = multer({ dest: 'uploads/' })

router.prefix('/system')

var SettingController = require('../controllers/SettingController.js')
var CacheController = require('../controllers/CacheController.js')
var FilterController = require('../controllers/FilterController.js')
var FtpController = require('../controllers/FtpController.js')


/**
 * 系统配置
 */
router.get('/setting',SettingController.index)
router.post('/setting/update',koaBody,SettingController.update)
/**
 * 过滤配置
 */
router.get('/filter',FilterController.index)
router.get('/filter/create',FilterController.create)
router.get('/filter/remove',FilterController.remove)

/**
 * 缓存配置
 */
router.get('/cache',CacheController.index)
router.get('/cache/flush',CacheController.flushCache)
/**
 * FTP
 */
router.get('/ftp',FtpController.index)
router.post('/ftp/put',upload.single('files'),FtpController.put)
router.post('/ftp/remove',koaBody,FtpController.remove)
router.post('/ftp/mkdir',koaBody,FtpController.mkdir)

module.exports = router