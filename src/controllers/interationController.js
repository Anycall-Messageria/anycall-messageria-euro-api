import fs from 'fs'
import Sequelize, { QueryTypes }  from 'sequelize'
import database from "../../database/dbPostgresClient.js"
import response from '../../response.js'
import __dirname from '../../dirname.js'
import Interation from '../model/interations.model.js'
import Session from '../model/sessions.model.js'
import Campaing from "../model/campaings.model.js"
import { send, sendMsgChat , sendMidia} from '../controllers/automateController.js'
import  * as ioClient  from 'socket.io-client'
import { rand } from '../utils/util.js'
import { sendNewInteration } from "./queuesController.js"


const socketClient = ioClient.io("https://euro17.anycall-messageria.com.br");

const updateInterationsClient = async (push, status) => {
        const { id_interation } = push
        socketClient.emit('updateInterationsClient', id_interation, (d) => { })
        return 
 }

const alterSessionSendChats = async(session, id) => {
       const s =  await Session.findOne({ where:{ name: session}})
       const retorno = await Interation.update({ 'session_id': s.id, 'session': s.name }, { where: { id } }, { multi: true })
       return 
}

var msgOri = ``
const createNewInterarion = async (data) => {
   try {
    const { number, var1, message, user_id } = data 
    const identificador = '1589981402349574FUCTF28GIZZ', status = 0,  active = 1, schedule = 1, statusSend = false, sendmessageinitial = 0, altertimers = 0, var9 = user_id
    const values = {identificador, number: `55${number}`, var1, status, active, schedule, statusSend, sendmessageinitial, altertimers, company_id: 1, var9 }
    if(msgOri != values){
        const c = await Campaing.create(values)
        if(c){
            const obj = { message, number: `55${number}`, rota: 'anycall', credor: 1, idFila: 1, campaing_id: c.id, identificador} 
            if(msgOri != values)
            await sendNewInteration(obj)
        }  
    }
    msgOri = values
   } catch (error) {
    console.error(error)    
   }
}

const randomAgenteInteration = async (ids) => {
    try {
        console.log(ids)
        const agent = rand(JSON.parse(ids))
        return agent
    } catch (error) {
        console.error(error)
    }
}


socketClient.on("connect", () => {
    socketClient.on('sendMsgChat', async (datas) => {
        try {
        console.log('bateu no back', datas)    
        let { receiver, session, id, message} = datas
        let sendMsgs = {session, id, receiver, message}
        const msgNew = `${receiver}${session}${id}${message}`    
                const sends = await sendMsgChat(sendMsgs)
                setTimeout( () => {
                        socketClient.emit('sendMsgChatReturn', id, (datas) => {
                            console.log(datas)
                        })
                    }, 100)
        } catch (error) {
            console.error(error)
        }
    })

    let ad, adb
    socketClient.on('sendMidiaBack', async (media) => {
        try {
            console.log('ad adb', ad, adb)
            const { session, receiver, id, audio } = media
            const filenames = `${receiver}${id}.mp3`
            const audioBuffer = Buffer.from(audio);
            console.log('sendMidiaBack', audioBuffer, filenames, am, ami)
            if(adb != audioBuffer ){
                if(ad != filenames ){
                    fs.writeFile(`./assets/midias/1/audio/temp/${filenames}`, audioBuffer, async (err) => {
                        if (err) {
                            console.error('Erro ao salvar o arquivo:', err);
                        } else {
                            const datas = { session, receiver: receiver, type: 'audio', fileName: filenames }  
                            const sends = await sendMidia(datas)
                            setTimeout( () => {
                                socketClient.emit('sendMsgChatReturn', id, (datas) => {
                                    console.log(datas)
                                })
                            }, 100)
                        }
                    });
                }
            }
            adb = audioBuffer
            ad = filenames
        } catch (error) {
            console.error('Deu ruim', error)
        }
    })


    let am, ami
    socketClient.on('uploadDocBack', async (file) => {  
        try {
            console.log('am ami', am, ami)
            const { session, receiver, id, doc } = file
            const filenames = `${receiver}${id}.pdf`
            const docBuffer = Buffer.from(doc);
            console.log('uploadDocBack', docBuffer, filenames, am, ami)
            if(ami != docBuffer ){
                if(am != filenames ){
                    console.log(docBuffer, filenames)
                    fs.writeFile(`./assets/midias/1/pdf/temp/${filenames}`, docBuffer, async (err) => {
                        if (err) {
                            console.error('Erro ao salvar o arquivo:', err);
                        } else {
                            const datas = { session, receiver: receiver, type: 'document', fileName: filenames, id }  
                            const sends = await sendMidia(datas)
                            setTimeout( () => {
                                socketClient.emit('sendMsgChatReturn', id, (datas) => {
                                    console.log(datas)
                                })
                            }, 100)
                        }
                    });
                }
            }
            ami = docBuffer
            am = filenames
        } catch (error) {
            console.error('Deu ruim', error)
        }
    })

    let ap, api
    socketClient.on('uploadImgBack', async (file) => {
        try {
            console.log('ap api', ap, api)
            const { session, receiver, id, image } = file
            const filenames = `${receiver}${id}.jpeg`
            const imageBuffer = Buffer.from(image);
            console.log('uploadImgBack', imageBuffer, filenames, ap, api)
            if(api != imageBuffer ){
                if(ap != filenames ){
                    fs.writeFile(`./assets/midias/1/image/temp/${filenames}`, imageBuffer, async (err) => {
                        if (err) {
                            console.error('Erro ao salvar o arquivo:', err);
                        } else {
                            const datas = { session, receiver: receiver, type: 'image', fileName: filenames }  
                            const sends = await sendMidia(datas)
                            setTimeout( () => {
                                socketClient.emit('sendMsgChatReturn', id, (datas) => {
                                    console.log(datas)
                                })
                            }, 100)
                        }
                    });
                }
            }
            api = imageBuffer
            ap = filenames
        } catch (error) {
            console.error('Deu ruim', error)
        }
    })

    socketClient.on('createNewInterarionBack', async (obj) => {
        try {
            await createNewInterarion(obj)
        } catch (error) {
            console.error(error)
        }
    })
    
});


const listInterationsIdEvent = async (id) => {
    try {
        let query = `SELECT id, remotejid, idmessage, messagerecive, messagetimestamp, pushname, datarecord, status, 
        "read", dateread, statusread, "session", fromme, id_interation, "urlProfile", namecontact, profilecontact
        FROM public.messages left join (
        select id_interation as id_name, pushname
        as namecontact, "urlProfile" as profilecontact from public.messages
        where id_interation = ${id} and fromme = 0 limit 1) w
        on w.id_name = id_interation
        where id_interation = ${id} order by datarecord asc;`
        const interations = await database.query(query, { type: QueryTypes.SELECT });
        return interations
       } catch (err) {
        console.log(err)
    }
}

export { listInterationsIdEvent , updateInterationsClient, alterSessionSendChats,  randomAgenteInteration}
