import Message from  '../../model/messages.model.js'
import Sendmessage from  '../../model/sendmessages.model.js'
import { sendLink, sendButtons, send, sendMidia, sendsContact, sendNewWithContact }  from  '../../controllers/automateController.js'
import { findString } from '../../utils/util.js'
import {
  getSession, getChatList, isExists, sendMessage,
  sendMessageMidia, sendMessageButtons, sendMessageLink, formatPhone
} from '../../wpp/whatsapp.js'

import {  rand, greetingMessage , comparNumbers} from '../../utils/util.js'
import Campaing from '../../model/campaings.model.js'
import Queues from '../../model/queue.model.js'


const recordMessageSend = async(data) => {
  try {
    console.log('recordMessageSend')
    const save = await Message.create( data )
    } catch (error) {
  }
}

const updateRecordMessageSend = async(id, session) => {
  try {
  const condition = { where :{idmessage: id } } 
  const options = { multi: true }
  let values = {
      session: session
    }
    let res = await Message.update( values, condition , options )
  } catch (error) {
    console.log('Error: '+error)
  }
}

const updatecheckedMessageSend = async(id) => {
  try {
  const condition = { where :{id: id } } 
  const options = { multi: true }
  let values = {
      checked: 1
    }
    let res = await Sendmessage.update( values, condition , options )
  } catch (error) {
    console.log('Error: '+error)
  }
}

const doNotBother = async(id, messagerecive) => {
  try {
  const condition = { where :{id: id } } 
  const options = { multi: true }
  let values = {
      title: messagerecive
    }
    let res = await Sendmessage.update( values, condition , options )
  } catch (error) {
    console.log('Error: '+error)
  }
}

const pushMessageDb = async (datas) => {
    try{
        console.log('pushMessageDb')
        const {remotejid } = datas
        const { messagerecive } = datas
        const { idmessage } = datas 
        const { session } = datas 
        const { fromme } = datas
        const mini = messagerecive.toLowerCase() 
        const save = await Message.create( datas )
        Sendmessage.findOne({ where: { receiver: remotejid , type:2, messageid: null, checked: 0 }, order: [ [ 'id', 'DESC' ]], })
        .then(async function (recivemsg) {
        if(recivemsg){
          const findWord = findString(recivemsg.messageinit,'correspondentes')  
          if(messagerecive == recivemsg.code){
              if(recivemsg.endpointmsg == 'send-text'){
                const datasSendMessageSimple = {
                  session: recivemsg.session,
                  receiver: recivemsg.receiver,
                  message: {
                  text: `${recivemsg.text}` 
                  },
                  messageid: idmessage,
                  id: recivemsg.id
                }
                  await send(datasSendMessageSimple)
              }else if(recivemsg.endpointmsg == 'send-contact'){
                  const datasSendMessageContact = {
                    session: recivemsg.session,
                    receiver: recivemsg.receiver,
                     phone: '558000003517',
                     phone2: '8000003517',
                     organization: '💲 Euro 17 Crédito', 
                     fullName: '💲 Euro 17 Crédito',
                     messageid: idmessage,
                     id: recivemsg.id
                  }
                  const datasSendAfterContact = {
                    session: recivemsg.session,
                    receiver: recivemsg.receiver,
                    message: {
                    text: `${recivemsg.text}` 
                    },
                    messageid: idmessage,
                    id: recivemsg.id
                  }
                  await sendsContact(datasSendMessageContact)
                  await send(datasSendAfterContact)
              }
          }else if(mini == 'sair'){
            if(recivemsg.endpointmsg == 'send-text'){
            const noDatasSendMessageSimpleOuter = {
              session: recivemsg.session,
              receiver: recivemsg.receiver,
              message: {
                text: `Agradecemos sua atenção, caso tenha interesse em nos conhecer` 
              },
              messageid: idmessage,
              id: recivemsg.id
            }
            await doNotBother(recivemsg.id, messagerecive)
            await send(noDatasSendMessageSimpleOuter)
           }
          }else{
                console.log('Entrou fora do contexto')
                setTimeout( ()=> sendOutContext(datas) , 1000)
                return
          }
        }else{
            console.log('Entrou fora da consulta')
            setTimeout( ()=> sendClientOutDB(datas) , 1500)
        }
       })
      }
      catch (error){
        console.log('Error: '+error)
      }
}

