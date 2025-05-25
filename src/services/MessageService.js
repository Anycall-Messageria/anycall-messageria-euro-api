// MessageService - Serviço para lógica de negócio de mensagens
// Separa lógica de negócio do acesso a dados

import getMessageRepository from '../repositories/MessageRepository.js'
import getCampaignRepository from '../repositories/CampaignRepository.js'
import getQueueRepository from '../repositories/QueueRepository.js'
import { findString } from '../utils/util.js'
import { send, sendsContact, sendNewWithContact } from '../controllers/automateController.js'

/**
 * Serviço para lógica de negócio relacionada a mensagens
 * Orquestra operações entre repositories e contém regras de negócio
 */
class MessageService {
    constructor() {
        this.messageRepo = getMessageRepository()
        this.campaignRepo = getCampaignRepository()
        this.queueRepo = getQueueRepository()
        
        // Constantes de negócio extraídas do código original
        this.EXIT_COMMAND = 'sair'
        this.CORRESPONDENTS_KEYWORD = 'correspondentes'
        this.COBRANCA_KEYWORD = 'Cobrança'
        this.ANTECIPE_KEYWORD = 'Antecipe'
        
        // Configurações de contato (extraídas do código hardcoded)
        this.CONTACT_CONFIG = {
            default: {
                phone: '558000003517',
                phone2: '8000003517',
                organization: '💲 Euro 17 Crédito',
                fullName: '💲 Euro 17 Crédito'
            },
            alternative: {
                phone: '5511961762957',
                phone2: '11 961762957',
                organization: '💲 Euro 17 Crédito',
                fullName: '💲 Euro 17 Crédito'
            }
        }
        
        // Templates de mensagem (extraídas do código hardcoded)
        this.MESSAGE_TEMPLATES = {
            exit: 'Agradecemos sua atenção, caso tenha interesse em nos conhecer, visite nosso site clicando aqui: https://www.euro17.com.br',
            santander: {
                1: 'Para saber + sobre redução de suas parcelas do consignado,\nclique agora no link\nhttps://bit.ly/E17_Santander\nvocê será atendido no whatsapp pela nossa Equipe especializada sem compromisso.',
                2: 'Para saber + sobre como adquirir um novo contrato de consignado,\nclique agora no link\nhttps://bit.ly/E17_Santander\nvocê será atendido no whatsapp pela nossa Equipe especializada sem compromisso.',
                3: 'Para saber + sobre como refinanciar seus contratos de consignado Santander,\nclique agora no link\nhttps://bit.ly/E17_Santander\nvocê será atendido no whatsapp pela nossa Equipe especializada sem compromisso.',
                4: 'Para saber + sobre como você pode adquirir um cartão de crédito,\nclique agora no link\nhttps://bit.ly/E17_Santander\nvocê será atendido no whatsapp pela nossa Equipe especializada sem compromisso.'
            },
            fallback: 'Agradecemos sua atenção, caso tenha interesse em nos conhecer, visite nosso site https://www.euro17.com.br ou pode chamar em nosso contato.',
            antecipe: 'Agradecemos sua atenção, caso tenha interesse em nos conhecer, visite nosso site https://www.euro17.com.br,\nvocê pode chamar em nosso contato também, será um prazer atende-lo.',
            greeting: 'Olá! Me chamo Any, em que posso ajudar?'
        }
    }

    /**
     * Processar mensagem recebida - função principal que substitui pushMessageDb
     * @param {Object} datas - Dados da mensagem
     * @returns {Promise<Object>} Resultado do processamento
     */
    async processIncomingMessage(datas) {
        try {
            const { remotejid, messagerecive, idmessage, session, fromme } = datas
            const mini = messagerecive.toLowerCase()
            
            // Salvar mensagem no banco
            const savedMessage = await this.messageRepo.pushMessageToDb(datas)
            
            // Buscar mensagem enviada relacionada
            const receivedMessage = await this.messageRepo.findSendMessageByReceiver(remotejid)
            
            if (receivedMessage) {
                return await this.processExistingConversation(datas, receivedMessage, mini)
            } else {
                console.log('Entrou fora da consulta')
                setTimeout(() => this.sendClientOutDB(datas), 1500)
                return { status: 'out_of_db', savedMessage }
            }
        } catch (error) {
            console.log('Error: ' + error)
            return { status: 'error', error }
        }
    }

    /**
     * Processar conversa existente
     * @param {Object} datas - Dados da mensagem
     * @param {Object} receivedMessage - Mensagem recebida encontrada
     * @param {string} mini - Mensagem em minúsculas
     * @returns {Promise<Object>} Resultado do processamento
     */
    async processExistingConversation(datas, receivedMessage, mini) {
        const { remotejid, messagerecive, idmessage, session, fromme } = datas
        
        // Verificar se contém palavra-chave "correspondentes"
        const hasCorrespondentsKeyword = findString(receivedMessage.messageinit, this.CORRESPONDENTS_KEYWORD)
        
        // Processar comando de saída
        if (mini === this.EXIT_COMMAND) {
            return await this.handleExitCommand(datas, receivedMessage)
        }
        
        // Processar código correto
        if (messagerecive == receivedMessage.code) {
            return await this.handleCorrectCode(datas, receivedMessage)
        }
        
        // Processar mensagens com palavra-chave "correspondentes"
        if (hasCorrespondentsKeyword) {
            return await this.handleCorrespondentsFlow(datas, receivedMessage, messagerecive)
        }
        
        // Fora do contexto
        console.log('Entrou fora do contexto')
        setTimeout(() => this.sendOutContext(datas), 1000)
        return { status: 'out_of_context' }
    }

