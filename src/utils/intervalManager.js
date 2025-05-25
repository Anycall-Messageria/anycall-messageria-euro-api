// IntervalManager - Sistema centralizado de gerenciamento de intervalos
// Implementação do item 3.3 - Cleanup de Intervalos

/**
 * Classe para gerenciamento centralizado de intervalos
 * Previne vazamentos de memória e facilita o cleanup
 */
class IntervalManager {
    constructor() {
        this.intervals = new Map()
        this.timeouts = new Map()
        this.isShuttingDown = false
        
        // Configurar limpeza automática no shutdown
        this.setupShutdownHandlers()
    }
    
    /**
     * Criar e gerenciar um interval
     * @param {string} key - Chave única para identificar o interval
     * @param {Function} callback - Função a ser executada
     * @param {number} delay - Delay em millisegundos
     * @param {Object} options - Opções adicionais
     */
    set(key, callback, delay, options = {}) {
        // Limpar interval existente se houver
        this.clear(key)
        
        // Validar parâmetros
        if (!key || typeof callback !== 'function' || delay < 0) {
            console.error(`[IntervalManager] Parâmetros inválidos para interval: ${key}`)
            return false
        }
        
        try {
            // Wrapper para callback com tratamento de erro
            const safeCallback = () => {
                try {
                    if (this.isShuttingDown) {
                        this.clear(key)
                        return
                    }
                    callback()
                } catch (error) {
                    console.error(`[IntervalManager] Erro no interval ${key}:`, error)
                    if (options.clearOnError) {
                        this.clear(key)
                    }
                }
            }
            
            const intervalId = setInterval(safeCallback, delay)
            
            // Armazenar metadata do interval
            this.intervals.set(key, {
                id: intervalId,
                callback,
                delay,
                created: Date.now(),
                options: { ...options }
            })
            
            console.log(`[IntervalManager] Interval criado: ${key} (${delay}ms)`)
            return true
            
        } catch (error) {
            console.error(`[IntervalManager] Erro ao criar interval ${key}:`, error)
            return false
        }
    }
    
    /**
     * Limpar um interval específico
     * @param {string} key - Chave do interval
     */
    clear(key) {
        const intervalData = this.intervals.get(key)
        if (intervalData) {
            clearInterval(intervalData.id)
            this.intervals.delete(key)
            console.log(`[IntervalManager] Interval removido: ${key}`)
            return true
        }
        return false
    }
    
    /**
     * Criar e gerenciar um timeout
     * @param {string} key - Chave única para identificar o timeout
     * @param {Function} callback - Função a ser executada
     * @param {number} delay - Delay em millisegundos
     */
    setTimeout(key, callback, delay) {
        // Limpar timeout existente se houver
        this.clearTimeout(key)
        
        if (!key || typeof callback !== 'function' || delay < 0) {
            console.error(`[IntervalManager] Parâmetros inválidos para timeout: ${key}`)
            return false
        }
        
        try {
            const safeCallback = () => {
                try {
                    this.timeouts.delete(key) // Auto-cleanup
                    if (!this.isShuttingDown) {
                        callback()
                    }
                } catch (error) {
                    console.error(`[IntervalManager] Erro no timeout ${key}:`, error)
                }
            }
            
            const timeoutId = setTimeout(safeCallback, delay)
            
            this.timeouts.set(key, {
                id: timeoutId,
                callback,
                delay,
                created: Date.now()
            })
            
            console.log(`[IntervalManager] Timeout criado: ${key} (${delay}ms)`)
            return true
            
        } catch (error) {
            console.error(`[IntervalManager] Erro ao criar timeout ${key}:`, error)
            return false
        }
    }
    
    /**
     * Limpar um timeout específico
     * @param {string} key - Chave do timeout
     */
    clearTimeout(key) {
        const timeoutData = this.timeouts.get(key)
        if (timeoutData) {
            clearTimeout(timeoutData.id)
            this.timeouts.delete(key)
            console.log(`[IntervalManager] Timeout removido: ${key}`)
            return true
        }
        return false
    }
    
