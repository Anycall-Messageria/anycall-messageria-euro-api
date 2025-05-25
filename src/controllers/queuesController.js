import csv from 'fast-csv'
import database from "../../database/dbPostgresClient.js"
import fs from 'fs'
import { monitorScheduleCampaing } from '../session/index.js'
import response from '../../response.js'
import __dirname from '../../dirname.js'
import { io } from '../../server.js'
import {
  getSession, getChatList, isExists, sendMessage, sendMessageBulk, 
  sendMessageMidia, formatPhone } from '../wpp/whatsapp.js'
import Queue from '../model/queue.model.js'
import Campaing from '../model/campaings.model.js'
import Msgs from '../model/mesgs.model.js'
import Issuers from '../model/issuers.model.js'
import Greetingmessage from '../model/greetingmessages.model.js'
import Session from '../model/sessions.model.js'
import RecordMessages from '../model/recordMessage.model.js'
import ControlQueues from '../model/controlqueues.model.js'
import Products from '../model/products.model.js'
import { validateSession, validate } from '../middlaware/sessionValidator.js'
import { justNumbers, cleanOcorrences, rand, generateDatabaseDateTime, getRandomArbitrary, greetingMessage, capitalizeFirstLetter , dataAtualFormatada, returnDateTimeZone2 } from '../utils/util.js'
import { insertSendMessageDb, updateSendMessageDb } from '../middlaware/getMessages.js'
import { updateSessionCount, restartApplication } from '../session/index.js'
import { findSessionsCount, findSessionsStatus } from '../service/sessions/find.js'
import { Op, QueryTypes } from 'sequelize'
import EventEmitter from 'events'
import { 
  CAMPAIGN_STATUS, 
  QUEUE_STATUS, 
  SCHEDULE_STATUS, 
  MESSAGE_TYPE, 
  SESSION_VERIFY, 
  TIMER_ALTER,
  isActiveStatus,
  isPausedStatus,
  isFinishedStatus
} from '../constants/status.js'
import getIntervalManager from '../utils/intervalManager.js'

const eventEmitter = new EventEmitter();
const intervalManager = getIntervalManager();

var meuInterval
let countSuccess = 0
let countFail = 0

const gfg_Run = () => {
  return Math.random().toString(10).slice(2) + Math.random().toString(36).toUpperCase().slice(2);
}

const getList = (req, res) => {
  return response(res, 200, true, '', getChatList(res.locals.sessionId))
}

const sendQeues = async (credor, nomeFila, number, identificador, values) => {
  let msg = ''
  if (number == '2') {
    io.emit('Finalizado', identificador, values)
  }
  if (number == '1') {
    msg = `Pausado a fila ${nomeFila} do ${credor} 🚀 `
    io.emit('sendQeues', msg)

  }
}

const sendStop = async (identificador) => {
  io.emit('Finalizado', identificador)
}

const scheduleMon = (identificador) => {
  io.emit('scheduleMon', identificador)
}

const sendQeuesPause = async (identificador, code) => {
  let msg = identificador
  io.emit('sendQeuesPause', msg, code)
}

const pausando = (identificador) => {
  let msgs = identificador
}

const enviado = identificador => {
  let msg = identificador
  io.emit('Enviando', msg)
}

const success = async (identificador, count, carga, total) => {
  io.emit('Success', identificador, count, carga, total)
}

const trocar = async (id, msg, code) => {
  io.emit('trocar', id, msg, code)
}

const fail = async (identificador, falhas, carga, total) => {
  io.emit('Fail', identificador, falhas, carga, total)
}


const uploadFile = async (req, res) => {
  try {
    const items = [];
    const user_comp = req.user.user_company
    const { credor, nomefila, product, minTime, maxTime, datainicial,
      datafinal, rota, mensagem, fileupload, filemidia, mensageminicial, massiva, captionmidia, tipomensagem, resp, init } = req.body
    const extensaoArquivo = req.file.originalname.split('.')[1];
    if (req.file == undefined) {
      return response(res, 500, false, `Please upload a file`)

    }
    if (!extensaoArquivo == 'csv' || !extensaoArquivo == 'txt') {
      return response(res, 500, false, `Please upload, only CSV or TXT files!`)

    }

    const obj = JSON.stringify(resp)
    const objMsgIni = JSON.stringify(init)
    const msgs = mensagem ? mensagem : null
    const filtroQueues = req.body.filtro ? req.body.filtro : 1
    const identificador = gfg_Run();
    const splitRoute = rota
    const resSplit = splitRoute.split("-", 2)
    const splitCredor = credor
    const resSplitCredor = splitCredor.split("-", 2)
    let newNameFila = `${resSplitCredor[1]} - ${nomefila}`
    let urlmidia = ``
    let randomica = resSplit[1] == process.env.CLIENT ? 'Randômica' : resSplit[1]
    const value = {
      credor: resSplitCredor[0], nomefila: newNameFila, minTime, maxTime, datainicial,
      datafinal, rota: resSplit[0], mensagem: msgs, identificador, mensageminicial, randomica, massiva,
      captionmidia, tipomensagem, company_id: user_comp, filtro: filtroQueues, messages_id: obj, msginit_id: objMsgIni,
      product
    }
    //console.log(value)
    const save = await Queue.create(value)
    let uploads = [];
    try {
        let path = __dirname + `/assets/uploads/${user_comp}/` + req.file.filename
        if (fs.existsSync(path)) {
          let count = 0
          const rs = fs.createReadStream(path)
          .pipe(csv.parse({ headers: false, skipRows: 1, delimiter: ";" }))
          .on("error", (error) => {
            throw error.message;
          })
          .on("data", async (row) => {
            if (row[0]) {
              uploads.push({
                number: '55'+row[0], //numero
                identificador: identificador,
                var1: row[1], //primeiro nome
                var2: row[2], //unique id
                var3: row[3], //produto ou credor
                var4: row[4], //atraso
                var5: row[5], //parcelas
                var6: row[6], //saldo devedor
                var7: row[7], //nome completo
                var8: row[8], //cpf
                var9: row[9],
                company_id: user_comp
                //status: (await verifyWppExists('55'+row[0]) == false ? 400 : 0)
              })
            }
          })
          .on("end", () => {
            const returnCampaing = Campaing.bulkCreate(uploads)
              .then(async function (data) {
                let total = await Campaing.findAndCountAll({ where: { identificador } })
                let retorno = await Queue.update({ 'registros': total.count }, { where: { identificador } }, { multi: true })
                response(res, 200, true, `Create success`, retorno)
              })
              .catch(function (error) { console.log('Error :', error) })
          })
          .on("error", (err) => {
            console.log('Error in read stream...', err)
          })

        }else{

          return response(res, 500, false, `Please verify folder and file`)
        }

    } catch (error) {
      console.log('Error in read stream...', error)
    }

    
    
  } catch (err) {
    const data = { err }
    console.log(err);
    response(res, 500, false, `Could not upload the file ${req.file.originalname}`, data)
  }
}


