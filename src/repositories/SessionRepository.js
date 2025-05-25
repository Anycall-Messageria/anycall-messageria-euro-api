// SessionRepository - Repositório para operações de sessões
// Implementa cache para consultas frequentes de sessão

import BaseRepository from './BaseRepository.js'
import Session from '../model/sessions.model.js'

/**
 * Repositório para operações relacionadas a sessões
 * Implementa cache específico para dados de sessão
 */
class SessionRepository extends BaseRepository {
    constructor() {
        super(Session)
        this.sessionCacheTTL = 300 // 5 minutos para sessões (dados mais dinâmicos)
    }

    /**
     * Buscar sessão por session_name com cache
     * @param {string} sessionName - Nome da sessão
     * @returns {Promise<Object|null>} Sessão encontrada
     */
    async findBySessionName(sessionName) {
        const cacheKey = this.getCacheKey(`sessionname:${sessionName}`)
        
        return await this.findWithCache(cacheKey, async () => {
            return await this.model.findOne({
                where: { session_name: sessionName }
            })
        }, this.sessionCacheTTL)
    }

    /**
     * Buscar sessões ativas com cache
     * @returns {Promise<Array>} Lista de sessões ativas
     */
    async findActiveSessions() {
        const cacheKey = this.getCacheKey('active:sessions')
        
        return await this.findWithCache(cacheKey, async () => {
            return await this.model.findAll({
                where: { status: 'active' },
                order: [['updated_at', 'DESC']]
            })
        }, this.sessionCacheTTL)
    }

    /**
     * Buscar sessões por status com cache
     * @param {string} status - Status da sessão
     * @returns {Promise<Array>} Lista de sessões
     */
    async findByStatus(status) {
        const cacheKey = this.getCacheKey(`status:${status}`)
        
        return await this.findWithCache(cacheKey, async () => {
            return await this.model.findAll({
                where: { status: status },
                order: [['updated_at', 'DESC']]
            })
        }, this.sessionCacheTTL)
    }

    /**
     * Contar sessões por status com cache
     * @param {string} status - Status da sessão
     * @returns {Promise<number>} Contagem de sessões
     */
    async countByStatus(status) {
        const cacheKey = this.getCacheKey(`count:status:${status}`)
        
        return await this.findWithCache(cacheKey, async () => {
            return await this.model.count({
                where: { status: status }
            })
        }, this.sessionCacheTTL)
    }

    /**
     * Verificar se sessão está ativa
     * @param {string} sessionName - Nome da sessão
     * @returns {Promise<boolean>} True se ativa, false caso contrário
     */
    async isSessionActive(sessionName) {
        const cacheKey = this.getCacheKey(`isactive:${sessionName}`)
        
        return await this.findWithCache(cacheKey, async () => {
            const session = await this.model.findOne({
                where: { 
                    session_name: sessionName,
                    status: 'active'
                }
            })
            return !!session
        }, 60) // Cache por 1 minuto para verificações de status
    }

    /**
     * Atualizar status da sessão e invalidar cache relacionado
     * @param {string} sessionName - Nome da sessão
     * @param {string} status - Novo status
     * @returns {Promise<Array>} Resultado da atualização
     */
    async updateSessionStatus(sessionName, status) {
        try {
            const result = await this.update(
                { status: status, updated_at: new Date() },
                { session_name: sessionName }
            )
            
            // Invalidar caches específicos
            await this.invalidateSessionCache(sessionName)
            
            return result
        } catch (error) {
            console.error('[SessionRepository] Erro ao atualizar status:', error)
            throw error
        }
    }

    /**
     * Invalidar cache específico da sessão
     * @param {string} sessionName - Nome da sessão
     */
    async invalidateSessionCache(sessionName) {
        await this.invalidateCache(this.getCacheKey(`sessionname:${sessionName}`))
        await this.invalidateCache(this.getCacheKey(`isactive:${sessionName}`))
        await this.cache.invalidatePattern(`${this.cachePrefix}:status:*`)
        await this.cache.invalidatePattern(`${this.cachePrefix}:active:*`)
        await this.cache.invalidatePattern(`${this.cachePrefix}:count:*`)
    }

    /**
     * Atualizar sessão e invalidar cache relacionado
     * @param {Object} values - Valores para atualização
     * @param {Object} where - Condições para atualização
     * @param {Object} options - Opções adicionais
     * @returns {Promise<Array>} Resultado da atualização
     */
    async update(values, where, options = {}) {
        const result = await super.update(values, where, options)
        
        // Invalidar caches específicos se status foi alterado
        if (values.status !== undefined) {
            await this.cache.invalidatePattern(`${this.cachePrefix}:status:*`)
            await this.cache.invalidatePattern(`${this.cachePrefix}:active:*`)
            await this.cache.invalidatePattern(`${this.cachePrefix}:count:*`)
            await this.cache.invalidatePattern(`${this.cachePrefix}:isactive:*`)
        }
        
        return result
    }
}

// Singleton instance
let instance = null

/**
 * Obter instância singleton do SessionRepository
 * @returns {SessionRepository} Instância do repositório
 */
export const getSessionRepository = () => {
    if (!instance) {
        instance = new SessionRepository()
    }
    return instance
}

// Exportar classe para casos onde múltiplas instâncias são necessárias
export { SessionRepository }

// Export default para facilitar importação
export default getSessionRepository