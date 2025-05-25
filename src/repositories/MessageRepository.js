// MessageRepository - Repositório para operações de mensagens
// Implementa acesso a dados isolado da lógica de negócio

import BaseRepository from './BaseRepository.js'
import Message from '../model/messages.model.js'
import Sendmessage from '../model/sendmessages.model.js'

/**
 * Repositório para operações relacionadas a mensagens
 * Herda operações básicas do BaseRepository
 */
class MessageRepository extends BaseRepository {
    constructor() {
        super(Message)
        this.sendMessageModel = Sendmessage
    }

    /**
     * Criar registro de mensagem (função original: recordMessageSend)
     * @param {Object} data - Dados da mensagem
     * @returns {Promise<Object>} Mensagem criada
     */
    async recordMessageSend(data) {
        try {
            console.log('recordMessageSend')
            return await this.create(data)
        } catch (error) {
            console.error('[MessageRepository] Erro ao gravar mensagem:', error)
            // Manter comportamento original: não re-throw erro
            return null
        }
    }

    /**
     * Atualizar session da mensagem (função original: updateRecordMessageSend)
     * @param {string} id - ID da mensagem
     * @param {string} session - Session para atualização
     * @returns {Promise<Array>} Resultado da atualização
     */
    async updateRecordMessageSend(id, session) {
        try {
            const condition = { idmessage: id }
            const values = { session: session }
            return await this.update(values, condition, { multi: true })
        } catch (error) {
            console.log('Error: ' + error)
            return null
        }
    }

    /**
     * Buscar mensagem enviada por receiver e condições específicas
     * @param {string} receiver - Receptor da mensagem
     * @param {Object} additionalWhere - Condições adicionais
     * @returns {Promise<Object|null>} Mensagem encontrada
     */
    async findSendMessageByReceiver(receiver, additionalWhere = {}) {
        try {
            const where = {
                receiver: receiver,
                type: 2,
                messageid: null,
                checked: 0,
                ...additionalWhere
            }
            
            return await this.sendMessageModel.findOne({
                where,
                order: [['id', 'DESC']]
            })
        } catch (error) {
            console.error('[MessageRepository] Erro ao buscar mensagem por receiver:', error)
            return null
        }
    }

    /**
     * Atualizar status checked da mensagem enviada (função original: updatecheckedMessageSend)
     * @param {number} id - ID da mensagem
     * @returns {Promise<Array>} Resultado da atualização
     */
    async updateCheckedMessageSend(id) {
        try {
            const condition = { id: id }
            const values = { checked: 1 }
            
            return await this.sendMessageModel.update(values, {
                where: condition,
                multi: true
            })
        } catch (error) {
            console.log('Error: ' + error)
            return null
        }
    }

    /**
     * Marcar como "não incomodar" (função original: doNotBother)
     * @param {number} id - ID da mensagem
     * @param {string} messageReceived - Mensagem recebida
     * @returns {Promise<Array>} Resultado da atualização
     */
    async doNotBother(id, messageReceived) {
        try {
            const condition = { id: id }
            const values = { title: messageReceived }
            
            return await this.sendMessageModel.update(values, {
                where: condition,
                multi: true
            })
        } catch (error) {
            console.log('Error: ' + error)
            return null
        }
    }

    /**
     * Criar mensagem e retornar registro (função original: pushMessageDb parte do create)
     * @param {Object} datas - Dados da mensagem
     * @returns {Promise<Object>} Mensagem criada
     */
    async pushMessageToDb(datas) {
        try {
            console.log('pushMessageDb')
            return await this.create(datas)
        } catch (error) {
            console.error('[MessageRepository] Erro ao push message:', error)
            return null
        }
    }

    /**
     * Atualizar status de leitura da mensagem (função original: updateMessageDB)
     * @param {string} status - Status de leitura
     * @param {string} id - ID da mensagem
     * @param {string} remoteJid - JID remoto
     * @returns {Promise<Array>} Resultado da atualização
     */
    async updateMessageReadStatus(status, id, remoteJid) {
        try {
            const condition = { idmessage: id }
            const values = {
                read: 1,
                statusread: status
            }
            
            return await this.update(values, condition, { multi: true })
        } catch (error) {
            console.log('Error: ' + error)
            return null
        }
    }

    /**
     * Buscar mensagens por JID remoto
     * @param {string} remoteJid - JID remoto
     * @param {Object} options - Opções de busca
     * @returns {Promise<Array>} Lista de mensagens
     */
    async findByRemoteJid(remoteJid, options = {}) {
        try {
            return await this.findAll({ remotejid: remoteJid }, options)
        } catch (error) {
            console.error('[MessageRepository] Erro ao buscar por remoteJid:', error)
            return []
        }
    }

    /**
     * Buscar mensagens por session
     * @param {string} session - Session
     * @param {Object} options - Opções de busca
     * @returns {Promise<Array>} Lista de mensagens
     */
    async findBySession(session, options = {}) {
        try {
            return await this.findAll({ session: session }, options)
        } catch (error) {
            console.error('[MessageRepository] Erro ao buscar por session:', error)
            return []
        }
    }

    /**
     * Obter modelo SendMessage para operações avançadas
     * @returns {Object} Modelo SendMessage
     */
    getSendMessageModel() {
        return this.sendMessageModel
    }
}

// Singleton instance
let instance = null

/**
 * Obter instância singleton do MessageRepository
 * @returns {MessageRepository} Instância do repositório
 */
export const getMessageRepository = () => {
    if (!instance) {
        instance = new MessageRepository()
    }
    return instance
}

// Exportar classe para casos onde múltiplas instâncias são necessárias
export { MessageRepository }

// Export default para facilitar importação
export default getMessageRepository