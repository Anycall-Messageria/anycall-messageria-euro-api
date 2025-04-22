import Sequelize, { QueryTypes }  from 'sequelize'
import database from "../../../database/dbPostgresClient.js"
import Servicequeue from '../../model/servicequeues.model.js'
import User from "../../model/user.model.js"
import Queues from '../../model/queue.model.js'

const findAllListServicequeue = async (page, limit, user_comp) => {
    try {
        
        let query = `select s.id, s.queue, s."userId", s."isActive", s."tenantId",
        q.creditor 
        from servicequeues s
        inner join products q on q.id = s.queue
        where s.company_id = ${user_comp};`
        const servicequeue = await database.query(query, { type: QueryTypes.SELECT });
       return servicequeue
    } catch (err) {
        console.log(err)
    }
}

  
export {  findAllListServicequeue }