const uploadFileMidia = async (req, res) => {
  const { credor, nomefila, minTime, maxTime, datainicial, tipomidia, midia,
    datafinal, rota, mensagem, mensageminicial, massiva, captionmidia, tipomensagem } = req.body
    const user_comp = req.user.user_company
  try {

    let tpm = 0
    if (tipomidia == 'imagem') {
      tpm = 1
    } else if (tipomidia == 'video') {
      tpm = 2
    } else if (tipomidia == 'audio') {
      tpm = 3
    } else if (tipomidia == 'documento') {
      tpm = 4
    }

    const extensaoArquivo = req.file.originalname.split('.')[1];
    if (req.file == undefined) {
      return response(res, 500, false, `Please upload a file`)
    }
    if (!extensaoArquivo == 'csv' || !extensaoArquivo == 'txt') {
      return response(res, 500, false, `Please upload, only CSV or TXT files!`)
    }

    const filtroQueues = req.body.filtro ? req.body.filtro : 0
    const identificador = gfg_Run();
    const splitRoute = rota
    const resSplit = splitRoute.split("-", 2)
    const splitCredor = credor
    const resSplitCredor = splitCredor.split("-", 2)
    let newNameFila = `${resSplitCredor[1]} - ${nomefila}`
    let urlmidia = midia //req.files[1].filename
    let randomica = resSplit[1] == process.env.CLIENT ? 'Randômica' : resSplit[1]
    const value = {
      credor: resSplitCredor[0], nomefila: newNameFila, minTime, maxTime, datainicial,
      datafinal, rota: resSplit[0], mensagem: 'Midia', identificador, mensageminicial, randomica, massiva,
      captionmidia, tipomensagem, urlmidia, tipomidia: tpm, company_id: user_comp, filtro: filtroQueues
    }
    const save = await Queue.create(value)
    let uploads = [];
    let path = __dirname + "/assets/uploads/1/" + req.file.filename //req.files[0].filename
    let count = 0
    fs.createReadStream(path)
      .pipe(csv.parse({ headers: false, skipRows: 1, delimiter: ";" }))
      .on("error", (error) => {
        throw error.message;
      })
      .on("data", (row) => {
        if (row[0]) {
          uploads.push({
            number: '55' + row[0],
            identificador: identificador,
            var1: row[1], //nome
            var2: row[2], //contrato
            var3: row[3], //boleto
            var4: row[4],
            var5: row[5],
            company_id: user_comp
          })
        }
      })
      .on("end", () => {
        const returnCampaing = Campaing.bulkCreate(uploads)
          .then(async function (data) {
            let total = await Campaing.findAndCountAll({ where: { identificador } })
            let retorno = await Queue.update({ 'registros': total.count }, { where: { identificador } }, { multi: true })
          })
          .catch(function (error) { console.log(error) })
      })
    res.redirect('/queues/list')
  } catch (err) {
    const data = { err }
    console.log(err);
    response(res, 500, false, `Could not upload the file ${req.file.originalname}`, data)
  }
}

const alterTimers = async (id) => {
   try {
    const queuesPause = await Queue.update({ status: 1, schedule: 3, altertimers: 1 }, { where: { id } }, { multi: true })
    const campaingsPause = await Campaing.update({ active: 1, schedule: 3, altertimers: 1 }, { where: { id } }, { multi: true })
    return
  
   } catch (err) {
    console.log(err, 500, false, 'server application error') 
   }
}

const updateText = async (req, res) => {
  try {
    const { minTime, maxTime, datainicial, datafinal, rota, mensagem, id } = req.body
    const splitRoute = rota
    const resSplit = splitRoute.split("-", 2)
    const randomica = resSplit[1] == process.env.CLIENT ? 'Randômica' : resSplit[1]
    const values = {
      minTime, maxTime, datainicial, datafinal,
      rota: resSplit[0], mensagem, randomica, banremove: 0
    }
    await Queue.update(values, { where: { id } }, { multi: true })
    const filas = await Queue.findOne({ where: { id } })
    if (filas.status == 0) {
      await alterTimers(id)
    }
    response(res, 200, true, 'update success', filas) 
  
  } catch (err) {
    const data = { err }
    response(res, 500, false, 'server application error', data)    
  }
}

const list = async (req, res) => {
  const user_comp = req.user.user_company
  try {
    const limit = req.query.limit || 15
    const page = +req.query.page || 0
    const sessionBan = await findSessionsStatus(0)
    const sessions = await findSessionsCount(user_comp)
    const filas = await Queue.findAndCountAll({
      where: {
        company_id: user_comp,
        [Op.or]: [
          { status: 0 },
          { status: 1 },
          { status: 2 },
          { status: 5 }
        ]
      },
      order: [
        ["banremove", "ASC"],
        ["status", "ASC"]
      ],
      offset: (page * limit),
      limit: limit
    })
    const itemCount = filas.count
    const pageCount = Math.floor(itemCount / limit);
    let lambda
    if (pageCount == page) {
      lambda = page
    } else {
      lambda = page + 1
    }
    response(res, 200, true, 'List queues',  {
      fila: filas.rows,
      currentPage: page,
      hasPreviousPage: page > 0,
      hasNextPage: (limit * page) < itemCount,
      nextPage: lambda,
      previousPage: page - 1,
      lastPage: Math.floor((pageCount)),
      totalResult: itemCount,
      limit: limit,
      sessions,
      user_comp
    }) 

  } catch (err) {
    const data = { err }
    response(res, 500, false, 'server application error', data)
  }
}


