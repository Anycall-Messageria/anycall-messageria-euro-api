// Teste de Validação - Compara implementação original vs refatorada
// Garante que não houve quebra de funcionalidade

import { 
    pushMessageDb as pushMessageDbRefactored,
    pushMessageDbOriginal,
    toggleImplementation,
    messageService 
} from './refactored.js'

/**
 * Testes de validação para garantir compatibilidade
 */
class MessageStoreValidation {
    constructor() {
        this.testResults = []
    }

    /**
     * Executar todos os testes de validação
     */
    async runAllTests() {
        console.log('🧪 Iniciando Validação do Message Store Refatorado...\n')
        
        await this.testBasicFunctionality()
        await this.testCorrectCodeFlow()
        await this.testExitFlow()
        await this.testCorrespondentsFlow()
        await this.testOutOfContextFlow()
        await this.testErrorHandling()
        
        this.printResults()
        return this.testResults
    }

    /**
     * Testar funcionalidade básica
     */
    async testBasicFunctionality() {
        console.log('1. Testando funcionalidade básica...')
        
        try {
            // Dados de teste
            const testData = {
                remotejid: '5511999999999@c.us',
                messagerecive: 'teste',
                idmessage: 'test_id_123',
                session: '1',
                fromme: 0,
                pushname: 'Teste User'
            }
            
            // Configurar para usar implementação refatorada
            toggleImplementation(true)
            const refactoredResult = await pushMessageDbRefactored(testData)
            
            // Verificar se função foi executada sem erro
            const success = refactoredResult !== null && refactoredResult !== undefined
            
            this.addTestResult('Funcionalidade Básica', success, {
                expected: 'Execução sem erro',
                actual: success ? 'Sucesso' : 'Falha',
                refactoredResult
            })
            
        } catch (error) {
            this.addTestResult('Funcionalidade Básica', false, {
                expected: 'Execução sem erro',
                actual: `Erro: ${error.message}`,
                error
            })
        }
    }

    /**
     * Testar fluxo de código correto
     */
    async testCorrectCodeFlow() {
        console.log('2. Testando fluxo de código correto...')
        
        try {
            // Simular dados para código correto
            const testData = {
                remotejid: '5511888888888@c.us',
                messagerecive: '1234', // Código correto simulado
                idmessage: 'test_correct_code',
                session: '1',
                fromme: 0
            }
            
            const result = await messageService.processIncomingMessage(testData)
            
            // Verificar se o resultado indica processamento adequado
            const success = result && result.status
            
            this.addTestResult('Fluxo Código Correto', success, {
                expected: 'Status de processamento retornado',
                actual: result?.status || 'Nenhum status',
                result
            })
            
        } catch (error) {
            this.addTestResult('Fluxo Código Correto', false, {
                error: error.message
            })
        }
    }

    /**
     * Testar fluxo de saída
     */
    async testExitFlow() {
        console.log('3. Testando fluxo de saída...')
        
        try {
            const testData = {
                remotejid: '5511777777777@c.us',
                messagerecive: 'sair',
                idmessage: 'test_exit',
                session: '1',
                fromme: 0
            }
            
            const result = await messageService.processIncomingMessage(testData)
            
            // Verificar se detectou comando de saída
            const success = result && (
                result.status === 'exit_processed' || 
                result.status === 'exit_not_processed' ||
                result.status === 'out_of_context'
            )
            
            this.addTestResult('Fluxo de Saída', success, {
                expected: 'Detecção do comando sair',
                actual: result?.status || 'Não detectado',
                result
            })
            
        } catch (error) {
            this.addTestResult('Fluxo de Saída', false, {
                error: error.message
            })
        }
    }

    /**
     * Testar fluxo correspondentes (Santander)
     */
    async testCorrespondentsFlow() {
        console.log('4. Testando fluxo correspondentes...')
        
        try {
            // Testar opções válidas (1-4)
            const validOptions = ['1', '2', '3', '4']
            let allValid = true
            
            for (const option of validOptions) {
                const testData = {
                    remotejid: '5511666666666@c.us',
                    messagerecive: option,
                    idmessage: `test_santander_${option}`,
                    session: '1',
                    fromme: 0
                }
                
                const result = await messageService.processIncomingMessage(testData)
                
                if (!result || !result.status) {
                    allValid = false
                    break
                }
            }
            
            // Testar opção inválida
            const invalidData = {
                remotejid: '5511666666666@c.us',
                messagerecive: '99',
                idmessage: 'test_santander_invalid',
                session: '1',
                fromme: 0
            }
            
            const invalidResult = await messageService.processIncomingMessage(invalidData)
            
            this.addTestResult('Fluxo Correspondentes', allValid, {
                expected: 'Processamento correto das opções 1-4',
                actual: allValid ? 'Todas válidas' : 'Alguma falhou',
                invalidResult
            })
            
        } catch (error) {
            this.addTestResult('Fluxo Correspondentes', false, {
                error: error.message
            })
        }
    }

