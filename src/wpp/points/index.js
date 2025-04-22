import { rmSync, readdir, readFileSync } from 'fs'
import { join } from 'path'
import {

    delay,

} from '@whiskeysockets/baileys'


const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const sendMessage = async (session, receiver, message, delayMs = 1000) => {
    try {
        let ramdonTime = getRandomInt(500, 1500)
        await delay(parseInt(delayMs))
        await session.presenceSubscribe(receiver)
        await delay(ramdonTime)
        await session.sendPresenceUpdate('composing', receiver)
        await delay(ramdonTime)
        await session.sendPresenceUpdate('paused', receiver)
          return await session.sendMessage(receiver, message)
        } catch {
        return Promise.reject(null)
    }
}

const sendMessageBulk = async (session, receiver, message, delayMs = 10) => {
    const receiver1 = receiver
    try {
        await delay(parseInt(delayMs))
        await session.presenceSubscribe(receiver1)
        await delay(delayMs)
        await session.sendPresenceUpdate('composing', receiver1)
        await delay(delayMs)
        await session.sendPresenceUpdate('paused', receiver1)
        return await session.sendMessage(receiver1, message)
    } catch {
        return Promise.reject(null)
    }
}

const sendTyping = async (session, receiver, message, delayMs = 1000) => {

    await delay(parseInt(delayMs))
    await session.presenceSubscribe(receiver)
    await delay(3500)
    await session.sendPresenceUpdate('composing', receiver)
    await delay(2000)
    await session.sendPresenceUpdate('paused', receiver)
    return await session.sendMessage(receiver, message)
}

const sendMessageLink = async (session, receiver, delayMs = 1000, text, url, title, description, jpegThumbnail) => {
    try {

        await delay(parseInt(delayMs))
        const bodyMessage =
        {
            extendedTextMessage: {
                text: text,
                matchedText: url,
                canonicalUrl: url,
                title: title,
                description: description,
                jpegThumbnail: readFileSync(`assets/midias/${jpegThumbnail}`)

            }
        }
        const result = session.sendMessage(receiver, {
            forward: {
                key: { fromMe: true },
                message: bodyMessage
            }
        })
        return result
    } catch {
        return Promise.reject(null) // eslint-disable-line prefer-promise-reject-errors
    }
}

const sendMessageButtons = async (session, receiver, message, delayMs = 1000) => {

    try {
        await delay(parseInt(delayMs))
        return session.sendMessage(receiver, message)
    } catch {
        return Promise.reject(null) // eslint-disable-line prefer-promise-reject-errors
    }
}


const sendMessageReact = async (session, receiver, message, delayMs = 1000) => {
    try {
        await delay(parseInt(delayMs))
        return session.sendMessage(receiver, message)
    } catch {
        return Promise.reject(null) // eslint-disable-line prefer-promise-reject-errors
    }
}

const sendContact = async (session, receiver, phone, phone2, organization, fullName) => {
    
    //const id = '554797932694@s.whatsapp.net' // the WhatsApp ID 
    // BEGIN:VCARD
    // VERSION:3.0
    // FN:🏛️Euro 17 FGTS
    // N:;🏛?️Euro 17 FGT;;;
    // TEL;TYPE=CELL:11961762957
    // CATEGORIES:myContacts
    // END:VCARD
    const displayName =  organization
    const vcard = `BEGIN:VCARD\n` // metadata of the contact card
                + `VERSION:3.0\n` 
                + `FN:${organization}\n` // full name
                + `ORG:${fullName};\n` // the organization of the contact
                //+ `TEL;type=CELL;type=VOICE;waid=554799215404:+55 479921 5404\n` // WhatsApp ID + phone number
                + `TEL;type=CELL;type=VOICE;waid=${phone}:+55 ${phone2}\n` // WhatsApp ID + phone number
                + `END:VCARD`
    const sentMsg  = await session.sendMessage(
        receiver,
        { 
            contacts: { 
                displayName: displayName, 
                contacts: [{ vcard }] 
            }
        }
    )
}

const sendMessageMidia = async (session, receiver, message, delayMs = 1000) => {
    const receiver1 = receiver
    try {
        let ramdonTime = getRandomInt(1000, parseInt(delayMs))
        await delay(1000)
        await session.presenceSubscribe(receiver1)
        await delay(ramdonTime)
        await session.sendPresenceUpdate('composing', receiver1)
        await delay(ramdonTime)
        await session.sendPresenceUpdate('paused', receiver1)
        return await session.sendMessage(receiver1, message)
    } catch {
        return Promise.reject(null)
    }
}

