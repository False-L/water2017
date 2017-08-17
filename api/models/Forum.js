/**
 * Forum.js
 *
 * @description :: 版块
 */

const dbUtils=require('../../utils/db.js')

const ForumModel={

  /** 
   * 查找所有板块数据
   *
   */ 
  async findAll(){
      let _sql=`SELECT * from forum`
      let result =await dbUtils.query(_sql)
      if ( !Array.isArray(result) || result.length < 0 ) {
            result = null
      }
      return result
  },
  /** 
   * 创建新版块
   * @param {object} values
   */ 
  async create(values){
      let input=[]
      Object.keys(values).forEach(item=>{
        input.push(values[item])
      })
      let result = await dbUtils.insertData('forum',input)
      return result
  },
  /** 
   * 更新版块
   * @param {array} values
   * @param {Number} id
   */ 
  async update(id,values){
      let input=values.pop(id)
      let result = await dbUtils.updateData(`forum`,input)
      return result
  },
  /** 
   * 删除版块
   * @param {Number} id
   */
  async remove(id){
    let result = await dbUtils.deleteDataById(`forum`,id)
    return result
  },


  /**
   * 查找一个存在用户的数据
   * @param  {obejct} options 查找条件参数
   * @return {object|null}        查找结果
   */
  async getExistOne(options) {
    let _sql = `
    SELECT * from user_info
      where name="${options.name}" or header="${options.header}"
      limit 1`
    let result = await dbUtils.query( _sql )
    if ( Array.isArray(result) && result.length > 0 ) {
      result = result[0]
    } else {
      result = null
    }
    return result
  },
}

module.exports=ForumModel