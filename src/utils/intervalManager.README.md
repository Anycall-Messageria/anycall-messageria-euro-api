# IntervalManager - Gerenciamento Centralizado de Intervalos

## Visão Geral

O `IntervalManager` é um sistema centralizado para gerenciar `setInterval` e `setTimeout` em aplicações Node.js, prevenindo vazamentos de memória e fornecendo ferramentas de monitoramento e limpeza automática.

## Problemas Resolvidos

- ✅ **Vazamentos de Memória**: Intervalos não limpos adequadamente
- ✅ **Debugging Difícil**: Dificuldade em rastrear intervalos ativos
- ✅ **Shutdown Graceful**: Limpeza automática no encerramento da aplicação
- ✅ **Gerenciamento Manual**: Necessidade de controlar manualmente cada interval
- ✅ **Error Handling**: Tratamento de erros em callbacks de interval

## Instalação e Uso Básico

### Importação

```javascript
// Singleton (recomendado)
import getIntervalManager from '../utils/intervalManager.js'
const intervalManager = getIntervalManager()

// Instância própria (casos especiais)
import { IntervalManager } from '../utils/intervalManager.js'
const manager = new IntervalManager()
```

### Uso Básico

```javascript
// Criar um interval
intervalManager.set('my-interval', () => {
    console.log('Executando tarefa...')
}, 5000) // A cada 5 segundos

// Criar um timeout
intervalManager.setTimeout('my-timeout', () => {
    console.log('Timeout executado!')
}, 10000) // Em 10 segundos

// Limpar interval específico
intervalManager.clear('my-interval')

// Limpar timeout específico
intervalManager.clearTimeout('my-timeout')

// Limpar todos
intervalManager.clearAll()
```

## API Completa

### Métodos Principais

#### `set(key, callback, delay, options)`
Cria e gerencia um interval.

```javascript
intervalManager.set('data-sync', async () => {
    await syncData()
}, 30000, {
    clearOnError: true // Remove interval se callback falhar
})
```

**Parâmetros:**
- `key` (string): Identificador único
- `callback` (function): Função a ser executada
- `delay` (number): Intervalo em milissegundos
- `options` (object): Opções adicionais

#### `setTimeout(key, callback, delay)`
Cria e gerencia um timeout.

```javascript
intervalManager.setTimeout('delayed-task', () => {
    console.log('Tarefa atrasada executada')
}, 5000)
```

#### `clear(key)` / `clearTimeout(key)`
Remove interval ou timeout específico.

```javascript
intervalManager.clear('data-sync')
intervalManager.clearTimeout('delayed-task')
```

#### `clearAll()`
Remove todos os intervals e timeouts.

```javascript
intervalManager.clearAll()
```

### Métodos de Monitoramento

#### `exists(key)`
Verifica se interval/timeout existe.

```javascript
if (intervalManager.exists('my-interval')) {
    console.log('Interval está ativo')
}
```

#### `getInfo(key)`
Obtém informações detalhadas.

```javascript
const info = intervalManager.getInfo('my-interval')
console.log(info)
// {
//   type: 'interval',
//   key: 'my-interval',
//   delay: 5000,
//   created: 1643723400000,
//   age: 30000,
//   options: { clearOnError: true }
// }
```

#### `listAll()`
Lista todos os intervals e timeouts ativos.

```javascript
const active = intervalManager.listAll()
console.log(`Total: ${active.total}`)
console.log(`Intervals: ${active.intervals.length}`)
console.log(`Timeouts: ${active.timeouts.length}`)
```

#### `getStats()`
Obtém estatísticas de uso.

```javascript
const stats = intervalManager.getStats()
console.log(stats)
// {
//   intervals: { total: 5, oldest: 120000, newest: 5000 },
//   timeouts: { total: 2 },
//   memory: { intervalMapSize: 5, timeoutMapSize: 2 }
// }
```

### Métodos de Limpeza

#### `clearOld(maxAge)`
Remove intervals antigos.

```javascript
// Remove intervals mais antigos que 1 hora
const removed = intervalManager.clearOld(3600000)
console.log(`Removidos: ${removed} intervals antigos`)
```

## Integração no Sistema

### Exemplo: queuesController.js

