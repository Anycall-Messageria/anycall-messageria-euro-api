import Interation from  '../../model/interations.model.js'
import Session from  '../../model/sessions.model.js'
import { pushMessageDb, updateMessageDB, recordMessageSend } from '../../../src/store/message/index.js'
import { recordContacts, updaterecordContacts, findContactsRemoteJid } from '../../../src/store/contact/index.js'
import {  rand, greetingMessage , comparNumbers, returnJustFieldDDD} from '../../utils/util.js'
import { updateInterationsClient , randomAgenteInteration} from '../../controllers/interationController.js'
import Queues from '../../model/queue.model.js'
import Campaing from '../../model/campaings.model.js'
import Servicequeues from '../../model/servicequeues.model.js'


const atributteCampaing = async (remotejid, sessions) => {
  try {
    const jid = returnJustFieldDDD(remotejid.toString())
    const session = parseInt(sessions)
    console.log('remotejid, sessions jid', remotejid, sessions, jid)
    let queues, agent, queueId
     const camp = await Campaing.findOne({ where: { number: jid , session: session, status: 200}, order: [ [ 'id', 'DESC' ]] })
    if(camp){
      console.log('Campanha', camp.var9)
      const queue = await Queues.findOne({ where:{'identificador': camp.identificador}})
      const services = await Servicequeues.findOne({where: {queue: queue.product}})
      queueId = queue.id
      const genericUser = JSON.stringify(["5"])
      queues = services.userId ? services.userId : genericUser
      agent = camp.var9 ? parseInt(camp.var9) : await randomAgenteInteration(queues)
    }else{
      queueId = 1
      agent = 5
    }
    return {id: queueId, agent: agent}
  } catch (error) {
    console.error(error)
  }
}

const getInteration = async (datas) => {
  try {
    const {status, remotejid, idmessage, messagerecive, messagetimestamp, pushname, fromme, session, urlProfile } = datas
    const len = remotejid.toString()
  if(len.length > 12){
      return
  }
  const saveContact = {name: pushname, verifiedName: pushname, profileUrl: urlProfile, remotejid  }
  findInteration(remotejid, session).then(function(resp){ 
    let push = {remotejid, idmessage, messagerecive, pushname, fromme, session, id_interation: resp, urlProfile}    
    if(resp){
      console.log('Localizou')
      uppdateInteration(remotejid, session, messagetimestamp).then(function(r){
      })
      recordMessage(push, status).then(function(r){})
    }else{
      console.log('Nao Localizou', session)
      let findSessionId = Session.findOne({ where: { number: parseInt(session) } }).then( 
        async function(s){ 
        if(s){
          const idCamp = await atributteCampaing(remotejid, session)
          let agent = idCamp.agent ? idCamp.agent : 5
          const save = { jid: remotejid, firstconversation:messagetimestamp, 
            fromme, session, urlProfile, session_id: s.id, users: agent, id_campaing: idCamp.id}
          let saveInteretion = createInteration(save).then(function(r){
            let push = {remotejid, idmessage, messagerecive, pushname, fromme, session, id_interation: r, urlProfile}    
            recordMessage(push, status).then(function(r){})
          })
        }else{
          return
        }
      })
    }
  })
  findContacts(remotejid, saveContact).then(function(r){})
  } catch (err) {
    console.log(err)
  }
}




const recordMessage = async (push, status) => {
  try {
    await updateInterationsClient(push, status) 
    console.log('Record Message status', status)
  if (status != 1) {
    let date = pushMessageDb(push).then(function(res){
    })
  } else if (status === 1) {
    let date = recordMessageSend(push).then(function(res){
    })
  }
  } catch (err) {
    console.log(err)
  }
}

const findContacts = async (remotejid, data) => {
  try {
    const search = await findContactsRemoteJid(remotejid)
    if(!search){
      await recordContacts(data)
    }
  } catch (err) {
    console.log(err)
  }
}


const findInteration = async (remotejid, getSession) => {
  try {
    const jid = remotejid.toString()
    const session = getSession.toString()
    const save = await Interation.findOne({ where: { jid: jid, /*, session: session,*/ finalization: 0, status: 1}, order: [ [ 'id', 'DESC' ]] })
    if(!save){
      return false
    }
    console.log('findInteration', save.id, remotejid, getSession)
    return save.id 
  } catch (err) {
    console.log(err)
  }
}

const createInteration = async(data) => {
  console.log('Entrou para criar interação')
  try {
      const save = await Interation.create( data )
      return  save.id 
    } catch (err) {
      console.log(err)
  }
}

const uppdateInteration = async (remotejid, session, messagetimestamp) => {
  try {
    const id = remotejid.toString()
    const sessions = session
    const condition = { where :{jid: id , session: sessions} } 
    const options = { multi: true }
    let values = {
        lastconversation: messagetimestamp
    }
    let res = await Interation.update( values, condition , options )
  } catch (err) {
    console.log(err)
  }
}


export { createInteration, findInteration, uppdateInteration, getInteration, atributteCampaing }


