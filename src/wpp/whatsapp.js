import { rmSync, readdir } from 'fs'
import makeWASocket, { DisconnectReason, useMultiFileAuthState, 
    fetchLatestBaileysVersion, makeInMemoryStore, } from '@whiskeysockets/baileys'
import pino from 'pino'
import __dirname from '../../dirname.js'
import response from '../../response.js'
import { join } from 'path'
import { justNumbers, formatPhone, formatGroup } from '../utils/util.js'
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
import { saveHistorySync } from '../service/historySync/index.js'


const loggers = logger

// Função debounce para otimizar chamadas frequentes
const debounce = (func, delay) => {
    let timeoutId
    const debouncedFunc = (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
    
    // Método para cancelar execução pendente
    debouncedFunc.cancel = () => {
        clearTimeout(timeoutId)
    }
    
    // Método para executar imediatamente
    debouncedFunc.flush = (...args) => {
        clearTimeout(timeoutId)
        return func.apply(this, args)
    }
    
    return debouncedFunc
}

// Classe Circuit Breaker para controlar reconexões
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000, resetTimeout = 300000) {
        this.threshold = threshold           // Número máximo de falhas antes de abrir o circuito
        this.timeout = timeout               // Tempo de timeout para cada tentativa (ms)
        this.resetTimeout = resetTimeout     // Tempo para tentar fechar o circuito novamente (ms)
        this.failures = new Map()           // Contador de falhas por sessão
        this.lastFailureTime = new Map()    // Timestamp da última falha
        this.circuitState = new Map()       // Estado do circuito por sessão: 'CLOSED', 'OPEN', 'HALF_OPEN'
        this.successCount = new Map()       // Contador de sucessos em estado HALF_OPEN
    }
    
    // Estados do Circuit Breaker
    static STATES = {
        CLOSED: 'CLOSED',       // Normal - permite requisições
        OPEN: 'OPEN',           // Circuito aberto - bloqueia requisições
        HALF_OPEN: 'HALF_OPEN'  // Teste - permite algumas requisições
    }
    
    // Registrar uma falha
    recordFailure(sessionId, error) {
        const failures = this.failures.get(sessionId) || 0
        const newFailures = failures + 1
        
        this.failures.set(sessionId, newFailures)
        this.lastFailureTime.set(sessionId, Date.now())
        
        console.log(`Circuit Breaker: Falha ${newFailures}/${this.threshold} registrada para sessão ${sessionId} - ${error}`)
        
        if (newFailures >= this.threshold) {
            this.openCircuit(sessionId)
        }
    }
    
    // Registrar um sucesso
    recordSuccess(sessionId) {
        const state = this.getState(sessionId)
        
        if (state === CircuitBreaker.STATES.HALF_OPEN) {
            const successCount = this.successCount.get(sessionId) || 0
            this.successCount.set(sessionId, successCount + 1)
            
            // Se teve sucesso em HALF_OPEN, fechar o circuito
            if (successCount >= 1) {
                this.closeCircuit(sessionId)
            }
        } else if (state === CircuitBreaker.STATES.CLOSED) {
            // Reset do contador de falhas em caso de sucesso
            this.failures.set(sessionId, 0)
        }
        
        console.log(`Circuit Breaker: Sucesso registrado para sessão ${sessionId}`)
    }
    
    // Verificar se deve permitir reconexão
    shouldAllowReconnection(sessionId) {
        const state = this.getState(sessionId)
        
        switch (state) {
            case CircuitBreaker.STATES.CLOSED:
                return true
                
            case CircuitBreaker.STATES.OPEN:
                // Verificar se é hora de tentar HALF_OPEN
                const lastFailure = this.lastFailureTime.get(sessionId) || 0
                const timeSinceLastFailure = Date.now() - lastFailure
                
                if (timeSinceLastFailure >= this.resetTimeout) {
                    this.setHalfOpen(sessionId)
                    return true
                }
                return false
                
            case CircuitBreaker.STATES.HALF_OPEN:
                return true
                
            default:
                return true
        }
    }
    
    // Abrir o circuito (bloquear reconexões)
    openCircuit(sessionId) {
        this.circuitState.set(sessionId, CircuitBreaker.STATES.OPEN)
        console.log(`Circuit Breaker: Circuito ABERTO para sessão ${sessionId} - reconexões bloqueadas por ${this.resetTimeout/1000}s`)
    }
    
    // Fechar o circuito (permitir reconexões)
    closeCircuit(sessionId) {
        this.circuitState.set(sessionId, CircuitBreaker.STATES.CLOSED)
        this.failures.set(sessionId, 0)
        this.successCount.set(sessionId, 0)
        console.log(`Circuit Breaker: Circuito FECHADO para sessão ${sessionId} - reconexões normalizadas`)
    }
    
    // Definir como meio aberto (teste)
    setHalfOpen(sessionId) {
        this.circuitState.set(sessionId, CircuitBreaker.STATES.HALF_OPEN)
        this.successCount.set(sessionId, 0)
        console.log(`Circuit Breaker: Circuito MEIO-ABERTO para sessão ${sessionId} - testando reconexão`)
    }
    
    // Obter estado atual do circuito
    getState(sessionId) {
        return this.circuitState.get(sessionId) || CircuitBreaker.STATES.CLOSED
    }
    
    // Obter estatísticas
    getStats(sessionId) {
        return {
            state: this.getState(sessionId),
            failures: this.failures.get(sessionId) || 0,
            threshold: this.threshold,
            lastFailureTime: this.lastFailureTime.get(sessionId),
            successCount: this.successCount.get(sessionId) || 0
        }
    }
    
    // Obter estatísticas de todas as sessões
    getAllStats() {
        const stats = {}
        
        // Combinar todas as sessões conhecidas
        const allSessions = new Set([
            ...this.failures.keys(),
            ...this.circuitState.keys(),
            ...this.lastFailureTime.keys()
        ])
        
        allSessions.forEach(sessionId => {
            stats[sessionId] = this.getStats(sessionId)
        })
        
        return stats
    }
    
    // Limpar dados de uma sessão
    clearSession(sessionId) {
        this.failures.delete(sessionId)
        this.lastFailureTime.delete(sessionId)
        this.circuitState.delete(sessionId)
        this.successCount.delete(sessionId)
        console.log(`Circuit Breaker: Dados limpos para sessão ${sessionId}`)
    }
    
    // Reset completo do circuit breaker
    reset() {
        this.failures.clear()
        this.lastFailureTime.clear()
        this.circuitState.clear()
        this.successCount.clear()
        console.log('Circuit Breaker: Reset completo realizado')
    }
}

