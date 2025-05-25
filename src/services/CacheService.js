// CacheService - Sistema de Cache Híbrido (Memory + Redis)
// Implementação da Cache Strategy 4.2

import getRedisClient from '../lib/redis.js'

/**
 * Serviço de cache híbrido que combina cache local e Redis
 * 
 * Estratégia de 3 níveis:
 * L1 (Memory): ~0.1ms - Cache local mais rápido
 * L2 (Redis):  ~1-5ms - Cache distribuído 
 * L3 (Database): ~20-100ms - Fonte de verdade
 */
class CacheService {
    constructor() {
        this.redis = getRedisClient()
        this.localCache = new Map()
        this.localTTLs = new Map()
        
        // Configurações
        this.maxLocalSize = parseInt(process.env.CACHE_LOCAL_MAX_SIZE) || 500
        this.defaultTTL = parseInt(process.env.CACHE_DEFAULT_TTL) || 300
        this.useRedis = process.env.CACHE_REDIS_ENABLED !== 'false'
        
        // Estatísticas
        this.stats = {
            hits: { local: 0, redis: 0, total: 0 },
            misses: 0,
            sets: 0,
            errors: { redis: 0, local: 0 }
        }
        
        // Verificar disponibilidade do Redis
        this.checkRedisAvailability()
        
        // Limpeza periódica do cache local
        this.setupLocalCacheCleanup()
        
        console.log(`🎯 [CacheService] Inicializado - Local: ${this.maxLocalSize} itens, TTL padrão: ${this.defaultTTL}s`)
    }
    
    /**
     * Verificar se Redis está disponível
     */
    async checkRedisAvailability() {
        if (!this.useRedis) {
            console.log('📝 [CacheService] Redis desabilitado por configuração')
            return
        }
        
        try {
            const isAvailable = await this.redis.ping()
            if (isAvailable) {
                console.log('✅ [CacheService] Redis disponível - Cache híbrido ativo')
            } else {
                console.warn('⚠️ [CacheService] Redis indisponível - Cache apenas local')
                this.useRedis = false
            }
        } catch (error) {
            console.warn('⚠️ [CacheService] Erro ao verificar Redis:', error.message)
            this.useRedis = false
        }
    }
    
    /**
     * Configurar limpeza automática do cache local
     */
    setupLocalCacheCleanup() {
        // Limpeza a cada 5 minutos
        setInterval(() => {
            this.cleanupExpiredLocalCache()
        }, 5 * 60 * 1000)
        
        // Limpeza de estatísticas a cada hora
        setInterval(() => {
            this.resetStats()
        }, 60 * 60 * 1000)
    }
    
    /**
     * Obter valor do cache com fallback para database
     * @param {string} key - Chave do cache
     * @param {Function} fallback - Função para buscar dados se não estiver em cache
     * @param {number} ttl - Time to live em segundos
     * @returns {Promise<any>} Dados do cache ou database
     */
    async get(key, fallback = null, ttl = this.defaultTTL) {
        try {
            // L1: Cache local (mais rápido)
            const localData = this.getLocal(key)
            if (localData !== null) {
                this.stats.hits.local++
                this.stats.hits.total++
                return localData
            }
            
            // L2: Redis (rápido, compartilhado)
            if (this.useRedis) {
                const redisData = await this.getRedis(key)
                if (redisData !== null) {
                    // Salvar no cache local para próximas consultas
                    this.setLocal(key, redisData, ttl)
                    this.stats.hits.redis++
                    this.stats.hits.total++
                    return redisData
                }
            }
            
            // L3: Database (fonte de verdade)
            if (fallback && typeof fallback === 'function') {
                const data = await fallback()
                if (data !== null && data !== undefined) {
                    // Salvar em ambos os caches para futuras consultas
                    await this.set(key, data, ttl)
                }
                this.stats.misses++
                return data
            }
            
            this.stats.misses++
            return null
            
        } catch (error) {
            console.error(`[CacheService] Erro ao obter cache para key "${key}":`, error.message)
            this.stats.errors.local++
            
            // Em caso de erro, tentar fallback direto
            if (fallback && typeof fallback === 'function') {
                try {
                    return await fallback()
                } catch (fallbackError) {
                    console.error(`[CacheService] Fallback falhou para key "${key}":`, fallbackError.message)
                    return null
                }
            }
            return null
        }
    }
    
