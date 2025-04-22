import fs from 'fs'
import { isSessionExists } from '../wpp/whatsapp.js'
import response from '../../response.js'
import Session from '../model/sessions.model.js'
import { returnDateTimeZone,  returnDateTimeZone2 } from '../utils/util.js'
const client = 'anycall' 
import { logger } from '../../logger.js'
const loggers = logger

const sessionValidator = async (req, res, next) => {
  try {
    let sessionId
    let lastSession
    const sessionIdRec = req.query.id
      if(client == sessionIdRec){
      const session = await Session.findOne( {where: { "laststates":  0, 
      'status': 'authenticated'  }, order: [['lastdate', 'ASC']] }) 
      console.log('sessionValidator Last Count ID => ', session)
        if(session){
          let numbermessagessent = session.numbermessagessent
          lastSession = session.number.toString() 
          if(session.lastcount > numbermessagessent){
              const condition = { where :{ id: session.id } } 
              const options = { multi: true }
              const values = {
              laststates: 1
              }
              let res = Session.update( values, condition , options )
              console.log('Last Count => ',res)
          }
          // sessionId = RandSessions[Math.floor(Math.random()*RandSessions.length)];
          sessionId = lastSession
        }else{
          return response(res, 404, false, 'Sessions are falling asleep for 20 minutes.')
        }
      }else{
          sessionId = sessionIdRec
      }
      if (!isSessionExists(sessionId)) {
          return response(res, 404, false, 'Session not found.')
      }
      res.locals.sessionId = sessionId
      next()
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}

const validateSession = async (session, clients) => {
  try {

    let sessionId
    let lastSession
    const sessionIdRec = session
    const date = returnDateTimeZone2()
    if(client == sessionIdRec){
      const session = await Session.findOne( { where: { "laststates":  0,  
      'clientsessionid': clients, 'status': 'authenticated', 'randomize': 0,  'maturation': 0  }, order: [['lastdate', 'ASC']] }) 
        if(session){
          let numbermessagessent = session.numbermessagessent
          lastSession = session.number.toString() 
          console.log("BATEU NO IF")
          if(session.lastcount > numbermessagessent){
              const condition = { where :{ id: session.id } } 
              const options = { multi: true }
              const values = {
              laststates: 1
              }
          let res = Session.update( values, condition , options )
          loggers.info(Session `going to sleep ${date} ${session.lastcount} - ${lastSession}`)
          }

          sessionId = lastSession
        }else{
          console.log('validateSession Não randomica')
          sessionId = 401
          return sessionId
        }
      }else{
           const validateSession = await Session.findOne( { where: { "laststates":  0,  
          'name': sessionIdRec, 'status': 'authenticated' }, order: [['lastdate', 'ASC']] }) 
          if(!validateSession){
             console.log('Sessão bloqueada')
             sessionId = 404
             return sessionId
          }
          sessionId = sessionIdRec
      }
      return sessionId
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}
  
const validateSessionCreditor = async (clients) => {
  try {
    let sessionId
    let lastSession
    const date = returnDateTimeZone2()
    if(clients){
      const session = await Session.findOne( { where: { "laststates":  0,  
      'clientsessionid': clients, 'status': 'authenticated',  'maturation': 0  }, order: [['lastdate', 'ASC']] }) 
        if(session){
          lastSession = session.number.toString() 
          console.log('validateSession Last Count ID', lastSession)
          sessionId = lastSession
        }
      }
      if (!isSessionExists(sessionId)) {
           console.log('Session not found.')
           sessionId = 404
          return sessionId
      }
      return sessionId
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}

const validate = async (session) => {
  try {
    let sessionId
    let lastSession
    const sessionIdRec = session
    console.log(sessionIdRec == client)
    if(client == sessionIdRec){
      const session = await Session.findOne( {where: { "laststates":  0,  'status': 'authenticated'   }, order: [['lastdate', 'ASC']] }) 
      if(session){
          let numbermessagessent = session.numbermessagessent
          lastSession = session.number.toString() 
          if(session.lastcount > numbermessagessent){
              const condition = { where :{ id: session.id } } 
              const options = { multi: true }
              const values = {
              laststates: 1
              }
          let res = Session.update( values, condition , options )
          }
          sessionId = lastSession
        }else{
          return console.log(404, false, 'Sessions are falling a sleep for 20 minutes.')
        }
      }else{
           console.log('sessionIdRec', sessionIdRec)
          sessionId = sessionIdRec
      }
      if (!isSessionExists(sessionId)) {
          return console.log('Session not found.')
      }
      return sessionId
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}

const validateSessionGroup = async (session) => {
  try {
    let sessionId
    if(session){
      const sessions = await Session.findOne( { where: { "name":  session,  
       'status': 'authenticated', 'maturation': 0  }, order: [['lastdate', 'ASC']] }) 
        if(sessions){
          sessionId = sessions.name
        }
      }
      if (!isSessionExists(sessionId)) {
           console.log('Session not found.')
           sessionId = 404
          return sessionId
      }
      return sessionId
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}


const validateSessionMaturation = async (session) => {
  try {
    let sessionId
    let lastSession
    const sessionIdRec = session
    if(client == sessionIdRec){
      const session = await Session.findOne( {where: { "laststates":  0,  'status': 'authenticated' , 'maturation': 1   }, order: [['lastdate', 'ASC']] }) 
      if(session){
          let numbermessagessent = session.numbermessagessent
          lastSession = session.number.toString() 
          if(session.lastcount > numbermessagessent){
              const condition = { where :{ id: session.id } } 
              const options = { multi: true }
              const values = {
              laststates: 1
              }
          let res = Session.update( values, condition , options )
          }
          sessionId = lastSession
        }else{
          return console.log(404, false, 'Sessions are falling a sleep for 20 minutes.')
        }
      }else{
          sessionId = sessionIdRec
      }
      if (!isSessionExists(sessionId)) {
          return console.log('Session not found.')
      }
      return sessionId
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}

export { sessionValidator, validate, validateSession, validateSessionGroup, validateSessionCreditor, validateSessionMaturation}