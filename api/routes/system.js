const router = require('koa-router')()
const koaBody = require('koa-body')({multipart: true})


router.prefix('/system')

var SettingController = require('../controllers/SettingController.js')
/**
 * 系统配置
 */
router.get('/setting',SettingController.index)
router.post('/setting/update',koaBody,SettingController.update)
/**
 * 过滤配置
 */

 module.exports = router