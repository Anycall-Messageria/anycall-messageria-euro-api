// Campaign Processor - Centraliza lógica comum de processamento de campanhas
import Queue from '../model/queue.model.js'
import Campaing from '../model/campaings.model.js'
import { monitorScheduleCampaing } from '../session/index.js'
import { io } from '../../server.js'
import { 
  CAMPAIGN_STATUS, 
  QUEUE_STATUS, 
  SCHEDULE_STATUS, 
  MESSAGE_TYPE 
} from '../constants/status.js'
import getIntervalManager from '../utils/intervalManager.js'

// Import sending functions - will be set by setController
let sending, sendingInitial, sendQeues, scheduleMon, sendQeuesPause;

// Global variable for interval (matches original behavior)
let meuInterval;

// Instância do IntervalManager
const intervalManager = getIntervalManager();

// Helper functions from original code
const getRandomInt = async (min, max) => {
  try {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } catch (error) {
    console.log(error)
  }
}

const random = async (id) => {
  try {
    const filasSchedule = await Queue.findOne({ where: { "identificador": id } })
    const min = (filasSchedule.minTime * 1000)
    const max = (filasSchedule.maxTime * 1000)
    return getRandomInt(min, max)
  } catch (error) {
    console.log(error)
  }
}

// Setup function to inject dependencies
export const setControllerDependencies = (deps) => {
  sending = deps.sending;
  sendingInitial = deps.sendingInitial;
  sendQeues = deps.sendQeues;
  scheduleMon = deps.scheduleMon;
  sendQeuesPause = deps.sendQeuesPause;
}

/**
 * Classe para centralizar o processamento de campanhas
 * Elimina duplicação entre restart() e sendStartMessage()
 */
class CampaignProcessor {
    constructor(identificador, options = {}) {
        this.identificador = identificador
        this.options = {
            isRestart: false,
            isStart: false,
            skipSessionCheck: false,
            enableScheduleMonitoring: true,
            ...options
        }
        
        // Estado interno
        this.intervals = new Map()
        this.isRunning = false
        this.campaignData = null
        this.queueData = null
    }
    
    /**
     * Função principal de processamento
     */
    async process() {
        try {
            console.log(`[CampaignProcessor] Iniciando processamento da campanha: ${this.identificador}`)
            
            // Validar dados da campanha
            await this.validateCampaignData()
            
            // Monitoramento de agendamento se habilitado
            if (this.options.enableScheduleMonitoring) {
                await this.monitorScheduleCampaing()
            }
            
            // Configurar intervalos e iniciar processamento
            await this.setupIntervals()
            
            console.log(`[CampaignProcessor] Processamento iniciado com sucesso: ${this.identificador}`)
            
        } catch (error) {
            console.error(`[CampaignProcessor] Erro no processamento da campanha ${this.identificador}:`, error)
            throw error
        }
    }
    
    /**
     * Validar se a campanha existe e está válida
     */
    async validateCampaignData() {
        // Buscar dados da fila
        this.queueData = await Queue.findOne({ 
            where: { "identificador": this.identificador } 
        })
        
        if (!this.queueData) {
            throw new Error(`Fila não encontrada para identificador: ${this.identificador}`)
        }
        
        // Buscar dados da campanha
        this.campaignData = await Campaing.findOne({
            where: { 
                'identificador': this.identificador, 
                'status': 0, 
                'schedule': 0 
            }, 
            order: [['id', 'ASC']]
        })
        
        if (!this.campaignData) {
            console.log(`[CampaignProcessor] Nenhuma campanha ativa encontrada: ${this.identificador}`)
            return false
        }
        
        return true
    }
    
