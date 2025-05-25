// Refactored Message Store - Mantém compatibilidade total
// Usa nova arquitetura Repository + Service internamente

import getMessageService from '../../services/MessageService.js'
import getMessageRepository from '../../repositories/MessageRepository.js'

// Importações originais mantidas para compatibilidade
import { send, sendsContact, sendNewWithContact } from '../../controllers/automateController.js'
import { findString } from '../../utils/util.js'

// Instâncias dos serviços
const messageService = getMessageService()
const messageRepo = getMessageRepository()


// Função original mantida para compatibilidade total
const recordMessageSend = async(data) => {
  try {
    return await messageService.recordMessageSend(data)
  } catch (error) {
    console.error('[RefactoredMessageStore] Erro em recordMessageSend:', error)
    return null
  }
}

// Função original mantida para compatibilidade total
const updateRecordMessageSend = async(id, session) => {
  try {
    return await messageService.updateRecordMessageSend(id, session)
  } catch (error) {
    console.error('[RefactoredMessageStore] Erro em updateRecordMessageSend:', error)
    return null
  }
}

// Função original mantida para compatibilidade total
const updatecheckedMessageSend = async(id) => {
  try {
    return await messageService.updateCheckedMessageSend(id)
  } catch (error) {
    console.error('[RefactoredMessageStore] Erro em updatecheckedMessageSend:', error)
    return null
  }
}

// Função original mantida para compatibilidade total
const doNotBother = async(id, messagerecive) => {
  try {
    return await messageRepo.doNotBother(id, messagerecive)
  } catch (error) {
    console.error('[RefactoredMessageStore] Erro em doNotBother:', error)
    return null
  }
}

// Função principal refatorada - usa nova arquitetura internamente
const pushMessageDb = async (datas) => {
    try {
        console.log('pushMessageDb [REFACTORED]')
        
        // Usar o novo MessageService para processar a lógica
        const result = await messageService.processIncomingMessage(datas)
        
        // Log para debugging da migração
        console.log('[RefactoredMessageStore] Resultado do processamento:', result.status)
        
        return result
        
    } catch (error) {
        console.log('Error: ' + error)
        
        // Fallback para comportamento original em caso de erro
        console.log('[RefactoredMessageStore] Fallback para implementação original')
        return await pushMessageDbOriginal(datas)
    }
}

// Implementação original mantida como fallback
const pushMessageDbOriginal = async (datas) => {
    try{
        console.log('pushMessageDb [ORIGINAL FALLBACK]')
        const {remotejid } = datas
        const { messagerecive } = datas
        const { idmessage } = datas 
        const { session } = datas 
        const { fromme } = datas
        const mini = messagerecive.toLowerCase() 
        const save = await messageRepo.pushMessageToDb(datas)
        
        const recivemsg = await messageRepo.findSendMessageByReceiver(remotejid)
        
        if(recivemsg){
          const findWord = findString(recivemsg.messageinit,'correspondentes')  
          if(messagerecive == recivemsg.code){
              if(recivemsg.endpointmsg == 'send-text'){
                const datasSendMessageSimple = {
                  session: recivemsg.session,
                  receiver: recivemsg.receiver,
                  message: {
                  text: `${recivemsg.text}` 
                  },
                  messageid: idmessage,
                  id: recivemsg.id
                }
                  await send(datasSendMessageSimple)
              }else if(recivemsg.endpointmsg == 'send-contact'){
                  const datasSendMessageContact = {
                    session: recivemsg.session,
                    receiver: recivemsg.receiver,
                     phone: '558000003517',
                     phone2: '8000003517',
                     organization: '💲 Euro 17 Crédito', 
                     fullName: '💲 Euro 17 Crédito',
                     messageid: idmessage,
                     id: recivemsg.id
                  }
                  const datasSendAfterContact = {
                    session: recivemsg.session,
                    receiver: recivemsg.receiver,
                    message: {
                    text: `${recivemsg.text}` 
                    },
                    messageid: idmessage,
                    id: recivemsg.id
                  }
                  await sendsContact(datasSendMessageContact)
                  await send(datasSendAfterContact)
              }
          }else if(mini == 'sair'){
            if(recivemsg.endpointmsg == 'send-text'){
            const noDatasSendMessageSimpleOuter = {
              session: recivemsg.session,
              receiver: recivemsg.receiver,
              message: {
                text: `Agradecemos sua atenção, caso tenha interesse em nos conhecer, visite nosso site clicando aqui: https://www.euro17.com.br ` 
              },
              messageid: idmessage,
              id: recivemsg.id
            }
            await doNotBother(recivemsg.id, messagerecive)
            await send(noDatasSendMessageSimpleOuter)
           }
          }else{
                console.log('Entrou fora do contexto')
                setTimeout( ()=> sendOutContext(datas) , 1000)
                return
          }
        }else{
            console.log('Entrou fora da consulta')
            setTimeout( ()=> sendClientOutDB(datas) , 1500)
        }
      }
      catch (error){
        console.log('Error: '+error)
      }
}

// Funções auxiliares originais mantidas
async function sendOutContext(rec) {
  try {
    return await messageService.sendOutContext(rec)
  } catch (error) {
    console.error('[RefactoredMessageStore] Erro em sendOutContext:', error)
    return null
  }
}

async function sendClientOutDB(rec) {
  try {
    return await messageService.sendClientOutDB(rec)
  } catch (error) {
    console.error('[RefactoredMessageStore] Erro em sendClientOutDB:', error)
    return null
  }
}

// Função original mantida para compatibilidade total
const updateMessageDB = async (status, id, remoteJid) => {
    try {
        return await messageService.updateMessageReadStatus(status, id, remoteJid)
    } catch (error) {
        console.log('Error: ' + error)
        return null
    }
}

// Flag para controlar se deve usar nova implementação ou original
let USE_REFACTORED = process.env.USE_REFACTORED_MESSAGE_STORE === 'true'

// Função para alternar entre implementações (para testes)
const toggleImplementation = (useRefactored = true) => {
    USE_REFACTORED = useRefactored
    console.log(`[RefactoredMessageStore] Usando implementação: ${useRefactored ? 'REFATORADA' : 'ORIGINAL'}`)
}

// Wrapper que decide qual implementação usar
const pushMessageDbWrapper = async (datas) => {
    if (USE_REFACTORED) {
        return await pushMessageDb(datas)
    } else {
        return await pushMessageDbOriginal(datas)
    }
}

// Exportar funções com mesma interface original
export { 
    pushMessageDbWrapper as pushMessageDb, 
    updateMessageDB, 
    recordMessageSend, 
    updateRecordMessageSend, 
    updatecheckedMessageSend,
    doNotBother,
    toggleImplementation,
    // Exportar também implementações específicas para testes
    pushMessageDbOriginal,
    messageService,
    messageRepo
}