// src/services/whatsappService.ts
import axios from 'axios';

/**
 * CONFIGURAÇÕES DA EVOLUTION API (INSTALADA NO SEU TRUENAS)
 * Substitua os valores abaixo pelos dados da sua instância
 */
const EVOLUTION_API_URL = "http://192.168.0.22:8081"; // Ex: http://192.168.1.100:8080
const INSTANCE_NAME = "Engemarko_Zap"; // Nome da instância que você criou na Evolution
const API_KEY = "SuaChaveForte2026!"; // Chave de segurança da API

/**
 * Interface para padronizar o envio de mensagens
 */
export const enviarNotificacaoWhatsApp = async (numero: string, mensagem: string) => {
  try {
    // A Evolution API espera o número com o código do país e sem o 9 extra (dependendo da região)
    // Mas geralmente o formato "55459..." funciona bem.
    const url = `${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`;

    const data = {
      number: numero,
      options: {
        delay: 1200, // Pequeno delay para evitar bloqueios
        presence: "composing", // Mostra "Digitando..." no WhatsApp
        linkPreview: false
      },
      textMessage: {
        text: mensagem
      }
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY // A Evolution usa 'apikey' no header
      }
    };

    const response = await axios.post(url, data, config);

    if (response.status === 201 || response.status === 200) {
      console.log(`✅ [WhatsApp] Mensagem enviada com sucesso para: ${numero}`);
    }

  } catch (error: any) {
    console.error("❌ [WhatsApp] Erro ao disparar notificação:", error.response?.data || error.message);
    // Não travamos a execução do sistema se o Zap falhar
  }
};