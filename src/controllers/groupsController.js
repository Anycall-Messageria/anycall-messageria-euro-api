import { getSession, getChatList, isExists, sendMessage, formatGroup,
    createGroup, moveParcipantsGroup, alterGroupsSubject, alterGroupsDescription,
    changeGroupsSettings, alterImage } 
from '../wpp/whatsapp.js'
import response from '../../response.js'
import __dirname from '../../dirname.js'
import { validateSessionGroup } from '../middlaware/sessionValidator.js'


const createActionGroup = async (req, res) => {
    const { receiver, title, participants } = req.body
    try {
        const route = await validateSessionGroup(receiver)
        const session =  getSession(route)
        const r = await createGroup(session, title, participants)
        return response(res, 200, true, `${r} Success in group creation.`)
    } catch (err) {
        const data = { err }
        console.log(err)
        response(res, 500, false, 'Failed to create group.', data)
    }
}    

const moveActionParcipantsGroup = async(req, res) => {
    const { receiver, idGroup, participants, move } = req.body
    try {
        const receiverGroup = formatGroup(idGroup)
        const route = await validateSessionGroup(receiver)
        const session =  await getSession(route)
        const a = await moveParcipantsGroup(session, receiverGroup, participants, move)
        return response(res, 200, true, 'Success move partipant group.')
    } catch (err) {
      const data = { err }
       console.log(err)
       response(res, 500, false, 'Failed move partipant group.', data)
   }
}

const alterActionGroupsSubject = async(req, res) => {
  const { receiver, subject, idGroup } = req.body
  try {
    const route = await validateSessionGroup(receiver)
    const receiverGroup = formatGroup(idGroup)
    const session =  getSession(route)
    await alterGroupsSubject(session, receiverGroup, subject)
    return response(res, 200, true, 'Success change subject group.')
  } catch (err) {
    const data = { err }
    console.log(err)
    response(res, 500, false, 'Failed change subject group.', data)
  }
}

const alterActionGroupsDescription = async(req, res) => {
    const { receiver, idGroup, description } = req.body
  try {
    const route = await validateSessionGroup(receiver)
    const receiverGroup = formatGroup(idGroup)
    const session =  getSession(route)
    await alterGroupsDescription(session, receiverGroup, description)
    return response(res, 200, true, 'Success change description group.')
  } catch (err) {
    const data = { err }
    console.log(err)
    response(res, 500, false, 'Failed change description group.', data)
  }
}

const changeActionGroupsSettings = async(req,res) => { 
    const { receiver, settings } = req.body
    try {
      const route = await validateSessionGroup(receiver)
      const receiverGroup = formatGroup(receiver)
      const session =  getSession(route)
      await changeGroupsSettings(session, receiverGroup, settings)
      return response(res, 200, true, 'Success change settings group.')
    } catch (err) {
      const data = { err }
      console.log(err)
      response(res, 500, false, 'Failed change settings group.', data)
    }
}

const alterImageProfileGroup = async (req, res) => {
  const sessions = req.query.id
  try {
    const route = await validateSessionGroup(sessions)
    const session = getSession(route)
    const jid = formatGroup(req.body.receiver)
    const image = req.body.image
    await alterImage(session, jid, image)    
    response(res, 200, true, 'Alter picture group.')
  } catch (err) {
    const data = { err }
    console.log(err)
    response(res, 400, true, 'Failed alter picture group.', data)
  }

}

const getList = (req, res) => {
    try {
      return response(res, 200, true, '', getChatList(res.locals.sessionId, true))
    } catch (err) {
      const data = { err }
      console.log(err)
      response(res, 400, true, 'Failed alter picture group.', data)
    }
}

const getGroupMetaData = async (req, res) => {
    const session = getSession(res.locals.sessionId)
    const { jid } = req.params
    try {
        const data = await session.groupMetadata(jid)
        if (!data.id) {
            return response(res, 400, false, 'The group is not exists.')
        }
        response(res, 200, true, '', data)
    } catch (err){
        const data = { err }
        console.log(err)
        response(res, 500, false, 'Failed to get group metadata.', data)
    }
}

const send = async (req, res) => {
    const session = getSession(res.locals.sessionId)
    const receiver = formatGroup(req.body.receiver)
    const { message } = req.body
    try {
        const exists = await isExists(session, receiver, true)

        if (!exists) {
            return response(res, 400, false, 'The group is not exists.')
        }
        await sendMessage(session, receiver, message)

        response(res, 200, true, 'The message has been successfully sent.')
      } catch (err){
        const data = { err }
        console.log(err)
        response(res, 500, false, 'Failed to send the message.', data)
    }
}

export { getList, getGroupMetaData, send, createActionGroup, moveActionParcipantsGroup,
  alterActionGroupsSubject, alterActionGroupsDescription, changeActionGroupsSettings,
  alterImageProfileGroup }