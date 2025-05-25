// Constantes para Status de Campanhas e Filas
// Implementação do item 3.2 - Constantes para Status

export const CAMPAIGN_STATUS = {
    ACTIVE: 0,
    PAUSED: 1,
    FINISHED: 2,
    DELETED: 4,
    MASSIVE: 5
}

export const QUEUE_STATUS = {
    ACTIVE: 0,
    PAUSED: 1,
    FINISHED: 2,
    SCHEDULED: 3,
    DELETED: 4
}

export const SCHEDULE_STATUS = {
    INACTIVE: 0,
    SCHEDULED: 1,
    CANCELLED: 3,
    FINISHED: 4
}

export const MESSAGE_STATUS = {
    PENDING: 0,
    SENT: 1,
    FAILED: 2,
    CANCELLED: 3
}

// Constantes para tipos de mensagem
export const MESSAGE_TYPE = {
    NORMAL: 0,
    INITIAL: 1
}

// Constantes para verificação de sessão
export const SESSION_VERIFY = {
    VALID: 0,
    INVALID: 1
}

// Constantes para alteração de timers
export const TIMER_ALTER = {
    NORMAL: 0,
    ALTERED: 1
}

// Helper functions para melhor legibilidade
export const isActiveStatus = (status) => status === CAMPAIGN_STATUS.ACTIVE || status === QUEUE_STATUS.ACTIVE
export const isPausedStatus = (status) => status === CAMPAIGN_STATUS.PAUSED || status === QUEUE_STATUS.PAUSED
export const isFinishedStatus = (status) => status === CAMPAIGN_STATUS.FINISHED || status === QUEUE_STATUS.FINISHED
export const isDeletedStatus = (status) => status === CAMPAIGN_STATUS.DELETED || status === QUEUE_STATUS.DELETED

// Função para obter descrição do status
export const getStatusDescription = (status, type = 'campaign') => {
    const statusMap = type === 'campaign' ? CAMPAIGN_STATUS : QUEUE_STATUS
    const descriptions = {
        [statusMap.ACTIVE]: 'Ativo',
        [statusMap.PAUSED]: 'Pausado',
        [statusMap.FINISHED]: 'Finalizado',
        [statusMap.DELETED]: 'Excluído',
        ...(type === 'campaign' && { [CAMPAIGN_STATUS.MASSIVE]: 'Massivo' }),
        ...(type === 'queue' && { [QUEUE_STATUS.SCHEDULED]: 'Agendado' })
    }
    return descriptions[status] || 'Status desconhecido'
}