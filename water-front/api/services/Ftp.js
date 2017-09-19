/**
* FtpService
*
* @description :: 文件上传通用包
*
* - put(buffer) 上传文件
* - list(path) 显示对应路径列表
* - mkdir(path) 创建文件夹
* - exist(path) 对应文件/文件夹是否存在
* - unlink(path) 删除对应文件
*/
var path = require('path')
var ftp = require('promise-ftp');
var fs = require('fs')

var config = require('../../config/env/development.js') 

module.exports = {
    
    ready: function () {
            return new Promise(function(resolve,reject){
                // Ftp 初始化
                var ftpClient = new ftp()
                ftpClient.connect(config.ftpServer)
                    .then(function (serverMessage) {
                        console.log('Server message: '+serverMessage)
                        resolve(ftpClient)
                    }).catch(err=>{
                        reject(err)
                    })
            })        
    }
};