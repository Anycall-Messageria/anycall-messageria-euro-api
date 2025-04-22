import { getSession, alterImage, formatPhone, removeImage, alterStatus,
    alterNameWpp, deleteChat, blockProfileWpp } from '../wpp/whatsapp.js'
import response from '../../response.js'
import __dirname from '../../dirname.js'
import { validateSessionGroup } from '../middlaware/sessionValidator.js'



const alterImageProfile = async (req, res) => {
    try {
        const route = await validateSessionGroup(req.body.receiver)
        const session = getSession(route)
        const jid = formatPhone(req.body.receiver)
        const image = req.body.image
        await alterImage(session, jid, image)    
        response(res, 200, true, 'Alter picture profile.')
    } catch (err) {
        const data = { err }
        response(res, 500, false, 'Failid alter picture profile.', data)
    }
}


const removeImageProfile = async(req, res) => {
    try {
        const route = await validateSessionGroup(req.body.receiver)
        const session = getSession(route)
        const jid = formatPhone(req.body.receiver)
        await removeImage(session, jid)    
        response(res, 200, true, 'Remove picture profile.')
    } catch (err) {
        const data = { err }
        response(res, 500, false, 'Failid remove picture profile.', data)
    }
}

//ok
const updateNameProfile = async(req, res) => {
    try {
        const route = await validateSessionGroup(req.body.receiver)
        const session = getSession(route)
        const jid = formatPhone(req.body.receiver)
        const name = req.body.name
        await alterNameWpp(session, jid, name)    
        response(res, 200, true, 'Alter name profile.')
    } catch (err) {
        const data = { err }
        response(res, 500, false, 'Failid alter picture profile.', data)
    }
}

//ok
const updateStatusProfile = async(req, res) => {
    try {
        const route = await validateSessionGroup(req.body.receiver)
        const session = getSession(route)
        const jid = formatPhone(req.body.receiver)
        const status = req.body.status
        await alterStatus(session, jid, status)    
        response(res, 200, true, 'Alter status profile.')
    } catch (err) {
        const data = { err }
        response(res, 500, false, 'Failid alter status profile.', data)
    }
}


const deleteChatProfile = async(req,res) => {
    try {
        const route = await validateSessionGroup(req.body.receiver)
        const session = getSession(route)
        const jid = formatPhone(req.body.receiver)
        await deleteChat(session,jid)
        response(res, 200, true, 'Delete chat.')
    } catch (err) {
        const data = { err }
        response(res, 500, false, 'Failid delete chat.', data)
    }
}

const getBlockProfileWpp = async(req,res) => {
    const sessions = req.query.id
    try {
        const route = await validateSessionGroup(sessions)
        const session = getSession(route)
        const jid = formatPhone(req.body.profile)
        const type = req.body.type
        await blockProfileWpp(session,jid, type)
        response(res, 200, true, 'Move block user.')
    } catch (err) {
        const data = { err }
        response(res, 500, false, 'Failid move block user.', data)
    }
}


export { getBlockProfileWpp, alterImageProfile, removeImageProfile, updateNameProfile,
     updateStatusProfile, deleteChatProfile  }