    /**
     * Processar comando de saída
     * @param {Object} datas - Dados da mensagem
     * @param {Object} receivedMessage - Mensagem recebida
     * @returns {Promise<Object>} Resultado do processamento
     */
    async handleExitCommand(datas, receivedMessage) {
        const { idmessage } = datas
        
        if (receivedMessage.endpointmsg === 'send-text') {
            const messageData = {
                session: receivedMessage.session,
                receiver: receivedMessage.receiver,
                message: { text: this.MESSAGE_TEMPLATES.exit },
                messageid: idmessage,
                id: receivedMessage.id
            }
            
            await this.messageRepo.doNotBother(receivedMessage.id, datas.messagerecive)
            await send(messageData)
            
            return { status: 'exit_processed', messageData }
        }
        
        return { status: 'exit_not_processed' }
    }

    /**
     * Processar código correto
     * @param {Object} datas - Dados da mensagem
     * @param {Object} receivedMessage - Mensagem recebida
     * @returns {Promise<Object>} Resultado do processamento
     */
    async handleCorrectCode(datas, receivedMessage) {
        const { idmessage } = datas
        
        if (receivedMessage.endpointmsg === 'send-text') {
            const messageData = {
                session: receivedMessage.session,
                receiver: receivedMessage.receiver,
                message: { text: receivedMessage.text },
                messageid: idmessage,
                id: receivedMessage.id
            }
            
            await send(messageData)
            return { status: 'correct_code_text', messageData }
            
        } else if (receivedMessage.endpointmsg === 'send-contact') {
            const contactData = {
                session: receivedMessage.session,
                receiver: receivedMessage.receiver,
                ...this.CONTACT_CONFIG.default,
                messageid: idmessage,
                id: receivedMessage.id
            }
            
            const afterContactData = {
                session: receivedMessage.session,
                receiver: receivedMessage.receiver,
                message: { text: receivedMessage.text },
                messageid: idmessage,
                id: receivedMessage.id
            }
            
            await sendsContact(contactData)
            await send(afterContactData)
            
            return { status: 'correct_code_contact', contactData, afterContactData }
        }
        
        return { status: 'correct_code_not_processed' }
    }

    /**
     * Processar fluxo de correspondentes (Santander)
     * @param {Object} datas - Dados da mensagem
     * @param {Object} receivedMessage - Mensagem recebida
     * @param {string} messagerecive - Mensagem recebida
     * @returns {Promise<Object>} Resultado do processamento
     */
    async handleCorrespondentsFlow(datas, receivedMessage, messagerecive) {
        const { idmessage } = datas
        
        if (receivedMessage.endpointmsg === 'send-text') {
            // Verificar se é uma opção válida do Santander (1-4)
            const option = parseInt(messagerecive)
            
            if (option >= 1 && option <= 4) {
                const messageData = {
                    session: receivedMessage.session,
                    receiver: receivedMessage.receiver,
                    message: { text: this.MESSAGE_TEMPLATES.santander[option] },
                    messageid: idmessage,
                    id: receivedMessage.id
                }
                
                await this.messageRepo.doNotBother(receivedMessage.id, messagerecive)
                await send(messageData)
                
                return { status: 'santander_option_processed', option, messageData }
            } else {
                // Opção inválida - enviar fallback com contato
                const fallbackData = {
                    session: receivedMessage.session,
                    receiver: receivedMessage.receiver,
                    message: { text: this.MESSAGE_TEMPLATES.fallback },
                    messageid: idmessage,
                    id: receivedMessage.id
                }
                
                const contactData = {
                    session: receivedMessage.session,
                    receiver: receivedMessage.receiver,
                    ...this.CONTACT_CONFIG.alternative,
                    messageid: idmessage,
                    id: receivedMessage.id
                }
                
                await this.messageRepo.doNotBother(receivedMessage.id, messagerecive)
                await sendNewWithContact(fallbackData, contactData, receivedMessage.id_campaing)
                
                return { status: 'santander_fallback', fallbackData, contactData }
            }
        }
        
        return { status: 'correspondents_not_processed' }
    }

