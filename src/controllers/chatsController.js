import fs from 'fs'
import {  getSession, getChatList, isExists, sendMessage, sendMessageMidia, 
    sendMessageButtons,sendMessageLink, formatPhone, sendTyping, 
     alterImage, sendMessageReact, sendMessageSurvey, sendContact,sendMessageList } from '../wpp/whatsapp.js'
import response from '../../response.js'
import __dirname from '../../dirname.js'
import  Msgs from '../model/mesgs.model.js'
import {insertSendMessageDb, updateSendMessageDb} from '../middlaware/getMessages.js'
import { justNumbers , rand, getRandomArbitrary, greetingMessage} from '../utils/util.js'
import { updateSessionCount } from '../session/index.js'
import { validate , validateSession, validateSessionCreditor, validateSessionGroup } from '../middlaware/sessionValidator.js'
import Issuers from '../model/issuers.model.js'
import Sendmessages from '../model/sendmessages.model.js'
import Session from '../model/sessions.model.js'
import  * as ioClient  from 'socket.io-client'

const socketClient = ioClient.io("https://euro17.anycall-messageria.com.br");

socketClient.on("connect", (socket) => {
    socketClient.on('sendMessage', async (data)  => {
            let { receiver, text } = data
            console.log(data)
            try {
                setTimeout( () => {
                    socketClient.emit('sendMessage', data, (datas) => {
                        console.log(datas)
                    })
                }, 500)
            }
            catch(error) { }
        })
});

const number = getRandomArbitrary(1,99)  

const sau = [ 
    `Olá!`, 
    `Oi!`, 
    `Tudo bem! `, 
    `Tudo bom!`,
    `Tudo tranquilo!`,
    ``, 
]

let gerar = greetingMessage(sau)


let choices = [ 
    `Oi *Clemerson*, tudo bem? Aqui é a Vivi da *Melhor Visão* 👓 . Posso enviar uma novidade para você? Se sim,  digite 👉 *${number}* para receber.`, 
 ]
 
const getList = (req, res) => {
    return response(res, 200, true, '', getChatList(res.locals.sessionId))
}


const senContacts = async (req, res) => {
    const session = getSession(res.locals.sessionId)
    const receiver = formatPhone(req.body.receiver)
    const { message } = req.body
    const messages = message
    try {
        const datas = await sendContact(session, receiver, '5547996980163', 'phone2', 'Euro 17', 'Atendimento')
        //const datas = await sendTyping(session, receiver, message, 0)
        response(res, 200, true, 'The message has been successfully sent.')
    } catch {
       response(res, 500, false, 'Failed to send the message.')
    }
}

const sendReactMessage = async (req, res) => { 
   try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const data = req.body
        let sessionId = await validate(req.query.id)
        const session = getSession(sessionId)
        if(session == 'Session not found.'){
           return response(res, 400, false, session )
        }
        const receiver = formatPhone(data.receiver)
        const messageKey = data.massage_key //message.key
        const text = data.message.text
        const reactionMessage = {
                react: {
                    text: text, 
                    key: [{messageKey}]
                }
               }
            const datas = await sendMessageReact(session, receiver, 0, reactionMessage)  
            response(res, 200, true, 'The message has been successfully sent.')
    } catch (err) {
          console.log(err, 500, false, 'Failed to send the message.')
          response(res, 500, false, 'Failed to send the message.')
    }
}


const sendSurvey = async () => {
   try {
    //const user_comp = req.user.user_company
    //const data = req.body
    const  filailSend =  'Balneário Camboriu'
    const setPhone =  '4796980163'
    const receiver = formatPhone('55'+setPhone)
    const message = 'Teste'
    const issuers = await Issuers.findOne({ where:{ name: filailSend} })
    const sessions = await Session.findOne({ where:{ clientsessionid: issuers.id} })
    const validate = await validateSessionGroup(sessions.number)
    const session = getSession(validate)
    
   const datas = await sendMessageSurvey(session, receiver, 0, message)  
    console.log(datas)
    //response(res, 200, true, 'The message has been successfully sent.')
    
   } catch (err) {
    console.log(err)
    //response(res, 500, false, 'Message.', err)
   }
}


