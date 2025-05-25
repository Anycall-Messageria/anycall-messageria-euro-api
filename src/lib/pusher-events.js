// lib/pusher-events.js
//import { createSession } from '../wpp/whatsapp.js';
import PusherClient  from './pusher-client.js';
import fetch from 'node-fetch';


export default class PusherEvents {
  constructor() {
    this.pusher = PusherClient.getInstance();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Inscreve nos canais necessários
    const channel = this.pusher.subscribe('test-channel');

    // Configura os listeners de eventos
    channel.bind('message-sent', async (data) => {
      console.log('Nova mensagem recebida:', data);
       const create = await createSessionBack(data.message)
      
      // Aqui você pode adicionar sua lógica de negócio
      // Por exemplo, salvar no banco de dados, notificar outros serviços, etc.
    });

    channel.bind('user-online', (data) => {
      console.log('Usuário online:', data);
      // Lógica para usuário online
    });

    channel.bind('user-offline', (data) => {
      console.log('Usuário offline:', data);
      // Lógica para usuário offline
    });
  }
}

async function createSessionBack(data){

  let qrcode
  const url = 'http://localhost:8040/api/calls/session-add';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json', 'content-type': 'application/json'
    },
    body: JSON.stringify({id: '55'+data})
  };
  fetch(url, options)
    .then(res => res.json())
    .then((data) => {
        console.log('qrcode', data)
        qrcode = data.data.qr
        return qrcode
    })
    .catch(err => console.error('error:' + err));
}