import HistorySync from '../../model/historySync.model.js'
import Chats from '../../model/chatsHistory.model.js'
import Contact from '../../model/contactsHistory.model.js'
import Message from '../../model/messagesHistory.model.js'
import { logger } from '../../../logger.js'

export const saveHistorySync = async (data, sessionId, companyId) => {
    try {
        const { chats, contacts, messages, syncType } = data

        // Salva o registro principal de sincronização
        const historySync = await HistorySync.create({
            sync_type: syncType,
            total_chats: chats?.length || 0,
            total_contacts: contacts?.length || 0,
            total_messages: messages?.length || 0,
            session_id: sessionId,
            company_id: companyId
        })

        // Salva os chats
        if (chats && chats.length > 0) {
            for (const chat of chats) {
                await Chats.create({
                    id: chat.id,
                    name: chat.name,
                    last_sync_id: historySync.id,
                    company_id: companyId
                })
            }
        }

        // Salva os contatos
        if (contacts && contacts.length > 0) {
            for (const contact of contacts) {
                await Contact.create({
                    id: contact.id,
                    name: contact.name,
                    last_sync_id: historySync.id,
                    company_id: companyId
                })
            }
        }

        // Garante que o sessionId existe como contato
        await Contact.findOrCreate({
            where: { id: sessionId },
            defaults: {
                id: sessionId,
                name: 'Me',
                last_sync_id: historySync.id,
                company_id: companyId
            }
        })

        // Salva as mensagens
        if (messages && messages.length > 0) {
            for (const message of messages) {
                const senderId = message.key.fromMe ? sessionId : message.key.remoteJid
                
                // Garante que o remetente existe como contato
                await Contact.findOrCreate({
                    where: { id: senderId },
                    defaults: {
                        id: senderId,
                        name: message.pushName || 'Unknown',
                        last_sync_id: historySync.id,
                        company_id: companyId
                    }
                })

                await Message.create({
                    id: message.key.id,
                    chat_id: message.key.remoteJid,
                    sender_id: senderId,
                    content: message.message?.conversation || message.message?.extendedTextMessage?.text || '',
                    timestamp: new Date(message.messageTimestamp * 1000),
                    last_sync_id: historySync.id,
                    company_id: companyId
                })
            }
        }

        logger.info(`Histórico salvo com sucesso para sessão ${sessionId}`)
        return historySync
    } catch (error) {
        logger.error('Erro ao salvar histórico:', error)
        throw error
    }
} 