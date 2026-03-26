// src/services/whatsappService.ts
export const enviarNotificacaoZap = async (mensagem: string, numero: string) => {
  console.log(`Enviando Zap para ${numero}: ${mensagem}`);
  // Aqui futuramente você coloca o código da sua API de WhatsApp (Z-API, Evolution, etc)
};