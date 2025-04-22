import { rmSync, readdir } from 'fs'
import makeWASocket, { DisconnectReason, useMultiFileAuthState, 
    fetchLatestBaileysVersion, makeInMemoryStore, jidNormalizedUser, 
    toNumber, Browsers  } from '@whiskeysockets/baileys'
import pino from 'pino'
import __dirname from '../../dirname.js'
import response from '../../response.js'
import { join } from 'path'
import { justNumbers, isNumber, formatPhone, formatGroup } from '../utils/util.js'
import { toDataURL } from 'qrcode'
import { io } from '../../server.js' 
import { logger } from '../../logger.js'
import { sendTyping, sendMessage, sendMessageLink, sendMessageButtons, sendMessageMidia, 
    sendMessageList, alterImage, removeImage, alterStatus, alterNameWpp, blockProfileWpp,
    deleteChat, createGroup, moveParcipantsGroup, alterGroupsSubject, alterGroupsDescription,
    changeGroupsSettings , fetchStatusProfile , getProfileBusiness, fetchUrlImage, sendContact, sendMessageReact,
    sendMessageSurvey , sendMessageBulk } from '../wpp/points/index.js'
import { updateMessageDB } from '../store/message/index.js'
import { updateStateSession, getLogs, countdisconnected, findTotalDisconect, 
    findCreateSession, banSession } from '../session/index.js'
import { wbotMessageListener } from '../wpp/points/messagesLstener.js'


const loggers = logger

const sessions = new Map()
const retries = new Map()
const timeElapsed = Date.now();
const today = new Date(timeElapsed)
const dateFinal = today.toISOString()
let openConnection
let openLastDisconnect




const trocar = (msg) => {
    io.emit('mensagem', msg)
}

const sessionsDir = (sessionId = '') => {
    return join(__dirname, 'sessions', sessionId ? sessionId : '')
}

const sendCreateSession = async (sessionId, statusCode) => {
    let msg = `Sessão ${sessionId} foi criada com sucesso 🚀 `
    io.emit('createSession', msg, statusCode)
}

const sendListSession = async (sessionId, statusCode) => {
    let msg = `Sessão ${sessionId} foi criada com sucesso 🚀 `
    io.emit('createSession', msg, 200)
}

const isSessionExists = (sessionId) => {
    console.log('isSessionExists', sessionId)
    return sessions.has(sessionId)
}

const findSessiomCreate = async (sessionId, user_comp) => {
    if (isSessionExists(sessionId)) {
       const create = await findCreateSession(sessionId, user_comp)
       if(create)
       return 'Sessão criada com sucesso'
    }
}

