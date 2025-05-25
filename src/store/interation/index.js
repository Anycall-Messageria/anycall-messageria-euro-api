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
    
    // Buscar campanha primeiro
    const camp = await Campaing.findOne({ 
      where: { number: jid, session: session, status: 200}, 
      order: [ [ 'id', 'DESC' ]] 
    })
    
    if(camp){
      console.log('Campanha', camp.var9)
      
      // Otimização: Uma única query para buscar queue, depois buscar services
      const queue = await Queues.findOne({ where: {'identificador': camp.identificador}})
      const services = queue ? await Servicequeues.findOne({where: {queue: queue.product}}) : null
      
      if (queue) {
        queueId = queue.id
        const genericUser = JSON.stringify(["5"])
        queues = services?.userId ? services.userId : genericUser
        agent = camp.var9 ? parseInt(camp.var9) : await randomAgenteInteration(queues)
      } else {
        queueId = 1
        agent = 5
      }
    } else {
      queueId = 1
      agent = 5
    }
    return {id: queueId, agent: agent}
  } catch (error) {
    console.error('[atributteCampaing] Erro:', error)
    // Fallback seguro
    return {id: 1, agent: 5}
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
  findInteration(remotejid, session).then(async function(resp){ 
    let push = {remotejid, idmessage, messagerecive, pushname, fromme, session, id_interation: resp, urlProfile}    
    if(resp){
      console.log('Localizou')
      uppdateInteration(remotejid, session, messagetimestamp).then(function(r){
      })
      recordMessage(push, status).then(function(r){})
    }else{
      console.log('Nao Localizou', session)
      
      // Otimização: Executar busca de sessão e campanha em paralelo
      const [sessionData, campaignData] = await Promise.all([
        Session.findOne({ where: { number: parseInt(session) } }),
        atributteCampaing(remotejid, session)
      ])
      
      if(sessionData){
        let agent = campaignData.agent ? campaignData.agent : 5
        const save = { 
          jid: remotejid, 
          firstconversation: messagetimestamp, 
          fromme, 
          session, 
          urlProfile, 
          session_id: sessionData.id, 
          users: agent, 
          id_campaing: campaignData.id
        }
        
        try {
          const interactionId = await createInteration(save)
          let push = {remotejid, idmessage, messagerecive, pushname, fromme, session, id_interation: interactionId, urlProfile}    
          await recordMessage(push, status)
        } catch (error) {
          console.error('[getInteration] Erro ao criar interação:', error)
        }
      } else {
        console.log('[getInteration] Sessão não encontrada:', session)
        return
      }
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


