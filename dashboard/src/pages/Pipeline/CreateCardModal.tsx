import { useState, useEffect } from "react";
import axios from "axios";

// Interface para tipagem dos setores vindos do Postgres
interface Setor {
  id: number;
  nome: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCardModal({ isOpen, onClose, onSuccess }: Props) {
  // Estados para o formulário
  const [setores, setSetores] = useState<Setor[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState(""); // Agora sendo utilizado
  const [setoresSelecionados, setSetoresSelecionados] = useState<number[]>([]);
  const [prioridade, setPrioridade] = useState("normal");
  const [enviando, setEnviando] = useState(false);

  // Recupera dados do usuário logado para aplicar as travas de perfil
  const sessao = JSON.parse(localStorage.getItem("@Engemarko:Sessao") || "{}");
  const isGestor = ["PO", "SM"].includes(sessao.perfil);

  // Busca os setores da Engemarko sempre que o modal abrir
  useEffect(() => {
    if (isOpen) {
      axios.get("http://localhost:3001/api/setores")
        .then(res => setSetores(res.data))
        .catch(err => console.error("Erro ao buscar setores no banco:", err));
    }
  }, [isOpen]);

  // Função para marcar/desmarcar setores via checkbox
  const handleToggleSetor = (id: number) => {
    setSetoresSelecionados(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Envio dos dados para o Backend (Node.js)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (setoresSelecionados.length === 0) {
      alert("Por favor, selecione pelo menos um setor de destino.");
      return;
    }

    setEnviando(true);

    const payload = {
      titulo,
      descricao,
      setores_destino: setoresSelecionados,
      prioridade,
      criado_por: sessao.id 
    };

    try {
      await axios.post("http://localhost:3001/api/cards", payload);
      alert("Demanda registrada com sucesso!");
      
      // Limpa o formulário após o sucesso
      setTitulo("");
      setDescricao("");
      setSetoresSelecionados([]);
      setPrioridade("normal");
      
      onSuccess(); // Avisa o Pipeline para atualizar as colunas
      onClose();   // Fecha o modal
    } catch (error: any) {
      // Exibe a mensagem de erro vinda do Backend (ex: limite de atenção atingido)
      alert(error.response?.data?.error || "Erro ao conectar com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Abrir Nova Demanda</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TÍTULO */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Problema</label>
            <input 
              required
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Divergência na armação da viga V-20"
            />
          </div>

          {/* DESCRIÇÃO (CORREÇÃO: setDescricao agora é usado aqui) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Detalhamento Técnico</label>
            <textarea 
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 h-28 focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descreva o que aconteceu e o que precisa ser feito..."
            />
          </div>

          {/* SELEÇÃO DE SETORES */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enviar para quais setores?</label>
            <div className="grid grid-cols-2 gap-3">
              {setores.map(setor => (
                <label key={setor.id} className={`flex items-center space-x-2 text-sm border p-3 rounded-lg cursor-pointer transition ${setoresSelecionados.includes(setor.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600"
                    checked={setoresSelecionados.includes(setor.id)}
                    onChange={() => handleToggleSetor(setor.id)}
                  />
                  <span className="text-gray-700 font-medium">{setor.nome}</span>
                </label>
              ))}
            </div>
          </div>

          {/* PRIORIDADE COM TRAVA DE GESTÃO */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nível de Prioridade</label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              value={prioridade}
              onChange={e => setPrioridade(e.target.value)}
            >
              <option value="normal">Normal (Fluxo padrão)</option>
              <option value="atencao">⚠️ Atenção (Fila prioritária - Máx 48h)</option>
              {isGestor && (
                <option value="urgente" className="text-red-600 font-bold">🚨 URGENTE (Intervenção imediata)</option>
              )}
            </select>
            {!isGestor && (
              <p className="text-[10px] text-gray-500 mt-1">* Apenas PO e SM podem definir prioridade Urgente.</p>
            )}
          </div>

          {/* AÇÕES */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2 text-gray-500 font-medium hover:text-gray-700 transition"
              disabled={enviando}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition flex items-center ${enviando ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={enviando}
            >
              {enviando ? "Salvando..." : "Criar Demanda"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}