    /**
     * Monitoramento de agendamento (lógica comum)
     */
    async monitorScheduleCampaing() {
        const filasSchedule = await Queue.findOne({ 
            where: { "identificador": this.identificador } 
        })
        
        if (filasSchedule?.agendamento == 1) {
            console.log(`[CampaignProcessor] Campanha agendada detectada: ${this.identificador}`)
            
            // Agendar processamento
            const agendamentos = await Campaing.findAll({
                where: { identificador: this.identificador, schedule: 1 },
                order: [['id', 'ASC']]
            })
            
            for (const agendamento of agendamentos) {
                await this.scheduleExecution(agendamento)
            }
        }
    }
    
    /**
     * Agendar execução de campanha
     */
    async scheduleExecution(agendamento) {
        const filasSchedule = await Queue.findOne({ 
            where: { "identificador": agendamento.identificador } 
        })
        
        if (filasSchedule) {
            const scheduleTime = new Date(agendamento.datatrigger)
            const now = new Date()
            const delay = scheduleTime.getTime() - now.getTime()
            
            if (delay > 0) {
                setTimeout(() => {
                    this.executeScheduledCampaign(agendamento.identificador)
                }, delay)
                
                console.log(`[CampaignProcessor] Campanha agendada para: ${scheduleTime.toISOString()}`)
            }
        }
    }
    
    /**
     * Executar campanha agendada
     */
    async executeScheduledCampaign(identificador) {
        try {
            await Campaing.update(
                { schedule: 0 },
                { where: { identificador: identificador } }
            )
            
            console.log(`[CampaignProcessor] Executando campanha agendada: ${identificador}`)
            
            // Reiniciar o processamento
            const processor = new CampaignProcessor(identificador)
            await processor.process()
            
        } catch (error) {
            console.error(`[CampaignProcessor] Erro na execução agendada:`, error)
        }
    }
    
    /**
     * Configurar intervalos de processamento
     */
    async setupIntervals() {
        // Logic from original restart() and sendStartMessage() functions
        const schedule = await monitorScheduleCampaing(
            this.queueData.datainicial, 
            this.queueData.datafinal, 
            this.queueData.identificador
        )
        
        if (!schedule) {
            scheduleMon(this.identificador)
            return
        }
        
        // Setup time randomization interval (matches original logic)
        intervalManager.set(`${this.identificador}-getTime`, async () => {
            const cont = await random(this.identificador)
            this.cancelInterval(this.identificador)
            this.proximaFuncao(cont)
        }, 60000)
        
        // Initial random time
        let passSend = await random(this.identificador)
        
        const proximaFuncao = (contagem) => {
            passSend = contagem
        }
        this.proximaFuncao = proximaFuncao
        
        // Find queue with status 0
        const filas = await Queue.findOne({ 
            where: { "identificador": this.identificador, 'status': QUEUE_STATUS.ACTIVE } 
        })
        
        if (!filas || filas.status !== QUEUE_STATUS.ACTIVE) {
            console.log(`[CampaignProcessor] Fila não ativa, abortando: ${this.identificador}`)
            return
        }
        
        const identificador1 = filas.identificador
        const _id = filas.id
        const mensageminicial = filas.mensageminicial
        
        // Main processing interval (matches original meuInterval)
        meuInterval = setInterval(() => this.result(identificador1, _id, mensageminicial), passSend)
        this.intervals.set(this.identificador, meuInterval)
        this.isRunning = true
        
        console.log(`[CampaignProcessor] Intervalos configurados para: ${this.identificador}`)
    }
    
    /**
     * Gerar intervalo aleatório
     */
    getRandomInterval() {
        const min = parseInt(this.queueData?.mintime) || 10000
        const max = parseInt(this.queueData?.maxtime) || 30000
        return this.getRandomInt(min, max)
    }
    
    /**
     * Gerar delay aleatório inicial
     */
    getRandomDelay() {
        return this.getRandomInt(1000, 5000)
    }
    