const listId = async (req, res) => {
  const id = req.params.id
  const msgs = []
  try {
    const filas = await Queue.findByPk(id)
    let messages = (JSON.parse(filas.msginit_id))
    messages.forEach(async (val) => {
            const msg = await Greetingmessage.findOne({ where: {id: val} })
              const t = {id: msg.id, salutation: msg.salutation}
            msgs.push(t)
    }); 
    setTimeout(()=> { return res.json({filas, msgsInit: msgs}) }, 1000)
  } catch (err) {
    const data = { err }
    response(res, 500, false, 'server application error', data)
  }
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const del = async (req, res) => {
  try {
    const { delqueue } = req.body
    const condition = { where: { 'identificador': delqueue } }
    const options = { multi: true }
    const values = { status: 4 }
    const values1 = { active: 4, schedule: 4 }
    await Queue.update(values, condition, options)
    await Campaing.update(values1, condition, options)
    const filas = await Queue.findAll({
      where: {
        [Op.or]: [
          { status: 0 },
          { status: 1 },
          { status: 2 },
          { status: 5 }
        ]
      },
      order: [
        ["banremove", "ASC"],
        ["status", "ASC"]
      ]
    })
    response(res, 200, true, 'delete item', filas)
  } catch (err) {
    const data = { err }
    response(res, 500, false, 'server application error', data)
  }
}


const listRestart = async () => {
  try {
    const find = await Queue.findAll({ where: { status: 0 } })
    if (find.length <= 0) {
      return
    }
    find.map(async function (data) {
      const identificador = data.identificador
      const schedule = await monitorScheduleCampaing(data.datainicial, data.datafinal, data.identificador)
      if (schedule == 400) {
        scheduleMon(identificador)
        return
      }
      await restart(identificador)
    })
  
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}

const listMonitor = async () => {
  try {
    const find = await Queue.findAll({ where: { status: 0, schedule: 0 } })
    if (find.length <= 0) {
      return
    }
    find.map(async function (data) {
      const identificador = data.identificador
      const schedule = await monitorScheduleCampaing(data.datainicial, data.datafinal, data.identificador)
      if (schedule == 400) {
        scheduleMon(identificador)
        return
      }
    })
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}

const listStart = async () => {
  try {
    const find = await Queue.findAll({ where: { status: 5 } })
    if (find.length <= 0) {
      return
    }
    find.map(async function (data) {
      const identificador = data.identificador
      const schedule = await monitorScheduleCampaing(data.datainicial, data.datafinal, data.identificador)
      if (schedule == 400) {
        scheduleMon(identificador)
        return
      }
      await restart(identificador)
    })
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}


const listRestartPause = async () => {
  try {
    const filasSchedule = await Queue.findAll({
      where: {
        [Op.or]: [
          { status: 1 }
        ],
        'schedule': { [Op.ne]: 3 }
      }
    })
    if (filasSchedule.length <= 0) {
      console.log('Não Tem Restart pause ')
      return
    }
    filasSchedule.map(async function (data) {
      const identificador = data.identificador
      const schedule = await monitorScheduleCampaing(data.datainicial, data.datafinal, data.identificador)
      //console.log('listRestartSchedule', schedule)
      if (schedule == 400) {
        scheduleMon(identificador)
        return
      }
      await restart(identificador)
    })
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}


async function restart(identificador){
  try {
    const filasSchedule = await Queue.findOne({ where: { "identificador": identificador } })
    const schedule = await monitorScheduleCampaing(filasSchedule.datainicial, filasSchedule.datafinal, filasSchedule.identificador)
    if (!schedule) {
      scheduleMon(identificador)
      return
    }
    async function getRandomInt(min, max) {
      try {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      } catch (error) {
        console.log(error)
      }
   }
    async function random(id) {
      try {
        const filasSchedule = await Queue.findOne({ where: { "identificador": id } })
        const min = (filasSchedule.minTime * 1000)
        const max = (filasSchedule.maxTime * 1000)
        return getRandomInt(min, max)
      } catch (error) {
        console.log(error)
      }
    }
    var getTime = setInterval(async function () {
      const cont = await random(identificador)
      cancelInterval(identificador)
      proximaFuncao(cont);
    }, 60000);
  
    var passSend = await random(identificador)
    function proximaFuncao(contagem) {
      passSend = contagem
    }
  
    const filas = await Queue.findOne({ where: { "identificador": identificador, 'status': QUEUE_STATUS.ACTIVE } })
    const identificador1 = filas.identificador
    const _id = filas.id
    const mensageminicial = filas.mensageminicial
    meuInterval = setInterval(result, passSend)
  
    async function cancelInterval(identificador) {
      try {
        const cancel = await Queue.findOne({ where: { identificador } })
        let id = cancel.identificador
        console.log('Cancel==>', cancel.status, id)
        if (cancel.status == 0 && (cancel.entregues + cancel.falhas) >= cancel.registros) {
          clearInterval(meuInterval)
          clearInterval(getTime)
          await sendQeues(cancel.credor, cancel.nomeFila, 2, cancel.identificador)
          await Queue.update({ status: 2 }, { where: { "identificador": identificador } }, { multi: true })
          await Campaing.update({ active: 2 }, { where: { "identificador": identificador } }, { multi: true })
          return
        }
        if (cancel.status == QUEUE_STATUS.PAUSED) {
          console.log('Pausou', id)
          clearInterval(meuInterval);
          intervalManager.clear(`${identificador}-getTime`);
          await sendQeues(cancel.credor, cancel.nomeFila, 1, cancel.identificador)
          return
        } else if (cancel.status == QUEUE_STATUS.FINISHED) {
          console.log('Cancelou', id)
          clearInterval(meuInterval);
          intervalManager.clear(`${identificador}-getTime`);
          await sendQeues(cancel.credor, cancel.nomeFila, 2, cancel.identificador)
          return
        }
        if (cancel.altertimers == TIMER_ALTER.ALTERED) {
          console.log('Alterou tempo e pausou', id)
          clearInterval(meuInterval);
          intervalManager.clear(`${identificador}-getTime`);
          intervalManager.setTimeout(`${id}-restart`, () => restart(id), 15000)
        }
        if ((cancel.entregues + cancel.falhas) >= cancel.registros) {
          await sendQeues(cancel.credor, cancel.nomeFila, 2, cancel.identificador)
          await Queue.update({ status: 2 }, { where: { "identificador": identificador } }, { multi: true })
          await Campaing.update({ active: 2 }, { where: { "identificador": identificador } }, { multi: true })
          clearInterval(meuInterval)
          clearInterval(getTime)
          return
        }
      } catch (error) {
        console.log(error)
      }
   }

    if (filas.status == 0) {
      meuInterval
    } else {
      return
    }
    function result() {
      Campaing.findOne({ where: { 'identificador': identificador1, 'status': CAMPAIGN_STATUS.ACTIVE, 'schedule': SCHEDULE_STATUS.INACTIVE }, order: [['id', 'ASC']] })
        .then(async function (res) {
          if (res) {
            if (res.schedule == SCHEDULE_STATUS.INACTIVE) {
              if (res.active == CAMPAIGN_STATUS.ACTIVE) {
                if (mensageminicial == MESSAGE_TYPE.NORMAL) {
                  sending(identificador1, res.id)
                } else if (mensageminicial == MESSAGE_TYPE.INITIAL) {
                  sendingInitial(identificador1, res.id)
                }
              } else if (res.active == CAMPAIGN_STATUS.PAUSED) {
                sendQeuesPause(identificador, 1)
                return
              }
            }
          } else {
            const condition = { where: { id: _id } }
            const options = { multi: true }
            let get = await Queue.findOne(condition)
              .then(async data => {
                if (data.status == 1 && data.schedule == 1) {
                  await sendQeuesPause(data.identificador)
                  await Queue.update({ status: 1, schedule: 1 }, condition, options)
                  await Campaing.update({ active: 1 }, { where: { "identificador": identificador } }, { multi: true })
                } else if (data.status == 4) {
                  await sendQeues(data.credor, data.nomeFila, QUEUE_STATUS.DELETED, data.identificador)
                  await Queue.update({ status: 4, schedule: 4 }, condition, options)
                  await Campaing.update({ active: 4, schedule: 4 }, { where: { "identificador": identificador } }, { multi: true })
                } else if (data.status == 1 && data.schedule == 3) {
                  await sendQeues(data.credor, data.nomeFila, QUEUE_STATUS.DELETED, data.identificador)
                  await Queue.update({ status: 1, schelule: 3 }, condition, options)
                  await Campaing.update({ active: 1, schedule: 3 }, { where: { "identificador": identificador } }, { multi: true })
                } else {
                  await sendQeues(data.credor, data.nomeFila, 2, data.identificador)
                  await Queue.update({ status: 2 }, condition, options)
                  await Campaing.update({ active: 2 }, { where: { "identificador": identificador } }, { multi: true })
                }
                return
              })
              .catch((error) => {
                console.error("Error:", error);
              })
            return
          }
        })
    }
  } catch (err) {
    const data = { err }
    console.log(500, false, `Error application server!`, data )
  }
}




const existsWppNumber = (id) => {
  try {
    eventEmitter.emit('verify-number', id )
  } catch (error) {
    console.log(error)
  }
}

eventEmitter.on('verify-number', async (id) => {
  try {
    await verifyWppExists(id)
  } catch (error) {
      console.log(error)
  }
});


const listnerStart = (datas) =>{
  try {
    eventEmitter.emit('set-start', datas )
  } catch (error) {
    console.log(error)
  }
}

eventEmitter.on('set-start', async (datas) => {
    try {
      await sendStartMessage(datas)
    } catch (error) {
        console.log(error)
    }
 });


 async function start (req, res){
  try {
    const datas = {
      identificador: req.body.identificador,
      verify: req.body.verify,
      pause: req.body.pause
    }
    
    listnerStart(datas)
    res.redirect('list')
  } catch (err) {
    const data = { err }
    console.log(err)
    response(res, 500, false, `Error application server!`, data )
  }
}


async function sendStartMessage(datas){
  console.log('Start', datas)
  try {
    const { identificador, verify, pause } = datas
    if (verify == SESSION_VERIFY.INVALID) {
      sendQeuesPause(identificador)
      trocar(identificador, `sessão removida ou banida`, 404)
      return
    }
    const filasSchedule = await Queue.findOne({ where: { "identificador": identificador } })
    const schedule = await monitorScheduleCampaing(filasSchedule.datainicial, filasSchedule.datafinal, filasSchedule.identificador)
    if (!schedule) {
      scheduleMon(identificador)
      return
    }
    async function getRandomInt(min, max) {
      try {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      } catch (error) {
        console.log(error)
      }
   }
    async function random(id) {
      try {
        const filasSchedule = await Queue.findOne({ where: { "identificador": id } })
        const min = (filasSchedule.minTime * 1000)
        const max = (filasSchedule.maxTime * 1000)
        return getRandomInt(min, max)
      } catch (error) {
        console.log(error)
      }
    }
    var getTime = setInterval(async function () {
      const cont = await random(identificador)
      cancelInterval(identificador)
      proximaFuncao(cont);
    }, 60000);
  
    var passSend = await random(identificador)
    function proximaFuncao(contagem) {
      passSend = contagem
    }
  
    const filas = await Queue.findOne({ where: { "identificador": identificador, 'status': 0 } })

    //console.log('Fila', filas)

    const identificador1 = filas.identificador
    const _id = filas.id
    const mensageminicial = filas.mensageminicial
    meuInterval = setInterval(result, passSend)
  
    async function cancelInterval(identificador) {
      try {
        const cancel = await Queue.findOne({ where: { identificador } })
        let id = cancel.identificador
        console.log('Cancel==>', cancel.status, id)
        if (cancel.status == 0 && (cancel.entregues + cancel.falhas) >= cancel.registros) {
          clearInterval(meuInterval)
          clearInterval(getTime)
          await sendQeues(cancel.credor, cancel.nomeFila, 2, cancel.identificador)
          await Queue.update({ status: 2 }, { where: { "identificador": identificador } }, { multi: true })
          await Campaing.update({ active: 2 }, { where: { "identificador": identificador } }, { multi: true })
          return
        }
        if (cancel.status == QUEUE_STATUS.PAUSED) {
          console.log('Pausou', id)
          clearInterval(meuInterval);
          intervalManager.clear(`${identificador}-getTime`);
          await sendQeues(cancel.credor, cancel.nomeFila, 1, cancel.identificador)
          return
        } else if (cancel.status == QUEUE_STATUS.FINISHED) {
          console.log('Cancelou', id)
          clearInterval(meuInterval);
          intervalManager.clear(`${identificador}-getTime`);
          await sendQeues(cancel.credor, cancel.nomeFila, 2, cancel.identificador)
          return
        }
        if (cancel.altertimers == TIMER_ALTER.ALTERED) {
          console.log('Alterou tempo e pausou', id)
          clearInterval(meuInterval);
          intervalManager.clear(`${identificador}-getTime`);
          intervalManager.setTimeout(`${id}-restart`, () => restart(id), 15000)
        }
        if ((cancel.entregues + cancel.falhas) >= cancel.registros) {
          await sendQeues(cancel.credor, cancel.nomeFila, 2, cancel.identificador)
          await Queue.update({ status: 2 }, { where: { "identificador": identificador } }, { multi: true })
          await Campaing.update({ active: 2 }, { where: { "identificador": identificador } }, { multi: true })
          clearInterval(meuInterval)
          clearInterval(getTime)
          return
        }
      } catch (error) {
        console.log(error)
      }
   }

    if (filas.status == 0) {
      meuInterval
    } else {
      return
    }
    function result() {
      Campaing.findOne({ where: { 'identificador': identificador1, 'status': CAMPAIGN_STATUS.ACTIVE, 'schedule': SCHEDULE_STATUS.INACTIVE }, order: [['id', 'ASC']] })
        .then(async function (res) {
          if (res) {
            if (res.schedule == SCHEDULE_STATUS.INACTIVE) {
              if (res.active == CAMPAIGN_STATUS.ACTIVE) {
                if (mensageminicial == MESSAGE_TYPE.NORMAL) {
                  console.log('Chama o sending', mensageminicial)
                  sending(identificador1, res.id)
                } else if (mensageminicial == MESSAGE_TYPE.INITIAL) {
                  sendingInitial(identificador1, res.id)
                }
              } else if (res.active == CAMPAIGN_STATUS.PAUSED) {
                sendQeuesPause(identificador, 1)
                return
              }
            }
          } else {
            const condition = { where: { id: _id } }
            const options = { multi: true }
            let get = await Queue.findOne(condition)
              .then(async data => {
                if (data.status == 1 && data.schedule == 1) {
                  await sendQeuesPause(data.identificador)
                  await Queue.update({ status: 1, schedule: 1 }, condition, options)
                  await Campaing.update({ active: 1 }, { where: { "identificador": identificador } }, { multi: true })
                } else if (data.status == 4) {
                  await sendQeues(data.credor, data.nomeFila, QUEUE_STATUS.DELETED, data.identificador)
                  await Queue.update({ status: 4, schedule: 4 }, condition, options)
                  await Campaing.update({ active: 4, schedule: 4 }, { where: { "identificador": identificador } }, { multi: true })
                } else if (data.status == 1 && data.schedule == 3) {
                  await sendQeues(data.credor, data.nomeFila, QUEUE_STATUS.DELETED, data.identificador)
                  await Queue.update({ status: 1, schelule: 3 }, condition, options)
                  await Campaing.update({ active: 1, schedule: 3 }, { where: { "identificador": identificador } }, { multi: true })
                } else {
                  await sendQeues(data.credor, data.nomeFila, 2, data.identificador)
                  await Queue.update({ status: 2 }, condition, options)
                  await Campaing.update({ active: 2 }, { where: { "identificador": identificador } }, { multi: true })
                }
                return
              })
              .catch((error) => {
                console.error("Error:", error);
              })
            return
          }
        })
    }
  } catch (err) {
    const data = { err }
    console.log(500, false, `Error application server!`, data )
  }
}

const getMessage = async (id, identificador, messages) => {
  try {
    let arr = []
    const result = await Campaing.findOne({
      where: {
        'identificador': identificador,
        'status': 0, id: id
      }, order: [['id', 'ASC']]
    })
    const var1 = result.var1
    const var2 = result.var2
    const var3 = result.var3
    const var4 = result.var4
    const var5 = result.var5
    const var6 = result.var6
    if (var1 || var2 || var3 || var4 || var5 || var6) {
      arr.push(var1, var2, var3, var4, var5, var6)
    }
    var replaceArrayValue = arr
    var finalAns = messages
    var replaceArray = ["var1", "var2", "var3", "var4", "var5", "var6"];
    for (var i = replaceArray.length - 1; i >= 0; i--) {
      finalAns = finalAns.replace(RegExp("\\b" + replaceArray[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\b", "g"), replaceArrayValue[i]);
    }
    const clearString = finalAns.replace(/[{}]/g, '');
    let message = { "text": clearString }
    return message
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}

const s = async (m, receiver, rota, id, identificador, credor) => {
  try {
    const validate = await validateSession(rota, credor)
    const message = await getMessage(id, identificador, m)
    const session = getSession(rota)
    const exists = await isExists(session, receiver)
    if (!exists) {
      await Campaing.update({ status: 400, statusSend: false, stateMsg: 'The receiver number is not exists.' },
        { where: { id: id } }, { multi: true })
      const f = await Queue.findOne({ where: { identificador } });
      const countFalhas = parseInt(f.falhas) + 1
      let tot = parseInt(f.entregues) + countFalhas
      let carga = parseInt(f.registros)
      await fail(identificador, countFalhas, carga, tot)
      await Queue.update({ falhas: countFalhas }, { where: { identificador } }, { multi: true })
      return
    } else {
      const delay = 0
      await sendMessageBulk(session, receiver, message, delay)
      await Campaing.update({ status: 200, statusSend: true, stateMsg: 'The message has been successfully sent.' },
        { where: { id: id } }, { multi: true })
      const e = await Queue.findOne({ where: { identificador } });
      let cont = parseInt(e.entregues) + 1
      let tot = parseInt(e.falhas) + cont
      let carga = parseInt(e.registros)
      await success(identificador, cont, carga, tot)
      await Queue.update({ entregues: cont }, { where: { identificador } }, { multi: true })
    }
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}

const sendBulkMessage = async (req, res) => {
  try {
    const identificador = req.body.identificador
    const filas = await Queue.findOne({ where: { "identificador": identificador, 'status': 5, 'massiva': 1 } })
    const m = filas.mensagem
    const session = filas.rota
    const credor = filas.credor
    const nomeFila = filas.nomeFila
    const total = filas.registros
    //await Queue.update({status: 5, schedule: 5}, {where: { "identificador":  identificador, 'status': 5, 'massiva': 1 }}, {multi: true})
    const campaing = await Campaing.findAll({ where: { "identificador": identificador, 'status': 0 }, order: [['id', 'ASC']] })
    let count = 0
    campaing.map(async function (data) {
      const _id = data.id
      const number = data.number
      const receiver = formatPhone(number)
      enviado(identificador)
      const a = await s(m, receiver, session, _id, identificador, credor)
      count = count + 1
      if (count == total) {
  
        const falhas = await Campaing.findAndCountAll({ where: { "identificador": identificador, 'statusSend': false } })
        const entregues = await Campaing.findAndCountAll({ where: { "identificador": identificador, 'statusSend': true } })
        await Queue.update({ status: 2, schedule: 2, falhas: falhas.count, entregues: entregues.count }, { where: { "identificador": identificador, 'status': 5, 'massiva': 1 } }, { multi: true })
        await Campaing.update({ active: 2, schedule: 2 }, { where: { "identificador": identificador } }, { multi: true })
        const totalQueues = count
        const values = {
          falhas: falhas.count,
          entregues: entregues.count,
          totalQueues: totalQueues
        }
        setTimeout(() => { sendQeues(credor, nomeFila, 2, identificador, values) }, 5000)
        return
      }
    })
  } catch (err) {
    const data = { err }
    console.log(err)
    response(res, 500, false, 'server application error', data)
  }
}

const pauseCamp = async (req, res) => {
  try {
    const pause = req.body.pause
    const identificador = req.body.identificador
    const queuesPause = await Queue.update({ status: pause, schedule: 3 }, { where: { 'identificador': identificador } }, { multi: true })
    const campaingsPause = await Campaing.update({ active: pause, schedule: 3 }, { where: { 'identificador': identificador } }, { multi: true })
    console.log('Pausou', identificador)
    sendQeuesPause(identificador, 3)
  } catch (err) {
    const data = { err }
    console.log(err)
    return response(res, 500, false, `Error application server!`, data )
  } 
}

const stopCamp = async (req, res) => {
  try {
    const identificador = req.body.identificador
    const queuesStop = await Queue.update({ status: 2, schedule: 2 }, { where: { 'identificador': identificador } }, { multi: true })
    const campaingsStop = await Campaing.update({ active: 2, schedule: 2, status: 2 }, { where: { 'identificador': identificador, status: 0 } }, { multi: true })
    sendStop(identificador)
  } catch (err) {
    const data = { err }
    console.log(err)
    return response(res, 500, false, `Error application server!`, data )
  }
}

const getTypeMidia = async (datas) => {
  try {
    const { tipomidia, urlmidia, caption } = datas
    let message = {}
    if (tipomidia == 2 /*"video"*/) {
      message = {
        video: fs.readFileSync("assets/midias/" + urlmidia),
        caption: caption,
        gifPlayback: false
      }
    }
    if (tipomidia == 1/*"image"*/) {
      message = {
        image: { url: "assets/midias/" + urlmidia },
        //image: { url: fs.readFileSync("assets/"+fileName)},
        caption: caption
      }
    }
    if (tipomidia == 3/*"audio"*/) {
      message = {
        audio: { url: "assets/midias/" + urlmidia },
      }
    }
    if (tipomidia == 4/*"document"*/) {
      message = {
        document: { url: urlmidia },
        mimetype: 'application/pdf',
         fileName:    `boleto_GrupoEuro17_${new Date().getTime()}.pdf`
      }
    }
    return message
  } catch (err) {
   console.log(err, 500, false, 'Failed to get media.')
  }
}

const sending = async (ids, id_send) => {
  console.log('Sending', ids, id_send)
  try {
    let idFila = 0, tipomsg = 0, number = ''
    let var1 = '' , var2 = '', var3 = '', var4 = '', var5 = '', var6 = '', var7 = '', var8 = '', var9 = ''
    let _id = 0
    const arr = []
    // Otimização: Buscar fila e campanha em paralelo quando possível
    const filas = await Queue.findOne({ where: { 'identificador': ids, 'status': 0 } })
    
    if (!filas || filas.status > 0 || filas.banremove == 1) {
      return
    }
    
    const identificador = filas.identificador
    const queueName = filas.nomefila
    console.log('Filas', identificador, queueName)

    const result = await Campaing.findOne({ where: { 'id': id_send, 'identificador': filas.identificador, 'status': 0 }, order: [['id', 'ASC']] })
  
    idFila = filas.id
    tipomsg = filas.tipomensagem
    number = result.number
    var1 = result.var1
    var2 = result.var2
    var3 = result.var3
    var4 = result.var4
    var5 = result.var5
    var6 = result.var6
    var7 = result.var7
    var8 = result.var8
    var8 = result.var9
    _id = result.id
    if (var1 || var2 || var3 || var4 || var5 || var6 || var7 || var8 || var9) {
      arr.push(var1, var2, var3, var4, var5, var6, var7, var8, var9)
    }
    var replaceArrayValue = arr
    const xpto = await validateSession(filas.rota, filas.credor)
    const sessions = getSession(xpto)
    if (xpto == 401) {
      console.log(401)
      await Queue.update({ 'status': 1, 'banremove': 0 }, { where: { 'identificador': identificador } }, { multi: true })
      await Campaing.update({ 'active': 1 }, { where: { 'identificador': identificador } }, { multi: true })
      sendQeuesPause(identificador)
      trocar(filas.identificador, `Verifique se a sessão é randômica para ${queueName}`, xpto)
      return
    } else if (xpto == 404) {
      console.log(404)
      await Queue.update({ 'status': 1, 'banremove': 1 }, { where: { 'identificador': identificador } }, { multi: true })
      await Campaing.update({ 'active': 1 }, { where: { 'identificador': identificador } }, { multi: true })
      sendQeuesPause(identificador)
      trocar(filas.identificador, `sessão removida ou banida para ${queueName}`, xpto)
      return
    }
   
    const session = getSession(xpto)
    const receiver = formatPhone(number)
      
    const a = filas.tipomidia 
    const url = filas.tipomidia 
    const title = filas.title
    const description = filas.description
    const jpegThumbnail = filas.midia
    const caption = filas.captionmidia
    const tipomidia = filas.tipomidia
    const tipomensagem = filas.tipomensagem
    var replaceArray = ["var1", "var2", "var3", "var4", "var5", "var6", "var7", "var8", "var9"];
    const messages = filas.mensagem ? filas.mensagem : JSON.parse(filas.messages_id)
    var finalAns
    if(typeof(messages) == 'object'){
      const count = messages.length
      const mssgs = await RecordMessages.findOne({ where:{ id: rand(messages) }})
      finalAns = mssgs.mensagem;
    }else{
      finalAns = messages;
    }
    let clearString
    if (finalAns) {
      for (var i = replaceArray.length - 1; i >= 0; i--) {
        finalAns = finalAns.replace(RegExp("\\b" + replaceArray[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\b", "g"), replaceArrayValue[i]);
      }
      clearString = finalAns.replace(/[{}]/g, '');
    } else {
      clearString = caption
    }
    const query = { where: { id: id_send } }
    const update = {
      messages: clearString
    }
    let message = { "text": clearString }
    const options = { multi: true }
    
    const exists = await isExists(session, receiver)

      if (!exists) {
        let objs = {
          queue_id: idFila,
          lasttime: Date.now(),
          status: 400,
          receiver: receiver
        }
    
        let save = await ControlQueues.create(objs)
        const f = await Queue.findOne({ where: { id: idFila } });
        const countFalhas = parseInt(f.falhas) + 1
        let tot = parseInt(f.entregues) + countFalhas
        let carga = parseInt(f.registros)
        const data = {}
        const msgsSaves = {
          receiver,
          statusSend: false,
          stateMsg: 'The receiver number is not exists.',
          credor: parseInt(f.credor),
          session: xpto,
          queues_id: idFila
        }
  
        const query1 = { where: { id: idFila } }
        const query2 = { where: { 'id': id_send } }
        const update1 = {
          status: 400,
          statusSend: false,
          stateMsg: 'The receiver number is not exists.'
        }
        const options1 = { multi: true }
        await Campaing.update(update1, query2, options1)
        const falhas = { falhas: countFalhas }
        await Queue.update(falhas, query1, options1)
        await fail(identificador, countFalhas, carga, tot)
        await Msgs.create(msgsSaves)
        return
      }
      if(tipomensagem == 2){
        const dataSendMidia = { caption, tipomidia, url, session, receiver }
        console.log(dataSendMidia)
        await sendingFiles(dataSendMidia, idFila, identificador, id_send, xpto)
      }else if(tipomensagem == 1){
        const datas = await sendMessage(session, receiver, message, 0)
        enviado(identificador)
        if (datas) {
          await Campaing.update({ status: 200, statusSend: true, stateMsg: 'The message has been successfully sent.', session: xpto },
            { where: { id: id_send } }, { multi: true })
          let objs = {
            queue_id: idFila,
            lasttime: Date.now(),
            status: 200,
            receiver: receiver
          }
          // Otimização: Executar criação e busca em paralelo
          const [save, e] = await Promise.all([
            ControlQueues.create(objs),
            Queue.findOne({ where: { id: idFila } })
          ])
          let cont = parseInt(e.entregues) + 1
          let tot = parseInt(e.falhas) + cont
          let carga = parseInt(e.registros)
          await updateSessionCount(xpto)
          let retorno = await Queue.update({ entregues: cont }, { where: { id: idFila } }, { multi: true })
          await success(identificador, cont, carga, tot)
          const msgsSave =
          {
            receiver,
            messages: messages,
            statusSend: true,
            stateMsg: 'The message has been successfully sent.',
            credor: parseInt(e.credor),
            session: xpto,
            queues_id: idFila
          }
          let ret = await Msgs.create(msgsSave)
        }
      }
    } catch (error) {
      console.log(error,  500, false, 'Failed to send the message.' )
    }
}


const sendingFiles = async (datas, idFila, identificador, id_send, xpto) => {
const { caption, tipomidia, url, session, receiver } = datas
try {
    const dataMidia = { tipomidia, urlmidia: url, caption }
    const message = await getTypeMidia(dataMidia)
    
    const d = await sendMessageMidia(session, receiver, message, 0)
    if (d) {
      enviado(identificador)
      let objs = {
        queue_id: idFila,
        lasttime: Date.now(),
        status: 200,
        receiver: receiver
      }
     await ControlQueues.create(objs)
     await Campaing.update({ status: 200, statusSend: true, stateMsg: 'The message has been successfully sent.' },
     { where: { id: id_send } }, { multi: true })
    
      const e = await Queue.findOne({ where: { id: idFila } });
      let cont = parseInt(e.entregues) + 1
      let tot = parseInt(e.falhas) + cont
      let carga = parseInt(e.registros)

      await updateSessionCount(xpto)
      await Queue.update({ entregues: cont }, { where: { id: idFila } }, { multi: true })
      await success(identificador, cont, carga, tot)
      const msgsSave =
      {
        receiver,
        messages: `${url} | ${caption}`,
        statusSend: true,
        stateMsg: 'The message has been successfully sent.',
        credor: parseInt(e.credor),
        session: xpto,
        queues_id: idFila
      }
      let ret = await Msgs.create(msgsSave)
    }
   } catch (err) {
     console.log(err,  500, false, 'Failed to send the message.' )
   }
}

const sendingInitial = async (identificador, id_send) => {
  try {
    let var1 = '', var2 = '', var3 = '', var4 = '', var5 = '', var6 = ''
    let messageInitial
    const arr = []
    let mggs
    const filas = await Queue.findOne({ where: { 'identificador': identificador } })
    
    const result = await Campaing.findOne({ where: { id: id_send, 'identificador': identificador, 'status': 0 } })
    if(!result){
      return
    }

    const { count, rows } = await Greetingmessage.findAndCountAll({});

    let messages = ''
    if(filas.msginit_id){
       messages = (JSON.parse(filas.msginit_id))
       if(typeof(messages) == 'object'){
        let mssgs = await Greetingmessage.findOne({ where:{ id: rand(messages) }})
        messageInitial = mssgs.salutation;
        mggs = messageInitial
      }
    }else{
      const ar = []
      const r = await Greetingmessage.findAll({ attributes: ['id']})
      r.map(function(data){ ar.push(data.id) })
      let idGM = rand(ar)
      messageInitial = await Greetingmessage.findOne({ where: { 'id': idGM } })
      mggs = messageInitial.salutation
    }

  const idFila = filas.id
  const number = result.number
  const _id = result.id
  const xpto = await validateSession(filas.rota, filas.credor)
  const session = getSession(xpto)
  const receiver = formatPhone(number)
  var1 = result.var1 ? capitalizeFirstLetter(result.var1) : result.var1
  var2 = result.var2
  var3 = result.var3
  var4 = result.var4
  var5 = result.var5
  var6 = result.var6
  if (var1 || var2 || var3 || var4 || var5 || var6) {
    arr.push(var1, var2, var3, var4, var5, var6)
  }
  var replaceArrayValue = arr
  var replaceArray = ["var1", "var2", "var3", "var4", "var5", "var6"];
  var finalAns = filas.mensagem;
  let msgsOrigin = ''
  let mggsView = ''
  let rd 
  rd = getRandomArbitrary (1, 99)
  if (finalAns || mggs) {
    for (var i = replaceArray.length - 1; i >= 0; i--) {
      finalAns = finalAns.replace(RegExp("\\b" + replaceArray[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\b", "g"), replaceArrayValue[i]);
      mggs = mggs.replace(RegExp("\\b" + replaceArray[i].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\b", "g"), replaceArrayValue[i]);
    }
    msgsOrigin = finalAns.replace(/[{}]/g, '');
    mggsView = mggs.replace(/[{}]/g, '');
  } else {
    msgsOrigin = filas.mensagem
    const mso = messageInitial.salutation
    mggsView =   mso.replace(/999/g, rd)
  }

  mggsView =   mggsView.replace(/999/g, rd)
  let message = { "text": mggsView , msgsOrigin}

    const exists = await isExists(session, receiver)
    if (!exists) {
      let objs = { queue_id: idFila, lasttime: Date.now(), status: 400, receiver: receiver }
      let save = await ControlQueues.create(objs)
      const f = await Queue.findOne({ where: { id: idFila } });
      const countFalhas = parseInt(f.falhas) + 1
      let tot = parseInt(f.entregues) + countFalhas
      let carga = parseInt(f.registros)
      const data = {}
      const msgsSaves = {
        receiver, messages: mggs, statusSend: false, stateMsg: 'The receiver number is not exists.',
        credor: parseInt(f.credor), session: xpto, queues_id: idFila, id_campaing: id_send
      }
      Msgs.create(msgsSaves).then(async data => {
        const query1 = { where: { id: idFila } }
        const query2 = { where: { 'id': id_send } }
        const update1 = {
          status: 400, statusSend: false, session: xpto, sendmessageinitial: 1,
          stateMsg: 'The receiver number is not exists.'
        }
        const options1 = { multi: true }
        const x = await Campaing.update(update1, query2, options1)
        const falhas = { falhas: countFalhas }
        const z = await Queue.update(falhas, query1, options1)
      })
      const falhas = { falhas: countFalhas }
      await fail(identificador, countFalhas, carga, tot)

      await sendMessageAfterFail(identificador, (id_send+1))

      return
    }
    const endpointmsg =  filas.filtro == 1 ?  'send-text' : 'send-contact'
    const datasMes = {receiver: justNumbers(receiver), messageinit: mggs, endpointmsg,
      session: xpto, type: 2, id_campaing: id_send, text: msgsOrigin, code: rd}
      console.log('Id Campanha ', receiver, id_send )
    const datas = await sendMessage(session, receiver, message, 0)
    if (datas) {
        console.log('Enviou Id Campanha ', datas.key.remoteJid, id_send )
        await Campaing.update({status: 200, statusSend: true,stateMsg: 'The message has been successfully sent.', sendmessageinitial: 1,session: xpto},
        { where: { id: id_send } }, { multi: true })

        await insertSendMessageDb(datasMes)
        await updateSessionCount(xpto)
        await updateSendMessageDb(justNumbers(receiver))

        let objs = { queue_id: idFila, lasttime: Date.now(), status: 200, receiver: receiver }
        let save = await ControlQueues.create(objs)
        const e = await Queue.findOne({ where: { id: idFila } });
        let cont = parseInt(e.entregues) + 1
        let tot = parseInt(e.falhas) + cont
        let carga = parseInt(e.registros)
        let retorno = await Queue.update({ entregues: cont }, { where: { id: idFila } }, { multi: true })
        await success(identificador, cont, carga, tot)
        const msgsSave = {receiver, messages: mggs, statusSend: true, stateMsg: 'The message has been successfully sent.',
          credor: parseInt(e.credor), session: xpto, queues_id: idFila, id_campaing: _id}
        await Msgs.create(msgsSave).then(data => { })
    }
   
   }catch (err){
     console.log(err, 500, false, 'Failed to send the message.')
  }
}


const msgStart = async (req, res, id = null) => {
  try {
    const credor = req.body.credor
    const message = req.body.message
    const rota = req.body.rota
    const receiver = formatPhone(req.body.receiver)
    const sessionSend = await validateSession(rota, credor)
    const session = getSession(sessionSend)
  
    const exists = await isExists(session, receiver)
    if (!exists) {
      const data = {}
      response(res, 400, false, 'The receiver number is not exists.', data, receiver)
      let msgs = { receiver: receiver, messages: 'The receiver number is not exists.', statusSend: false, stateMsg: 'The receiver number is not exists.' }
      Msgs.create(msgs)
        .then(data => {
        })
      return
    }
    const datas = await sendMessage(session, receiver, message, 0)
    response(res, 200, true, 'The message has been successfully sent.')
  } catch (err) {
    const data = { err }
   // response(res, 500, false, 'server application error', data)
  }
}

async function logoutAppSession(type) {
  try {
    let query = `select Q.identificador, Q.id, "maxTime", Q.status, max(lasttime) lasttime
    from queues Q inner join control_queues C on C.queue_id = Q.id  
    where Q.status = 0 group by Q.identificador, Q.id, "maxTime", Q.status;`
    const sessions = await database.query(query, { type: QueryTypes.SELECT });
    let identificador, id, maxTime, status, lasttime
    sessions.map(async function (data) {
      identificador = data.identificador
      id = data.id
      maxTime = data.maxTime
      status = data.status
      lasttime = data.lasttime
      const ts = Math.round(Date.now());
      const difference = ((ts - lasttime) / 1000) / 60
      if (difference > ((maxTime + 240) / 60)) {
        console.log('Desloga')
        restartApplication(type)
      }
    })
    return
  } catch (err) {
    console.log(err, 500, false, 'server application error')
  }
}

var sendCountMsg = ``
const sendNewInteration = async (obj) => {
  try {
   const { message, number, rota, credor, idFila, campaing_id, identificador} =  obj

   console.log('sendNewInteration', number, message)
   const receiver = formatPhone(number)
   const xpto = await validateSession(rota, credor)
   const sessions = getSession(xpto)
   const  messages  = { text: `${message}` }   
   const sendCountMsgRec = `${receiver}${messages}`
   const exists = await isExists(sessions, receiver)
      if (!exists) {
        console.log('Não Passou')
          let objs = {
            queue_id: idFila,
            lasttime: Date.now(),
            status: 400,
            receiver: receiver
          }
          let save = await ControlQueues.create(objs)
          const f = await Queue.findOne({ where: { id: idFila } });
          const countFalhas = parseInt(f.falhas) + 1
          let tot = parseInt(f.entregues) + countFalhas
          let carga = parseInt(f.registros)
          const data = {}
          const msgsSaves = {
            receiver,
            statusSend: false,
            stateMsg: 'The receiver number is not exists.',
            credor: parseInt(f.credor),
            session: xpto,
            queues_id: idFila
          }
    
          const query1 = { where: { id: idFila } }
          const query2 = { where: { 'id': campaing_id } }
          const update1 = {
            status: 400,
            statusSend: false,
            stateMsg: 'The receiver number is not exists.'
          }
          const options1 = { multi: true }
          await Campaing.update(update1, query2, options1)
          const falhas = { falhas: countFalhas }
          await Queue.update(falhas, query1, options1)
          await fail(f.identificador, countFalhas, carga, tot)
          await Msgs.create(msgsSaves)
          return
      }
      
            if(sendCountMsg != sendCountMsgRec){
              const datas = await sendMessage(sessions, receiver, messages, 0)
              enviado(identificador)
              if (datas) {
                let objs = {
                  queue_id: idFila,
                  lasttime: Date.now(),
                  status: 200,
                  receiver: receiver
                }
                const datasMes = {receiver: justNumbers(receiver), messageinit: message, endpointmsg: 'send-text',
                  session: xpto, type: 2, id_campaing: campaing_id /*, text: '', code: 0*/}
                let save = await ControlQueues.create(objs)
                const e = await Queue.findOne({ where: { id: idFila } });
                let cont = parseInt(e.entregues) + 1
                let tot = parseInt(e.falhas) + cont
                let carga = parseInt(e.registros)
                await Campaing.update({ status: 200, statusSend: true, stateMsg: 'The message has been successfully sent.', session: parseInt(xpto) },
                  { where: { id: campaing_id } }, { multi: true })
                  //await insertSendMessageDb(datasMes)
                  await updateSessionCount(xpto)
                  await updateSendMessageDb(justNumbers(receiver))
                let retorno = await Queue.update({ entregues: cont }, { where: { id: idFila } }, { multi: true })
                await success(e.identificador, cont, carga, tot)
                const msgsSave =
                {
                  receiver,
                  messages: message,
                  statusSend: true,
                  stateMsg: 'The message has been successfully sent.',
                  credor: parseInt(e.credor),
                  session: xpto,
                  queues_id: idFila
                }
                let ret = await Msgs.create(msgsSave)
              }
            }
      sendCountMsg = sendCountMsgRec
  } catch (err) {
    console.log(err)
  }
}

async function sendMessageAfterFail(identificador, id_send){
     const x = await sending(identificador, id_send)//sendingInitial(identificador, id_send)
     console.log('Envio após falha')
}

// Funções auxiliares para gerenciamento de intervalos
const setManagedInterval = (key, callback, delay) => {
  return intervalManager.set(key, callback, delay)
}

const clearManagedInterval = (key) => {
  return intervalManager.clear(key)
}

const setManagedTimeout = (key, callback, delay) => {
  return intervalManager.setTimeout(key, callback, delay)
}

const clearManagedTimeout = (key) => {
  return intervalManager.clearTimeout(key)
}

// Configurar intervalos globais gerenciados
intervalManager.set('logout-session', () => logoutAppSession(2), 300000)
intervalManager.set('restart-application', () => restartApplication(1), 3600000)

export {
  list, uploadFile, listId, start, del, pauseCamp, msgStart, updateText, listRestart,
  listRestartPause, listStart, listMonitor, stopCamp, sendBulkMessage, uploadFileMidia,
  sendNewInteration
}
