import Pusher from 'pusher-js';

export default class PusherClient {
  static instance;
  
  static getInstance() {
    if (!PusherClient.instance) {
      PusherClient.instance = new PusherClient();
    }
    return PusherClient.instance;
  }
  constructor() {
    // Configuração do cliente
    this.client = new Pusher('471bd76264f8beaaeb1a', {
      cluster: 'sa1',
      enabledTransports: ['ws', 'wss'], // Força WebSocket
      timeout: 10000 // Timeout de conexão em ms
    });

    // Armazena canais ativos
    this.channels = new Map();

    // Configura listeners globais
    this.setupConnectionListeners();
  }

  setupConnectionListeners() {
    // Evento de conexão estabelecida
    this.client.connection.bind('connected', () => {
      console.log('Conectado ao Pusher');
    });

    // Evento de erro na conexão
    this.client.connection.bind('error', (err) => {
      console.error('Erro na conexão Pusher:', err);
    });

    // Evento de desconexão
    this.client.connection.bind('disconnected', () => {
      console.log('Desconectado do Pusher');
    });

    // Evento de tentativa de reconexão
    this.client.connection.bind('connecting', () => {
      console.log('Tentando reconectar ao Pusher...');
    });
  }

  // Inscreve em um canal
  subscribe(channelName) {
    try {
      const channel = this.client.subscribe(channelName);
      this.channels.set(channelName, channel);

      // Eventos do canal
      channel.bind('subscription_succeeded', () => {
        console.log(`Inscrito no canal: ${channelName}`);
      });

      channel.bind('subscription_error', (error) => {
        console.error(`Erro ao inscrever no canal ${channelName}:`, error);
      });

      return channel;
    } catch (error) {
      console.error('Erro ao se inscrever no canal:', error);
      throw error;
    }
  }

  // Escuta um evento específico em um canal
  listen(channelName, eventName, callback) {
    try {
      let channel = this.channels.get(channelName);
      
      // Se o canal não existe, cria ele
      if (!channel) {
        channel = this.subscribe(channelName);
      }

      channel.bind(eventName, (data) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erro ao processar evento ${eventName}:`, error);
        }
      });
    } catch (error) {
      console.error('Erro ao escutar evento:', error);
      throw error;
    }
  }

  // Cancela inscrição em um canal
  unsubscribe(channelName) {
    try {
      this.client.unsubscribe(channelName);
      this.channels.delete(channelName);
      console.log(`Cancelada inscrição no canal: ${channelName}`);
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
    }
  }

  // Desconecta o cliente
  disconnect() {
    try {
      this.client.disconnect();
      this.channels.clear();
      console.log('Cliente Pusher desconectado');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  }
}


// // Exemplo de uso:
// const pusher = new PusherClient();

// // Escuta eventos
// pusher.listen('test-channel', 'message-sent', (data) => {
//   console.log('Nova mensagem:', data);
// });

// pusher.listen('test-channel', 'user-online', (data) => {
//   console.log('Usuário online:', data);
// });

// // Para desconectar quando necessário
// // pusher.disconnect();