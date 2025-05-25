import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import __dirname from '../../../dirname.js'
import * as Sentry from "@sentry/node";
import { getInteration } from '../../store/interation/index.js'
import * as ioClient from 'socket.io-client'

const socketClient = ioClient.io("https://euro17.anycall-messageria.com.br");
const writeFileAsync = promisify(writeFile);

// Worker para processar mídia de forma assíncrona
const processMediaJob = {
  key: 'ProcessMedia',
  options: {
    delay: 0,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50
  },
  
  async handle(job) {
    const { msg, sessionId, msgContact } = job.data;
    
    try {
      console.log(`[ProcessMedia] Iniciando processamento de mídia para sessão ${sessionId}`);
      
      // Download da mídia de forma assíncrona
      const mediaData = await downloadMediaAsync(msg);
      
      if (!mediaData) {
        throw new Error('Falha no download da mídia');
      }
      
      // Salvar arquivo de forma assíncrona
      const filename = mediaData.filename;
      const filepath = join(__dirname, 'assets/uploads-messages', filename);
      await writeFileAsync(filepath, mediaData.data);
      
      console.log(`[ProcessMedia] Mídia salva: ${filename}`);
      
      // Processar mensagem com dados da mídia
      const msgWithMedia = {
        ...msg,
        mediaFilename: filename,
        mediaPath: filepath,
        mediaType: mediaData.type
      };
      
      // Criar interação no banco de dados
      await getInteration(msgWithMedia, sessionId, msgContact);
      
      console.log(`[ProcessMedia] Processamento concluído para sessão ${sessionId}`);
      
      return {
        success: true,
        filename: filename,
        sessionId: sessionId
      };
      
    } catch (error) {
      console.error(`[ProcessMedia] Erro no processamento:`, error);
      Sentry.captureException(error);
      throw error;
    }
  }
};

// Função para download assíncrono de mídia
async function downloadMediaAsync(msg) {
  try {
    let type = '';
    let extension = '';
    let mimetype = '';
    
    // Determinar tipo de mídia
    if (msg.message?.imageMessage) {
      type = 'image';
      extension = 'jpeg';
      mimetype = msg.message.imageMessage.mimetype || 'image/jpeg';
    } else if (msg.message?.audioMessage) {
      type = 'audio';
      extension = 'ogg';
      mimetype = msg.message.audioMessage.mimetype || 'audio/ogg';
    } else if (msg.message?.videoMessage) {
      type = 'video';
      extension = 'mp4';
      mimetype = msg.message.videoMessage.mimetype || 'video/mp4';
    } else if (msg.message?.documentMessage) {
      type = 'document';
      extension = 'pdf';
      mimetype = msg.message.documentMessage.mimetype || 'application/pdf';
    } else if (msg.message?.stickerMessage) {
      type = 'sticker';
      extension = 'webp';
      mimetype = msg.message.stickerMessage.mimetype || 'image/webp';
    } else {
      throw new Error('Tipo de mídia não suportado');
    }
    
    // Download do conteúdo
    const stream = await downloadContentFromMessage(
      msg.message[`${type}Message`] || msg.message.stickerMessage,
      type === 'sticker' ? 'sticker' : type
    );
    
    // Processar stream de forma assíncrona
    const chunks = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    
    // Gerar nome único do arquivo
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}_${randomId}.${extension}`;
    
    return {
      data: buffer,
      filename: filename,
      type: type,
      mimetype: mimetype,
      size: buffer.length
    };
    
  } catch (error) {
    console.error('[downloadMediaAsync] Erro no download:', error);
    throw error;
  }
}

export default processMediaJob;