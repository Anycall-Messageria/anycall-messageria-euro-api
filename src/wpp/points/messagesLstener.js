import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import * as Sentry from "@sentry/node";
import __dirname from '../../../dirname.js'
import { downloadContentFromMessage, jidNormalizedUser, getContentType, WAMessageStubType, toNumber
} from "@whiskeysockets/baileys";
import { fetchUrlImage } from '../points/index.js'
import { getInteration } from '../../store/interation/index.js'
import { justNumbers } from '../../utils/util.js'
import { selectdChoices } from "../../sock/wpp/index.js";
import  * as ioClient  from 'socket.io-client'
import Queue from '../../queues/queues.js'

const socketClient = ioClient.io("https://euro17.anycall-messageria.com.br");


const writeFileAsync = promisify(writeFile);

// Função para processar mídia de forma assíncrona
const processMediaAsync = async (msg, session, msgContact) => {
  try {
    const sessionId = session.id || 'unknown';
    
    console.log(`[MessagesListener] Adicionando mídia à fila para sessão ${sessionId}`);
    
    // Adicionar job à fila de processamento de mídia
    const job = await Queue.add('ProcessMedia', {
      msg: msg,
      sessionId: sessionId,
      msgContact: msgContact,
      timestamp: Date.now()
    });
    
    console.log(`[MessagesListener] Job de mídia criado: ${job.id} para sessão ${sessionId}`);
    
    // Resposta imediata para não bloquear a thread
    return {
      jobId: job.id,
      status: 'queued',
      message: 'Mídia adicionada à fila de processamento'
    };
    
  } catch (error) {
    console.error('[processMediaAsync] Erro ao adicionar mídia à fila:', error);
    Sentry.captureException(error);
    
    // Fallback: processar de forma síncrona em caso de erro na fila
    console.log('[processMediaAsync] Fallback: processando mídia de forma síncrona');
    return await verifyMediaMessage(msg, session);
  }
};

const getTypeMessage = (msg) => {
  //console.log('getTypeMessage', msg.message)
  return getContentType(msg.message);
};

const getBodyButton = (msg) => {
  if (msg.key.fromMe && msg?.message?.buttonsMessage?.contentText) {
    let bodyMessage = `*${msg?.message?.buttonsMessage?.contentText}*`;
    // eslint-disable-next-line no-restricted-syntax
    for (const buton of msg.message?.buttonsMessage?.buttons) {
      bodyMessage += `\n\n${buton.buttonText?.displayText}`;
    }
    return bodyMessage;
  }
  if (msg.key.fromMe && msg?.message?.listMessage) {
    let bodyMessage = `*${msg?.message?.listMessage?.description}*`;
    // eslint-disable-next-line no-restricted-syntax
    for (const buton of msg.message?.listMessage?.sections) {
      // eslint-disable-next-line no-restricted-syntax
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }
    return bodyMessage;
  }
  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.listMessage?.description}*`;
    // eslint-disable-next-line no-restricted-syntax
    for (const buton of msg?.message?.viewOnceMessage?.message?.listMessage
      ?.sections) {
      // eslint-disable-next-line no-restricted-syntax
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }
    return bodyMessage;
  }
  if (
    msg.key.fromMe &&
    msg?.message?.viewOnceMessage?.message?.buttonsMessage
  ) {
    let bodyMessage = `*${msg?.message?.viewOnceMessage?.message?.buttonsMessage?.contentText}*`;
    // eslint-disable-next-line no-restricted-syntax
    for (const buton of msg?.message?.viewOnceMessage?.message?.buttonsMessage
      ?.buttons) {
      bodyMessage += `\n\n${buton.buttonText?.displayText}`;
    }

    return bodyMessage;
  }
};

const msgLocation = (image, latitude, longitude) => {
  if (image) {
    const b64 = Buffer.from(image).toString("base64");

    const data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude}, ${longitude} `;
    return data;
  }
};


