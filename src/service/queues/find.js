import Session from '../../model/sessions.model.js'
import Sequelize, { QueryTypes }  from 'sequelize'
import Greetingmessage from '../../model/greetingmessages.model.js'
import database from "../../../database/dbPostgresClient.js"

const findAllList = async (id) => {
    try {
        let query = `select id,credor,nomefila,identificador,datainicial,datafinal,rota,
                    tipomidia,midia,captionmidia,tipomensagem,mensageminicial,mensagem,
                    created,status,"minTime","maxTime",entregues,falhas,registros,
                    randomica, msginit_id from queues q where id = ${id};`
        const messages = await database.query(query, { type: QueryTypes.SELECT });
       return messages
    } catch (err) {
        console.log(err)
    }
}


const findInitialMessages = async (id) => {
    const msgs = []
    try {
            let messages = (JSON.parse(id))
            if(typeof(messages) == 'object'){
                messages.forEach(async (val) => {
                    const msg = await Greetingmessage.findOne({ where: {id: val} })
                    const t = {id: msg.id, salutation: msg.salutation}
                    msgs.push(t)
                }); 
                setTimeout(()=> { 
                    return msgs
                 }, 1500)
                
           }
    } catch (err) {
        console.log(err)
    }
}

export { findAllList, findInitialMessages }