const send = async (req, res) => {
       try {
        console.log(req.body.receiver)
        let session
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const receiver = formatPhone(req.body.receiver)
        let messages
        let message
        let abcd
        const chatbot = req.body.chatbot ? req.body.chatbot : ''
        if(chatbot){
            let texto = req.body.text
            let sss = await validateSessionCreditor(chatbot)
            session = getSession(sss)
            console.log('validateSessionCreditor ', session)
            message  = { text: `${texto}` }
            messages = message
            abcd = texto
        }else{
           session = getSession(res.locals.sessionId)
           message = req.body.message
           abcd = req.body.message.text
           messages = message
        }
        const exists = await isExists(session, receiver)
        if (!exists) {
            const data = {}
            response(res, 400, false, 'The receiver number is not exists.', data, receiver)
            let msgs = { receiver: receiver, messages: messages.text, statusSend: false,
                 stateMsg: 'The receiver number is not exists.' , company_id: user_comp} 
            Msgs.create(msgs)  
            .then(data => { 
            })  
            return
        }
        const endpointmsg = 'send'
        const datasMes = {
            receiver: justNumbers(receiver),
            text: abcd,
            endpointmsg,
            session: res.locals.sessionId
        }
        const datas = await sendMessage(session, receiver, message, 0)
        await insertSendMessageDb(datasMes)
        await updateSessionCount(res.locals.sessionId)
        response(res, 200, true, 'The message has been successfully sent.')
        let msgs = { receiver: receiver, messages: messages.text, statusSend: true, 
            stateMsg: 'The message has been successfully sent.' , company_id: user_comp } 
        Msgs.create(msgs)
        .then(data => { 
            console.log(data)
        })
    } catch (err) {
        const data = { err }
        response(res, 500, false, 'Failed to send the message.', data)
    }
}

const sendLink = async (req, res) => {
    try {   
            const user_comp = req.user.user_company // where: {company_id: user_comp}
            var session = getSession(res.locals.sessionId)
            var receiver = formatPhone(req.body.receiver)
            const { message } = req.body
            let text1 = req.body.message.text ? req.body.message.text : ''
            const messages =  { "text": rand(choices)  } 
            var text  =  req.body.text ?  req.body.text : ''
            var title =  req.body.title
            var url =  req.body.url
            var description =  req.body.description
            var jpegThumbnail = req.body.jpegThumbnail
            var endpointmsg = 'send-link'
            const datasMes = {
                receiver: justNumbers(receiver),
                messageinit: rand(choices),//message.text,  
                text: text1,
                title,
                url,
                description,
                jpegThumbnail,
                endpointmsg,
                session: res.locals.sessionId
            }

                insertSendMessageDb(datasMes)
                const send = sendMessage(session, receiver, messages, 0)
                .then(function (resp) {
                    updateSendMessageDb(justNumbers(receiver))
                    response(res, 200, true, 'Initial message sent, awaiting customer response.')
                })
        
      return 
    } catch (err) {
        const data = { err }
        response(res, 500, false, 'Failed to send the message.', data)
    }
}

