import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- COMPONENTE DO CARD ---
const CardPeca = ({ id, nomePeca, data, secao, processo }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dataFormatada = data ? new Date(data).toLocaleDateString('pt-BR') : "---";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border-l-4 border-blue-500 border dark:border-gray-600 cursor-grab active:cursor-grabbing hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start">
        <p className="font-bold text-gray-800 dark:text-white text-[11px] uppercase tracking-tighter">{nomePeca}</p>
        <span className="text-[8px] bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-500 font-bold">{secao}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[9px] text-gray-500 dark:text-gray-400">📅 {dataFormatada}</p>
        <span className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 dark:bg-blue-900/30 px-1 rounded">
          {processo}
        </span>
      </div>
    </div>
  );
};

// --- COMPONENTE DA COLUNA ---
const Coluna = ({ titulo, itens, cor }: any) => {
  return (
    <div className="flex flex-col min-w-[260px] bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border-t-4 shadow-sm h-fit max-h-[75vh]" style={{ borderColor: cor }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[10px] dark:text-white uppercase tracking-wider">{titulo}</h2>
        <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          {itens.length}
        </span>
      </div>
      <SortableContext items={itens.map((i: any) => i.codigoControle)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 overflow-y-auto pr-1 no-scrollbar">
          {itens.map((item: any) => (
            <CardPeca key={item.codigoControle} id={item.codigoControle} nomePeca={item.nomePeca} data={item.data} secao={item.secao} processo={item.processo} />
          ))}
          {itens.length === 0 && <div className="py-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 text-[10px] uppercase font-bold">Vazio</div>}
        </div>
      </SortableContext>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const Kanban = () => {
  const [siglaObra, setSiglaObra] = useState("562");
  const [data, setData] = useState<any>({ planej: [], detalham: [], producao: [], expedicao: [], montagem: [] });
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // LISTA COMPLETA DE OBRAS ATUALIZADA
  const listaObras = [
    { id: "535", nome: "535 | FRIVATTI - ALMOXARIFADO (A)" },
    { id: "537", nome: "537 | FRIVATTI - COLETA SELETIVA (C)" },
    { id: "542", nome: "542 | FRIVATTI - LAV. CAMINHÕES (H)" },
    { id: "544", nome: "544 | FRIVATTI - NAVE PRINCIPAL (J)" },
    { id: "545", nome: "545 | FRIVATTI - POCILGA (K)" },
    { id: "546", nome: "546 | FRIVATTI - POCILGA PLACAS (L)" },
    { id: "547", nome: "547 | FRIVATTI - SL. MÁQUINAS (M)" },
    { id: "548", nome: "548 | FRIVATTI - SOCIAL (N)" },
    { id: "550", nome: "550 | FRIVATTI - ADMINISTRATIVO (P)" },
    { id: "556", nome: "556 | VANZELLA LTDA" },
    { id: "562", nome: "562 | ADM ENG. - SOORO" },
    { id: "564", nome: "564 | SOORO RENNER" },
    { id: "566", nome: "566 | ADM - C.VALE" },
    { id: "568", nome: "568 | CBM - SOORO PLATAFORMA" },
  ];

  const stats = useMemo(() => {
    const total = data.planej.length + data.detalham.length + data.producao.length + data.expedicao.length + data.montagem.length;
    const getPercent = (qtd: number) => total > 0 ? ((qtd / total) * 100).toFixed(1) : "0";
    return {
      total,
      planej: { qtd: data.planej.length, pct: getPercent(data.planej.length) },
      detalham: { qtd: data.detalham.length, pct: getPercent(data.detalham.length) },
      producao: { qtd: data.producao.length, pct: getPercent(data.producao.length) },
      expedicao: { qtd: data.expedicao.length, pct: getPercent(data.expedicao.length) },
      montagem: { qtd: data.montagem.length, pct: getPercent(data.montagem.length) },
    };
  }, [data]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://179.124.195.91:1890/ADM_Engemarko/api/bi/exportaStatusProducao?sigla=${siglaObra}`);
        const pecas = response.data || [];
        setData({
          planej: pecas.filter((p: any) => p.processo === "PLANEJAMENTO"),
          detalham: pecas.filter((p: any) => p.processo === "PROJETADA"),
          producao: pecas.filter((p: any) => p.processo === "CONCRETAGEM" || p.processo === "ACABADA"),
          expedicao: pecas.filter((p: any) => p.processo === "EXPEDIDA"),
          montagem: pecas.filter((p: any) => p.processo === "MONTADA"),
        });
      } catch (err) {
        setData({ planej: [], detalham: [], producao: [], expedicao: [], montagem: [] });
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [siglaObra]);

  return (
    <div className="p-4 h-full flex flex-col gap-6 bg-gray-50 dark:bg-transparent min-h-screen">
      {/* HEADER E FILTRO */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Status de Produção</h1>
          <p className="text-xs text-blue-600 font-bold tracking-widest uppercase mt-1">Engemarko Engenharia</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-[10px] font-black text-gray-400 uppercase">Selecione o Projeto:</label>
          <select 
            value={siglaObra} 
            onChange={(e) => setSiglaObra(e.target.value)} 
            className="bg-gray-100 dark:bg-gray-700 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[300px]"
          >
            {listaObras.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
          </select>
        </div>
      </header>

      {/* PAINEL DE ESTATÍSTICAS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-2xl shadow-lg text-white">
          <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Total Geral</p>
          <h3 className="text-3xl font-black">{stats.total}</h3>
          <p className="text-[9px] mt-2 font-medium opacity-60 italic">Peças catalogadas</p>
        </div>
        {[
          { label: "Planejamento", color: "text-blue-500", data: stats.planej },
          { label: "Detalhamento", color: "text-purple-500", data: stats.detalham },
          { label: "Produção", color: "text-orange-500", data: stats.producao },
          { label: "Expedição", color: "text-pink-500", data: stats.expedicao },
          { label: "Montagem", color: "text-emerald-500", data: stats.montagem },
        ].map((s, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className={`text-[10px] uppercase font-bold mb-2 ${s.color}`}>{s.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black dark:text-white">{s.data.qtd}</h3>
              <span className="text-xs text-gray-400 font-bold">{s.data.pct}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
               <div className={`h-full rounded-full ${s.color.replace('text', 'bg')}`} style={{ width: `${s.data.pct}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* QUADRO KANBAN */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center dark:text-white py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-black text-gray-400 animate-pulse tracking-widest uppercase">Sincronizando com a Fábrica...</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners}>
          <div className="flex flex-row gap-6 overflow-x-auto pb-10 no-scrollbar flex-1 items-start">
            <Coluna titulo="Planej. Montagem" itens={data.planej} cor="#3b82f6" />
            <Coluna titulo="Proj. Detalhamento" itens={data.detalham} cor="#a855f7" />
            <Coluna titulo="Exec. Produção" itens={data.producao} cor="#f97316" />
            <Coluna titulo="Exec. Expedição" itens={data.expedicao} cor="#ec4899" />
            <Coluna titulo="Exec. Montagem" itens={data.montagem} cor="#10b981" />
          </div>
        </DndContext>
      )}
    </div>
  );
};

export default Kanban;