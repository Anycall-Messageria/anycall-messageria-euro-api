// cacheRoute - Rotas para monitoramento de cache
// Permite visualizar estatísticas e controlar o cache

import { Router } from 'express'
import getCacheService from '../services/CacheService.js'

const router = Router()

// Instância compartilhada do cache para estatísticas
const cacheService = getCacheService()

/**
 * GET /cache/stats
 * Obter estatísticas do cache
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = cacheService.getStats()
        const redisInfo = await cacheService.getRedisInfo()
        
        res.json({
            success: true,
            data: {
                local: stats,
                redis: redisInfo,
                hitRate: stats.hits.total > 0 ? 
                    ((stats.hits.total / (stats.hits.total + stats.misses)) * 100).toFixed(2) + '%' : 
                    '0%'
            }
        })
    } catch (error) {
        console.error('[CacheRoute] Erro ao obter estatísticas:', error)
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        })
    }
})

/**
 * DELETE /cache/clear
 * Limpar todo o cache
 */
router.delete('/clear', async (req, res) => {
    try {
        await cacheService.clear()
        
        res.json({
            success: true,
            message: 'Cache limpo com sucesso'
        })
    } catch (error) {
        console.error('[CacheRoute] Erro ao limpar cache:', error)
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        })
    }
})

/**
 * DELETE /cache/clear/:pattern
 * Limpar cache por padrão
 */
router.delete('/clear/:pattern', async (req, res) => {
    try {
        const { pattern } = req.params
        await cacheService.invalidatePattern(pattern)
        
        res.json({
            success: true,
            message: `Cache limpo para padrão: ${pattern}`
        })
    } catch (error) {
        console.error('[CacheRoute] Erro ao limpar cache por padrão:', error)
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        })
    }
})

/**
 * POST /cache/warm
 * Aquecimento de cache (pré-carregamento de dados frequentes)
 */
router.post('/warm', async (req, res) => {
    try {
        // Aqui você pode implementar lógica de aquecimento específica
        // Por exemplo, pré-carregar campanhas ativas, sessões etc.
        
        res.json({
            success: true,
            message: 'Aquecimento de cache iniciado (implementar lógica específica)'
        })
    } catch (error) {
        console.error('[CacheRoute] Erro no aquecimento de cache:', error)
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        })
    }
})

/**
 * GET /cache/health
 * Verificar saúde do sistema de cache
 */
router.get('/health', async (req, res) => {
    try {
        const redisConnected = await cacheService.isRedisConnected()
        const localCacheSize = cacheService.getLocalCacheSize()
        
        res.json({
            success: true,
            data: {
                redis: {
                    connected: redisConnected,
                    status: redisConnected ? 'healthy' : 'disconnected'
                },
                local: {
                    size: localCacheSize,
                    status: 'healthy'
                },
                overall: redisConnected ? 'healthy' : 'degraded'
            }
        })
    } catch (error) {
        console.error('[CacheRoute] Erro ao verificar saúde do cache:', error)
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        })
    }
})

export default router