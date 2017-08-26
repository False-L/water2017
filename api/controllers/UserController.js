/**
 * UserController
 *
 * @description :: 用户
 */

const UserModel = require('../models/User.js')

exports.index =  async function (ctx,next) {
    var page = ctx.query.page || 1
    var pagesize = ctx.query.pagesize || 20

    var map = {}
    var sort = {}

    if (ctx.query.name) {
        map['name'] = {
            '$like': ctx.query.name
        };
    }

    if (ctx.query.order) {
        if (ctx.query.sort == 'desc') {
            sort[ctx.query.order] = 'desc';
        } else {
            sort[ctx.query.order] = 'asc';
        }
    } else {
        sort['id'] = 'desc';
    }
    let count =  await UserModel.count({
        where:map
    })
    let result = await UserModel.findAll({
        where:map,
        limit: pagesize,
        offset: page * pagesize
    })
    console.log('user',result)
}