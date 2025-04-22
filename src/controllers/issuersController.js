import Issuers from '../model/issuers.model.js'
import response from '../../response.js'

async function list(req, res) {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const issuers = await Issuers.findAll({ where: {company_id: user_comp} }) 
        response(res, 200, true, 'List  issuers', issuers)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error', data)
    }
}


const add = async (req, res) => {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const { name } = req.body
        const issuers = await Issuers.create({ name , company_id: user_comp});
        response(res, 200, true, 'Create success', issuers)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error', data)
    }
}
  
const update = async (req, res) => {
    try {
        const { id, name } = req.body
        const condition = { where :{id: id } } 
        const values = {name}
        const multi = { multi: true }
        let issuers = await Issuers.update( values, condition ,  multi )
        response(res, 200, true, 'Update success', issuers)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error', data)
    }
}



export {  list, add , update }