const sendButtons = async (req, res) => {
    const user_comp = req.user.user_company // where: {company_id: user_comp}
    const messages =  { "text": rand(choices)  } 
    const session = getSession(res.locals.sessionId)
    const receiver = formatPhone(req.body.receiver)
    const { text, footer } = req.body
    const urlButton_displayText = req.body.urlButton.displayText
    const urlButton_url = req.body.urlButton.url
    const callButton_displayText = req.body.callButton.displayText
    const callButton_phoneNumber = req.body.callButton.phoneNumber
    const quickReplyButton_displayText = req.body.quickReplyButton.displayText
    const quickReplyButton_id = req.body.quickReplyButton.id
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
            let msgs = { receiver, messages: templateMessage, statusSend: false,
                 stateMsg: 'The receiver number is not exists.', company_id: user_comp } 
            Msgs.create(msgs)  
            .then(data => { 
                
            })  
            return
        }
        const endpointmsg = 'send-button'
        const datasMes = {
            receiver: justNumbers(receiver),
            messageinit: rand(choices),//message.text,  
            endpointmsg,
            textbutton: text, 
            footerbutton: footer,
            urlButton_displayText,
            urlButton_url,
            callButton_displayText,
            callButton_phoneNumber,
            quickReplyButton_displayText,
            quickReplyButton_id,
            session: res.locals.sessionId
        }
        insertSendMessageDb(datasMes)
        const send = sendMessage(session, receiver, messages, 0)
        .then(async function (resp) {
            await updateSessionCount(res.locals.sessionId)
            updateSendMessageDb(justNumbers(receiver))
            response(res, 200, true, 'Initial message sent, awaiting customer response.')
            let msgs = { receiver: receiver, messages: messages.text, statusSend: true, 
                stateMsg: 'The message has been successfully sent.',  company_id: user_comp } 
            Msgs.create(msgs)
            .then(data => { 
               
            })
        })
    } catch (err) {
        const data = { err }
        response(res, 500, false, 'Failed to send the message.', data)
    }
}

const newSendButtons = async (req, res) => {
    try {
    const user_comp = req.user.user_company // where: {company_id: user_comp}
    const data = req.body
    let sessionId = await validate(req.query.id)
    const session = getSession(sessionId)
    if(session == 'Session not found.'){
       return response(res, 400, false, session )
    }
    const receiver = formatPhone(data.receiver)
    const text = data.text
    const footer  = data.footer
    const urlButton_displayText = data.urlButton.displayText
    const urlButton_url = data.urlButton.url
    const callButton_displayText = data.callButton.displayText
    const callButton_phoneNumber = data.callButton.phoneNumber
    const quickReplyButton_displayText = data.quickReplyButton.displayText
    const quickReplyButton_id = data.quickReplyButton.id
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
    const exists = await isExists(session, receiver)
        if (!exists) {
            const dataNoSend = {}
            response(res, 400, false, 'The receiver number is not exists.', dataNoSend, receiver)
            let msgs =  { receiver, messages: text, statusSend: false,
                 stateMsg: 'The receiver number is not exists.' , company_id: user_comp } 
            const rt = await Msgs.create(msgs)
            console.log(rt.id)
            return
        }
    const m = await sendMessageButtons(session, receiver, templateMessage, 0)
    const condition = { where :{id: m.id } } 
    const options = { multi: true }
    let values = { messageid: m.messageid , company_id: user_comp }
    await Sendmessages.update( values, condition , options )
    const dataSend =  { receiver, messages: text, statusSend: true, 
        stateMsg: 'The message has been successfully sent.' , company_id: user_comp } 
    await Msgs.create(dataSend)
    console.log(200, m)
    response(res, 200, true, 'The message has been successfully sent.')
    } catch (err) {
        console.log(err, 500, false, 'Failed to send the message.')
     }
}

