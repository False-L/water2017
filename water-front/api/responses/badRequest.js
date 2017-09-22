/**
 * 400 (Bad Request) Handler
 *
 * Usage:
 * return res.badRequest();
 * return res.badRequest(data);
 * return res.badRequest(data, 'some/specific/badRequest/view');
 *
 * e.g.:
 * ```
 * return res.badRequest(
 *   'Please choose a valid `password` (6-12 characters)',
 *   'trial/signup'
 * );
 * ```
 */
const utility = require('../services/utility.js')

 module.exports = async function badRequest(data) {
     console.log('this================',this)
     var ctx = this;
     ctx.status = 400;
     if(data !=undefined){
         console.log('Sending 400 ("Bad Request") response: \n', data);
     }else{
         console.log('Sending 400 ("Bad Request") response');
     }
     var data = {
        data: data,
        msg: data,
        success: false,
        code: 400
     }
     switch ('desktop') {
        case 'desktop':
        default :
            await ctx.render('desktop/code/400', data)
            break;
     }
 }