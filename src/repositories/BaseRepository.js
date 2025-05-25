// BaseRepository - Classe base para todos os repositórios
// Implementa operações CRUD básicas reutilizáveis

import getCacheService from '../services/CacheService.js'

/**
 * Repositório base que implementa operações CRUD comuns
 * Todos os repositórios específicos herdam desta classe
 */
class BaseRepository {
    constructor(model) {
        this.model = model
        this.cache = getCacheService()
        this.cachePrefix = model.name.toLowerCase()
        this.defaultCacheTTL = 300 // 5 minutos
    }

    /**
     * Criar novo registro e invalidar cache
     * @param {Object} data - Dados para criação
     * @returns {Promise<Object>} Registro criado
     */
    async create(data) {
        try {
            const result = await this.model.create(data)
            // Invalidar cache relacionado
            await this.cache.invalidatePattern(`${this.cachePrefix}:*`)
            return result
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao criar:`, error)
            throw error
        }
    }

    /**
     * Buscar por ID com cache
     * @param {number} id - ID do registro
     * @param {number} ttl - TTL do cache em segundos
     * @returns {Promise<Object|null>} Registro encontrado ou null
     */
    async findById(id, ttl = this.defaultCacheTTL) {
        try {
            const cacheKey = `${this.cachePrefix}:id:${id}`
            return await this.cache.get(cacheKey, async () => {
                return await this.model.findByPk(id)
            }, ttl)
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao buscar por ID:`, error)
            throw error
        }
    }

    /**
     * Buscar um registro por condições
     * @param {Object} where - Condições de busca
     * @param {Object} options - Opções adicionais (order, include, etc)
     * @returns {Promise<Object|null>} Registro encontrado ou null
     */
    async findOne(where, options = {}) {
        try {
            return await this.model.findOne({
                where,
                ...options
            })
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao buscar um:`, error)
            throw error
        }
    }

    /**
     * Buscar múltiplos registros
     * @param {Object} where - Condições de busca
     * @param {Object} options - Opções adicionais
     * @returns {Promise<Array>} Lista de registros
     */
    async findAll(where = {}, options = {}) {
        try {
            return await this.model.findAll({
                where,
                ...options
            })
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao buscar múltiplos:`, error)
            throw error
        }
    }

    /**
     * Atualizar registro(s) e invalidar cache
     * @param {Object} values - Valores para atualização
     * @param {Object} where - Condições para atualização
     * @param {Object} options - Opções adicionais
     * @returns {Promise<Array>} [quantidade_afetada, registros_afetados]
     */
    async update(values, where, options = {}) {
        try {
            const result = await this.model.update(values, {
                where,
                ...options
            })
            // Invalidar cache relacionado
            await this.cache.invalidatePattern(`${this.cachePrefix}:*`)
            return result
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao atualizar:`, error)
            throw error
        }
    }

    /**
     * Deletar registro(s) e invalidar cache
     * @param {Object} where - Condições para deleção
     * @returns {Promise<number>} Quantidade de registros deletados
     */
    async delete(where) {
        try {
            const result = await this.model.destroy({ where })
            // Invalidar cache relacionado
            await this.cache.invalidatePattern(`${this.cachePrefix}:*`)
            return result
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao deletar:`, error)
            throw error
        }
    }

    /**
     * Contar registros
     * @param {Object} where - Condições para contagem
     * @returns {Promise<number>} Quantidade de registros
     */
    async count(where = {}) {
        try {
            return await this.model.count({ where })
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao contar:`, error)
            throw error
        }
    }

    /**
     * Verificar se registro existe
     * @param {Object} where - Condições de busca
     * @returns {Promise<boolean>} True se existe, false caso contrário
     */
    async exists(where) {
        try {
            const count = await this.count(where)
            return count > 0
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao verificar existência:`, error)
            throw error
        }
    }

    /**
     * Buscar ou criar registro
     * @param {Object} where - Condições de busca
     * @param {Object} defaults - Valores padrão para criação
     * @returns {Promise<[Object, boolean]>} [registro, foi_criado]
     */
    async findOrCreate(where, defaults = {}) {
        try {
            return await this.model.findOrCreate({
                where,
                defaults
            })
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao buscar ou criar:`, error)
            throw error
        }
    }

    /**
     * Executar operação em transação
     * @param {Function} operation - Função que recebe a transação
     * @returns {Promise<any>} Resultado da operação
     */
    async transaction(operation) {
        const transaction = await this.model.sequelize.transaction()
        try {
            const result = await operation(transaction)
            await transaction.commit()
            return result
        } catch (error) {
            await transaction.rollback()
            console.error(`[${this.constructor.name}] Erro na transação:`, error)
            throw error
        }
    }

    /**
     * Obter modelo para operações avançadas
     * @returns {Object} Modelo Sequelize
     */
    getModel() {
        return this.model
    }

    /**
     * Criar cache key personalizada
     * @param {string} suffix - Sufixo da chave
     * @returns {string} Chave do cache
     */
    getCacheKey(suffix) {
        return `${this.cachePrefix}:${suffix}`
    }

    /**
     * Invalidar cache específico
     * @param {string} key - Chave para invalidar
     */
    async invalidateCache(key) {
        await this.cache.delete(key)
    }

    /**
     * Busca com cache customizável
     * @param {string} cacheKey - Chave do cache
     * @param {Function} queryFn - Função de consulta ao banco
     * @param {number} ttl - TTL em segundos
     * @returns {Promise<any>} Resultado da consulta
     */
    async findWithCache(cacheKey, queryFn, ttl = this.defaultCacheTTL) {
        return await this.cache.get(cacheKey, queryFn, ttl)
    }
}

export default BaseRepository