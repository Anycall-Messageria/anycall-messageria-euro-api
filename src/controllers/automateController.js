import fs from 'fs'
import { getSession, getChatList, isExists, sendMessage, sendMessageMidia, 
    sendMessageButtons,sendMessageLink, formatPhone , sendContact} from '../wpp/whatsapp.js'
import response from '../../response.js'
import __dirname from '../../dirname.js'
import  Msgs from '../model/mesgs.model.js'
import Sendmessages from '../model/sendmessages.model.js'
import { updatecheckedMessageSend} from '../store/message/index.js' 
import { validate, validateSession  } from '../middlaware/sessionValidator.js'
import { updateSessionCount } from '../session/index.js' 
import  * as ioClient  from 'socket.io-client'
import { alterSessionSendChats } from './interationController.js'
const socketClient = ioClient.io("https://euro17.anycall-messageria.com.br");


var respo = response

const alertSessionBan = async (interation_id) => {
  socketClient.on("connect", () => {
      socketClient.emit('alertSessionBan', interation_id, (datas) => {})
  });
}

  
const getList = (req, res) => {
  try {
    return response(res, 200, true, '', getChatList(res.locals.sessionId))

  } catch (error) {
    response(res, 500, false, 'Failed application.')
  }
    
}

var sendMessageComp = ''
const send = async (data) => {
    const session = getSession(data.session)
    const receiver = formatPhone(data.receiver)
    const { message, bot } = data
    const b = bot ? bot : 0
    const messages = message
    console.log('Envio mensagem final', data.receiver)
    //console.log('RETORNO DE MESSAGES INICIAL ', messages)
      try {
        const exists = await isExists(session, receiver)
        if (!exists) {
            const data = {}
            console.log(400, false, 'The receiver number is not exists.', data, receiver)
            let msgs =  { receiver, messages: messages.text, statusSend: false, stateMsg: 'The receiver number is not exists.', bot: b } 
            Msgs.create(msgs)  
            .then(data => { 
            })  
            return
        }
        const sendMessageOri = `${message}${receiver}`
        if(sendMessageComp != sendMessageOri){
            const datas = sendMessage(session, receiver, message, 2000)
            .then(async function (resp) {
                  await updateSessionCount(data.session)
                  await updatecheckedMessageSend(data.id)
                  if(data.messageid){
                    const condition = { where :{id: data.id } } 
                    const options = { multi: true }
                    let values = {
                        messageid: data.messageid
                    }
                    let res =  Sendmessages.update( values, condition , options )
                    .then(function (resp) {
                        console.log(resp)
                    })
                    .catch(function(error){
                        console.log(error)      
                    })
                  }
                  let msgs =  { receiver, messages: messages.text, statusSend: true, stateMsg: 'The message has been successfully sent.',  bot: b } 
                Msgs.create(msgs).then(data => { })   
            })
            .catch(function(error){
            console.log(error)      
            })
        }
        sendMessageComp = sendMessageOri
    } catch (err) {
        console.log(err, 500, false, 'Failed to send the message.')
    }
}

const sendNewWithContact = async (data, contact, idCampaing) => {
    const session = getSession(data.session)
    const receiver = formatPhone(data.receiver)
    const { message } = data
   
    const messages = message
    console.log('Envio mensagem final', data.receiver)
    //console.log('RETORNO DE MESSAGES INICIAL ', messages)
      try {
        const exists = await isExists(session, receiver)
        if (!exists) {
            const data = {}
            console.log(400, false, 'The receiver number is not exists.', data, receiver)
            let msgs =  { receiver, messages: messages.text, statusSend: false, stateMsg: 'The receiver number is not exists.' } 
            Msgs.create(msgs)  
            .then(data => { 
            })  
            return
        }
        const datas = sendMessage(session, receiver, message, 2000)
        .then(async function (resp) {
              await updateSessionCount(data.session)
              await updatecheckedMessageSend(data.id)
              await sendsContact(contact)
              if(data.messageid){
                const condition = { where :{id: data.id } } 
                const options = { multi: true }
                let values = {
                    messageid: data.messageid
                }
                let res =  Sendmessages.update( values, condition , options )
                .then(async function (resp) {
                })
                .catch(function(error){
                    console.log(error)      
                })
              }
              let msgs =  { receiver, messages: messages.text, statusSend: true, stateMsg: 'The message has been successfully sent.' } 
              Msgs.create(msgs).then(data => { }) 
        })
        .catch(function(error){
        console.log(error)      
        })
    } catch (err) {
        console.log(err, 500, false, 'Failed to send the message.')
    }
}

