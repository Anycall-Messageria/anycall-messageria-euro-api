// BaseRepository - Classe base para todos os repositórios
// Implementa operações CRUD básicas reutilizáveis

/**
 * Repositório base que implementa operações CRUD comuns
 * Todos os repositórios específicos herdam desta classe
 */
class BaseRepository {
    constructor(model) {
        this.model = model
    }

    /**
     * Criar novo registro
     * @param {Object} data - Dados para criação
     * @returns {Promise<Object>} Registro criado
     */
    async create(data) {
        try {
            return await this.model.create(data)
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao criar:`, error)
            throw error
        }
    }

    /**
     * Buscar por ID
     * @param {number} id - ID do registro
     * @returns {Promise<Object|null>} Registro encontrado ou null
     */
    async findById(id) {
        try {
            return await this.model.findByPk(id)
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
     * Atualizar registro(s)
     * @param {Object} values - Valores para atualização
     * @param {Object} where - Condições para atualização
     * @param {Object} options - Opções adicionais
     * @returns {Promise<Array>} [quantidade_afetada, registros_afetados]
     */
    async update(values, where, options = {}) {
        try {
            return await this.model.update(values, {
                where,
                ...options
            })
        } catch (error) {
            console.error(`[${this.constructor.name}] Erro ao atualizar:`, error)
            throw error
        }
    }

    /**
     * Deletar registro(s)
     * @param {Object} where - Condições para deleção
     * @returns {Promise<number>} Quantidade de registros deletados
     */
    async delete(where) {
        try {
            return await this.model.destroy({ where })
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
}

export default BaseRepository