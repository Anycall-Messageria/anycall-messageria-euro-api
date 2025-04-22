
import Tag from '../model/tags.model.js'
import response from '../../response.js'

async function list(req, res) {
    try {
        const user_comp = req.user.user_company
        const tags = await Tag.findAll({ where: {company_id: user_comp} }) 
        response(res, 200, true, 'list tags', tags)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

const add = async (req, res) => {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const { tag, color, isActive } = req.body
        const tags = await Tag.create({ tag, color, isActive: true, company_id: user_comp });
        response(res, 200, true, 'create success', tags)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}



async function del(req, res) {
    try {
        const id = req.params.id
        const datas = await Tag.destroy({where: {id: id}})
        response(res, 200, true, 'Item deleted successfully!', datas)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

const update = async (req, res) => {
    try {
        const { id, tag, color, isActive } = req.body
        const isCond = isActive ? true : false
        const condition = { where :{id: id } } 
        const values = {tag, color, isActive: isCond}
        const multi = { multi: true }
        let tags = await Tag.update( values, condition ,  multi )
        response(res, 200, true, 'update success', tags)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}
 
  
export {  list, add , del, update  }