const sendsContact = async (data) => {
    const session = getSession(data.session)
    const receiver = formatPhone(data.receiver)
    const { phone, phone2, organization,  fullName } = data
    const datas = sendContact(session, receiver, phone, phone2, organization, fullName)
}

var received = ''
const sendMsgChat = async (data) => {
    try {
      let session  
      const sessionsExists = await validate(data.session) 
      if(sessionsExists != 404){
        session = getSession(data.session)
      }else{
        const xpto = await validateSession('anycall', 1)
        await alterSessionSendChats(xpto, data.id)
        session = getSession(xpto)
        await alertSessionBan(data.id)
      }  
      const receiver = formatPhone(data.receiver)
      const { message } = data
      const messages = message
      if(messages.text.length == 0){
        return
      }
      const exists = await isExists(session, receiver)
      if (!exists) {
          const data = {}
          console.log(400, false, 'The receiver number is not exists.', data, receiver)
          let msgs =  { receiver, messages: messages.text, statusSend: false, stateMsg: 'The receiver number is not exists.' } 
          Msgs.create(msgs)  
          .then(data => { 
          })  
          return
      }
      if(received != messages.text){
            const datas = sendMessage(session, receiver, message, 0)
            .then(async function (resp) {
                    await updateSessionCount(session)
                    let msgs =  { receiver, messages: messages.text, statusSend: true, stateMsg: 'The message has been successfully sent.' } 
                Msgs.create(msgs).then(data => { })   
            })
            .catch(function(error){
                console.error(error)      
            })
       }
      received = messages.text
  } catch (err) {
      console.log(err, 500, false, 'Failed to send the message.')
  }
}


const sendLink = async (data) => {
    try { 
        console.log(data)
        const sessions = getSession(validate(data.session)) 
        const receivers = formatPhone(data.receiver)
        const datas = sendMessageLink(sessions, receivers, 0, data.text, data.url, data.title, data.description, data.jpegThumbnail)
            .then(function (resp) {
                           
                    console.log('Message sendLink => ', resp)
                    const condition = { where :{id: data.id } } 
                    const options = { multi: true }
                    let values = {
                        messageid: data.messageid
                    }
                    let res =  Sendmessages.update( values, condition , options )
                    .then(function (resp) {
                        console.log(resp)
                    })
                    .catch(function(error){
                        console.log(error)      
                    })
                    let msgs =  { receivers, messages: data.text, statusSend: true, stateMsg: 'The message has been successfully sent.' } 
                    Msgs.create(msgs).then(data => { })   
            })
            .catch(function(error){
              console.log(error)      
            })
      return 
    } catch (err) {
        console.log(err, 500, false, 'Failed to send the message.')
    }
}

