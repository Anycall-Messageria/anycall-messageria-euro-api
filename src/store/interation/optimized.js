// Versão otimizada das funções de interação com JOINs
import Queues from '../../model/queue.model.js'
import Campaing from '../../model/campaings.model.js'
import Servicequeues from '../../model/servicequeues.model.js'
import Session from '../../model/sessions.model.js'
import { returnJustFieldDDD } from '../../utils/util.js'

// Versão otimizada com JOIN para reduzir queries N+1
const atributteCampaingOptimized = async (remotejid, sessions) => {
  try {
    const jid = returnJustFieldDDD(remotejid.toString())
    const session = parseInt(sessions)
    console.log('[OPTIMIZED] remotejid, sessions jid', remotejid, sessions, jid)
    
    // Tentar usar JOIN primeiro para máxima performance
    try {
      const campWithRelations = await Campaing.findOne({
        where: { number: jid, session: session, status: 200 },
        order: [['id', 'DESC']],
        include: [
          {
            model: Queues,
            as: 'queue', // Precisa configurar associação no modelo
            required: true,
            include: [
              {
                model: Servicequeues,
                as: 'service', // Precisa configurar associação no modelo
                required: false
              }
            ]
          }
        ]
      })
      
      if (campWithRelations && campWithRelations.queue) {
        console.log('[OPTIMIZED] Usando JOIN - Campanha', campWithRelations.var9)
        const queue = campWithRelations.queue
        const services = queue.service
        
        const queueId = queue.id
        const genericUser = JSON.stringify(["5"])
        const queues = services?.userId ? services.userId : genericUser
        const agent = campWithRelations.var9 ? parseInt(campWithRelations.var9) : await randomAgenteInteration(queues)
        
        return { id: queueId, agent: agent }
      }
    } catch (joinError) {
      console.log('[OPTIMIZED] JOIN falhou, usando fallback:', joinError.message)
    }
    
    // Fallback: Usar queries separadas mas paralelas
    const camp = await Campaing.findOne({ 
      where: { number: jid, session: session, status: 200 }, 
      order: [['id', 'DESC']] 
    })
    
    if (camp) {
      console.log('[OPTIMIZED] Fallback - Campanha', camp.var9)
      
      // Queries paralelas
      const [queue, services] = await Promise.all([
        Queues.findOne({ where: { 'identificador': camp.identificador } }),
        Queues.findOne({ where: { 'identificador': camp.identificador } })
          .then(q => q ? Servicequeues.findOne({ where: { queue: q.product } }) : null)
      ])
      
      if (queue) {
        const queueId = queue.id
        const genericUser = JSON.stringify(["5"])
        const queues = services?.userId ? services.userId : genericUser
        const agent = camp.var9 ? parseInt(camp.var9) : await randomAgenteInteration(queues)
        
        return { id: queueId, agent: agent }
      }
    }
    
    // Fallback final
    return { id: 1, agent: 5 }
    
  } catch (error) {
    console.error('[atributteCampaingOptimized] Erro:', error)
    return { id: 1, agent: 5 }
  }
}

// Versão otimizada da busca de dados da sessão
const getSessionDataOptimized = async (session) => {
  try {
    // Buscar sessão com dados relacionados usando JOIN se possível
    const sessionData = await Session.findOne({
      where: { number: parseInt(session) },
      include: [
        {
          model: Campaing, // Se existir associação
          as: 'campaigns',
          required: false,
          where: { status: 200 },
          order: [['id', 'DESC']],
          limit: 1
        }
      ]
    })
    
    return sessionData
  } catch (error) {
    console.error('[getSessionDataOptimized] Erro:', error)
    // Fallback para query simples
    return await Session.findOne({ where: { number: parseInt(session) } })
  }
}

// Função otimizada para buscar múltiplos dados em uma única operação
const getInteractionDataBatch = async (remotejid, session) => {
  try {
    // Executar todas as queries necessárias em paralelo
    const [sessionData, campaignData] = await Promise.all([
      Session.findOne({ where: { number: parseInt(session) } }),
      atributteCampaingOptimized(remotejid, session)
    ])
    
    return {
      sessionData,
      campaignData,
      hasSession: !!sessionData,
      hasCampaign: !!(campaignData && campaignData.id !== 1)
    }
  } catch (error) {
    console.error('[getInteractionDataBatch] Erro:', error)
    return {
      sessionData: null,
      campaignData: { id: 1, agent: 5 },
      hasSession: false,
      hasCampaign: false
    }
  }
}

export {
  atributteCampaingOptimized,
  getSessionDataOptimized,
  getInteractionDataBatch
}