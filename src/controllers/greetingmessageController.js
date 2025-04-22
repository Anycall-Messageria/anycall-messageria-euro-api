import Greetingmessage from '../model/greetingmessages.model.js'
import response from '../../response.js'

async function list(req, res) {
    try {
        const user_comp = req.user.user_company
        const greetingmessages = await Greetingmessage.findAll({ where: { company_id: user_comp }, order: [
      ["type", "ASC"], ["id", "ASC"]
    ]}) 
        response(res, 200, true, 'Lis greetingmessage', greetingmessages)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
     }
}

const add = async (req, res) => {
    try {
        const user_comp = req.user.user_company
        const { salutation, type } = req.body
        const greetingmessage = await Greetingmessage.create({ salutation, type, company_id: user_comp});
        console.log("Auto-generated ID:", greetingmessage.id);
        res.redirect('list-greetingmessages')
    } catch (err) {
        const data = { err }
        response(res, 500, false, 'server application error.', data)
     }
}

const update = async (req, res) => {
    try {
        const { salutation, type, status, id } = req.body
        const values = {salutation, type, status}
        const condition = { where :{id: id } } 
        const options = { multi: true }
        let result = await Greetingmessage.update( values, condition , options )
        res.redirect('list-greetingmessages')
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
     }
}



async function getGreetingmessage(req, res) {
    const user_comp = req.user.user_company // where: {company_id: user_comp}
    try {
        const recordMsgs = await Greetingmessage.findAll({ where:{ company_id: user_comp}, order: [['id', 'ASC']] })
        response(res, 200, true, 'Return Greetingmessage', recordMsgs)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }

}

export {  list, add , update, getGreetingmessage }