const getBodyMessage = (msg) => {
  try {
    const type = getTypeMessage(msg);
    const types = {
      conversation: msg.message.conversation,
      imageMessage: msg.message.imageMessage?.caption,
      videoMessage:  "Video",//msg.message.videoMessage?.caption,
      extendedTextMessage: msg.message.extendedTextMessage?.text,
      buttonsResponseMessage:
        msg.message.buttonsResponseMessage?.selectedDisplayText,
      listResponseMessage:
        msg.message.listResponseMessage?.title ||
        msg.message.listResponseMessage?.singleSelectReply?.selectedRowId,
      templateButtonReplyMessage:
        msg.message?.templateButtonReplyMessage?.selectedId,
      messageContextInfo:
        msg.message.buttonsResponseMessage?.selectedButtonId ||
        msg.message.listResponseMessage?.title,
      buttonsMessage:
        getBodyButton(msg) || msg.message.listResponseMessage?.title,
      stickerMessage: "sticker",
      contactMessage: msg.message?.contactMessage?.vcard,
      contactsArrayMessage: "varios contatos",
      // locationMessage: `Latitude: ${msg.message.locationMessage?.degreesLatitude} - Longitude: ${msg.message.locationMessage?.degreesLongitude}`,
      locationMessage: msgLocation(
        msg.message?.locationMessage?.jpegThumbnail,
        msg.message?.locationMessage?.degreesLatitude,
        msg.message?.locationMessage?.degreesLongitude
      ),
      liveLocationMessage: `Latitude: ${msg.message.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message.liveLocationMessage?.degreesLongitude}`,
      documentMessage: msg.message.documentMessage?.title,
      audioMessage: "Áudio",
      listMessage: getBodyButton(msg) || msg.message.listResponseMessage?.title,
      viewOnceMessage: getBodyButton(msg),
      reactionMessage: msg.message.reactionMessage?.text || "reaction"
    };

    const objKey = Object.keys(types).find(key => key === type);

    if (!objKey) {
        console.log(`#### Nao achou o type 152: ${type} ${JSON.stringify(msg)}`);
      //logger.warn(`#### Nao achou o type 152: ${type} ${JSON.stringify(msg)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, type });
      Sentry.captureException(
        new Error("Novo Tipo de Mensagem em getTypeMessage")
      );
    }
    return types[type];
  } catch (error) {
    Sentry.setExtra("Error getTypeMessage", { msg, BodyMsg: msg.message });
    Sentry.captureException(error);
    console.log(error);
  }
};

const getMeSocket = (Session) => {
  return {
    id: jidNormalizedUser(Session.user.id),
    name: Session.user.name
  };
};

const getSenderMessage = (msg, Session)=> {
  const me = getMeSocket(Session);
  if (msg.key.fromMe) return me.id;

  const senderId =
    msg.participant || msg.key.participant || msg.key.remoteJid || undefined;

  return senderId && jidNormalizedUser(senderId);
};

const getContactMessage = async (msg, Session) => {
  const isGroup = msg.key.remoteJid.includes("g.us");
  const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
  return isGroup
    ? {
        id: getSenderMessage(msg, Session),
        name: msg.pushName
      }
    : {
        id: msg.key.remoteJid,
        name: msg.key.fromMe ? rawNumber : msg.pushName
      };
};

const downloadMedia = async (msg) => {
  const mineType =
    msg.message?.imageMessage ||
    msg.message?.audioMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  // eslint-disable-next-line no-nested-ternary
  const messageType = msg.message?.documentMessage
    ? "document"
    : mineType.mimetype.split("/")[0].replace("application", "document")
    ? (mineType.mimetype
        .split("/")[0]
        .replace("application", "document")/* as MediaType*/)
    : (mineType.mimetype.split("/")[0]/* as MediaType*/);

  let stream;
  let contDownload = 0;

  while (contDownload < 10 && !stream) {
    try {
      // eslint-disable-next-line no-await-in-loop
      stream = await downloadContentFromMessage(
        msg.message.audioMessage ||
          msg.message.videoMessage ||
          msg.message.documentMessage ||
          msg.message.imageMessage ||
          msg.message.stickerMessage ||
          msg.message.extendedTextMessage?.contextInfo.quotedMessage
            .imageMessage ||
          msg.message?.buttonsMessage?.imageMessage ||
          msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
          msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
          msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
          msg.message?.interactiveMessage?.header?.imageMessage,
        messageType
      );
    } catch (error) {
      // eslint-disable-next-line no-plusplus
      contDownload++;
      // eslint-disable-next-line no-await-in-loop, no-loop-func
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * contDownload * 2)
      );
      //logger.warn(`>>>> erro ${contDownload} de baixar o arquivo ${msg?.key.id}`);
      console.log(`>>>> erro ${contDownload} de baixar o arquivo ${msg?.key.id}`);
    }
  }

  let buffer = Buffer.from([]);
  // eslint-disable-next-line no-restricted-syntax
  try {
    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
  } catch (error) {
    return { data: "error", mimetype: "", filename: "" };
  }

  if (!buffer) {
    Sentry.setExtra("ERR_WAPP_DOWNLOAD_MEDIA", { msg });
    Sentry.captureException(new Error("ERR_WAPP_DOWNLOAD_MEDIA"));
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }
  let filename = msg.message?.documentMessage?.fileName || "";

  if (!filename) {
    const ext = mineType.mimetype.split("/")[1].split(";")[0];
    filename = `${new Date().getTime()}.${ext}`;
  }
  const media = {
    data: buffer,
    mimetype: mineType.mimetype,
    filename
  };
  return media;
};

