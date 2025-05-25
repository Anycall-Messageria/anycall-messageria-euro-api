// Exemplos de uso das constantes de status
// Este arquivo demonstra como usar as constantes implementadas

import { 
  CAMPAIGN_STATUS, 
  QUEUE_STATUS, 
  SCHEDULE_STATUS, 
  MESSAGE_TYPE, 
  SESSION_VERIFY, 
  TIMER_ALTER,
  isActiveStatus,
  getStatusDescription 
} from './status.js'

// Exemplos de uso das constantes

// 1. Verificação de status de campanha
function checkCampaignStatus(campaign) {
  if (campaign.status === CAMPAIGN_STATUS.ACTIVE) {
    console.log('Campanha ativa')
  } else if (campaign.status === CAMPAIGN_STATUS.PAUSED) {
    console.log('Campanha pausada')
  } else if (campaign.status === CAMPAIGN_STATUS.FINISHED) {
    console.log('Campanha finalizada')
  }
}

// 2. Query usando constantes
async function findActiveCampaigns() {
  return await Campaign.findAll({
    where: {
      status: CAMPAIGN_STATUS.ACTIVE,
      schedule: SCHEDULE_STATUS.INACTIVE
    }
  })
}

// 3. Usando helper functions
function processCampaign(campaign) {
  if (isActiveStatus(campaign.status)) {
    // Processar campanha ativa
  }
}

// 4. Descrições legíveis
function getCampaignStatusText(status) {
  return getStatusDescription(status, 'campaign')
}

// 5. Verificação de tipo de mensagem
function sendMessage(messageType, content) {
  if (messageType === MESSAGE_TYPE.INITIAL) {
    // Enviar mensagem inicial
  } else if (messageType === MESSAGE_TYPE.NORMAL) {
    // Enviar mensagem normal
  }
}

// 6. Verificação de sessão
function validateSession(verify) {
  return verify === SESSION_VERIFY.VALID
}

export {
  checkCampaignStatus,
  findActiveCampaigns,
  processCampaign,
  getCampaignStatusText,
  sendMessage,
  validateSession
}