    /**
     * Função utilitária para números aleatórios
     */
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    
    /**
     * Cancelar intervalos (lógica comum extraída)
     */
    async cancelInterval(identificador) {
        try {
            const cancel = await Queue.findOne({ where: { identificador } })
            let id = cancel.identificador
            console.log('Cancel==>', cancel.status, id)
            
            if (cancel.status == 0 && (cancel.entregues + cancel.falhas) >= cancel.registros) {
                clearInterval(meuInterval)
                intervalManager.clear(`${identificador}-getTime`)
                
                await sendQeues(cancel.credor, cancel.nomeFila, 2, cancel.identificador)
                await Queue.update({ status: 2 }, { where: { "identificador": identificador } }, { multi: true })
                await Campaing.update({ active: 2 }, { where: { "identificador": identificador } }, { multi: true })
                return
            }
            
            if (cancel.status == 1) {
                console.log('Pausou', id)
                clearInterval(meuInterval)
                intervalManager.clear(`${identificador}-getTime`)
                await sendQeues(cancel.credor, cancel.nomeFila, 1, cancel.identificador)
                return
            } else if (cancel.status == 2) {
                console.log('Cancelou', id)
                clearInterval(meuInterval)
                intervalManager.clear(`${identificador}-getTime`)
                await sendQeues(cancel.credor, cancel.nomeFila, 2, cancel.identificador)
                return
            }
            
            if (cancel.altertimers == 1) {
                console.log('Alterou tempo e pausou', id)
                clearInterval(meuInterval)
                intervalManager.clear(`${identificador}-getTime`)
                // Use external restart function
                intervalManager.setTimeout(`${id}-restart`, () => {
                    const processor = campaignProcessorManager.getProcessor(id, { isRestart: true })
                    processor.process()
                }, 15000)
            }
            
            if ((cancel.entregues + cancel.falhas) >= cancel.registros) {
                await sendQeues(cancel.credor, cancel.nomeFila, 2, cancel.identificador)
                await Queue.update({ status: 2 }, { where: { "identificador": identificador } }, { multi: true })
                await Campaing.update({ active: 2 }, { where: { "identificador": identificador } }, { multi: true })
                clearInterval(meuInterval)
                intervalManager.clear(`${identificador}-getTime`)
                return
            }
        } catch (error) {
            console.log(error)
        }
    }
    
    /**
     * Função result() centralizada (lógica comum)
     */
    result(identificador1, _id, mensageminicial) {
        Campaing.findOne({ 
            where: { 'identificador': identificador1, 'status': 0, 'schedule': 0 }, 
            order: [['id', 'ASC']] 
        })
        .then(async (res) => {
            if (res) {
                if (res.schedule == 0) {
                    if (res.active == 0) {
                        if (mensageminicial == 0) {
                            if (this.options.isStart) {
                                console.log('Chama o sending', mensageminicial)
                            }
                            sending(identificador1, res.id)
                        } else if (mensageminicial == 1) {
                            sendingInitial(identificador1, res.id)
                        }
                    } else if (res.active == 1) {
                        sendQeuesPause(identificador1, 1)
                        return
                    }
                }
            } else {
                const condition = { where: { id: _id } }
                const options = { multi: true }
                
                await Queue.findOne(condition)
                .then(async (data) => {
                    if (data.status == 1 && data.schedule == 1) {
                        await sendQeuesPause(data.identificador)
                        await Queue.update({ status: 1, schedule: 1 }, condition, options)
                        await Campaing.update({ active: 1 }, { where: { "identificador": identificador1 } }, { multi: true })
                    } else if (data.status == 4) {
                        await sendQeues(data.credor, data.nomeFila, 4, data.identificador)
                        await Queue.update({ status: 4, schedule: 4 }, condition, options)
                        await Campaing.update({ active: 4, schedule: 4 }, { where: { "identificador": identificador1 } }, { multi: true })
                    } else if (data.status == 1 && data.schedule == 3) {
                        await sendQeues(data.credor, data.nomeFila, 4, data.identificador)
                        await Queue.update({ status: 1, schelule: 3 }, condition, options)
                        await Campaing.update({ active: 1, schedule: 3 }, { where: { "identificador": identificador1 } }, { multi: true })
                    } else {
                        await sendQeues(data.credor, data.nomeFila, 2, data.identificador)
                        await Queue.update({ status: 2 }, condition, options)
                        await Campaing.update({ active: 2 }, { where: { "identificador": identificador1 } }, { multi: true })
                    }
                    return
                })
                .catch((error) => {
                    console.error("Error:", error)
                })
                return
            }
        })
    }
    