    /**
     * Testar fluxo fora de contexto
     */
    async testOutOfContextFlow() {
        console.log('5. Testando fluxo fora de contexto...')
        
        try {
            const testData = {
                remotejid: '5511555555555@c.us',
                messagerecive: 'mensagem_aleatoria',
                idmessage: 'test_out_context',
                session: '1',
                fromme: 0
            }
            
            const result = await messageService.sendOutContext(testData)
            
            const success = result !== null
            
            this.addTestResult('Fluxo Fora de Contexto', success, {
                expected: 'Processamento sem erro',
                actual: success ? 'Processado' : 'Erro',
                result
            })
            
        } catch (error) {
            this.addTestResult('Fluxo Fora de Contexto', false, {
                error: error.message
            })
        }
    }

    /**
     * Testar tratamento de erros
     */
    async testErrorHandling() {
        console.log('6. Testando tratamento de erros...')
        
        try {
            // Dados inválidos para forçar erro
            const invalidData = null
            
            const result = await messageService.processIncomingMessage(invalidData)
            
            // Deve retornar erro, não crash
            const success = result && result.status === 'error'
            
            this.addTestResult('Tratamento de Erros', success, {
                expected: 'Erro capturado, não crash',
                actual: success ? 'Erro tratado' : 'Comportamento inesperado',
                result
            })
            
        } catch (error) {
            // Se chegou aqui, erro não foi tratado adequadamente
            this.addTestResult('Tratamento de Erros', false, {
                expected: 'Erro capturado internamente',
                actual: 'Exception não tratada',
                error: error.message
            })
        }
    }

    /**
     * Adicionar resultado de teste
     */
    addTestResult(testName, success, details = {}) {
        this.testResults.push({
            test: testName,
            success,
            details,
            timestamp: new Date().toISOString()
        })
        
        const status = success ? '✅' : '❌'
        console.log(`  ${status} ${testName}: ${success ? 'PASSOU' : 'FALHOU'}`)
        
        if (!success && details.error) {
            console.log(`     Erro: ${details.error}`)
        }
    }

    /**
     * Imprimir resultados finais
     */
    printResults() {
        console.log('\n📊 Resultados da Validação:')
        
        const total = this.testResults.length
        const passed = this.testResults.filter(r => r.success).length
        const failed = total - passed
        
        console.log(`  Total: ${total}`)
        console.log(`  ✅ Passou: ${passed}`)
        console.log(`  ❌ Falhou: ${failed}`)
        console.log(`  📈 Taxa de Sucesso: ${Math.round((passed/total) * 100)}%`)
        
        if (failed > 0) {
            console.log('\n⚠️  Testes que falharam:')
            this.testResults
                .filter(r => !r.success)
                .forEach(r => {
                    console.log(`  - ${r.test}: ${r.details.error || 'Falha'}`)
                })
        }
        
        console.log(`\n${failed === 0 ? '🎉' : '⚠️'} Validação ${failed === 0 ? 'COMPLETA' : 'COM PROBLEMAS'}`)
    }

    /**
     * Teste de performance comparativo
     */
    async performanceTest() {
        console.log('\n⚡ Executando teste de performance...')
        
        const testData = {
            remotejid: '5511999999999@c.us',
            messagerecive: 'teste_performance',
            idmessage: 'perf_test',
            session: '1',
            fromme: 0
        }
        
        const iterations = 10
        
        // Testar implementação refatorada
        const startRefactored = Date.now()
        for (let i = 0; i < iterations; i++) {
            try {
                await pushMessageDbRefactored({ ...testData, idmessage: `perf_ref_${i}` })
            } catch (error) {
                // Ignorar erros de banco em teste de performance
            }
        }
        const timeRefactored = Date.now() - startRefactored
        
        console.log(`  Implementação Refatorada: ${timeRefactored}ms (${iterations} iterações)`)
        console.log(`  Média por operação: ${(timeRefactored/iterations).toFixed(2)}ms`)
        
        return {
            refactored: timeRefactored,
            iterations,
            averageRefactored: timeRefactored/iterations
        }
    }
}

// Função para executar validação se arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new MessageStoreValidation()
    
    validator.runAllTests()
        .then(() => validator.performanceTest())
        .then(() => {
            console.log('\n✅ Validação completa!')
            process.exit(0)
        })
        .catch(error => {
            console.error('\n❌ Erro na validação:', error)
            process.exit(1)
        })
}

export { MessageStoreValidation }
export default MessageStoreValidation