import HistorySync from '../../model/historySync.model.js'
import Chats from '../../model/chatsHistory.model.js'
import Contact from '../../model/contactsHistory.model.js'
import Message from '../../model/messagesHistory.model.js'
import { logger } from '../../../logger.js'

export const findHistorySync = async (sessionId, companyId) => {
    try {
        // Busca o último registro de sincronização
        const lastSync = await HistorySync.findOne({
            where: {
                session_id: sessionId,
                company_id: companyId
            },
            order: [['timestamp', 'DESC']]
        })

        // Busca os dados relacionados
        const [chats, contacts, messages] = await Promise.all([
            Chats.findAll({
                where: { 
                    company_id: companyId,
                    last_sync_id: lastSync?.id 
                },
                limit: 10,
                order: [['id', 'DESC']]
            }),
            Contact.findAll({
                where: { 
                    company_id: companyId,
                    last_sync_id: lastSync?.id 
                },
                limit: 10
            }),
            Message.findAll({
                where: { 
                    company_id: companyId,
                    last_sync_id: lastSync?.id 
                },
                limit: 10,
                order: [['timestamp', 'DESC']]
            })
        ])

        return {
            message: lastSync ? 'Dados encontrados com sucesso' : 'Nenhum registro de sincronização encontrado',
            data: {
                sync: lastSync,
                stats: {
                    total_chats: chats.length,
                    total_contacts: contacts.length,
                    total_messages: messages.length
                },
                last_chats: chats,
                last_contacts: contacts,
                last_messages: messages
            }
        }
    } catch (error) {
        logger.error('Erro ao buscar histórico:', error)
        throw error
    }
} 