// Classe para gerenciar pool de conexões
class SessionPool {
    constructor(maxSessions = 50) {
        this.sessions = new Map()
        this.maxSessions = maxSessions
        this.activeConnections = 0
        this.waitingQueue = []
    }
    
    canCreateSession() {
        return this.sessions.size < this.maxSessions
    }
    
    addSession(sessionId, sessionData) {
        if (this.canCreateSession()) {
            this.sessions.set(sessionId, sessionData)
            console.log(`Sessão ${sessionId} adicionada ao pool. Total: ${this.sessions.size}/${this.maxSessions}`)
            return true
        }
        console.log(`Pool lotado! Máximo de ${this.maxSessions} sessões atingido`)
        return false
    }
    
    removeSession(sessionId) {
        const removed = this.sessions.delete(sessionId)
        if (removed) {
            console.log(`Sessão ${sessionId} removida do pool. Total: ${this.sessions.size}/${this.maxSessions}`)
            // Processar fila de espera se houver
            this.processWaitingQueue()
        }
        return removed
    }
    
    getSession(sessionId) {
        return this.sessions.get(sessionId) ?? null
    }
    
    hasSession(sessionId) {
        return this.sessions.has(sessionId)
    }
    
    addToWaitingQueue(sessionId, callback) {
        this.waitingQueue.push({ sessionId, callback })
        console.log(`Sessão ${sessionId} adicionada à fila de espera. Posição: ${this.waitingQueue.length}`)
    }
    
