import Session from  '../model/sessions.model.js'
import Settings from '../model/settings.model.js'
import Queue from  '../model/queue.model.js'
import Campaing from  '../model/campaings.model.js'
import Ultimesessions from  '../model/ultiimatesessions.model.js'
import Log from '../model/logs.model.js'
import {returnDateTimeZone2, returnDateTimeZone, getdates} from '../utils/util.js'
import  childProcess  from 'child_process'
import { logger } from '../../logger.js'
import database from "../../database/dbPostgresClient.js"
import { io } from '../../server.js'
import { updateSessionDisconect } from '../service/sessions/update.js'
import { findTotalSessionDisconect } from '../service/sessions/find.js'
import Sequelize, { QueryTypes , Op}  from 'sequelize'
import { getSession , formatPhone} from '../wpp/whatsapp.js'


const findCreateSession = async (sessionId, user_comp) => {
    try {
      const date = returnDateTimeZone2()
      const find = await Session.findOne({ where: { number: sessionId } })
      if(!find){
          let recordSaveId = sessionId.toString()
          const ses = getSession(recordSaveId)
          const jid = formatPhone(recordSaveId)
          const addSess = { name: recordSaveId, number: sessionId, lastdate: date, company_id: user_comp}
          const save = await Session.create(addSess)
          return save
      }else{
          const up = await Session.update({name: sessionId.toString(), number: sessionId, lastdate: date}, {where: {id:find.id}},{multi: true})
      }
    } catch (err) {
      console.log(err)
    }
}

const banSession = async (sessionId) => {
  try {
    const date = returnDateTimeZone2()
    let ret = await Session.update({ status: 'ban or remove', lastdate: date }, { where: { number: sessionId } }, { multi: true })
    return
  } catch (err) {
    console.log(err)
  }
}

const saveSession = async (sessionId) => {
    try {
      const value = {
        lastsessionid: sessionId,
        lastcountid: 1
      }
      const save = await Ultimesessions.create(value)
      return save
    } catch (err) {
      console.log(err)
    }
}

const listSession = async (sessionId) => {
   try {
    const session = await Session.findOne({ where :{ name: sessionId } })
    return session
   } catch (err) {
    console.log(err)
   }
}


const sendQeuesPause = async (identificador) => {
  try {
    let msg =  identificador   
    io.emit('sendQeuesPause', msg)
  } catch (err) {
    console.log(err)
  }
}

const updateUltimateSession = async (sum, id, date) => {
  try {
    const session = await Ultimesessions.findOne({ where :{ lastsessionid: id } })
  if(session){
    const condition = { where :{lastsessionid: id } } 
    const options = { multi: true }
    const values = {
      lastcountid: sum,
      daterecord: date
    }
    let res = await Ultimesessions.update( values, condition , options )
  }else{
    await saveSession(id)
  }
  } catch (err) {
    console.log(err)
  }
}

const updateStateSession = async (sessionId, status) => {
   try {
    const id = sessionId.toString()
    const condition = { where :{name: id } } 
    const options = { multi: true }
    let values = {
        status: status
      }
    let res = await Session.update( values, condition , options )
   } catch (err) {
    console.log(err)
   }
}

const updateSessionCount = async (sessionId) => {
  try {
    const id = sessionId.toString()
    const session = await Session.findOne({ where :{ name: id } })
    if(session){
      const sum = (parseInt(session.lastcount) + 1)
      const date = returnDateTimeZone2()
      const condition = { where :{name: id } } 
      const options = { multi: true }
      const values = {
          lastcount: sum,
          lastdate: date
      }
    const r = await Session.update( values, condition , options )
    return r
    }
  } catch (err) {
    console.log(err)
  }
}


const getLogs = async (log, sessionid, status) => {
  try {
    const date = returnDateTimeZone2()
    const values = {log, sessionid, date, status}
    let logs = await Log.create(values)
    return logs
  } catch (err) {
    console.log(err)
  }
}

const restartApplication = async (t) => {
  try {
    const type = t ? t : 0
    const dateNow = Date.now()
    const a = await Settings.create({data_restart: dateNow, type})
    process.on("exit", function () {
        childProcess.spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached : true,
            stdio: "inherit"
        });
    });
    process.exit();
  } catch (err) {
    console.log(err)
  }
}

