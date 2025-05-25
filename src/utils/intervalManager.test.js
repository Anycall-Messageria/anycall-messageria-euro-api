// Teste e demonstração do IntervalManager
// Este arquivo demonstra o uso e funcionalidades do IntervalManager

import getIntervalManager, { IntervalManager } from './intervalManager.js'

// Função de teste básico
function testBasicFunctionality() {
    console.log('=== Teste Básico do IntervalManager ===')
    
    const manager = getIntervalManager()
    
    // Teste 1: Criar interval
    console.log('1. Criando interval de teste...')
    const success = manager.set('test-interval', () => {
        console.log('  ✓ Interval executado:', new Date().toISOString())
    }, 1000)
    
    console.log('  Status da criação:', success ? 'Sucesso' : 'Falha')
    
    // Teste 2: Verificar se existe
    console.log('2. Verificando se interval existe...')
    console.log('  Existe:', manager.exists('test-interval'))
    
    // Teste 3: Obter informações
    console.log('3. Informações do interval:')
    const info = manager.getInfo('test-interval')
    console.log('  Info:', info)
    
    // Teste 4: Criar timeout
    console.log('4. Criando timeout de teste...')
    manager.setTimeout('test-timeout', () => {
        console.log('  ✓ Timeout executado!')
    }, 3000)
    
    // Teste 5: Listar todos
    setTimeout(() => {
        console.log('5. Listando todos os intervals/timeouts:')
        const all = manager.listAll()
        console.log('  Total:', all.total)
        console.log('  Intervals:', all.intervals.length)
        console.log('  Timeouts:', all.timeouts.length)
        
        // Teste 6: Estatísticas
        console.log('6. Estatísticas:')
        const stats = manager.getStats()
        console.log('  Stats:', stats)
        
        // Teste 7: Limpeza
        setTimeout(() => {
            console.log('7. Limpando interval específico...')
            manager.clear('test-interval')
            console.log('  Interval removido. Existe ainda?', manager.exists('test-interval'))
            
            setTimeout(() => {
                console.log('8. Limpeza geral...')
                manager.clearAll()
                console.log('  Total após limpeza:', manager.listAll().total)
            }, 2000)
        }, 5000)
    }, 2000)
}

// Função de teste de erro handling
function testErrorHandling() {
    console.log('\n=== Teste de Error Handling ===')
    
    const manager = new IntervalManager() // Nova instância para testes
    
    // Teste 1: Parâmetros inválidos
    console.log('1. Testando parâmetros inválidos...')
    const result1 = manager.set('', () => {}, 1000) // Key vazia
    const result2 = manager.set('test', null, 1000) // Callback nulo
    const result3 = manager.set('test', () => {}, -1) // Delay negativo
    
    console.log('  Key vazia:', result1 ? 'Passou (erro)' : 'Rejeitado (correto)')
    console.log('  Callback nulo:', result2 ? 'Passou (erro)' : 'Rejeitado (correto)')
    console.log('  Delay negativo:', result3 ? 'Passou (erro)' : 'Rejeitado (correto)')
    
    // Teste 2: Callback com erro
    console.log('2. Testando callback com erro...')
    manager.set('error-test', () => {
        throw new Error('Erro intencional no callback')
    }, 1000, { clearOnError: true })
    
    setTimeout(() => {
        console.log('  Interval ainda existe após erro?', manager.exists('error-test'))
    }, 2000)
}

// Função de teste de performance
function testPerformance() {
    console.log('\n=== Teste de Performance ===')
    
    const manager = new IntervalManager()
    const startTime = Date.now()
    
    // Criar muitos intervals
    console.log('1. Criando 100 intervals...')
    for (let i = 0; i < 100; i++) {
        manager.set(`perf-test-${i}`, () => {
            // Noop
        }, 10000) // 10 segundos (não executarão durante o teste)
    }
    
    const createTime = Date.now() - startTime
    console.log(`  Tempo para criar 100 intervals: ${createTime}ms`)
    
    // Testar listagem
    const listStart = Date.now()
    const list = manager.listAll()
    const listTime = Date.now() - listStart
    console.log(`  Tempo para listar ${list.total} intervals: ${listTime}ms`)
    
    // Testar limpeza
    const clearStart = Date.now()
    manager.clearAll()
    const clearTime = Date.now() - clearStart
    console.log(`  Tempo para limpar todos os intervals: ${clearTime}ms`)
}

// Função de teste de memory cleanup
function testMemoryCleanup() {
    console.log('\n=== Teste de Memory Cleanup ===')
    
    const manager = new IntervalManager()
    
    // Criar intervals antigos (simular)
    console.log('1. Criando intervals com timestamps antigos...')
    for (let i = 0; i < 5; i++) {
        const success = manager.set(`old-interval-${i}`, () => {}, 10000)
        if (success) {
            // Simular idade alterando o timestamp
            const intervalData = manager.intervals?.get(`old-interval-${i}`)
            if (intervalData) {
                intervalData.created = Date.now() - (2 * 60 * 60 * 1000) // 2 horas atrás
            }
        }
    }
    
    // Criar intervals novos
    for (let i = 0; i < 3; i++) {
        manager.set(`new-interval-${i}`, () => {}, 10000)
    }
    
    console.log('2. Total antes da limpeza:', manager.listAll().total)
    
    // Limpar intervals antigos (mais de 1 hora)
    const cleaned = manager.clearOld(60 * 60 * 1000)
    console.log(`3. Intervals antigos removidos: ${cleaned}`)
    console.log('4. Total após limpeza:', manager.listAll().total)
    
    // Limpeza final
    manager.clearAll()
}

// Executar testes se arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🧪 Iniciando testes do IntervalManager...\n')
    
    testBasicFunctionality()
    
    setTimeout(() => {
        testErrorHandling()
        
        setTimeout(() => {
            testPerformance()
            
            setTimeout(() => {
                testMemoryCleanup()
                
                setTimeout(() => {
                    console.log('\n✅ Todos os testes concluídos!')
                    process.exit(0)
                }, 1000)
            }, 1000)
        }, 3000)
    }, 10000)
}

export {
    testBasicFunctionality,
    testErrorHandling,
    testPerformance,
    testMemoryCleanup
}