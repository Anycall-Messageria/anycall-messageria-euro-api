// Redis Client - Configuração para Cache Strategy
// Conecta ao Redis local do Ubuntu 22.04

import Redis from 'ioredis'

/**
 * Cliente Redis otimizado para o sistema de mensageria
 * Configurado para trabalhar com Redis local do Ubuntu
 */
class RedisClient {
    constructor() {
        this.redis = null
        this.isConnected = false
        this.connectionAttempts = 0
        this.maxConnectionAttempts = 5
        
        this.config = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            db: parseInt(process.env.REDIS_DB) || 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            keepAlive: true,
            connectTimeout: 10000,
            commandTimeout: 5000
        }
        
        this.connect()
    }
    
    /**
     * Estabelecer conexão com Redis
     */
    async connect() {
        try {
            this.redis = new Redis(this.config)
            this.setupEventHandlers()
            await this.redis.connect()
        } catch (error) {
            console.error('[Redis] Erro na conexão inicial:', error.message)
            this.handleConnectionError()
        }
    }
    
    /**
     * Configurar event handlers do Redis
     */
    setupEventHandlers() {
        this.redis.on('connect', () => {
            console.log('✅ [Redis] Conectado ao servidor Redis')
            this.isConnected = true
            this.connectionAttempts = 0
        })
        
        this.redis.on('ready', () => {
            console.log('🚀 [Redis] Cliente pronto para operações')
        })
        
        this.redis.on('error', (error) => {
            console.warn('⚠️ [Redis] Erro de conexão:', error.message)
            this.isConnected = false
        })
        
        this.redis.on('close', () => {
            console.log('🔌 [Redis] Conexão fechada')
            this.isConnected = false
        })
        
        this.redis.on('reconnecting', () => {
            console.log('🔄 [Redis] Tentando reconectar...')
        })
    }
    
    /**
     * Tratar erros de conexão
     */
    handleConnectionError() {
        this.connectionAttempts++
        this.isConnected = false
        
        if (this.connectionAttempts < this.maxConnectionAttempts) {
            const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000)
            console.log(`[Redis] Tentativa ${this.connectionAttempts}/${this.maxConnectionAttempts} em ${delay}ms`)
            
            setTimeout(() => {
                this.connect()
            }, delay)
        } else {
            console.error('[Redis] Máximo de tentativas de conexão atingido. Cache funcionará apenas em memória.')
        }
    }
    
    /**
     * Verificar se Redis está disponível
     */
    async ping() {
        try {
            if (!this.isConnected || !this.redis) return false
            const result = await this.redis.ping()
            return result === 'PONG'
        } catch (error) {
            console.warn('[Redis] Ping falhou:', error.message)
            return false
        }
    }
    
    /**
     * Obter valor do cache
     */
    async get(key) {
        try {
            if (!this.isConnected || !this.redis) return null
            return await this.redis.get(key)
        } catch (error) {
            console.warn(`[Redis] GET falhou para key "${key}":`, error.message)
            return null
        }
    }
    
    /**
     * Definir valor no cache
     */
    async set(key, value, ttl = 300) {
        try {
            if (!this.isConnected || !this.redis) return false
            
            if (ttl > 0) {
                return await this.redis.setex(key, ttl, value)
            } else {
                return await this.redis.set(key, value)
            }
        } catch (error) {
            console.warn(`[Redis] SET falhou para key "${key}":`, error.message)
            return false
        }
    }
    
    /**
     * Deletar valor do cache
     */
    async del(key) {
        try {
            if (!this.isConnected || !this.redis) return false
            return await this.redis.del(key)
        } catch (error) {
            console.warn(`[Redis] DEL falhou para key "${key}":`, error.message)
            return false
        }
    }
    
    /**
     * Deletar múltiplas chaves por padrão
     */
    async delPattern(pattern) {
        try {
            if (!this.isConnected || !this.redis) return 0
            
            const keys = await this.redis.keys(pattern)
            if (keys.length === 0) return 0
            
            return await this.redis.del(...keys)
        } catch (error) {
            console.warn(`[Redis] DEL pattern falhou para pattern "${pattern}":`, error.message)
            return 0
        }
    }
    
    /**
     * Verificar se chave existe
     */
    async exists(key) {
        try {
            if (!this.isConnected || !this.redis) return false
            const result = await this.redis.exists(key)
            return result === 1
        } catch (error) {
            console.warn(`[Redis] EXISTS falhou para key "${key}":`, error.message)
            return false
        }
    }
    
    /**
     * Definir TTL para uma chave existente
     */
    async expire(key, ttl) {
        try {
            if (!this.isConnected || !this.redis) return false
            return await this.redis.expire(key, ttl)
        } catch (error) {
            console.warn(`[Redis] EXPIRE falhou para key "${key}":`, error.message)
            return false
        }
    }
    
    /**
     * Obter TTL de uma chave
     */
    async ttl(key) {
        try {
            if (!this.isConnected || !this.redis) return -1
            return await this.redis.ttl(key)
        } catch (error) {
            console.warn(`[Redis] TTL falhou para key "${key}":`, error.message)
            return -1
        }
    }
    
    /**
     * Incrementar valor numérico
     */
    async incr(key, increment = 1) {
        try {
            if (!this.isConnected || !this.redis) return null
            
            if (increment === 1) {
                return await this.redis.incr(key)
            } else {
                return await this.redis.incrby(key, increment)
            }
        } catch (error) {
            console.warn(`[Redis] INCR falhou para key "${key}":`, error.message)
            return null
        }
    }
    
    /**
     * Obter informações do Redis
     */
    async info() {
        try {
            if (!this.isConnected || !this.redis) return null
            return await this.redis.info()
        } catch (error) {
            console.warn('[Redis] INFO falhou:', error.message)
            return null
        }
    }
    
    /**
     * Obter estatísticas de conexão
     */
    getConnectionStats() {
        return {
            isConnected: this.isConnected,
            connectionAttempts: this.connectionAttempts,
            maxConnectionAttempts: this.maxConnectionAttempts,
            config: {
                host: this.config.host,
                port: this.config.port,
                db: this.config.db
            }
        }
    }
    
    /**
     * Fechar conexão gracefully
     */
    async disconnect() {
        try {
            if (this.redis) {
                await this.redis.quit()
                console.log('[Redis] Desconectado gracefully')
            }
        } catch (error) {
            console.warn('[Redis] Erro ao desconectar:', error.message)
        } finally {
            this.isConnected = false
            this.redis = null
        }
    }
}

// Singleton instance
let instance = null

/**
 * Obter instância singleton do RedisClient
 * @returns {RedisClient} Instância do cliente Redis
 */
export const getRedisClient = () => {
    if (!instance) {
        instance = new RedisClient()
    }
    return instance
}

// Configurar cleanup no shutdown da aplicação
process.on('SIGINT', async () => {
    if (instance) {
        await instance.disconnect()
    }
})

process.on('SIGTERM', async () => {
    if (instance) {
        await instance.disconnect()
    }
})

// Exportar classe e função getter
export { RedisClient }
export default getRedisClient