const sendMidia = async (req, res, next) => {
  try {
          const user_comp = req.user.user_company // where: {company_id: user_comp}
          const session = getSession(res.locals.sessionId)
          const receiver = formatPhone(req.body.receiver)
          const { type } = req.body
          const { caption } = req.body
          const {urlImage} = req.body
          const {fileName}  = req.body
          let message
          const existsIf = await isExists(session, receiver)
          if (!existsIf) {
                  const data = {}
                  response(res, 400, false, 'The receiver number is not exists.', data, receiver)
                  let msgs =  { receiver, messages: messages, statusSend: false, 
                    stateMsg: 'The receiver number is not exists.', company_id: user_comp } 
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
                image: { url: "assets/midias/"+fileName },
                //image: { url: fs.readFileSync("assets/"+fileName)},
                caption: caption
                }
        }   
        if(type === "audio"){
            message = {
                audio: { url: "assets/midias/"+fileName }, 
                }
        }   
        if(type === "document"){
            message = {
                 document: { url: urlImage },
                 mimetype: 'application/pdf',
                fileName: fileName
                }
        }

        const datas = await sendMessageMidia(session, receiver, message, 0)
        const dataSend =  { receiver, messages: 'midias', statusSend: true, 
            stateMsg: 'The message has been successfully sent.' , company_id: user_comp } 
        await Msgs.create(dataSend)
        response(res, 200, true, 'The message has been successfully sent.')
  } catch (err) {
         const data = { err }
        response(res, 500, false, 'Failed to send the message.', data)
  }
}

const sendBulk = async (req, res) => {
    const user_comp = req.user.user_company // where: {company_id: user_comp}
    const session = getSession(res.locals.sessionId)
    const errors = []
    try {
        
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

    } catch (err) {
        const isAllFailed = err.length === req.body.length
        response(
            res,
            isAllFailed ? 500 : 200,
            !isAllFailed,
            isAllFailed ? 'Failed to send all messages.' : 'Some messages has been successfully sent.',
            { errors }
        )
    }
}

const getFindStatus = async (req, res) => {
    let result
    const user_comp = req.user.user_company // where: {company_id: user_comp}
    try {
        if(req.params.status == 'all'){
            result = await Msgs.findAll({ where: {company_id: user_comp}, order: [['created', 'ASC']] })
        }else{
            result = await Msgs.findOne({ where: {statusSend: req.params.status, company_id: user_comp}, order: [['created', 'ASC']] })
        }
        return res.json(result)
    } catch (err) {
        const data = { err }
        response(res, 401, false, 'server application error!', data )
    }
   
}

const getFindId = async (req, res) => {
    const user_comp = req.user.user_company // where: {company_id: user_comp}
    try {
        const jid = req.params.phone
        const receiver = formatPhone(jid)
        const result = await Msgs.findOne({ where: {receiver, company_id: user_comp }, order: [['created', 'ASC']] })
        return res.json(result)
    } catch (err) {
        const data = { err }
        response(res, 401, false, 'server application error!', data)
    }
}


const getFindPeriod = async (req, res) => {
      const user_comp = req.user.user_company // where: {company_id: user_comp}
    try {
        const start = req.body.start+'T00:00:00.000Z'
        const end = req.body.end+'T23:59:59.000Z'
        const status = req.body.status
        const credor = req.body.credor
        const result = await Msgs.findAll({
           where: { "created": { $gt: new Date(start), $lt: new Date(end), status: status, company_id: user_comp} } 
        })
        return res.json(result)  
    } catch (err) {
        const data = { err }
        response(res, 401, false, 'server application error!', data)
    }
}

const sendList= async (req, res) => {
    try {
             const user_comp = req.user.user_company // where: {company_id: user_comp}
             const session = getSession(d)
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
                  const msgs =  { receiver, messages: messages, statusSend: true, 
                    stateMsg: 'The message has been successfully sent.' ,company_id: user_comp } 
                  Msgs.create(msgs)
                  .then(data => { 
                  })

    } catch (err) {
        const data = { err }
        response(res, 500, false, 'server application error!', data)
    }
}

const listReport = async (req, res) => {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const issuers = await Issuers.findAll({ where: {company_id: user_comp} })
        res.render('page/report/report', { issuers })
    } catch (err) {
        const data = { err }
        console.log(err, 500, false, 'server application error!')
        response(res, 500, false, 'server application error!', data)
    }
}




export { listReport, getList, send, sendBulk, getFindId, getFindStatus, getFindPeriod, 
    sendMidia, sendButtons, sendLink, sendList, sendMessageMidia, senContacts , 
    newSendButtons, sendReactMessage, sendSurvey }