    /**
     * Processar contexto externo (função original: sendOutContext)
     * @param {Object} rec - Dados da mensagem
     * @returns {Promise<Object>} Resultado do processamento
     */
    async sendOutContext(rec) {
        try {
            const { remotejid, messagerecive, idmessage, session, fromme } = rec
            
            const receivedMessage = await this.messageRepo.findSendMessageByReceiver(remotejid)
            
            if (receivedMessage) {
                // Buscar campanha e fila
                const campaign = await this.campaignRepo.findCampaignById(receivedMessage.id_campaing)
                const queue = campaign ? await this.queueRepo.findByIdentificador(campaign.identificador) : null
                
                if (queue) {
                    const isCobranca = findString(queue.nomefila, this.COBRANCA_KEYWORD)
                    
                    if (!isCobranca) {
                        const isAntecipe = findString(queue.nomefila, this.ANTECIPE_KEYWORD)
                        
                        if (isAntecipe) {
                            // Fluxo Antecipe
                            const messageData = {
                                session: receivedMessage.session,
                                receiver: receivedMessage.receiver,
                                message: { text: receivedMessage.text },
                                messageid: idmessage,
                                id: receivedMessage.id
                            }
                            
                            await send(messageData)
                            return { status: 'antecipe_processed', messageData }
                        }
                        
                        // Fluxo padrão (não Cobrança, não Antecipe)
                        const messageData = {
                            session: receivedMessage.session,
                            receiver: receivedMessage.receiver,
                            message: { text: this.MESSAGE_TEMPLATES.antecipe },
                            messageid: idmessage,
                            id: receivedMessage.id
                        }
                        
                        await send(messageData)
                        return { status: 'default_flow_processed', messageData }
                    }
                    
                    // Fluxo Cobrança
                    return await this.handleCobrancaFlow(rec, receivedMessage)
                }
            }
            
            return { status: 'out_context_not_processed' }
        } catch (error) {
            console.error('[MessageService] Erro em sendOutContext:', error)
            return { status: 'error', error }
        }
    }

    /**
     * Processar fluxo de cobrança
     * @param {Object} rec - Dados da mensagem
     * @param {Object} receivedMessage - Mensagem recebida
     * @returns {Promise<Object>} Resultado do processamento
     */
    async handleCobrancaFlow(rec, receivedMessage) {
        const { idmessage } = rec
        
        const messageData = {
            session: receivedMessage.session,
            receiver: receivedMessage.receiver,
            message: { text: receivedMessage.text },
            messageid: idmessage,
            id: receivedMessage.id,
            bot: 1
        }
        
        await this.messageRepo.doNotBother(receivedMessage.id, rec.messagerecive)
        await send(messageData)
        
        return { status: 'cobranca_processed', messageData }
    }

    /**
     * Processar cliente fora do banco (função original: sendClientOutDB)
     * @param {Object} rec - Dados da mensagem
     * @returns {Promise<Object>} Resultado do processamento
     */
    async sendClientOutDB(rec) {
        try {
            const { remotejid, messagerecive, idmessage, session, fromme, pushname } = rec
            
            if (fromme == 0) {
                const messageData = {
                    session: session,
                    receiver: remotejid.toString(),
                    message: { text: this.MESSAGE_TEMPLATES.greeting }
                }
                
                console.log('Any =>', fromme, messageData)
                
                // Aqui poderia enviar a mensagem se necessário
                // await send(messageData)
                
                return { status: 'client_out_db_processed', messageData }
            }
            
            return { status: 'client_out_db_skipped' }
        } catch (error) {
            console.error('[MessageService] Erro em sendClientOutDB:', error)
            return { status: 'error', error }
        }
    }

    /**
     * Atualizar status de leitura (wrapper para função original)
     * @param {string} status - Status de leitura
     * @param {string} id - ID da mensagem
     * @param {string} remoteJid - JID remoto
     * @returns {Promise<Array>} Resultado da atualização
     */
    async updateMessageReadStatus(status, id, remoteJid) {
        return await this.messageRepo.updateMessageReadStatus(status, id, remoteJid)
    }

    /**
     * Gravar mensagem enviada (wrapper para função original)
     * @param {Object} data - Dados da mensagem
     * @returns {Promise<Object>} Mensagem criada
     */
    async recordMessageSend(data) {
        return await this.messageRepo.recordMessageSend(data)
    }

    /**
     * Atualizar session da mensagem (wrapper para função original)
     * @param {string} id - ID da mensagem
     * @param {string} session - Session
     * @returns {Promise<Array>} Resultado da atualização
     */
    async updateRecordMessageSend(id, session) {
        return await this.messageRepo.updateRecordMessageSend(id, session)
    }

    /**
     * Atualizar checked da mensagem (wrapper para função original)
     * @param {number} id - ID da mensagem
     * @returns {Promise<Array>} Resultado da atualização
     */
    async updateCheckedMessageSend(id) {
        return await this.messageRepo.updateCheckedMessageSend(id)
    }
}

// Singleton instance
let instance = null

/**
 * Obter instância singleton do MessageService
 * @returns {MessageService} Instância do serviço
 */
export const getMessageService = () => {
    if (!instance) {
        instance = new MessageService()
    }
    return instance
}

// Exportar classe para casos onde múltiplas instâncias são necessárias
export { MessageService }

// Export default para facilitar importação
export default getMessageService