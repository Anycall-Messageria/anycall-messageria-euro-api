// CampaignRepository - Repositório para operações de campanhas
// Implementa acesso a dados para campanhas

import BaseRepository from './BaseRepository.js'
import Campaing from '../model/campaings.model.js'

/**
 * Repositório para operações relacionadas a campanhas
 */
class CampaignRepository extends BaseRepository {
    constructor() {
        super(Campaing)
        this.campaignCacheTTL = 600 // 10 minutos para campanhas
    }

    /**
     * Buscar campanha por número e session
     * @param {string} number - Número do contato
     * @param {number} session - Session
     * @param {number} status - Status da campanha (padrão 200)
     * @returns {Promise<Object|null>} Campanha encontrada
     */
    async findByNumberAndSession(number, session, status = 200) {
        try {
            return await this.findOne({
                number: number,
                session: session,
                status: status
            }, {
                order: [['id', 'DESC']]
            })
        } catch (error) {
            console.error('[CampaignRepository] Erro ao buscar por número e session:', error)
            return null
        }
    }

    /**
     * Buscar campanhas ativas por identificador (com cache)
     * @param {string} identificador - Identificador da campanha
     * @param {Object} additionalWhere - Condições adicionais
     * @returns {Promise<Array>} Lista de campanhas
     */
    async findActiveByIdentificador(identificador, additionalWhere = {}) {
        try {
            const cacheKey = this.getCacheKey(`active:${identificador}:${JSON.stringify(additionalWhere)}`)
            
            return await this.findWithCache(cacheKey, async () => {
                const where = {
                    identificador: identificador,
                    status: 0,
                    schedule: 0,
                    ...additionalWhere
                }
                
                return await this.findAll(where, {
                    order: [['id', 'ASC']]
                })
            }, this.campaignCacheTTL)
        } catch (error) {
            console.error('[CampaignRepository] Erro ao buscar ativas por identificador:', error)
            return []
        }
    }

    /**
     * Buscar uma campanha ativa por identificador (com cache)
     * @param {string} identificador - Identificador da campanha
     * @param {Object} additionalWhere - Condições adicionais
     * @returns {Promise<Object|null>} Campanha encontrada
     */
    async findOneActiveByIdentificador(identificador, additionalWhere = {}) {
        try {
            const cacheKey = this.getCacheKey(`oneactive:${identificador}:${JSON.stringify(additionalWhere)}`)
            
            return await this.findWithCache(cacheKey, async () => {
                const where = {
                    identificador: identificador,
                    status: 0,
                    schedule: 0,
                    ...additionalWhere
                }
                
                return await this.findOne(where, {
                    order: [['id', 'ASC']]
                })
            }, this.campaignCacheTTL)
        } catch (error) {
            console.error('[CampaignRepository] Erro ao buscar uma ativa por identificador:', error)
            return null
        }
    }

    /**
     * Buscar campanhas por status
     * @param {number} status - Status da campanha
     * @param {Object} options - Opções de busca
     * @returns {Promise<Array>} Lista de campanhas
     */
    async findByStatus(status, options = {}) {
        try {
            return await this.findAll({ status: status }, options)
        } catch (error) {
            console.error('[CampaignRepository] Erro ao buscar por status:', error)
            return []
        }
    }

    /**
     * Atualizar status de campanhas por identificador
     * @param {string} identificador - Identificador da campanha
     * @param {number} active - Novo status active
     * @param {number} schedule - Novo status schedule (opcional)
     * @returns {Promise<Array>} Resultado da atualização
     */
    async updateStatusByIdentificador(identificador, active, schedule = null) {
        try {
            const values = { active: active }
            if (schedule !== null) {
                values.schedule = schedule
            }
            
            return await this.update(values, {
                identificador: identificador
            }, { multi: true })
        } catch (error) {
            console.error('[CampaignRepository] Erro ao atualizar status:', error)
            return null
        }
    }

    /**
     * Buscar campanhas agendadas
     * @param {string} identificador - Identificador da campanha
     * @returns {Promise<Array>} Lista de campanhas agendadas
     */
    async findScheduledByIdentificador(identificador) {
        try {
            return await this.findAll({
                identificador: identificador,
                schedule: 1
            }, {
                order: [['id', 'ASC']]
            })
        } catch (error) {
            console.error('[CampaignRepository] Erro ao buscar agendadas:', error)
            return []
        }
    }

    /**
     * Contar campanhas por identificador e status (com cache)
     * @param {string} identificador - Identificador da campanha
     * @param {number} status - Status da campanha
     * @returns {Promise<number>} Quantidade de campanhas
     */
    async countByIdentificadorAndStatus(identificador, status) {
        try {
            const cacheKey = this.getCacheKey(`count:${identificador}:${status}`)
            
            return await this.findWithCache(cacheKey, async () => {
                return await this.count({
                    identificador: identificador,
                    status: status
                })
            }, this.campaignCacheTTL)
        } catch (error) {
            console.error('[CampaignRepository] Erro ao contar campanhas:', error)
            return 0
        }
    }

    /**
     * Buscar campanha por ID específico
     * @param {number} id - ID da campanha
     * @returns {Promise<Object|null>} Campanha encontrada
     */
    async findCampaignById(id) {
        try {
            return await this.findById(id)
        } catch (error) {
            console.error('[CampaignRepository] Erro ao buscar por ID:', error)
            return null
        }
    }
}

// Singleton instance
let instance = null

/**
 * Obter instância singleton do CampaignRepository
 * @returns {CampaignRepository} Instância do repositório
 */
export const getCampaignRepository = () => {
    if (!instance) {
        instance = new CampaignRepository()
    }
    return instance
}

// Exportar classe para casos onde múltiplas instâncias são necessárias
export { CampaignRepository }

// Export default para facilitar importação
export default getCampaignRepository