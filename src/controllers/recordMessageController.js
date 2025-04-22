import RecordMessages from '../model/recordMessage.model.js'
import response from '../../response.js'

const list = async (req, res) => {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const lists = await RecordMessages.findAll({where: {company_id: user_comp}, order: [['tipo', 'ASC'], ['id', 'ASC']] })
        response(res, 200, true, 'List ocorrences', ocorrences)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

async function getMessage(req, res) {
    try {
    const credorid = req.params['id']
    const user_comp = req.user.user_company // where: {company_id: user_comp}
      const recordMsgs = await RecordMessages.findAll({ where:{credorid, company_id: user_comp}, order: [['credorid', 'ASC'], ['tipo', 'ASC']] })
      response(res, 200, true, 'List recordMsgs', recordMsgs)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}


const add = async (req, res) => {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const { credor, tipo, mensagem } = req.body
        console.log(credor)
        const splitCredor = credor
		const resSplitCredor = splitCredor.split("-", 2)
        console.log(resSplitCredor)
        const credorid =  resSplitCredor[0]
        const emitente =  resSplitCredor[1]
        const recordMsgs = await RecordMessages.create({ tipo, mensagem, credorid, credor: emitente, company_id: user_comp });
        response(res, 200, true, 'create success', recordMsgs)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}
  
const update = async (req, res) => {
    const { id, mensagem, status, tipo} = req.body
    try {
        const condition = { where :{id: id } } 
        const options = { multi: true }
        const values= {id, mensagem, status, tipo}
        const recordMsgs = await RecordMessages.update( values, condition , options )
        response(res, 200, true, 'update success', recordMsgs)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

async function del(req, res) {
    try {
        const id = req.params.id
        const datas = await RecordMessages.destroy({where: {id: id}})
        response(res, 200, true, 'Item deleted successfully!', datas)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

const getRecordMessage = async (req, res) => {
    try {
        const id = req.params['id'];
        const lists = await RecordMessages.findOne({ where: {'id': id }})
        response(res, 200, true, 'update success', lists)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}

export {  list, add, update, del, getRecordMessage, getMessage }