    processWaitingQueue() {
        if (this.waitingQueue.length > 0 && this.canCreateSession()) {
            const next = this.waitingQueue.shift()
            console.log(`Processando sessão ${next.sessionId} da fila de espera`)
            next.callback()
        }
    }
    
    getStats() {
        return {
            activeSessions: this.sessions.size,
            maxSessions: this.maxSessions,
            waitingQueue: this.waitingQueue.length,
            utilizationRate: (this.sessions.size / this.maxSessions * 100).toFixed(2) + '%'
        }
    }
    
    getAllSessions() {
        return Array.from(this.sessions.keys())
    }
    
    forEach(callback) {
        this.sessions.forEach(callback)
    }
}

// Instâncias globais
const sessionPool = new SessionPool(parseInt(process.env.MAX_SESSIONS) || 50)
const circuitBreaker = new CircuitBreaker(
    parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5,       // 5 falhas
    parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 60000,     // 60 segundos
    parseInt(process.env.CIRCUIT_BREAKER_RESET) || 300000       // 5 minutos
)

// Manter compatibilidade com código existente
const sessions = sessionPool.sessions
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
    return sessionPool.hasSession(sessionId)
}

const findSessiomCreate = async (sessionId, user_comp) => {
    if (isSessionExists(sessionId)) {
       const create = await findCreateSession(sessionId, user_comp)
       if(create)
       return 'Sessão criada com sucesso'
    }
}