var receivedMidia = ''
const sendMidia = async (datas) => {
  try {
        console.log(datas)
        const receiver = formatPhone(datas.receiver)
        const { type, caption, urlImage, fileName } = datas
        let message, session  
        const sessionsExists = await validate(datas.session) 
        if(sessionsExists){
            session = getSession(datas.session)
        }else{
            const xpto = await validateSession('anycall', 1)
            await alterSessionSendChats(xpto, datas.id)
            session = getSession(xpto)
            await alertSessionBan(datas.id)
        }  
        const existsIf = await isExists(session, receiver)
        if (!existsIf) {
                  const data = {}
                  console.log(400, false, 'The receiver number is not exists.', data, receiver)
                  let msgs =  { receiver, messages: message, statusSend: false, stateMsg: 'The receiver number is not exists.' } 
                  Msgs.create(msgs)  
                  .then(data => { 
                      console.log('save database')
                  })  
                  return
        } 
                     if(type === "video"){
                          message = {
                              video: fs.readFileSync("assets/midias/"+fileName), 
                                  caption: caption,
                                  gifPlayback: false
                          }
                      }   
                      if(type === "image"){
                          message = {
                              image: { url: "assets/midias/1/image/temp/"+fileName },
                              caption: caption
                          }
                      }   
                      if(type === "audio"){
                          message = {
                            // { audio: { url: "./Media/audio.mp3" }, mimetype: 'audio/mp4' }
                             audio: { url: "assets/midias/1/audio/temp/"+fileName }, mimetype: 'audio/mp4'
                          }
                      }   
                      if(type === "document"){
                          message = {
                          document: { url: "assets/midias/1/pdf/temp/"+fileName}, //
                                  mimetype: 'application/pdf',
                                  fileName:    `boleto_${new Date().getTime()}.pdf`
                          }
                      }
          let x = `${receiver}${fileName}`            
          if(receivedMidia != x){                      
          const d = sendMessageMidia(session, receiver, message, 0)
            .then(async function (resp) {
                    console.log(200, true, resp, 'The message has been successfully sent.')
                    await updateSessionCount(datas.session)
                    const condition = { where :{id: datas.id } } 
                    const options = { multi: true }
                    let values = { messageid: datas.messageid }
                    let res =  Sendmessages.update( values, condition , options )
                    .then(function (resp) { console.log(resp) })
                    .catch(function(error){ console.log(error) })
                    let msgs =  { receiver, messages: type, statusSend: true, stateMsg: 'The message has been successfully sent.' } 
                    Msgs.create(msgs).then(data => { })   
            })
            .catch(function(error){ console.log(error) })
          }
          receivedMidia = x
   } catch (err) {
      console.log(err, 500, false, 'Failed to send the message.')
   }
}



const sendButtons = async (data) => {
    const session = getSession(validate(data.session))
    const receiver = formatPhone(data.receiver)
    const text = data.textbutton
    const footer  = data.footerbutton
    const urlButton_displayText = data.urlButton_displayText
    const urlButton_url = data.urlButton_url
    const callButton_displayText = data.callButton_displayText
    const callButton_phoneNumber = data.callButton_phoneNumber
    const quickReplyButton_displayText = data.quickReplyButton_displayText
    const quickReplyButton_id = data.quickReplyButton_id
    const templateButtons = [
        {index: 1, urlButton: {displayText: `${urlButton_displayText}` , url: `${urlButton_url}` }},
        {index: 2, callButton: {displayText: `${callButton_displayText}`, phoneNumber: `${callButton_phoneNumber}`}},
        {index: 3, quickReplyButton: {displayText: `${quickReplyButton_displayText}` , id: `${quickReplyButton_id}`}},
    ]
    const templateMessage  = {
        text: text,
        footer: footer,
        templateButtons: templateButtons
    }
    try {
        const exists = await isExists(session, receiver)
        if (!exists) {
            const data = {}
            response(res, 400, false, 'The receiver number is not exists.', data, receiver)
            let msgs =  { receiver, messages: templateMessage, statusSend: false, stateMsg: 'The receiver number is not exists.' } 
            Msgs.create(msgs)  
            .then(data => { 
                // console.log('save database')
            })  
            return
        }
        const t = await sendMessageButtons(session, receiver, templateMessage, 0)
        .then(function (resp) {
            //console.log('Message ID => ', data.messageid)
            const condition = { where :{id: data.id } } 
            const options = { multi: true }
            let values = {
                messageid: data.messageid
            }
            let res =  Sendmessages.update( values, condition , options )
            .then(function (resp) {
                console.log(resp)
            })
            .catch(function(error){
                console.log(error)      
            })
            console.log(200, true, t, 'The message has been successfully sent.')
            let msgs =  { receiver, messages: templateMessage, statusSend: true, stateMsg: 'The message has been successfully sent.' } 
            Msgs.create(msgs)
            .then(data => { 
            }) 
        })
        .catch(function(error){
        console.log(error)      
        })
    } catch (err) {
        console.log(err, 500, false, 'Failed to send the message.')
     }
}

