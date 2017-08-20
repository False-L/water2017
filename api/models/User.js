/**
 * User.js
 *
 * @description ::用户
 */
const Sequelize = require('sequelize')

const sequelize = require('../../utils/dbpool.js')

sequelize.define('user',{
  access:{
    type:Sequelize.ENUM,
    defaultValue:['manager']
  },
  name:{
    type:Sequelize.STRING,
    allowNull:false
  },
  pasword:{
    type:Sequelize.STRING,
    allowNull:false
  },
  salt:{
    type:Sequelize.STRING,
    allowNull:false
  },
},{      
  freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
  tableName: 'user',       
  timestamps: false     
})
var UserModel = sequelize.models.user

module.exports = UserModel