async function createSession (id, res = null, user_comp=null) {
      // Verificar se o pool tem capacidade para nova sessão
      if (!sessionPool.canCreateSession()) {
          console.log(`Não é possível criar sessão ${id}: pool lotado (${sessionPool.getStats().activeSessions}/${sessionPool.getStats().maxSessions})`)
          
          // Adicionar à fila de espera
          return new Promise((resolve) => {
              sessionPool.addToWaitingQueue(id, () => {
                  createSession(id, res, user_comp).then(resolve)
              })
          })
      }
      
      const sessionFile = `md_${id}`
      const logger = pino({ level: 'warn' }) 
      
      // Configuração otimizada do store com limites de cache
      const store = makeInMemoryStore({ 
          logger,
          maxCacheSize: 1000,        // Limite máximo de itens no cache
          chatsCacheSize: 500,       // Limite de chats no cache
          contactsCacheSize: 300,    // Limite de contatos no cache
          messagesCacheSize: 200     // Limite de mensagens no cache
      })
      
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
         syncFullHistory: true
      }
     /**
     * @type {import('baileys').WASocket}
     */
      const sock = makeWASocket.default(waConfig)
      const userSession = id
      const isLegacy = false
      // Criar objeto da sessão
      const sessionData = { ...sock, store, isLegacy }
      
      // Tentar adicionar ao pool
      if (!sessionPool.addSession(userSession, sessionData)) {
          console.log(`Falha ao adicionar sessão ${userSession} ao pool`)
          return
      }
      
      sock.ev.on('creds.update', saveState)
      
      // Configurar limpeza automática do store a cada 30 minutos
      const cleanupInterval = setInterval(() => {
          try {
              if (store && typeof store.cleanup === 'function') {
                  store.cleanup()
                  console.log(`Store cleanup executado para sessão ${userSession}`)
              }
          } catch (error) {
              console.log(`Erro na limpeza do store para sessão ${userSession}:`, error)
          }
      }, 30 * 60 * 1000) // 30 minutos
      
      // Atualizar sessão no pool com interval
      sessionData.cleanupInterval = cleanupInterval
      sessionPool.addSession(userSession, sessionData)

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
            //console.log(messages)
            //logger.info({ messages: messages.length }, 'Synced messages');
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
              contacts.map(async function(data){ })
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

    const setChat = async (data) => {
        try {
            const { chats, contacts, messages, syncType } = data
            const historyData = {
                chats,
                contacts,
                messages,
                syncType,
                timestamp: new Date()
            }
            
            console.log(`Iniciando salvamento de histórico para sessão ${userSession}`)
            console.log(`Dados a serem salvos: ${chats?.length || 0} chats, ${contacts?.length || 0} contatos, ${messages?.length || 0} mensagens`)
            
            // Salva os dados no banco
            await saveHistorySync(historyData, userSession, user_comp)
            
            console.log(`Histórico salvo com sucesso para sessão ${userSession}`)
            
        } catch (e) {
            console.log(e, 'An error occured during chats set');
        }
    }

    const upsertChat = async (chats) => {
        try {
             //console.log('upsertChat', chats) 
        } catch (e) {
            console.log(e, 'An error occured during chats upsert')
        }
    }

    const updateChat = async (updates) => {
        for (const update of updates) {
            try {
                const { id, conversationTimestamp, unreadCount } = update
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
                
                // Registrar falha no circuit breaker
                const errorMessage = lastDisconnect?.error?.message || 'Connection closed'
                circuitBreaker.recordFailure(userSession, errorMessage)
                
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut 
                console.log(`connection closed due to ${userSession}`, userSession, statusCode,  lastDisconnect.error, ', reconnecting ', shouldReconnect)
                const ab = lastDisconnect.error.output.statusCode
                const bc = lastDisconnect.error.output.payload.message

                if(statusCode == 401 && bc ==  'Intentional Logout'){
                    setTimeout(
                    async () => {let user_company = null},1000)
                  return
            }

                if(statusCode == 408 || statusCode ==  428 || statusCode ==  503 || statusCode ==  515 || statusCode ==  516){
                   console.log(update.qr)
                }
                
                if(ab == 403 && bc == 'Connection Failure'){
                    await countdisconnected(userSession)
                    const count = await findTotalDisconect(userSession)
                    if(count > 2){
                        return deleteSession(userSession, isLegacy)
                    }
                }  
                if (statusCode === DisconnectReason.loggedOut) {
                    circuitBreaker.clearSession(userSession) // Limpar dados do circuit breaker
                    return deleteSession(userSession, isLegacy)
                }
                
                // Verificar circuit breaker antes de tentar reconectar
                if(shouldReconnect && circuitBreaker.shouldAllowReconnection(userSession)) {
                    const reconnectDelay = statusCode === DisconnectReason.restartRequired ? 0 : parseInt(process.env.RECONNECT_INTERVAL ?? 0)
                    console.log(`Circuit Breaker: Permitindo reconexão para sessão ${userSession} em ${reconnectDelay}ms`)
                    
                    setTimeout(
                        async () => {
                            try {
                                let user_company = null
                                await createSession(userSession, res, user_company)
                                await sendCreateSession(userSession, statusCode)
                                await findSessiomCreate(userSession,user_comp)
                                
                                // Registrar sucesso se chegou até aqui
                                circuitBreaker.recordSuccess(userSession)
                            } catch (error) {
                                console.log(`Erro na reconexão da sessão ${userSession}:`, error)
                                circuitBreaker.recordFailure(userSession, error.message)
                            }
                        },
                        reconnectDelay
                    )
                } else if (shouldReconnect) {
                    console.log(`Circuit Breaker: Bloqueando reconexão para sessão ${userSession} - circuito aberto`)
                }

            } else if(connection === 'open') {
                console.log('opened connection')
                openConnection = `open connection ${userSession} ${dateFinal}: ${conn}`
                openLastDisconnect = `open lastDisconnect ${userSession} ${dateFinal}: ${last}`
                await getLogs(openConnection, userSession, connection)
                await getLogs(openLastDisconnect, userSession, lastDisconnect)
                
                // Registrar sucesso no circuit breaker quando conexão abre
                circuitBreaker.recordSuccess(userSession)
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
    // Configurar monitoramento de status com interval otimizado
    const statusInterval = setInterval(() => { 
        statusSession(userSession) 
    }, parseInt(process.env.STATUS_CHECK_INTERVAL) || 60000) // Padrão: 60 segundos
    
    // Armazenar referência do interval para limpeza posterior
    sessionData.statusInterval = statusInterval
    sessionPool.addSession(userSession, sessionData)
}

const getSession = (sessionId) => {
    return sessionPool.getSession(sessionId)
}

// Função original de status da sessão
const _statusSession = async (sessionId) => {
  try {
    const session = await getSession(sessionId)
    if (!session) {
        console.log(`Sessão ${sessionId} não encontrada para status update`)
        return
    }
    
    let state
    if (session.ws.isOpen) {
        state = 'authenticated'
    }
    if (session.ws.isClosed || session.ws.isClosing) {
       state = 'closed'
    }
    
    console.log(`Status update para sessão ${sessionId}: ${state}`)
    await updateStateSession(sessionId, state)
  } catch (err) {
    console.log(`Erro ao atualizar status da sessão ${sessionId}:`, err)    
  }
}

// Versão com debounce para evitar updates excessivos
const statusSession = debounce(_statusSession, 5000) // 5 segundos de debounce

const deleteSession = async (sessionId, isLegacy = false) => {
    try {
        // Limpar intervals antes de deletar a sessão
        const session = sessionPool.getSession(sessionId)
        if (session) {
            // Cancelar debounce pendente
            if (statusSession.cancel) {
                statusSession.cancel()
            }
            
            // Limpar interval de cleanup
            if (session.cleanupInterval) {
                clearInterval(session.cleanupInterval)
                console.log(`Cleanup interval removido para sessão ${sessionId}`)
            }
            
            // Limpar interval de status
            if (session.statusInterval) {
                clearInterval(session.statusInterval)
                console.log(`Status interval removido para sessão ${sessionId}`)
            }
        }
        
        // Limpar dados do circuit breaker
        circuitBreaker.clearSession(sessionId)
        
        await banSession(sessionId)
        const sessionFile = (isLegacy ? 'legacy_' : 'md_') + sessionId + (isLegacy ? '.json' : '')
        const storeFile = `${sessionId}_store.json`
        const rmOptions = { force: true, recursive: true }
        rmSync(sessionsDir(sessionFile), rmOptions)
        rmSync(sessionsDir(storeFile), rmOptions)
        
        // Remover do pool (irá processar fila de espera automaticamente)
        sessionPool.removeSession(sessionId)
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
        
        // Cancelar todos os debounces pendentes
        if (statusSession.cancel) {
            statusSession.cancel()
        }
        
        sessionPool.forEach((session, sessionId) => {
            // Limpar intervals de cleanup
            if (session.cleanupInterval) {
                clearInterval(session.cleanupInterval)
            }
            
            // Limpar intervals de status
            if (session.statusInterval) {
                clearInterval(session.statusInterval)
            }
            
            if (!session.isLegacy) {
                session.store.writeToFile(sessionsDir(`${sessionId}_store.json`))
            }
        })
    } catch (err) {
        console.log(err)
    }
}

// Função para obter estatísticas do pool
const getPoolStats = () => {
    return sessionPool.getStats()
}

// Função para listar todas as sessões ativas
const getAllActiveSessions = () => {
    return sessionPool.getAllSessions()
}

// Função para obter estatísticas do circuit breaker
const getCircuitBreakerStats = (sessionId = null) => {
    if (sessionId) {
        return circuitBreaker.getStats(sessionId)
    }
    return circuitBreaker.getAllStats()
}

// Função para resetar circuit breaker de uma sessão específica
const resetCircuitBreaker = (sessionId = null) => {
    if (sessionId) {
        circuitBreaker.clearSession(sessionId)
        console.log(`Circuit Breaker resetado para sessão ${sessionId}`)
    } else {
        circuitBreaker.reset()
        console.log('Circuit Breaker resetado para todas as sessões')
    }
}

// Função para forçar abertura do circuito (para testes/manutenção)
const openCircuitBreaker = (sessionId) => {
    circuitBreaker.openCircuit(sessionId)
}

// Função para forçar fechamento do circuito
const closeCircuitBreaker = (sessionId) => {
    circuitBreaker.closeCircuit(sessionId)
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
     // Funções do pool de sessões
     getPoolStats,
     getAllActiveSessions,
     // Funções do circuit breaker
     getCircuitBreakerStats,
     resetCircuitBreaker,
     openCircuitBreaker,
     closeCircuitBreaker,
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
 