const verifyContact = async (msgContact, Session) => {
  let profilePicUrl
  try {
    profilePicUrl = await Session.profilePictureUrl(msgContact.id);
  } catch {
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }

  const contactData = {
    name: msgContact?.name || msgContact.id.replace(/\D/g, ""),
    number: msgContact.id.replace(/\D/g, ""),
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us")
  };

  return contactData;
};

const numberSession = async (session) => {
    const str = session.user.id
    const s = str.split(':');
    return s[0];
}


const sendMidiaFrontEnd = async (data) => {
  try {
    const { media, fileName} = data
    socketClient.emit('sendMidiaFrontEnd', data, (d) => { })
  } catch (error) {
     console.error(error)      
  }  
}

const verifyMediaMessage = async (msg, session) => {
  const media = await downloadMedia(msg);
  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }
  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  }
  try {
    await writeFileAsync(
      join(__dirname, 'assets/uploads-messages',  media.filename),
      //join(__dirname, "..", "..", "..", "assets", media.filename),
      media.data,
      "base64"
    );
    await sendMidiaFrontEnd({media, mediaFilename: media.filename})
  } catch (err) {
    Sentry.captureException(err);
    console.log(err)
    //logger.error(err);
  }
  
  const body = media.filename//(getBodyMessage(msg) == 'Áudio' || getBodyMessage(msg) == 'Video') ? media.filename : getBodyMessage(msg);
  
  const messageData = {
    id: msg.key.id,
    body: body,
    fromMe: msg.key.fromMe,
    read: msg.key.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: 0,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    urlProfiles: await fetchUrlImage((session), msg.key.remoteJid),
    dataJson: JSON.stringify(msg)
  };
   // return messageData;
    const datas = { 
        status: msg.status ? msg.status : 0, 
        remotejid: justNumbers(msg.key.remoteJid), 
        idmessage: msg.key.id,
        messagerecive:  body,
        messagetimestamp: toNumber(msg.messageTimestamp), 
        pushname: msg.pushName ? msg.pushName : '',
        fromme: (msg.key.fromMe == true ? 1 : 0), 
        session: await numberSession(session), 
        urlProfile: await fetchUrlImage((session), msg.key.remoteJid),
    }
    return await getInteration(datas);
};

const verifyMessage = async ( msg, session) => {
  const body = getBodyMessage(msg);
  
  const v = {
    phone: justNumbers(msg.key.remoteJid), 
    code: body, 
    expires: toNumber(msg.messageTimestamp) 
  }

  const m = {
    phoneCompany: justNumbers(msg.key.remoteJid), 
    getChoice: body 
  }

  const messageData = {
    idmessage: msg.key.id,
    messagerecive: body,
    fromMe: msg.key.fromMe,
    mediaType: getTypeMessage(msg),
    read: msg.key.fromMe,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    urlProfiles: await fetchUrlImage((session), msg.key.remoteJid),
    dataJson: JSON.stringify(msg),
    status : msg.status ? msg.status : 0,
    messagetimestamp:  toNumber(msg.messageTimestamp)
  };
  //return ({ messageData });
  const datas = { 
    status: msg.status ? msg.status : 0, 
    remotejid: justNumbers(msg.key.remoteJid), 
    idmessage: msg.key.id,
    messagerecive:  body, 
    messagetimestamp: toNumber(msg.messageTimestamp), 
    pushname: msg.pushName ? msg.pushName : '',
    fromme: (msg.key.fromMe == true ? 1 : 0), 
    session: await numberSession(session), 
    urlProfile: await fetchUrlImage((session), msg.key.remoteJid),
  }
    
    await getInteration(datas);
    if(!msg.key.fromMe){
      if(body == '$menu' || body == '$sair' || body > 1 && body < 103){
       await selectdChoices(m)
      }
    }
};