    /**
     * Definir valor no cache (ambos os níveis)
     * @param {string} key - Chave do cache
     * @param {any} data - Dados para cache
     * @param {number} ttl - Time to live em segundos
     * @returns {Promise<boolean>} Sucesso da operação
     */
    async set(key, data, ttl = this.defaultTTL) {
        try {
            // Sempre salvar no cache local
            this.setLocal(key, data, ttl)
            
            // Salvar no Redis se disponível
            if (this.useRedis) {
                await this.setRedis(key, data, ttl)
            }
            
            this.stats.sets++
            return true
            
        } catch (error) {
            console.error(`[CacheService] Erro ao definir cache para key "${key}":`, error.message)
            this.stats.errors.local++
            return false
        }
    }
    
    /**
     * Invalidar cache por chave específica
     * @param {string} key - Chave para invalidar
     * @returns {Promise<boolean>} Sucesso da operação
     */
    async invalidate(key) {
        try {
            // Remover do cache local
            this.localCache.delete(key)
            this.clearLocalTTL(key)
            
            // Remover do Redis
            if (this.useRedis) {
                await this.redis.del(key)
            }
            
            return true
        } catch (error) {
            console.error(`[CacheService] Erro ao invalidar cache para key "${key}":`, error.message)
            return false
        }
    }
    
