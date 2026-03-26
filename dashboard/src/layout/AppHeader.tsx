import { useState, useEffect } from "react";
import { LogOut, ShieldCheck, Settings, HardHat, Menu } from "lucide-react";
import { useNavigate } from "react-router";
import { useSidebar } from "../context/SidebarContext"; 

const AppHeader = () => {
  const navigate = useNavigate();
  const { toggleSidebar, toggleMobileSidebar } = useSidebar(); 
  const [userData, setUserData] = useState({
    nome: "Carregando...",
    perfil: "DEV"
  });

  useEffect(() => {
    const sessao = localStorage.getItem("@Engemarko:Sessao");
    if (sessao) {
      setUserData(JSON.parse(sessao));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("@Engemarko:Sessao");
    navigate("/");
    window.location.reload(); 
  };

  // FUNÇÃO CORRIGIDA: Detecta se é mobile ou desktop antes de alternar
  const handleToggle = () => {
    if (window.innerWidth < 1280) { // 1280px é o padrão 'xl' do seu layout
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  const getProfileIcon = () => {
    switch (userData.perfil) {
      case "PO": return <ShieldCheck className="text-blue-600" size={18} />;
      case "SM": return <Settings className="text-amber-500" size={18} />;
      default: return <HardHat className="text-gray-500" size={18} />;
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 sm:px-8 flex items-center justify-between shadow-sm relative z-[60]">
      
      {/* LADO ESQUERDO: Botão de Menu + Identificação */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggle} // Usando a função inteligente
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
        >
          <Menu size={22} />
        </button>

        <div className="flex flex-col border-l border-gray-100 dark:border-gray-700 pl-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Unidade</span>
          <h2 className="text-sm font-bold dark:text-white mt-1">Engemarko - Marechal C. Rondon</h2>
        </div>
      </div>

      {/* LADO DIREITO: Usuário */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-black dark:text-white leading-none uppercase">{userData.nome}</p>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
            {userData.perfil === "PO" ? "Product Owner" : userData.perfil === "SM" ? "Scrum Master" : "Equipe de Dev"}
          </span>
        </div>

        <div className="relative group">
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center border border-gray-100 dark:border-gray-600 cursor-pointer transition-all group-hover:ring-2 group-hover:ring-blue-500">
            {getProfileIcon()}
          </div>
          
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-[11px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-black uppercase transition-colors"
            >
              Sair do Sistema
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;