async function createSession (id, res = null, user_comp=null) {
      const sessionFile = `md_${id}`
      const logger = pino({ level: 'warn' }) 
      const store = makeInMemoryStore({ logger })
      const { state, saveCreds: saveState } = await useMultiFileAuthState(sessionsDir(sessionFile));
      const { version } = await fetchLatestBaileysVersion();

     /**
     * @type {import('baileys').UserFacingSocketConfig}
     */
     const waConfig = {
         auth: state,
         printQRInTerminal: true,
         logger,
         //agent: agent,
         version: version,
         browser: ["ANYCALL", "Chrome", "1.4.0"],
         connectTimoutMs: 60_000,
         //browser: Browsers.macOS('Desktop'),
         //syncFullHistory: true
      }
     /**
     * @type {import('baileys').WASocket}
     */
      const sock = makeWASocket.default(waConfig)
      const userSession = id
      const isLegacy = false
      sessions.set(userSession, { ...sock, store, isLegacy })
      sock.ev.on('creds.update', saveState)

    const upsert = async ({ messages, type }) => {
            const messageUpsert = { messages, type }
            const w1 =  await wbotMessageListener(getSession(userSession), messageUpsert)
    }
  
    const update = async (updates) => {
        for (const { update, key } of updates) {
            try {
                await  updateMessageDB(update.status, key.id, justNumbers(key.remoteJid))
            } catch (e) {
                logger.error(e, 'An error occured during message update');
            }
        }
    }

    async function getMessage(key){
		if(store) {
            const msg = await store.loadMessage(key.remoteJid, key.id)
			return msg?.message || undefined
		}
		return proto.Message.fromObject({})
	}

    const set = async ({ messages, isLatest }) => {
        try {
            console.log(messages)
            logger.info({ messages: messages.length }, 'Synced messages');
        } catch (e) {
            logger.error(e, 'An error occured during messages set');
        }
    }


    const updateContacts = async (contacts) => {
        //console.log('updateContacts => ', contacts)
        for (const contact of contacts) {
            if (typeof contact.imgUrl !== 'undefined') {
                const newUrl = contact.imgUrl === null
                    ? null
                    : await fetchUrlImage(getSession(userSession), contact.id)
            } else {

            }
        }
    }

   
    const upsertContacts = async (contacts) => {
        try {
              console.log('upsertContacts ', contacts)    
              contacts.map(async function(data){
                    // upsertContactDB(sessionId, id, name, notify, verifiedName, imgUrl, status)
                })
        } catch (e) {
            logger.error(e, 'An error occured during contacts upsert');
        }
    }

    const setContacts = async ({ contacts }) => {
        try {
            const contactIds = contacts.map((c) => c.id);
        } catch (e) {
            logger.error(e, 'An error occured during contacts set');
        }
    }

    const setChat = async ({ chats, isLatest }) => {
        try {
            console.log('setChat', chats)
        } catch (e) {
            logger.error(e, 'An error occured during chats set');
        }
    }

    const upsertChat = async (chats) => {
        try {
            //console.log('upsertChat ', chats)
           /* chats.map(function (data) {
                pushChatDb(data.id, data.conversationTimestamp, data.unreadCount)
            })*/
        } catch (e) {
            logger.error(e, 'An error occured during chats upsert')
        }
    }

    const updateChat = async (updates) => {
        for (const update of updates) {
            try {
                const { id, conversationTimestamp, unreadCount } = update
                //updateChatDb(id, conversationTimestamp, unreadCount)
            } catch (e) {
                logger.error(e, 'An error occured during chat update');
            }
        }
    }

    const presenceUpdate = async (updates) => {
            try {
                await presence(updates)
            } catch (e) {
                logger.error(e, 'An error occured during chat update');
            }
    }

    // the presence update is fetched and called here
    sock.ev.on('presence.update', presenceUpdate)
    sock.ev.on('messaging-history.set', setChat)
    sock.ev.on('chats.update', upsertChat)
    sock.ev.on('chats.update', updateChat);
    sock.ev.on('contacts.upsert', upsertContacts);
    sock.ev.on('contacts.update', updateContacts)
    sock.ev.on('messaging-history.set', set)
    sock.ev.on('messaging-history.set', setContacts)
    sock.ev.on('messages.upsert', upsert)
    sock.ev.on('messages.update', update)

    
    sock.ev.on('messages.reaction', async(data) => {
        console.log('messages.reaction ', data)
    })

    sock.ev.on('labels.association', async(data) => {
        console.log('labels.association ', data)
    })

    sock.ev.on('labels.edit', async(data) => {
        console.log('labels.edit ', data)
    })

    sock.ev.on('connection.update', async(update) => {
            const { connection, lastDisconnect } = update
            const statusCode = lastDisconnect?.error?.output?.statusCode
            const conn = typeof(connection) == 'object' ? connection.connection : connection
            const last = typeof(lastDisconnect) == 'object' ? `${lastDisconnect.error} - ${lastDisconnect.date} ` : lastDisconnect
            if(connection === 'close') {
                openConnection = `close connection ${userSession} ${dateFinal}: ${conn}`
                openLastDisconnect = `close lastDisconnect ${userSession} ${dateFinal}: ${last}`
                await getLogs(openConnection, userSession, conn)
                await getLogs(openLastDisconnect, userSession, last)
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut 
                //loggers.error(`${userSession}`)
                console.log(`connection closed due to ${userSession}`, userSession, statusCode,  lastDisconnect.error, ', reconnecting ', shouldReconnect)
                const ab = lastDisconnect.error.output.statusCode
                const bc = lastDisconnect.error.output.payload.message

                if(statusCode == 401 && bc ==  'Intentional Logout'){
                    setTimeout(
                    async () => {
                        let user_company = null
                      //  await createSession(userSession, res, user_company)
                      //  await sendCreateSession(userSession, statusCode)
                      //  await findSessiomCreate(userSession,user_comp)
                    },
                  1000)
                  return
            }


                if(statusCode == 408 || statusCode ==  428 || statusCode ==  503 || statusCode ==  515 || statusCode ==  516){
                   console.log(update.qr)
                //    setTimeout( async () => {
                //         const newQr = toDataURL(update.qr)
                //         console.log(newQr)
                //    }, 500)
                }
                
                if(ab == 403 && bc == 'Connection Failure'){
                    await countdisconnected(userSession)
                    const count = await findTotalDisconect(userSession)
                    if(count > 2){
                        return deleteSession(userSession, isLegacy)
                    }
                }  
                if (statusCode === DisconnectReason.loggedOut) {
                    return deleteSession(userSession, isLegacy)
                }
                if(shouldReconnect) {
                   setTimeout(
                        async () => {
                            let user_company = null
                            await createSession(userSession, res, user_company)
                            await sendCreateSession(userSession, statusCode)
                            await findSessiomCreate(userSession,user_comp)
                        },
                        statusCode === DisconnectReason.restartRequired ? 0 : parseInt(process.env.RECONNECT_INTERVAL ?? 0)
                    )
                }

            } else if(connection === 'open') {
                console.log('opened connection')
                openConnection = `open connection ${userSession} ${dateFinal}: ${conn}`
                openLastDisconnect = `open lastDisconnect ${userSession} ${dateFinal}: ${last}`
                //loggers.error(openConnection)
                //loggers.error(openLastDisconnect)
                await getLogs(openConnection, userSession, connection)
                await getLogs(openLastDisconnect, userSession, lastDisconnect)
                retries.delete(userSession)
            }
            if (update.qr) {
                if (res && !res.headersSent) {
                    try {
                        const qr = await toDataURL(update.qr)
                        response(res, 200, true, 'QR code recebido, por favor faça scan do QR code.', { qr })
                        return
                    } catch {
                        response(res, 500, false, 'Unable to create QR code.')
                    }
                }
                try {
                    await sock.logout()
                } catch {
                } finally {
                    deleteSession(userSession, isLegacy)
                }
            }
    })
    setInterval(() => { statusSession(userSession) }, 60000)
    //statusSession(userSession)
}