const sendMessageList = async (session, receiver, delayMs = delayMes, messages) => {
    try {
        await delay(parseInt(delayMs))
        const sendMessagesList = session.sendMessage(receiver, messages)
        return sendMessagesList
    } catch {
        return Promise.reject(null) // eslint-disable-line prefer-promise-reject-errors
    }
}


const sendMessageSurvey = async (session, receiver, messages, delayMs = delayMes) => {
    try {
        console.log(session)
        await delay(parseInt(delayMs))
        const sendSurvey = session.sendMessage(receiver, { poll: { name: "ph", value: ["1", "2"] } })
        return sendSurvey
    } catch {
        return Promise.reject(null) // eslint-disable-line prefer-promise-reject-errors
    }
}

const formatPhone = (phone) => {
    let p
    p = justFieldDDD(phone)
    if (p.endsWith('@s.whatsapp.net')) {
        return p
    }
    let formatted = p.replace(/\D/g, '')
    return (formatted += '@s.whatsapp.net')
}

const fetchStatusProfile = async (session, jid) => {
    const status = await session.fetchStatus(jid)
    console.log(status)
    return status
}

const fetchUrlImage = async (session, jid) => {
        let ppUrl 
    try {
        ppUrl = await session.profilePictureUrl(jid) 
      } catch (err) {
        ppUrl = `nopicture.png`;
      }
      return ppUrl;
}


const getProfileBusiness = async (session, jid) => {
    const status = await session.getBusinessProfile(jid)
    return status
}

const alterImage = async (session, jid, user_comp, image ) => {
    await session.updateProfilePicture(jid, { url: `assets/midias/${user_comp}/profile/${image}` })
    return ('Alterado com sucesso')
}

const removeImage = async (session, jid) => {
    await session.removeProfilePicture(jid)
    return ('Removido com sucesso')
}

//ok
const alterStatus = async (session, jid, status) => {
    await session.updateProfileStatus(status)
    return ('Status alterado com sucesso')
}

//ok
const alterNameWpp = async (session, jid, name) => {
    await session.updateProfileName(name)
    return ('Nome alterado com sucesso')
}

const blockProfileWpp = async (session, jid, type ) => {
    const ub = type == 'block' ? 'block' : 'unblock'
    console.log(jid, ub)
    await session.updateBlockStatus(jid, ub)
    return (`usuario ${ub} com sucesso`)
}


const deleteChat = async(session, lastMsgInChat) => {
  await session.chatModify({
    delete: true,
    lastMessages: [{ key: lastMsgInChat.key, messageTimestamp: lastMsgInChat.messageTimestamp }]
  },
  lastMsgInChat)
  return (`Chat apagado com sucesso`)
}

const createGroup = async(session, title, participants ) => {
    const group = await session.groupCreate(title, participants )
    console.log(group.id)
    await session.sendMessage(group.id, { text: 'Bem vindos' }) 

    return ("created group with id: " + group.id)
}

const moveParcipantsGroup = async (session, idGroup, participants, move) => {
////"add","remove","demote","promote"
       const response = session.groupParticipantsUpdate(
        idGroup,
        participants,
        move
       )
    return ("Moved participant successfully")
}

const alterGroupsSubject = async (session, idGroup, subject) => {
 await session.groupUpdateSubject(idGroup, subject) 
 return ("Change subject successfully")
}

const alterGroupsDescription = async (session, idGroup, description) => {
 await session.groupUpdateDescription(idGroup, description) 
 return ("Moved description successfully")
}

const changeGroupsSettings = async(session, idGroup, settings) => {
    await session.groupSettingUpdate(idGroup,settings)
    return ("Change settings successfully")
}


export {
    sendTyping, sendMessage, sendMessageLink, sendMessageButtons,
    sendMessageMidia, sendMessageList, formatPhone, alterImage, removeImage,
    alterStatus, alterNameWpp, blockProfileWpp, deleteChat, createGroup,
    moveParcipantsGroup, alterGroupsSubject, alterGroupsDescription,
    changeGroupsSettings, fetchStatusProfile, getProfileBusiness, fetchUrlImage, sendContact,
    sendMessageReact, sendMessageSurvey, sendMessageBulk
}