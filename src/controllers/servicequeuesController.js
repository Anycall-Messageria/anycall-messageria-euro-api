import Servicequeue from '../model/servicequeues.model.js'
import response from '../../response.js'
import { findAllListServicequeue } from '../service/servicequeue/find.js'
import QueueUsers from '../model/queue_users.js'

async function list(req, res) {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const servicequeues = await findAllListServicequeue(1,8, user_comp) 
        response(res, 200, true, 'list servicequeues.', servicequeues)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}


async function add(req, res) {
    try {
        const user_comp = req.user.user_company
        const { queue, userId, isActive } = req.body
        const objuserId = JSON.stringify(userId)
        const servicequeues = await Servicequeue.create({ queue, userId: objuserId, isActive: true, company_id: user_comp });
        const userQueue = JSON.parse(servicequeues.userId)   
        userQueue.map(async function(data){
            const create = await QueueUsers.create({creditor_id: queue, user_id: data }) 
            response(res, 200, true, 'create success.', data)
        })
    } catch (err) {
        const data = { err }
        console.error(err)
        response(res, 500, false, 'server application error.', data)
    }
  }
  
  async function update(req, res) {
    try {
        const { id, queue, userId, isActive } = req.body
        const isCond = isActive ? true : false
        const condition = { where :{id: id } } 
        const values = { queue, userId, isActive: isCond }
        const multi = { multi: true }
        const data = await Servicequeue.update( values, condition ,  multi )
        response(res, 200, true, 'update success.', data)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
  }
  
export {  list , add, update }

