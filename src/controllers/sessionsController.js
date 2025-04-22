import { isSessionExists, createSession, deleteSession,
    getSession, isExists, formatPhone, fetchStatusProfile, getProfileBusiness,
    fetchUrlImage
  } from '../wpp/whatsapp.js'
import response from '../../response.js'
import { io } from '../../server.js'
import { findAllList, findSessionsActive, findAll, findSessionSleep , findSessionsStatus } from '../service/sessions/find.js'
import Session from '../model/sessions.model.js'
import {returnDateTimeZone2, returnDateTimeZone} from '../utils/util.js'
import { logger } from '../../logger.js'
const loggers = logger


const monitoringSleepingSession = async () => {
    try {
        const date = returnDateTimeZone2()
        const session = await findSessionSleep()
        session.map(function(data) {
            const seconds1 = Math.floor(new Date(data.lastdate) / 1000 /60)
            const seconds2 = Math.floor(Date.now() / 1000/60)
            const difference = (seconds2-seconds1)
            const sleepingsession = data.sleepingsession
            //console.log(seconds2, seconds1, difference, sleepingsession)
            if(difference >= sleepingsession){
              const condition = { where :{ id: data.id } } 
              const options = { multi: true }
              const values = {
                laststates: 0,
                lastcount: 0,
                lastdate: date
              }
              let res = Session.update( values, condition , options ).then(function(r){
                loggers.info(`Waking up the session ${date} - ${r.id} - ${r.name}`)
             })
            }
        })
    } catch (err) {
        console.log(err, 500, false, 'server application error')
    }
}

const sessionActice = (count) => {
    io.emit('sessionActice', count)
}


setInterval(() => { 
        monitoringSleepingSession() 
        countSessionActive()
    }, 30000)

const sendDeleteSession = (sessionId) => {
    let msg = `Sessão ${sessionId} foi apagada com sucesso 🚀 ` 
    io.emit('deleteSession', msg)
}

const countSessionActive = async () => {
    try {
        const session = await Session.findAndCountAll({status: 'authenticated', order: [["id", "ASC"]]})
        const count = session.count ? session.count : 0
        sessionActice(count)
    } catch (error) {
        console.log(error)
    }
}

const add = async (req, res) => {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const { id, number, isLegacy } = req.body
        const state = true;
        if (isSessionExists(id)) {
            return response(res, 401, false, 'Session already exists, please use another id.')
        }
        createSession(id, res, user_comp)
       
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res,500, false, 'server application error.', data)
      }
}

const addNew = async (req, res) => {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const { id, number, isLegacy } = req.body
        const state = true;
        if (isSessionExists(id)) {
            return response(res, 401, false, 'Session already exists, please use another id.')
        }
        createSession(id, res, user_comp)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res,500, false, 'server application error.', data)
      }
}

const del = async (req, res) => {
    try {
        const id = req.params.delete
        console.log(id)
        const session = getSession(id)
        if(session){ await session.logout() }
        let isLegacy = false
        const find = await Session.findOne({ where: { id: id } })
        if(find.status == 'ban or remove'){
            await Session.destroy({ where: { id: id } })
        }else{
            const name = find.name
            await deleteSession(name, isLegacy)
            await Session.destroy({ where: { id: id } })
        }
        res.redirect('/sessions/list')
    } catch (err) {
        const data = { err }
        console.log(err)
    }
}


const listSessions = async (req, res) => {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const accounts = await findAllList(0, 8, user_comp)
        res.json(accounts)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res,500, false, 'server application error.', data)
      }
}

const listSessionsStatus = async (req, res) => {
    try {
        const status = req.params.status // where: {company_id: user_comp}
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const accounts = await findSessionsStatus(status)
        res.json(accounts)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res,500, false, 'server application error.', data)
      }
}



const list = async (req, res) => {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
         const page = +req.query.page || 0
         const limit = req.query.limit || 8
    try {
        const accounts = await findAllList(page, limit, user_comp)
        const session = await Session.findAndCountAll(
      { 
        company_id: user_comp,
        order: [
        ["id", "ASC"]
      ],
       offset: (page * limit),  
       limit:limit
      })

      

      const itemCount = session.count
      const pageCount = Math.floor(itemCount/limit);
      let lambda
      if(pageCount == page){
          lambda = page
      }else{
          lambda = page + 1
      }
      res.render('page/session/session', {
            sessions: accounts, 
            currentPage: page,
            hasPreviousPage: page > 0,
            hasNextPage: (limit * page) < itemCount,
            nextPage: lambda,
            previousPage: page - 1,
            lastPage: Math.floor((pageCount)),
            totalResult: itemCount,
            limit: limit
            
        })
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res,500, false, 'server application error.', data)
      }
}



const getSessions = async (req, res) => {
        const { id } = req.params
    try {
        const accounts = await findSessionsActive(id)
        console.log(accounts)
        res.json(accounts)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res,500, false, 'server application error.', data)
      }
}

const addform = async (req, res) => {
    try {
        res.render('page/session/addform', {title:'Crie uma nova sessão'})
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res,500, false, 'server application error.', data)
      }
}


export { add, del, list, addform, listSessions, getSessions, addNew, listSessionsStatus }
