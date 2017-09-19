/**
 * FtpController
 *
 * @description :: Server-side logic for managing ftps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var path = require('path')
var ftp = require('promise-ftp')
var fs = require('fs')

var FtpServices = require('../services/Ftp.js')

module.exports = {

    // 浏览
    index:  async function (ctx, next) {
        var remoptePath = ctx.query.path || __dirname
        let data
        try{
            let ftpClient = await FtpServices.ready()
            let data = await ftpClient.list(remoptePath)
            await ftpClient.end()
            await ctx.render('system/ftp/index', {
                page: {
                    name: 'FTP管理',
                    desc: 'CDN及静态文件管理，主要是静态文件管理。'
                },
                path: remoptePath,
                breadcrumb: remoptePath.split('/'),
                data: data
            })  
        }catch(err){
            console.log('err',err)
            // return ctx.redirect('back')
            return
        }     
    },

    // 上传
    put: async function (ctx, next) {

        if (ctx.method != 'POST') {
            return await next()
        }
        //originalname 文件名称，path上传后文件的临时路径，mimetype文件类型
		const {originalname, path, mimetype,size} = ctx.req.file
        
        var nowPath = ctx.query.path || '/'
        // nowPath = path.normalize(nowPath) 
        if(size>200*1024*1024){
            return ctx.redirect('back')
        }
        if(!originalname){
            return ctx.redirect('back')
        }
        var localPath = path
        var remotePath = nowPath + '/' + originalname
        try{
            let ftpClient = await FtpServices.ready()
            await ftpClient.put(localPath,remotePath)
            await fs.unlink(localPath)//删除文件
            await ftpClient.end()
            return ctx.redirect('back')
        }catch(err){
            console.log(err)
            //之后可以对文件进行上出上传到七牛等操作，完成操作后
            fs.unlink(path)//删除文件
            return ctx.redirect('back')
        }

    },

    // 创建文件夹
    mkdir: async function (ctx, next) {
        var body = ctx.request.body || {}
        body = JSON.stringify(body)
        body = JSON.parse(body)
        body = body.fields
        if (ctx.method != 'POST') {
            return 
        }
        console.log(body)
        var nowPath = ctx.query.path || '/'
        // nowPath = path.normalize(nowPath)
        var dirName = body.dirName;
        if (!dirName) {
            return 
        }
        var dirPath = nowPath + '/' + dirName
        console.log(dirPath)
        // dirPath = path.normalize(dirPath);
        try{
            let ftpClient = await FtpServices.ready()
            await ftpClient.mkdir(dirPath,true)
            await ftpClient.end()
            return ctx.redirect('back')
        }catch(err){

            return ctx.redirect('back')
        }
    },

    // 删除文件
    remove: async function(ctx,next){

        var files = ctx.body.files || []
        var withParent = req.body.withParent

        if(!files || files == '' || files.length == 0){
            // res.notFound();
        }

        if(typeof files == 'string')
            files = [files];

        var handledFiles = files;

        if(withParent && withParent == 'true'){

            for(var i in files){
                var file = files[i];
                if(file.indexOf('/image/')==0){
                    handledFiles.push(file.replace('/image/','/thumb/'));
                } else if(file.indexOf('/thumb/')==0){
                    handledFiles.push(file.replace('/thumb/','/image/'));
                } else if(file.indexOf('/h/upload/th/')==0){
                    handledFiles.push(file.replace('/h/upload/th/','/h/upload/'));
                } else if(file.indexOf('/h/upload2/th/')==0){
                    handledFiles.push(file.replace('/h/upload2/th/','/h/upload2/images/'));
                } else if(file.indexOf('/h/upload2/images/')==0){
                    handledFiles.push(file.replace('/h/upload2/images/','/h/upload2/th/'));
                } if(file.indexOf('/h/upload/')==0){
                    handledFiles.push(file.replace('/h/upload/','/h/upload/th/'));
                }
            }
        }
        try{
            let = await FtpServices.ready()
            let ftpClient = await FtpServices.ready()
            return ctx.redirect('back');
        }catch(err){
            // return ctx.redirect('back');
        }
    }
}

