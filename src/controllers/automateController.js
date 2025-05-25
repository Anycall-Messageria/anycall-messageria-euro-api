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

// Classe para gerenciar contexto de mensagens por sessão
class MessageContext {
    constructor(sessionId) {
        this.sessionId = sessionId
        this.sendMessageComp = ''
        this.received = ''
        this.receivedMidia = ''
        this.lastActivity = Date.now()
    }
    
    // Atualizar contexto de mensagem enviada
    updateSendMessage(receiver, message) {
        this.sendMessageComp = `${message}${receiver}`
        this.lastActivity = Date.now()
    }
    
    // Verificar se mensagem já foi enviada (evitar duplicatas)
    isDuplicateMessage(receiver, message) {
        const messageKey = `${message}${receiver}`
        return this.sendMessageComp === messageKey
    }
    
    // Atualizar contexto de mensagem recebida
    updateReceived(messageId) {
        this.received = messageId
        this.lastActivity = Date.now()
    }
    
    // Verificar se mensagem já foi processada
    isDuplicateReceived(messageId) {
        return this.received === messageId
    }
    
    // Atualizar contexto de mídia recebida
    updateReceivedMidia(mediaId) {
        this.receivedMidia = mediaId
        this.lastActivity = Date.now()
    }
    
    // Verificar se mídia já foi processada
    isDuplicateMidia(mediaId) {
        return this.receivedMidia === mediaId
    }
    
    // Limpar contexto antigo (garbage collection)
    isExpired(timeoutMs = 300000) { // 5 minutos
        return Date.now() - this.lastActivity > timeoutMs
    }
    
    // Reset do contexto
    reset() {
        this.sendMessageComp = ''
        this.received = ''
        this.receivedMidia = ''
        this.lastActivity = Date.now()
    }
}

// Gerenciador global de contextos por sessão
class ContextManager {
    constructor() {
        this.contexts = new Map()
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000) // Cleanup a cada minuto
    }
    
    // Obter ou criar contexto para sessão
    getContext(sessionId) {
        if (!this.contexts.has(sessionId)) {
            this.contexts.set(sessionId, new MessageContext(sessionId))
        }
        return this.contexts.get(sessionId)
    }
    
    // Limpar contextos expirados
    cleanup() {
        const expiredSessions = []
        this.contexts.forEach((context, sessionId) => {
            if (context.isExpired()) {
                expiredSessions.push(sessionId)
            }
        })
        
        expiredSessions.forEach(sessionId => {
            this.contexts.delete(sessionId)
            console.log(`[ContextManager] Contexto expirado removido para sessão: ${sessionId}`)
        })
        
        if (expiredSessions.length > 0) {
            console.log(`[ContextManager] Cleanup executado: ${expiredSessions.length} contextos removidos`)
        }
    }
    
    // Remover contexto específico
    removeContext(sessionId) {
        const removed = this.contexts.delete(sessionId)
        if (removed) {
            console.log(`[ContextManager] Contexto removido para sessão: ${sessionId}`)
        }
        return removed
    }
    
    // Obter estatísticas
    getStats() {
        return {
            activeSessions: this.contexts.size,
            sessions: Array.from(this.contexts.keys())
        }
    }
    
    // Destruir gerenciador
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
        }
        this.contexts.clear()
    }
}

// Instância global do gerenciador de contextos
const contextManager = new ContextManager()

// Função para obter estatísticas dos contextos
const getContextStats = () => {
    return contextManager.getStats()
}

// Função para limpar contexto de uma sessão específica
const clearSessionContext = (sessionId) => {
    return contextManager.removeContext(sessionId)
}

// Função para resetar um contexto específico
const resetSessionContext = (sessionId) => {
    const context = contextManager.getContext(sessionId)
    context.reset()
    console.log(`[ContextManager] Contexto resetado para sessão: ${sessionId}`)
}

// Cleanup graceful do sistema de contextos
const cleanupContextManager = () => {
    console.log('[ContextManager] Executando cleanup graceful...')
    contextManager.destroy()
    console.log('[ContextManager] Cleanup concluído')
}

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

const send = async (data) => {
    const session = getSession(data.session)
    const receiver = formatPhone(data.receiver)
    const { message, bot } = data
    const b = bot ? bot : 0
    const messages = message
    console.log('Envio mensagem final', data.receiver)
    
    // Obter contexto da sessão
    const context = contextManager.getContext(data.session)
    
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
        
        // Verificar se mensagem já foi enviada usando contexto
        if(!context.isDuplicateMessage(receiver, message)){
            const datas = sendMessage(session, receiver, message, 2000)
            .then(async function (resp) {
                  // Atualizar contexto após envio bem-sucedido
                  context.updateSendMessage(receiver, message)
                  
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
        } else {
            console.log(`[MessageContext] Mensagem duplicada ignorada para sessão ${data.session}: ${receiver}`)
        }
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

const sendMsgChat = async (data) => {
    try {
      let session  
      const sessionsExists = await validate(data.session) 
      let sessionId = data.session
      
      if(sessionsExists != 404){
        session = getSession(data.session)
      }else{
        const xpto = await validateSession('anycall', 1)
        await alterSessionSendChats(xpto, data.id)
        session = getSession(xpto)
        sessionId = xpto
        await alertSessionBan(data.id)
      }
      
      // Obter contexto da sessão
      const context = contextManager.getContext(sessionId)
      
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
      
      // Verificar se mensagem já foi processada usando contexto
      if(!context.isDuplicateReceived(messages.text)){
            const datas = sendMessage(session, receiver, message, 0)
            .then(async function (resp) {
                    // Atualizar contexto após processamento bem-sucedido
                    context.updateReceived(messages.text)
                    
                    await updateSessionCount(sessionId)
                    let msgs =  { receiver, messages: messages.text, statusSend: true, stateMsg: 'The message has been successfully sent.' } 
                Msgs.create(msgs).then(data => { })   
            })
            .catch(function(error){
                console.error(error)      
            })
       } else {
           console.log(`[MessageContext] Mensagem recebida duplicada ignorada para sessão ${sessionId}: ${messages.text}`)
       }
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

const sendMidia = async (datas) => {
  try {
        console.log(datas)
        const receiver = formatPhone(datas.receiver)
        const { type, caption, urlImage, fileName } = datas
        let message, session, sessionId = datas.session  
        const sessionsExists = await validate(datas.session) 
        if(sessionsExists){
            session = getSession(datas.session)
        }else{
            const xpto = await validateSession('anycall', 1)
            await alterSessionSendChats(xpto, datas.id)
            session = getSession(xpto)
            sessionId = xpto
            await alertSessionBan(datas.id)
        }
        
        // Obter contexto da sessão
        const context = contextManager.getContext(sessionId)  
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
          const mediaId = `${receiver}${fileName}`
          
          // Verificar se mídia já foi processada usando contexto
          if(!context.isDuplicateMidia(mediaId)){                      
          const d = sendMessageMidia(session, receiver, message, 0)
            .then(async function (resp) {
                    // Atualizar contexto após processamento bem-sucedido
                    context.updateReceivedMidia(mediaId)
                    
                    console.log(200, true, resp, 'The message has been successfully sent.')
                    await updateSessionCount(sessionId)
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
          } else {
              console.log(`[MessageContext] Mídia duplicada ignorada para sessão ${sessionId}: ${mediaId}`)
          }
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
    sendMessageMidia , sendsContact, sendNewWithContact, sendMsgChat, 
    // Funções do sistema de contexto
    getContextStats, clearSessionContext, resetSessionContext, cleanupContextManager }