    /**
     * Processar uma única campanha
     */
    async processSingleCampaign(campaign) {
        try {
            // Determinar método de envio baseado no tipo
            if (this.options.isStart) {
                await sendingInitial(this.identificador, campaign.id)
            } else {
                await sending(this.identificador, campaign.id)
            }
            
        } catch (error) {
            console.error(`[CampaignProcessor] Erro ao processar campanha ${campaign.id}:`, error)
        }
    }
    
    /**
     * Parar processamento
     */
    async stop() {
        console.log(`[CampaignProcessor] Parando processamento: ${this.identificador}`)
        this.cancelInterval()
        this.isRunning = false
    }
    
    /**
     * Pausar processamento
     */
    async pause() {
        console.log(`[CampaignProcessor] Pausando processamento: ${this.identificador}`)
        this.cancelInterval()
        
        // Atualizar status no banco
        await Queue.update(
            { 'status': 1 }, 
            { where: { 'identificador': this.identificador } }
        )
    }
    
    /**
     * Reiniciar processamento
     */
    async restart() {
        console.log(`[CampaignProcessor] Reiniciando processamento: ${this.identificador}`)
        
        // Resetar status
        await Queue.update(
            { 'status': 0 }, 
            { where: { 'identificador': this.identificador } }
        )
        
        // Reiniciar processamento
        await this.process()
    }
    
    /**
     * Obter estatísticas do processamento
     */
    getStats() {
        return {
            identificador: this.identificador,
            isRunning: this.isRunning,
            hasInterval: this.intervals.has(this.identificador),
            options: this.options,
            campaignData: this.campaignData ? {
                id: this.campaignData.id,
                status: this.campaignData.status,
                schedule: this.campaignData.schedule
            } : null,
            queueData: this.queueData ? {
                id: this.queueData.id,
                status: this.queueData.status,
                agendamento: this.queueData.agendamento
            } : null
        }
    }
    
    /**
     * Cleanup ao destruir instância
     */
    destroy() {
        this.stop()
        console.log(`[CampaignProcessor] Instância destruída: ${this.identificador}`)
    }
}

// Gerenciador global de processadores
class CampaignProcessorManager {
    constructor() {
        this.processors = new Map()
    }
    
    /**
     * Obter ou criar processador
     */
    getProcessor(identificador, options = {}) {
        if (!this.processors.has(identificador)) {
            const processor = new CampaignProcessor(identificador, options)
            this.processors.set(identificador, processor)
        }
        return this.processors.get(identificador)
    }
    
    /**
     * Remover processador
     */
    removeProcessor(identificador) {
        const processor = this.processors.get(identificador)
        if (processor) {
            processor.destroy()
            this.processors.delete(identificador)
        }
    }
    
    /**
     * Obter todos os processadores ativos
     */
    getAllProcessors() {
        return Array.from(this.processors.keys())
    }
    
    /**
     * Obter estatísticas de todos os processadores
     */
    getAllStats() {
        const stats = {}
        this.processors.forEach((processor, identificador) => {
            stats[identificador] = processor.getStats()
        })
        return stats
    }
    
    /**
     * Cleanup de todos os processadores
     */
    cleanup() {
        console.log('[CampaignProcessorManager] Executando cleanup de todos os processadores...')
        this.processors.forEach((processor, identificador) => {
            processor.destroy()
        })
        this.processors.clear()
        console.log('[CampaignProcessorManager] Cleanup concluído')
    }
}

// Instância global do gerenciador
const campaignProcessorManager = new CampaignProcessorManager()

export { 
    CampaignProcessor, 
    CampaignProcessorManager, 
    campaignProcessorManager 
}