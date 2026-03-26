// src/pages/Pipeline/CardItem.tsx
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CardProps {
  card: {
    id: number;
    titulo: string;
    prioridade: string;
    criado_em: string;
  };
  onOpen: (id: number) => void;
}

export default function CardItem({ card, onOpen }: CardProps) {
  // Estilos baseados na prioridade (Identidade visual Engemarko)
  const prioridadeStyle = {
    urgente: "border-l-4 border-red-600 bg-red-50 hover:bg-red-100",
    atencao: "border-l-4 border-yellow-500 bg-yellow-50 hover:bg-yellow-100",
    normal: "border-l-4 border-blue-400 bg-white hover:bg-gray-50",
  }[card.prioridade as "urgente" | "atencao" | "normal"] || "border-l-4 border-gray-300 bg-white";

  // Formatação da data usando a biblioteca instalada
  const dataFormatada = format(new Date(card.criado_em), "dd 'de' MMM", { locale: ptBR });

  return (
    <div 
      onClick={() => onOpen(card.id)}
      className={`p-4 mb-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${prioridadeStyle}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-sm ${
          card.prioridade === 'urgente' ? 'bg-red-600 text-white' : 
          card.prioridade === 'atencao' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
        }`}>
          {card.prioridade}
        </span>
        <span className="text-[10px] font-mono text-gray-400">
          ID-{card.id}
        </span>
      </div>
      
      <h4 className="text-sm font-bold text-gray-800 mb-3 leading-snug">
        {card.titulo}
      </h4>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex -space-x-2">
          {/* Avatar genérico para indicar que há setores envolvidos */}
          <div className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[8px] text-gray-500">
            E
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-medium">
          {dataFormatada}
        </p>
      </div>
    </div>
  );
}