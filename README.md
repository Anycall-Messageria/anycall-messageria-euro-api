# Anycall Messageria Euro

Plataforma de gerenciamento de comunicação WhatsApp para empresas.

## Descrição

Anycall Messageria Euro é uma solução completa para gerenciamento de mensagens WhatsApp em ambientes corporativos, permitindo automação de campanhas, gestão de filas de atendimento, e integração com múltiplos dispositivos.

## Estrutura do Projeto

```
anycall-messageria-euro/
├── assets/                     # Recursos estáticos e uploads
│   ├── clients/                # Arquivos de clientes
│   ├── downloads/              # Arquivos para download
│   ├── midias/                 # Arquivos de mídia
│   ├── modelos/                # Modelos de arquivos
│   └── uploads/                # Uploads gerais
├── database/                   # Configuração de banco de dados
│   └── dbPostgresClient.js     # Cliente PostgreSQL
├── dirname.js                  # Utilitário de diretórios
├── logger.js                   # Configuração de logs
├── package.json                # Dependências e scripts
├── response.js                 # Formatador de respostas
├── server.js                   # Servidor HTTP e Socket.IO
├── sessions/                   # Armazenamento de sessões WhatsApp
└── src/                        # Código-fonte principal
    ├── app.js                  # Configuração da aplicação
    ├── auth/                   # Autenticação
    ├── config/                 # Configurações
    ├── controllers/            # Controladores de rotas
    ├── index.js                # Ponto de entrada
    ├── middlaware/             # Middlewares
    ├── model/                  # Modelos Sequelize
    ├── providers/              # Provedores de serviços
    ├── queues/                 # Sistema de filas
    ├── routes/                 # Definição de rotas
    ├── schemas/                # Esquemas de validação
    ├── service/                # Serviços de negócio
    ├── session/                # Gerenciamento de sessão
    ├── sock/                   # Integração com sockets
    ├── store/                  # Armazenamento de estado
    ├── utils/                  # Utilitários
    ├── websocket.js            # Configuração WebSocket
    └── wpp/                    # Integração WhatsApp
```

## Tecnologias Principais

- **Backend**: Node.js, Express.js
- **Banco de Dados**: PostgreSQL, Sequelize ORM
- **Integração WhatsApp**: @whiskeysockets/baileys
- **Autenticação**: JWT, Passport.js
- **Comunicação Real-time**: Socket.IO
- **Processamento de Arquivos**: Multer, Excel.js

## Funcionalidades

- Gerenciamento de sessões WhatsApp
- Automação de campanhas de mensagens
- Filas de atendimento
- Suporte a múltiplos dispositivos
- Relatórios e estatísticas
- Mensagens em massa
- Gerenciamento de contatos e grupos
- Sistema de etiquetas

## Instalação

```bash
# Clonar repositório
git clone [url-do-repositorio]

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar aplicação
npm start
```

## Requisitos

- Node.js >= 14.5.0
- PostgreSQL
- Conexão com internet para WhatsApp Web

## Licença

Proprietária - Anycall © 2025