const getSession = (sessionId) => {
    return sessions.get(sessionId) ?? null
}

const statusSession = async (sessionId) => {
  try {
    const session = await getSession(sessionId)
    let state
    if (session.ws.isOpen) {
        state = 'authenticated'
    }
    if (session.ws.isClosed || session.ws.isClosing) {
       state = 'closed'
    }
    await updateStateSession(sessionId, state)
  } catch (err) {
    console.log(err)    
  }
}

const deleteSession = async (sessionId, isLegacy = false) => {
    try {
        await banSession(sessionId)
        const sessionFile = (isLegacy ? 'legacy_' : 'md_') + sessionId + (isLegacy ? '.json' : '')
        const storeFile = `${sessionId}_store.json`
        const rmOptions = { force: true, recursive: true }
        rmSync(sessionsDir(sessionFile), rmOptions)
        rmSync(sessionsDir(storeFile), rmOptions)
        sessions.delete(sessionId)
        retries.delete(sessionId)
    } catch (err) {
        console.log(err)    
    }
} 

const getChatList = (sessionId, isGroup = false) => {
    try {
        const filter = isGroup ? '@g.us' : '@s.whatsapp.net'
        return getSession(sessionId).store.chats.filter((chat) => {
            return chat.id.endsWith(filter)
        })
    } catch (err) {
        console.log(err)  
    }
}

const isExists = async (session, jid, isGroup = false) => {
    try {
        let result

        if (isGroup) {
            result = await session.groupMetadata(jid)

            return Boolean(result.id)
        }

        if (session.isLegacy) {
            result = await session.onWhatsApp(jid)
        } else {
            ;[result] = await session.onWhatsApp(jid)
        }
        return result.exists
    } catch {
        return false
    }
}

const cleanup = () => {
    try {
        console.log('Running cleanup before exit.')
        sessions.forEach((session, sessionId) => {
            if (!session.isLegacy) {
                session.store.writeToFile(sessionsDir(`${sessionId}_store.json`))
            }
        })
    } catch (err) {
        console.log(err)
    }
}



const init = async () => {
    try {
        readdir(sessionsDir(), (err, files) => {
            if (err) {
                throw err
            }
            for (const file of files) {
                if ((!file.startsWith('md_') && !file.startsWith('legacy_')) || file.endsWith('_store')) {
                    continue
                }
                const filename = file.replace('.json', '')
                const isLegacy = filename.split('_', 1)[0] !== 'md'
                const sessionId = filename.substring(isLegacy ? 7 : 3)
                createSession(sessionId, isLegacy)
            }
        })
    } catch (err) {
        console.log(err)
    }
}

const presenceOnline = async(obj) => {
    try {
        io.emit('presenceOnline', obj)
    } catch (error) {
        console.log(error)
    }
}


const presence = async (obj) => {
    try {
        await presenceOnline(obj)
    } catch (error) {
         console.log(error)   
    }   
}


export {
    isSessionExists,
     createSession,
     getSession,
     deleteSession,
     getChatList,
     isExists,
     formatPhone,
     formatGroup,
     cleanup,
     init,
     trocar,
     sendTyping, sendMessage, sendMessageLink, sendMessageButtons, sendMessageMidia, 
     sendMessageList, alterImage, removeImage, alterStatus, alterNameWpp, blockProfileWpp,
     deleteChat, createGroup, moveParcipantsGroup, alterGroupsSubject, alterGroupsDescription,
     changeGroupsSettings,
     sendContact, 
     fetchStatusProfile,
     getProfileBusiness,
     fetchUrlImage,
     sendMessageReact,
     sendMessageSurvey,
     sendMessageBulk,
     presence,
     presenceOnline
 }
 