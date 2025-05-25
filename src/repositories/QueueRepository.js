// QueueRepository - Repositório para operações de filas
// Implementa acesso a dados para filas

import BaseRepository from './BaseRepository.js'
import Queue from '../model/queue.model.js'

/**
 * Repositório para operações relacionadas a filas
 */
class QueueRepository extends BaseRepository {
    constructor() {
        super(Queue)
    }

    /**
     * Buscar fila por identificador
     * @param {string} identificador - Identificador da fila
     * @returns {Promise<Object|null>} Fila encontrada
     */
    async findByIdentificador(identificador) {
        try {
            return await this.findOne({ identificador: identificador })
        } catch (error) {
            console.error('[QueueRepository] Erro ao buscar por identificador:', error)
            return null
        }
    }

    /**
     * Buscar fila por identificador e status
     * @param {string} identificador - Identificador da fila
     * @param {number} status - Status da fila
     * @returns {Promise<Object|null>} Fila encontrada
     */
    async findByIdentificadorAndStatus(identificador, status) {
        try {
            return await this.findOne({
                identificador: identificador,
                status: status
            })
        } catch (error) {
            console.error('[QueueRepository] Erro ao buscar por identificador e status:', error)
            return null
        }
    }

    /**
     * Buscar filas ativas
     * @param {Object} additionalWhere - Condições adicionais
     * @returns {Promise<Array>} Lista de filas ativas
     */
    async findActive(additionalWhere = {}) {
        try {
            const where = {
                status: 0,
                ...additionalWhere
            }
            
            return await this.findAll(where)
        } catch (error) {
            console.error('[QueueRepository] Erro ao buscar filas ativas:', error)
            return []
        }
    }

    /**
     * Atualizar status da fila
     * @param {string} identificador - Identificador da fila
     * @param {number} status - Novo status
     * @param {number} schedule - Novo schedule (opcional)
     * @returns {Promise<Array>} Resultado da atualização
     */
    async updateStatus(identificador, status, schedule = null) {
        try {
            const values = { status: status }
            if (schedule !== null) {
                values.schedule = schedule
            }
            
            return await this.update(values, {
                identificador: identificador
            }, { multi: true })
        } catch (error) {
            console.error('[QueueRepository] Erro ao atualizar status:', error)
            return null
        }
    }

    /**
     * Buscar fila por produto
     * @param {string} product - Produto da fila
     * @returns {Promise<Object|null>} Fila encontrada
     */
    async findByProduct(product) {
        try {
            return await this.findOne({ product: product })
        } catch (error) {
            console.error('[QueueRepository] Erro ao buscar por produto:', error)
            return null
        }
    }

    /**
     * Buscar filas por credor
     * @param {string} credor - Credor da fila
     * @param {Object} options - Opções de busca
     * @returns {Promise<Array>} Lista de filas
     */
    async findByCreador(credor, options = {}) {
        try {
            return await this.findAll({ credor: credor }, options)
        } catch (error) {
            console.error('[QueueRepository] Erro ao buscar por credor:', error)
            return []
        }
    }

    /**
     * Buscar filas agendadas
     * @param {Object} additionalWhere - Condições adicionais
     * @returns {Promise<Array>} Lista de filas agendadas
     */
    async findScheduled(additionalWhere = {}) {
        try {
            const where = {
                schedule: 1,
                ...additionalWhere
            }
            
            return await this.findAll(where)
        } catch (error) {
            console.error('[QueueRepository] Erro ao buscar filas agendadas:', error)
            return []
        }
    }

    /**
     * Incrementar contador de entregas
     * @param {string} identificador - Identificador da fila
     * @param {number} increment - Quantidade a incrementar (padrão 1)
     * @returns {Promise<Array>} Resultado da atualização
     */
    async incrementEntregues(identificador, increment = 1) {
        try {
            // Primeiro buscar valor atual
            const queue = await this.findByIdentificador(identificador)
            if (!queue) return null
            
            const newValue = (queue.entregues || 0) + increment
            
            return await this.update({
                entregues: newValue
            }, {
                identificador: identificador
            })
        } catch (error) {
            console.error('[QueueRepository] Erro ao incrementar entregas:', error)
            return null
        }
    }

    /**
     * Incrementar contador de falhas
     * @param {string} identificador - Identificador da fila
     * @param {number} increment - Quantidade a incrementar (padrão 1)
     * @returns {Promise<Array>} Resultado da atualização
     */
    async incrementFalhas(identificador, increment = 1) {
        try {
            // Primeiro buscar valor atual
            const queue = await this.findByIdentificador(identificador)
            if (!queue) return null
            
            const newValue = (queue.falhas || 0) + increment
            
            return await this.update({
                falhas: newValue
            }, {
                identificador: identificador
            })
        } catch (error) {
            console.error('[QueueRepository] Erro ao incrementar falhas:', error)
            return null
        }
    }

    /**
     * Verificar se fila está completa (entregas + falhas >= registros)
     * @param {string} identificador - Identificador da fila
     * @returns {Promise<boolean>} True se completa, false caso contrário
     */
    async isComplete(identificador) {
        try {
            const queue = await this.findByIdentificador(identificador)
            if (!queue) return false
            
            const total = (queue.entregues || 0) + (queue.falhas || 0)
            return total >= (queue.registros || 0)
        } catch (error) {
            console.error('[QueueRepository] Erro ao verificar se completa:', error)
            return false
        }
    }

    /**
     * Buscar estatísticas da fila
     * @param {string} identificador - Identificador da fila
     * @returns {Promise<Object|null>} Estatísticas da fila
     */
    async getStats(identificador) {
        try {
            const queue = await this.findByIdentificador(identificador)
            if (!queue) return null
            
            const entregues = queue.entregues || 0
            const falhas = queue.falhas || 0
            const registros = queue.registros || 0
            const total = entregues + falhas
            const pendentes = registros - total
            const percentual = registros > 0 ? (total / registros) * 100 : 0
            
            return {
                identificador,
                entregues,
                falhas,
                registros,
                total,
                pendentes,
                percentual: Math.round(percentual * 100) / 100,
                isComplete: total >= registros
            }
        } catch (error) {
            console.error('[QueueRepository] Erro ao obter estatísticas:', error)
            return null
        }
    }
}

// Singleton instance
let instance = null

/**
 * Obter instância singleton do QueueRepository
 * @returns {QueueRepository} Instância do repositório
 */
export const getQueueRepository = () => {
    if (!instance) {
        instance = new QueueRepository()
    }
    return instance
}

// Exportar classe para casos onde múltiplas instâncias são necessárias
export { QueueRepository }

// Export default para facilitar importação
export default getQueueRepository