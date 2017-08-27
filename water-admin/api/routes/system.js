const router = require('koa-router')()
const koaBody = require('koa-body')({multipart: true})


router.prefix('/system')

var SettingController = require('../controllers/SettingController.js')
var CacheController = require('../controllers/CacheController.js')

/**
 * 系统配置
 */
router.get('/setting',SettingController.index)
router.post('/setting/update',koaBody,SettingController.update)
/**
 * 过滤配置
 */
/**
 * 缓存配置
 */
router.get('/cache',CacheController.index)


module.exports = router