const isValidMsg = (msg) => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  try {
    const msgType = getTypeMessage(msg);
    if (!msgType) {
      return;
    }
    const ifType =
      msgType === "conversation" ||
      msgType === "extendedTextMessage" ||
      msgType === "audioMessage" ||
      msgType === "videoMessage" ||
      msgType === "imageMessage" ||
      msgType === "documentMessage" ||
      msgType === "stickerMessage" ||
      msgType === "buttonsResponseMessage" ||
      msgType === "buttonsMessage" ||
      msgType === "messageContextInfo" ||
      msgType === "locationMessage" ||
      msgType === "liveLocationMessage" ||
      msgType === "contactMessage" ||
      msgType === "voiceMessage" ||
      msgType === "mediaMessage" ||
      msgType === "contactsArrayMessage" ||
      msgType === "reactionMessage" ||
      msgType === "ephemeralMessage" ||
      msgType === "protocolMessage" ||
      msgType === "listResponseMessage" ||
      msgType === "listMessage" ||
      msgType === "viewOnceMessage";
    if (!ifType) {
      //logger.warn(`#### Nao achou o type em isValidMsg: ${msgType}${JSON.stringify(msg?.message)}`);
      console.log(`#### Nao achou o type em isValidMsg: ${msgType}${JSON.stringify(msg?.message)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, msgType });
      Sentry.captureException(new Error("Novo Tipo de Mensagem em isValidMsg"));
    }
    return !!ifType;
  } catch (error) {
    Sentry.setExtra("Error isValidMsg", { msg });
    Sentry.captureException(error);
  }
};

const handleMessage = async ( msg,  session )=> {
  if (!isValidMsg(msg)) {
    console.log('Not valide message!')
    return;
  }
    try {
    let msgContact=  { }
    let msgs
    const bodyMessage = getBodyMessage(msg);
    const msgType = getTypeMessage(msg);
    if (msgType === "protocolMessage") return; // Tratar isso no futuro para excluir msgs se vor REVOKE
    const hasMedia =
      msg.message?.audioMessage ||
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.documentMessage ||
      msg.message.stickerMessage ||
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ?.imageMessage;
    if (msg.key.fromMe) {
      if (/\u200e/.test(bodyMessage)) return;
      if (
        !hasMedia &&
        msgType !== "conversation" &&
        msgType !== "extendedTextMessage" &&
        msgType !== "vcard" &&
        msgType !== "reactionMessage" &&
        msgType !== "ephemeralMessage" &&
        msgType !== "protocolMessage" &&
        msgType !== "viewOnceMessage"
      )
        return;
      msgContact = await getContactMessage(msg, session);
    } else {
      msgContact = await getContactMessage(msg, session);
    }
    const contact = await verifyContact(msgContact, session);

    if (hasMedia) {
        // Processar mídia de forma assíncrona via queue
        await processMediaAsync(msg, session, msgContact);
    } else {
        msgs = await verifyMessage(msg, session);
    }
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    //logger.error(`Error handling whatsapp message: Err: ${err}`);
    console.log(`Error handling whatsapp message: Err: ${err}`);
  }
};


const filterMessages = (msg) => {
  if (msg.message?.protocolMessage) return false;
  if (
    [
      WAMessageStubType.REVOKE,
      WAMessageStubType.E2E_DEVICE_CHANGED,
      WAMessageStubType.E2E_IDENTITY_CHANGED,
      WAMessageStubType.CIPHERTEXT
    ].includes(msg.messageStubType)
  )
    return false;

  return true;
};

const wbotMessageListener = async (session, messageUpsert) => {
  try {
      const messages = messageUpsert.messages
        .filter(filterMessages)
        .map(msg => msg);
      if (!messages) return;
      messages.forEach(async (message) => {
        if (
          session.type === "md" &&
          !message.key.fromMe &&
          messageUpsert.type === "notify"
        ) {
          const x = await session.readMessages([message.key]);
        }
        handleMessage(message, session);
      });
  } catch (error) {
    Sentry.captureException(error);
    //logger.error(`Error handling wbot message listener. Err: ${error}`);
    console.log(`Error handling wbot message listener. Err: ${error}`);
  }
};


export { wbotMessageListener, handleMessage, getContactMessage, verifyContact };