```javascript
import getIntervalManager from '../utils/intervalManager.js'
const intervalManager = getIntervalManager()

// Substitui: setInterval(callback, 5000)
intervalManager.set(`${identificador}-sync`, callback, 5000)

// Substitui: setTimeout(() => restart(id), 15000)
intervalManager.setTimeout(`${id}-restart`, () => restart(id), 15000)

// Substitui: clearInterval(intervalId)
intervalManager.clear(`${identificador}-sync`)
```

### Exemplo: CampaignProcessor.js

```javascript
// Setup de intervalos para campanha
async setupIntervals() {
    // Interval de randomização de tempo
    intervalManager.set(`${this.identificador}-getTime`, async () => {
        const cont = await random(this.identificador)
        this.updateTiming(cont)
    }, 60000)
    
    // Interval principal de processamento
    intervalManager.set(`${this.identificador}-main`, () => {
        this.processNext()
    }, this.getRandomDelay())
}

// Limpeza de intervalos
cleanup() {
    intervalManager.clear(`${this.identificador}-getTime`)
    intervalManager.clear(`${this.identificador}-main`)
}
```

## Recursos Avançados

### Error Handling Automático

```javascript
intervalManager.set('risky-task', () => {
    if (Math.random() < 0.1) {
        throw new Error('Falha aleatória')
    }
    console.log('Tarefa executada com sucesso')
}, 1000, {
    clearOnError: true // Remove interval se falhar
})
```

### Shutdown Graceful

O IntervalManager automaticamente configura handlers para:
- `SIGINT` (Ctrl+C)
- `SIGTERM` (Termination signal)
- `exit` (Process exit)
- `uncaughtException`
- `unhandledRejection`

```javascript
// Limpeza automática no shutdown
process.on('SIGINT', () => {
    console.log('Limpando intervals...')
    // IntervalManager faz isso automaticamente
})
```

### Monitoramento de Performance

```javascript
// Configurar monitoramento
intervalManager.set('monitor', () => {
    const stats = intervalManager.getStats()
    console.log(`Intervals ativos: ${stats.intervals.total}`)
    
    // Limpar intervals antigos (> 2 horas)
    if (stats.intervals.total > 50) {
        const cleaned = intervalManager.clearOld(7200000)
        console.log(`Limpeza automática: ${cleaned} intervals removidos`)
    }
}, 300000) // A cada 5 minutos
```

## Migração do Código Existente

### Antes (Código Tradicional)

```javascript
// Problemático - pode vazar memória
const intervals = {}

function startProcess(id) {
    intervals[id] = setInterval(() => {
        processData(id)
    }, 5000)
}

function stopProcess(id) {
    if (intervals[id]) {
        clearInterval(intervals[id])
        delete intervals[id]
    }
}

// Difícil de debugar e monitorar
```

### Depois (Com IntervalManager)

```javascript
// Seguro e monitorável
import getIntervalManager from '../utils/intervalManager.js'
const intervalManager = getIntervalManager()

function startProcess(id) {
    intervalManager.set(`process-${id}`, () => {
        processData(id)
    }, 5000)
}

function stopProcess(id) {
    intervalManager.clear(`process-${id}`)
}

// Fácil debugging e monitoramento
console.log('Processos ativos:', intervalManager.listAll())
```

## Testes

Execute os testes incluídos:

```bash
cd src/utils
node intervalManager.test.js
```

## Logs e Debugging

O IntervalManager produz logs estruturados:

```
[IntervalManager] Interval criado: campaign-123-sync (5000ms)
[IntervalManager] Timeout criado: session-456-restart (15000ms)
[IntervalManager] Interval removido: campaign-123-sync
[IntervalManager] Limpando 5 intervals e 2 timeouts
[IntervalManager] Cleanup completo
```

## Performance

- **Overhead mínimo**: Map para armazenamento O(1)
- **Memory efficient**: Cleanup automático de metadata
- **Scalable**: Testado com centenas de intervals simultâneos
- **Zero dependencies**: Usa apenas APIs nativas do Node.js

## Segurança

- ✅ Validação de parâmetros
- ✅ Tratamento de exceções em callbacks
- ✅ Prevenção de duplicate keys
- ✅ Cleanup automático em erros
- ✅ Shutdown graceful

## Benefícios

1. **Elimina vazamentos de memória** por intervals não limpos
2. **Facilita debugging** com logs e monitoramento
3. **Melhora performance** com cleanup automático
4. **Reduz complexidade** do código de gerenciamento
5. **Aumenta confiabilidade** com error handling robusto