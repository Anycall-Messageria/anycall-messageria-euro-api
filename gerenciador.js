// --- Configurações de Tempo (em milissegundos) ---
const INTERVALO_AJUSTE_TEMPO_MS = 10 * 60 * 1000; // 10 minutos (Ciclo que REAJUSTA a frequência)
const INTERVALO_SONECA_MS = 40 * 60 * 1000;       // 40 minutos
const DURACAO_SONECA_MS = 15 * 60 * 1000;        // 15 minutos (ALTERADO)
const MIN_SEGUNDOS_DISPARO = 60;
const MAX_SEGUNDOS_DISPARO = 110;

// --- Variáveis de Controle ---
let intervaloAjusteId = null;     // Guarda o ID do setInterval de 10 minutos (que AJUSTA o tempo)
let intervaloDisparoId = null;    // Guarda o ID do setInterval de DISPARO (frequência variável)
let intervaloSonecaId = null;     // Guarda o ID do setInterval da SONECA
let timeoutSonecaId = null;     // Guarda o ID do setTimeout que ACORDA da soneca
let emSoneca = false;           // Flag para indicar se está no período de soneca
let intervaloDisparoAtualMs = 0;// Guarda o intervalo de disparo ATUAL (sorteado)

// --- Funções ---

/**
 * Função que simula o disparo da mensagem.
 */
function disparoMensagem() {
  console.log(`\n*******************************************`);
  console.log(`[${new Date().toLocaleTimeString()}] ==> MENSAGEM DISPARADA! (Usando intervalo atual: ${(intervaloDisparoAtualMs / 1000).toFixed(1)}s)`);
  console.log(`*******************************************\n`);
  // Coloque aqui a lógica real do disparo
}

/**
 * Gera um número aleatório de milissegundos dentro do range especificado.
 */