async function sendOutContext(rec) {
  try {
    const {remotejid, messagerecive, idmessage, session, fromme } = rec
    const recivemsg = await Sendmessage.findOne({ where: { receiver: remotejid , type:2, messageid: null, checked: 0 }, order: [ [ 'id', 'DESC' ]], })
    console.log(recivemsg)
    if(recivemsg){
       // Otimização: Buscar campanha primeiro, depois queue
       const find = await Campaing.findOne({where: {id: recivemsg.id_campaing}})
       const queue = find ? await Queues.findOne({where: { identificador: find.identificador }}) : null
       const findWord = findString(queue.nomefila,'Cobrança')  
       if(findWord == false){
        const findWord2 = findString(queue.nomefila,'Antecipe') 
          if(findWord2 == true){
            const noDatasSendMessageSimple11 = {
              session: recivemsg.session,
              receiver: recivemsg.receiver,
              message: {
              text: `${recivemsg.text}`
              },
              messageid: idmessage,
              id: recivemsg.id
            }
            await send(noDatasSendMessageSimple11)
            return
          }
          const textSend = `Agradecemos sua atenção, caso tenha interesse em nos conhecer, visite nosso site https://www.euro17.com.br,\nvocê pode chamar em nosso contato também, será um prazer atende-lo.`
          const noDatasSendMessageSimple11 = {
            session: recivemsg.session,
            receiver: recivemsg.receiver,
            message: {
              text: `${textSend}`
            },
            messageid: idmessage,
            id: recivemsg.id
          }
          await send(noDatasSendMessageSimple11)
          return
       }
      const noDatasSendMessageSimple1 = {
        session: recivemsg.session,
        receiver: recivemsg.receiver,
        message: {
          //text: `${textSend}`
          text: `${recivemsg.text}`
        },
        messageid: idmessage,
        id: recivemsg.id,
        bot: 1
      }
      const datasSendMessageContact2 = {
        session: recivemsg.session,
        receiver: recivemsg.receiver,
        phone: '558000003517',
        phone2: '8000003517',
        organization: '💲 Euro 17 Crédito', 
        fullName: '💲 Euro 17 Crédito',
        messageid: idmessage,
        id: recivemsg.id
      }
      await doNotBother(recivemsg.id, messagerecive)
      //await sendNewWithContact(noDatasSendMessageSimple1, datasSendMessageContact2, recivemsg.id_campaing)
      await send(noDatasSendMessageSimple1)
      return  
    }
  } catch (error) {
    console.error(error)
  }
}

async function sendClientOutDB(rec) {
  try {

    const {remotejid, messagerecive, idmessage, session, fromme, pushname } = rec
      let id = remotejid.toString()
      let datas = {
        session: session,
        receiver: id,
        message: {
        text: "Olá! Me chamo Any, em que posso ajudar?"
        }
      }
      console.log('From =>', fromme)
      if(fromme == 0)
      console.log('Any =>', fromme, datas)
  } catch (error) {
    console.error(error)
  }
}

const updateMessageDB = async (status, id, remoteJid) => {
    try {
      //await Message.sync({force: true})
      const condition = { where :{idmessage: id } } 
      const options = { multi: true }
      let values = {
          read: 1,
          statusread: status
        }
        let res = await Message.update( values, condition , options )
    } catch (error) {
      console.log('Error: '+error)
    }
}

export { pushMessageDb, updateMessageDB, recordMessageSend, updateRecordMessageSend, updatecheckedMessageSend}


