import { useState, useEffect } from "react";
import axios from "axios";
import CreateCardModal from "./CreateCardModal";
import CardItem from "./CardItem";

interface Card {
  id: number;
  titulo: string;
  status: string;
  prioridade: string;
  criado_em: string;
}

export default function Pipeline() {
  const [cards, setCards] = useState<Card[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Função para buscar os cards do seu Postgres
  const buscarCards = async () => {
    try {
      setCarregando(true);
      const res = await axios.get("http://localhost:3001/api/cards");
      setCards(res.data);
    } catch (err) {
      console.error("Erro ao carregar Pipeline", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarCards();
  }, []);

  // Filtros para as colunas
  const colunas = [
    { id: "triagem", titulo: "📥 Triagem", bg: "bg-gray-100" },
    { id: "execucao", titulo: "⚙️ Execução", bg: "bg-blue-50" },
    { id: "pendente", titulo: "⏳ Pendente", bg: "bg-orange-50" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pipeline Engemarko</h1>
          <p className="text-sm text-gray-500">Gestão de Demandas Técnicas</p>
        </div>
        <button 
          onClick={() => setModalAberto(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all"
        >
          + Nova Demanda
        </button>
      </div>

      {carregando ? (
        <div className="flex justify-center p-10 font-medium text-gray-400">Carregando painel...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {colunas.map((col) => (
            <div key={col.id} className={`${col.bg} p-4 rounded-xl border border-gray-200 min-h-[500px]`}>
              <h3 className="text-sm font-bold text-gray-700 mb-4 border-b pb-2 flex justify-between">
                {col.titulo}
                <span className="bg-gray-300 text-gray-700 px-2 rounded-full text-[10px]">
                  {cards.filter(c => c.status === col.id).length}
                </span>
              </h3>
              
              <div className="flex flex-col">
                {cards
                  .filter(c => c.status === col.id)
                  .map(card => (
                    <CardItem 
                      key={card.id} 
                      card={card} 
                      onOpen={(id) => console.log("Abrir card:", id)} 
                    />
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCardModal 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)} 
        onSuccess={buscarCards} // Recarrega a lista automaticamente ao criar
      />
    </div>
  );
}