function obterIntervaloDisparoAleatorioMs(minSegundos, maxSegundos) {
  const minMs = minSegundos * 1000;
  const maxMs = maxSegundos * 1000;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

/**
 * Função chamada a cada 10 minutos para AJUSTAR a frequência de disparo.
 */
function ajustarFrequenciaDeDisparo() {
  if (emSoneca) {
    console.log(`[${new Date().toLocaleTimeString()}] Ajuste de frequência (10 min): Ignorado - Em modo soneca.`);
    return;
  }

  if (intervaloDisparoId) {
    clearInterval(intervaloDisparoId);
    intervaloDisparoId = null;
  }

  intervaloDisparoAtualMs = obterIntervaloDisparoAleatorioMs(MIN_SEGUNDOS_DISPARO, MAX_SEGUNDOS_DISPARO);
  console.log(`--------------------------------------------------`);
  console.log(`[${new Date().toLocaleTimeString()}] AJUSTE DE FREQUÊNCIA (10 min): Novo intervalo de disparo definido para ${(intervaloDisparoAtualMs / 1000).toFixed(1)} segundos.`);
  console.log(`--------------------------------------------------`);

  intervaloDisparoId = setInterval(disparoMensagem, intervaloDisparoAtualMs);
}

/**
 * Inicia o ciclo principal de 10 minutos que AJUSTA a frequência.
 */
function iniciarCicloDeAjuste() {
  if (intervaloAjusteId) {
    clearInterval(intervaloAjusteId);
  }

  console.log(`\n[${new Date().toLocaleTimeString()}] === INICIANDO CICLO DE AJUSTE DE TEMPO (a cada ${INTERVALO_AJUSTE_TEMPO_MS / 1000 / 60} min) ===`);

  console.log(`[${new Date().toLocaleTimeString()}] Definindo a frequência inicial de disparo...`);
  ajustarFrequenciaDeDisparo(); // Define o 1º intervalo e começa a disparar

  intervaloAjusteId = setInterval(ajustarFrequenciaDeDisparo, INTERVALO_AJUSTE_TEMPO_MS);
}

/**
 * Função executada a cada 40 minutos para verificar se deve entrar em modo soneca.
 */
function verificarSoneca() {
  if (emSoneca) {
    console.log(`[${new Date().toLocaleTimeString()}] Verificação de 'soneca' (40 min): Já está em modo soneca.`);
    return;
  }

  console.log(`\n##################################################`);
  // Atualiza o log para refletir a nova duração
  console.log(`[${new Date().toLocaleTimeString()}] INICIANDO MODO SONECA por ${DURACAO_SONECA_MS / 1000 / 60} minutos.`);
  console.log(`##################################################\n`);
  emSoneca = true;

  // 1. Para o ciclo de AJUSTE de tempo (10 min)
  if (intervaloAjusteId) {
    clearInterval(intervaloAjusteId);
    intervaloAjusteId = null;
    console.log(`[${new Date().toLocaleTimeString()}] Ciclo de AJUSTE (10 min) PAUSADO.`);
  }

  // 2. Para o ciclo de DISPARO (frequência variável)
  if (intervaloDisparoId) {
    clearInterval(intervaloDisparoId);
    intervaloDisparoId = null;
    console.log(`[${new Date().toLocaleTimeString()}] Ciclo de DISPARO (frequência atual: ${(intervaloDisparoAtualMs / 1000).toFixed(1)}s) PAUSADO.`);
  }

  // 3. Agenda o "despertar"
  if (timeoutSonecaId) {
    clearTimeout(timeoutSonecaId);
  }
  // O setTimeout agora usa o novo valor de DURACAO_SONECA_MS (15 minutos)
  timeoutSonecaId = setTimeout(() => {
    console.log(`\n**************************************************`);
    console.log(`[${new Date().toLocaleTimeString()}] FIM DO MODO SONECA. Reiniciando operações.`);
    console.log(`**************************************************`);
    emSoneca = false;
    timeoutSonecaId = null;
    iniciarCicloDeAjuste(); // Reinicia o ciclo de ajuste (que reiniciará o disparo)
  }, DURACAO_SONECA_MS);
}

/**
 * Inicia o ciclo de verificação da soneca (a cada 40 minutos).
 */
function iniciarCicloSoneca() {
  if (intervaloSonecaId) {
      clearInterval(intervaloSonecaId);
  }
  console.log(`[${new Date().toLocaleTimeString()}] === INICIANDO CICLO DE SONECA (verificação a cada ${INTERVALO_SONECA_MS / 1000 / 60} min) ===`);
  intervaloSonecaId = setInterval(verificarSoneca, INTERVALO_SONECA_MS);
}

/**
 * Função para encerrar todos os temporizadores de forma limpa.
 */
function encerrarSistema() {
  console.log("\nRecebido sinal de encerramento. Limpando temporizadores...");

  if (intervaloAjusteId) {
    clearInterval(intervaloAjusteId);
    intervaloAjusteId = null;
    console.log("- Intervalo de 'ajuste de frequência' (10 min) limpo.");
  }
  if (intervaloDisparoId) {
    clearInterval(intervaloDisparoId);
    intervaloDisparoId = null;
    console.log("- Intervalo de 'disparoMensagem' limpo.");
  }
  if (intervaloSonecaId) {
    clearInterval(intervaloSonecaId);
    intervaloSonecaId = null;
    console.log("- Intervalo 'verificarSoneca' limpo.");
  }
  if (timeoutSonecaId) {
    clearTimeout(timeoutSonecaId);
    timeoutSonecaId = null;
    console.log("- Timeout de 'despertar' limpo.");
  }

  console.log("Sistema encerrado de forma limpa.");
  process.exit(0);
}

// --- Inicialização ---
const dataAtual = new Date();
console.log(`[${dataAtual.toLocaleTimeString()} ${dataAtual.toLocaleDateString('pt-BR')}] Sistema iniciado.`); // Adicionado data
iniciarCicloDeAjuste();
iniciarCicloSoneca();

// --- Captura de Sinais de Encerramento ---
process.on('SIGINT', encerrarSistema);
process.on('SIGTERM', encerrarSistema);

console.log("\nSistema rodando. Pressione Ctrl+C para sair.");
// Adicionado um lembrete da hora atual para referência
setInterval(() => {
    console.log(`[${new Date().toLocaleTimeString()}] ... sistema ativo ...`);
}, 5 * 60 * 1000); // Exibe uma mensagem a cada 5 minutos para indicar que está ativo