const sendBulk = async (req, res) => {
    const session = getSession(res.locals.sessionId)
    const errors = []

    for (const [key, data] of req.body.entries()) {
        let { receiver, message, delay } = data

        if (!receiver || !message) {
            errors.push(key)

            continue
        }

        if (!delay || isNaN(delay)) {
            delay = 1000
        }

        receiver = formatPhone(receiver)

        try {
            const exists = await isExists(session, receiver)

            if (!exists) {
                errors.push(key)

                continue
            }

            await sendMessage(session, receiver, message, delay)
        } catch {
            errors.push(key)
        }
    }

    if (errors.length === 0) {
        return response(res, 200, true, 'All messages has been successfully sent.')
    }

    const isAllFailed = errors.length === req.body.length

    response(
        res,
        isAllFailed ? 500 : 200,
        !isAllFailed,
        isAllFailed ? 'Failed to send all messages.' : 'Some messages has been successfully sent.',
        { errors }
    )
}

const getFindStatus = async (req, res) => {
    try {
         let result
        if(req.params.status == 'all'){
            result = await Msgs.find({}).sort({created:1})
        }else{
            result = await Msgs.find({statusSend: req.params.status}).sort({created:1})
        }
         return res.json(result)
    } catch (err) {
        console.log(err, 500, false, 'Failed to send the message.')
     }
}

const getFindId = async (req, res) => {
    try {
        const jid = req.params.phone
        const receiver = formatPhone(jid)
        const result = await Msgs.find({receiver})
        .sort({created:1})
        return res.json(result)
    } catch (err) {
        console.log(err)
        response(res, 500, false, 'Failed application.')
    }
}

const getFindPeriod = async (req, res) => {
    try {
        const start = req.body.start+'T00:00:00.000Z'
        const end = req.body.end+'T23:59:59.000Z'
        const result = await Msgs.
        find({"created":{$gte: new Date(start),$lte: new Date(end)}})
        return res.json(result)  
    } catch (err) {
        console.log(err)
        response(res, 500, false, 'Failed application.')
    }
}

const sendList= async (req, res) => {
    try {
             const session = getSession(res.locals.sessionId)
             const receiver = formatPhone(req.body.receiver)
             const sections = [
                {
                title: "Nossa Equipe",
                rows: [
                    {title: "Cobrança", rowId: "option1", description: "Negocie conosco"},
                    {title: "Atendimento", rowId: "option2", description: "O que podemos ajudar?"},
                    {title: "Crédito", rowId: "option3", description: "Analise de crédito"},
                    {title: "Empréstimos", rowId: "option4", description: "Aproveite seu beneficio"}
                ]
                }
               /* ,
               {
                title: "Section 2",
                rows: [
                    {title: "Option 3", rowId: "option3"},
                    {title: "Option 4", rowId: "option4", description: "This is a description V2"}
                ]
                },
                */
            ]
             const messages = {
                text: "Abaixo nossa lista de opções:",
                footer: "https://www.youtube.com",
                title: "Selecione a opção desejada",
                buttonText: "Lista",
                sections
            }
       
                  const datas = await sendMessageList(session, receiver, 0, messages)
                  response(res, 200, true, 'The message has been successfully sent.')
                  const msgs =  { receiver, messages: messages, statusSend: true, stateMsg: 'The message has been successfully sent.' } 
                  Msgs.create(msgs)
                  .then(data => { 
                  })

    } catch (err) {
        console.log(err, 500, false, 'Failed to send the message.')
    }
}




export { getList, send, sendBulk, getFindId, getFindStatus, getFindPeriod, sendMidia, sendButtons, sendLink, sendList, 
    sendMessageMidia , sendsContact, sendNewWithContact, sendMsgChat }


