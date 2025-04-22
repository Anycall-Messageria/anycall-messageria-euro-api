import { QueryTypes } from "sequelize"
import database from "../../database/dbPostgresClient.js"
import { updateSetting } from '../service/settings/update.js'
import * as s  from '../service/sessions/find.js'
import * as i  from '../service/issuers/find.js'
import { getSession, formatPhone, fetchStatusProfile, fetchUrlImage,
    alterImage, alterNameWpp } from '../wpp/whatsapp.js'
import response from "../../response.js"


const updateSessionsId = async (id) => {
    try {
        const lists = await s.findOne(id)
        if(lists.profile_image){
            console.log(lists.profile_image)
            return
        }
        const ses = getSession(lists.name)
        const str = ses.user.id
        const sesse = str.split(':');
        const getNumberUser = sesse[0];
        const jid = formatPhone(getNumberUser)
        const x = await fetchStatusProfile(ses, jid) 
        const u = await fetchUrlImage(ses, jid) 

        const userName = ses.user.name
        const values = { profile_name: userName, profile_status: x.status,  profile_image: u}
        const condition = { where :{id: id } } 
        await updateSetting( values, condition )
        return { codigo:200 , status:true, message: 'Update session success!'}
    } catch (err) {
        console.log(err)
        return {err,  codigo:500 , status:true, message: 'Failied update session success!'}
    }
}


const addSettingSession = async (req, res) => {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        let fileProfile = ''
        const { numbermessagessent, sleepingsession, sessionId, namesession, clientsessionid, randomize,
            profile_name, profile_status, urlprofile
        } = req.body
        let UrlProfileGet = urlprofile
        console.log(req.body)
        const lists = await s.findOne(sessionId)
        const ses = getSession(lists.name)
        const str = ses.user.id
        const sesse = str.split(':');
        const getNumberUser = sesse[0];
        const jid = formatPhone(getNumberUser)
        if(req.file){
            const nomeArquivo = req.file.originalname.split('.')[0];
            const extensaoArquivo = req.file.originalname.split('.')[1];
            fileProfile = `${nomeArquivo}.${extensaoArquivo}`
            const z99 = await alterImage(ses, jid, user_comp, fileProfile)
            if(z99){
               UrlProfileGet = await fetchUrlImage(ses, jid) 
               console.log(UrlProfileGet)
            }
        }
        const z1 = await alterNameWpp(ses, jid, profile_name) 
        //const z0 = await alterStatus(ses, jid, profile_status)
        const values = {numbermessagessent, sleepingsession, namesession, clientsessionid, randomize,
        profile_name, profile_status, profile_image: fileProfile, urlprofile: UrlProfileGet }
        const condition = { where :{id: sessionId } } 
        const data = await updateSetting( values, condition )
        response(res, 200, true, `add session success`, data )
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}
  
const updateSettingSession = async (req, res) => {
    try {
        const user_comp = req.user.user_company // where: {company_id: user_comp}
        const id = req.params['id'];
        console.log('Lado de ca', id)
        await updateSessionsId(id)
        const lists = await s.findOne(id)
        const issuers = await i.findAll(user_comp)
        response(res, 200, true, 'updateSettingSession.', {lists, issuers})
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'server application error.', data)
    }
}



export {  addSettingSession, updateSettingSession }
