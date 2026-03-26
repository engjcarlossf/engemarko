// src/routes/cardRoutes.ts
import { Router, Request, Response } from 'express';
import pool from '../database';
// Importamos o serviço que criamos para falar com o Zap
import { enviarNotificacaoWhatsApp } from '../services/whatsappService';

const router = Router();

/**
 * 1. ROTA: Listar todos os cards para o Pipeline
 * Ordena por: Urgente -> Atenção -> Normal
 */
router.get('/cards', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM cards 
      WHERE status != 'finalizado'
      ORDER BY 
        CASE 
          WHEN prioridade = 'urgente' THEN 1
          WHEN prioridade = 'atencao' THEN 2
          ELSE 3 
        END ASC, 
        criado_em DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar cards:", err);
    res.status(500).json({ error: "Erro ao carregar o Pipeline." });
  }
});

/**
 * 2. ROTA: Buscar setores para os Checkboxes
 */
router.get('/setores', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, nome FROM setores ORDER BY nome ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar setores" });
  }
});

/**
 * 3. ROTA: Criar Card com Travas de Prioridade e Alerta WhatsApp
 */
router.post('/cards', async (req: Request, res: Response) => {
  const { titulo, descricao, setores_destino, prioridade, criado_por } = req.body;

  try {
    // Validação de Perfil (Apenas Jean/Adriano criam Urgente)
    const userResult = await pool.query('SELECT nome, perfil FROM usuarios WHERE id = $1', [criado_por]);
    const usuario = userResult.rows[0];
    
    if (prioridade === 'urgente' && usuario?.perfil === 'DEV') {
      return res.status(403).json({ error: "Apenas a gestão define Urgência." });
    }

    // Validação do Limite de Atenção (Gargalo C)
    if (prioridade === 'atencao') {
       const count = await pool.query(
         "SELECT COUNT(*) FROM cards WHERE prioridade = 'atencao' AND status != 'finalizado' AND setores_destino && $1",
         [setores_destino]
       );
       if (parseInt(count.rows[0].count) >= 5) {
         return res.status(400).json({ error: "Limite de alertas 'Atenção' atingido para estes setores." });
       }
    }

    // Inserção no Banco de Dados
    const newCardResult = await pool.query(
      'INSERT INTO cards (titulo, descricao, setores_destino, prioridade, criado_por) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [titulo, descricao, setores_destino, prioridade, criado_por]
    );

    const newCard = newCardResult.rows[0];

    // --- DISPARO DE WHATSAPP (A Magia acontece aqui) ---
    // Montamos uma mensagem personalizada para a Engemarko
    const emoji = prioridade === 'urgente' ? '🚨' : (prioridade === 'atencao' ? '⚠️' : '📋');
    const mensagemZap = `${emoji} *NOVA DEMANDA: ${prioridade.toUpperCase()}*\n\n` +
                        `*Título:* ${titulo}\n` +
                        `*Solicitante:* ${usuario?.nome || 'Sistema'}\n` +
                        `*Descrição:* ${descricao}\n\n` +
                        `_Acesse o Dashboard para assumir esta tarefa._`;

    // Enviamos a notificação (Exemplo enviando para o seu número ou grupo)
    // No futuro, podemos buscar o telefone do encarregado do setor no banco
    await enviarNotificacaoWhatsApp("5545999999999", mensagemZap);

    res.status(201).json(newCard);
  } catch (err) {
    console.error("Erro ao criar card:", err);
    res.status(500).json({ error: "Erro ao criar card" });
  }
});

export default router;