    /**
     * Limpar todos os intervals
     */
    clearAll() {
        console.log(`[IntervalManager] Limpando ${this.intervals.size} intervals e ${this.timeouts.size} timeouts`)
        
        // Limpar intervals
        this.intervals.forEach((intervalData, key) => {
            clearInterval(intervalData.id)
        })
        this.intervals.clear()
        
        // Limpar timeouts
        this.timeouts.forEach((timeoutData, key) => {
            clearTimeout(timeoutData.id)
        })
        this.timeouts.clear()
        
        console.log(`[IntervalManager] Cleanup completo`)
    }
    
    /**
     * Verificar se um interval existe
     * @param {string} key - Chave do interval
     */
    exists(key) {
        return this.intervals.has(key) || this.timeouts.has(key)
    }
    
    /**
     * Obter informações sobre um interval
     * @param {string} key - Chave do interval
     */
    getInfo(key) {
        const interval = this.intervals.get(key)
        const timeout = this.timeouts.get(key)
        
        if (interval) {
            return {
                type: 'interval',
                key,
                delay: interval.delay,
                created: interval.created,
                age: Date.now() - interval.created,
                options: interval.options
            }
        }
        
        if (timeout) {
            return {
                type: 'timeout',
                key,
                delay: timeout.delay,
                created: timeout.created,
                age: Date.now() - timeout.created
            }
        }
        
        return null
    }
    
    /**
     * Listar todos os intervals ativos
     */
    listAll() {
        const result = {
            intervals: [],
            timeouts: [],
            total: this.intervals.size + this.timeouts.size
        }
        
        this.intervals.forEach((data, key) => {
            result.intervals.push({
                key,
                delay: data.delay,
                created: data.created,
                age: Date.now() - data.created,
                options: data.options
            })
        })
        
        this.timeouts.forEach((data, key) => {
            result.timeouts.push({
                key,
                delay: data.delay,
                created: data.created,
                age: Date.now() - data.created
            })
        })
        
        return result
    }
    
    /**
     * Limpar intervals antigos (mais de X ms)
     * @param {number} maxAge - Idade máxima em millisegundos
     */
    clearOld(maxAge = 3600000) { // 1 hora por padrão
        const now = Date.now()
        const oldIntervals = []
        
        this.intervals.forEach((data, key) => {
            if (now - data.created > maxAge) {
                oldIntervals.push(key)
            }
        })
        
        oldIntervals.forEach(key => {
            console.log(`[IntervalManager] Removendo interval antigo: ${key}`)
            this.clear(key)
        })
        
        return oldIntervals.length
    }
    
    /**
     * Configurar handlers para shutdown graceful
     */
    setupShutdownHandlers() {
        const shutdown = () => {
            console.log(`[IntervalManager] Iniciando shutdown graceful...`)
            this.isShuttingDown = true
            this.clearAll()
        }
        
        // Capturar sinais de shutdown
        process.on('SIGINT', shutdown)
        process.on('SIGTERM', shutdown)
        process.on('exit', shutdown)
        
        // Capturar uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error(`[IntervalManager] Uncaught exception:`, error)
            shutdown()
        })
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error(`[IntervalManager] Unhandled rejection:`, reason)
            shutdown()
        })
    }
    
    /**
     * Obter estatísticas de uso
     */
    getStats() {
        const now = Date.now()
        let totalIntervals = 0
        let totalTimeouts = 0
        let oldestInterval = now
        let newestInterval = 0
        
        this.intervals.forEach((data) => {
            totalIntervals++
            if (data.created < oldestInterval) oldestInterval = data.created
            if (data.created > newestInterval) newestInterval = data.created
        })
        
        this.timeouts.forEach((data) => {
            totalTimeouts++
        })
        
        return {
            intervals: {
                total: totalIntervals,
                oldest: totalIntervals > 0 ? now - oldestInterval : 0,
                newest: totalIntervals > 0 ? now - newestInterval : 0
            },
            timeouts: {
                total: totalTimeouts
            },
            memory: {
                intervalMapSize: this.intervals.size,
                timeoutMapSize: this.timeouts.size
            }
        }
    }
}

// Singleton instance
let instance = null

/**
 * Obter instância singleton do IntervalManager
 */
export const getIntervalManager = () => {
    if (!instance) {
        instance = new IntervalManager()
    }
    return instance
}

// Exportar classe para casos onde múltiplas instâncias são necessárias
export { IntervalManager }

// Export default para facilitar importação
export default getIntervalManager