import Ocorrences from '../model/ocorrences.model.js'
import OcorrencesStatus from '../model/ocorrencesStatus.model.js'

async function list(req, res) {
    const user = req.user.name
    const user_comp = req.user.user_company
    try {
        const ocorrences = await Ocorrences.findAll({ where: {company_id: user_comp}, order: [['id', 'ASC']] }) 
        response(res, 200, true, 'List ocorrences', ocorrences)
    } catch (err) {
        console.log(err)
    }
}

const add = async (req, res) => {
    try {
        const user_comp = req.user.user_company
        const { descricao, status_ocorrencia, status } = req.body
        const state = status == 1 ? true : false
        const ocorrences = await Ocorrences.create({ descricao, status_ocorrencia, status: state, company_id: user_comp });
        response(res, 200, true, 'create success', ocorrences)
    } catch (err) {
        console.log(err);
    }
}

async function del(req, res) {
    try {
        const id = req.params.id
        const datas = await Ocorrences.destroy({where: {id: id}})
        response(res, 200, true, 'Item deleted successfully!', datas)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

const update = async (req, res) => {
    try {
    const user = req.user.name
    const { id, descricao, status_ocorrencia, status } = req.body
    const state = status == 1 ? true : false
    const condition = { where :{ id } } 
    const options = { multi: true }
      let values = {
            descricao, status_ocorrencia, status: state
        }
        let ocorrences = await Ocorrences.update( values, condition , options )
        response(res, 200, true, 'create success', ocorrences)
    } catch (error) {
          console.log(error)
    }
  }


export {  list, add, update , del }