    /**
     * Invalidar cache por padrão (wildcards)
     * @param {string} pattern - Padrão para invalidar (ex: "campaign:*")
     * @returns {Promise<number>} Número de chaves invalidadas
     */
    async invalidatePattern(pattern) {
        try {
            let invalidated = 0
            
            // Invalidar cache local
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'))
                const localKeys = Array.from(this.localCache.keys())
                
                localKeys.forEach(key => {
                    if (regex.test(key)) {
                        this.localCache.delete(key)
                        this.clearLocalTTL(key)
                        invalidated++
                    }
                })
            } else {
                if (this.localCache.has(pattern)) {
                    this.localCache.delete(pattern)
                    this.clearLocalTTL(pattern)
                    invalidated++
                }
            }
            
            // Invalidar Redis
            if (this.useRedis) {
                const redisInvalidated = await this.redis.delPattern(pattern)
                invalidated += redisInvalidated
            }
            
            console.log(`[CacheService] Invalidadas ${invalidated} chaves com padrão "${pattern}"`)
            return invalidated
            
        } catch (error) {
            console.error(`[CacheService] Erro ao invalidar padrão "${pattern}":`, error.message)
            return 0
        }
    }
    
    /**
     * Verificar se chave existe no cache
     * @param {string} key - Chave para verificar
     * @returns {Promise<boolean>} Se existe no cache
     */
    async exists(key) {
        try {
            // Verificar cache local primeiro
            if (this.localCache.has(key)) {
                return true
            }
            
            // Verificar Redis
            if (this.useRedis) {
                return await this.redis.exists(key)
            }
            
            return false
        } catch (error) {
            console.error(`[CacheService] Erro ao verificar existência de "${key}":`, error.message)
            return false
        }
    }
    
    /**
     * Obter dados apenas do cache local
     */
    getLocal(key) {
        if (!this.localCache.has(key)) {
            return null
        }
        
        // Verificar TTL
        const ttlData = this.localTTLs.get(key)
        if (ttlData && Date.now() > ttlData.expires) {
            this.localCache.delete(key)
            this.localTTLs.delete(key)
            return null
        }
        
        return this.localCache.get(key)
    }
    
    /**
     * Definir dados no cache local
     */
    setLocal(key, data, ttl) {
        // Verificar limite de tamanho
        if (this.localCache.size >= this.maxLocalSize) {
            this.evictOldestLocal()
        }
        
        this.localCache.set(key, data)
        
        // Configurar TTL
        if (ttl > 0) {
            this.localTTLs.set(key, {
                expires: Date.now() + (ttl * 1000)
            })
        }
    }
    
    /**
     * Obter dados do Redis
     */
    async getRedis(key) {
        try {
            const cached = await this.redis.get(key)
            return cached ? JSON.parse(cached) : null
        } catch (error) {
            console.warn(`[CacheService] Redis GET falhou para "${key}":`, error.message)
            this.stats.errors.redis++
            return null
        }
    }
    
    /**
     * Definir dados no Redis
     */
    async setRedis(key, data, ttl) {
        try {
            const serialized = JSON.stringify(data)
            return await this.redis.set(key, serialized, ttl)
        } catch (error) {
            console.warn(`[CacheService] Redis SET falhou para "${key}":`, error.message)
            this.stats.errors.redis++
            return false
        }
    }
    
    /**
     * Remover item mais antigo do cache local
     */
    evictOldestLocal() {
        const firstKey = this.localCache.keys().next().value
        if (firstKey) {
            this.localCache.delete(firstKey)
            this.clearLocalTTL(firstKey)
        }
    }
    
    /**
     * Limpar TTL local de uma chave
     */
    clearLocalTTL(key) {
        this.localTTLs.delete(key)
    }
    
    /**
     * Limpar cache local expirado
     */
    cleanupExpiredLocalCache() {
        const now = Date.now()
        let cleaned = 0
        
        this.localTTLs.forEach((ttlData, key) => {
            if (now > ttlData.expires) {
                this.localCache.delete(key)
                this.localTTLs.delete(key)
                cleaned++
            }
        })
        
        if (cleaned > 0) {
            console.log(`[CacheService] Limpeza automática: ${cleaned} itens expirados removidos`)
        }
    }
    
    /**
     * Resetar estatísticas
     */
    resetStats() {
        const oldStats = { ...this.stats }
        this.stats = {
            hits: { local: 0, redis: 0, total: 0 },
            misses: 0,
            sets: 0,
            errors: { redis: 0, local: 0 }
        }
        
        console.log('[CacheService] Estatísticas resetadas:', {
            hitRate: oldStats.hits.total > 0 ? 
                Math.round((oldStats.hits.total / (oldStats.hits.total + oldStats.misses)) * 100) + '%' : '0%',
            ...oldStats
        })
    }
    
    /**
     * Obter estatísticas do cache
     */
    getStats() {
        const total = this.stats.hits.total + this.stats.misses
        const hitRate = total > 0 ? (this.stats.hits.total / total) * 100 : 0
        
        return {
            hitRate: Math.round(hitRate * 100) / 100,
            hits: this.stats.hits,
            misses: this.stats.misses,
            sets: this.stats.sets,
            errors: this.stats.errors,
            localCacheSize: this.localCache.size,
            maxLocalSize: this.maxLocalSize,
            redisAvailable: this.useRedis,
            strategy: this.useRedis ? 'Hybrid (Memory + Redis)' : 'Memory Only'
        }
    }

    /**
     * Verificar se Redis está conectado
     * @returns {Promise<boolean>} Status da conexão
     */
    async isRedisConnected() {
        if (!this.useRedis) return false
        
        try {
            const result = await this.redis.ping()
            return result === 'PONG'
        } catch (error) {
            return false
        }
    }

    /**
     * Obter informações do Redis
     * @returns {Promise<Object>} Informações do Redis
     */
    async getRedisInfo() {
        if (!this.useRedis) {
            return { connected: false, status: 'disabled' }
        }
        
        try {
            const info = await this.redis.info('memory')
            const keyCount = await this.redis.dbsize()
            
            return {
                connected: true,
                status: 'connected',
                memory: info,
                keyCount: keyCount
            }
        } catch (error) {
            return {
                connected: false,
                status: 'error',
                error: error.message
            }
        }
    }

    /**
     * Obter tamanho do cache local
     * @returns {number} Número de itens no cache local
     */
    getLocalCacheSize() {
        return this.localCache.size
    }
    
    /**
     * Limpar todo o cache
     */
    async clear() {
        try {
            // Limpar cache local
            this.localCache.clear()
            this.localTTLs.clear()
            
            // Limpar Redis (apenas chaves do sistema)
            if (this.useRedis) {
                await this.redis.delPattern('anycall:*')
            }
            
            console.log('[CacheService] Cache completamente limpo')
            return true
        } catch (error) {
            console.error('[CacheService] Erro ao limpar cache:', error.message)
            return false
        }
    }
}

// Singleton instance
let instance = null

/**
 * Obter instância singleton do CacheService
 * @returns {CacheService} Instância do serviço de cache
 */
export const getCacheService = () => {
    if (!instance) {
        instance = new CacheService()
    }
    return instance
}

// Configurar limpeza no shutdown
process.on('SIGINT', async () => {
    if (instance) {
        console.log('[CacheService] Shutdown graceful...')
    }
})

// Exportar classe e função getter
export { CacheService }
export default getCacheService