const monitoringSession = async () => {
    try {
      const findAllDisconect = await Session.findAll({ where:{status: 'closed'} })
      if(!findAllDisconect){ return }
      findAllDisconect.map(async function(data) {
          const seconds1 = Math.floor(new Date(data.lastdate) / 1000)
          const seconds2 = Math.floor(Date.now() / 1000)
          const difference = (seconds2-seconds1)
          let sleepingsession = 240
          const sum = (parseInt(data.lastcount) + 1)
          const date = returnDateTimeZone2()
           if(difference >= sleepingsession){
             await Session.update( {
              lastcount: sum,
              lastdate: date
          }, {where:{'id':data.id}} ,  { multi: true } )
                console.log(`Passou ${difference} segundos, vamos dar restart na aplicação`)
                setTimeout(() => restartApplication(1), 10000)
           }
      })
    } catch (err) {
      console.log(err)
    }
}

const countdisconnected = async (sessionId) => {
  try {
    return await updateSessionDisconect(sessionId)
  } catch (err) {
    console.log(err)
  }
}

const findTotalDisconect = async (sessionId) => {
    try {
      return await findTotalSessionDisconect(sessionId)
    } catch (err) {
      console.log(err)
    }
}

const workSunday = async (identificador) => {
  try {
    const credores = await Queue.findOne({ where: { 'identificador': identificador } })
    let date = returnDateTimeZone2()
    const workingDays = date.getDay()
    const sunday = workingDays == credores.sunday
    if(sunday){
       return true
    }else{
       return false
    }
  } catch (err) {
    console.log(err)
  }
}

const monitorScheduleCampaing = async (d1, d2, identificador) => {
  try {
    let date = returnDateTimeZone2()
    const workingDays = date.getDay()
    console.log(workingDays)
    const sunday = await workSunday(identificador)
    if(sunday){ 
      const datainicial = returnDateTimeZone(d1)
      const dataFimal = returnDateTimeZone(d2)
      const v1 = parseInt(date.toString().substring(8, 10)) >= parseInt(datainicial.toString().substring(8, 10)) && parseInt(date.toString().substring(8, 10)) <=  parseInt(dataFimal.toString().substring(8, 10)) ? true : false
      console.log('monitorScheduleCampaing ', v1)
      if(v1){
        const hourNow = (new Date().getHours()*60) + new Date().getMinutes()
        const hi = (new Date(d1).getHours()*60) + new Date(d1).getMinutes()
        const hf = (new Date(d2).getHours()*60) + new Date(d2).getMinutes()
        console.log(hourNow, hi, hf)
        const camp = await Campaing.findOne({ where: { 'identificador': identificador,
        'status':{ [Op.lte]: 0 } } })
        if(camp){
          const ho = hourNow >= hi && hourNow <=  hf ? true : false
          console.log(ho)
          if(ho){
            console.log('monitorScheduleCampaing True Schudule')
            const condition = { where :{identificador} } 
            const options = { multi: true }
            await Queue.update(  {schedule: 0, status: 0, altertimers: 0}, condition , options )
            await Campaing.update(  {active: 0, schedule: 0, altertimers: 0}, condition , options )
          return 200
          }else{
            const queue = await Queue.findOne({ where: { 'identificador': camp.identificador } })
            console.log('monitorScheduleCampaing False Schudule')
            if(queue.status == 0){
              const condition = { where :{identificador} } 
              const options = { multi: true }
              await Queue.update( {schedule: 1, status: 1, altertimers: 0 }, condition , options )
              await Campaing.update( {schedule: 1, active: 1, altertimers: 0 }, condition , options )
            }
            await sendQeuesPause(identificador)
            return 400
          }
        }
        return 200
      }else{
        return 400
      }
    } 
    //////
    return 400
  } catch (err) {
    console.log(err)
  }
}

const monitorSchedule = async (d1, d2) => {
  try {
    let date = returnDateTimeZone2()
  const workingDays = date.getDay()
  if(workingDays > 0){
    const datainicial = returnDateTimeZone(d1)
    const dataFinal = returnDateTimeZone(d2)
    const v1 = parseInt(date.toString().substring(8, 10)) >= parseInt(datainicial.toString().substring(8, 10)) && parseInt(date.toString().substring(8, 10)) <=  parseInt(dataFinal.toString().substring(8, 10)) ? true : false
    if(v1){
      const hourNow = (new Date().getHours()*60) + new Date().getMinutes()
      const hi = (new Date(d1).getHours()*60) + new Date(d1).getMinutes()
      const hf = (new Date(d2).getHours()*60) + new Date(d2).getMinutes()
      const ho = hourNow >= hi && hourNow <=  hf ? true : false
      if(!ho){
        return 400
      }
      return 200
    }else{
      return 400
    }
  }
  return 400
  } catch (err) {
    console.log(err)
  }
}


export { getLogs, findTotalDisconect, countdisconnected, monitoringSession,
   monitorScheduleCampaing, updateStateSession, updateSessionCount, listSession, 
   saveSession, monitorSchedule, restartApplication, findCreateSession, banSession }
