import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import Calendar from "./pages/Calendar";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

// --- IMPORTS DE ENGENHARIA ---
import Kanban from './pages/Kanban/index';
import Pipeline from './pages/Pipeline/index';

// Componente de Proteção com Log de Segurança
const ProtectedRoute = ({ allowedProfiles }: { allowedProfiles: string[] }) => {
  const sessao = localStorage.getItem("@Engemarko:Sessao");
  
  if (!sessao) return <Navigate to="/" replace />;

  try {
    const { perfil } = JSON.parse(sessao);
    // Se o perfil do usuário está na lista permitida, libera o acesso (Outlet)
    // Se não estiver, volta para o Dashboard que é o porto seguro
    return allowedProfiles.includes(perfil) ? <Outlet /> : <Navigate to="/dashboard" replace />;
  } catch (error) {
    return <Navigate to="/" replace />;
  }
};

export default function App() {
  const [autenticado, setAutenticado] = useState(!!localStorage.getItem("@Engemarko:Sessao"));

  useEffect(() => {
    const checkAuth = () => {
      setAutenticado(!!localStorage.getItem("@Engemarko:Sessao"));
    };
    window.addEventListener("storage", checkAuth);
    const interval = setInterval(checkAuth, 1000);
    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ROTA PÚBLICA / LOGIN 
          Agora a rota "/" renderiza SEMPRE o SignIn como base.
          Se o usuário já estiver autenticado, ele é levado para o Pipeline automaticamente.
        */}
        <Route 
          path="/" 
          element={autenticado ? <Navigate to="/pipeline" replace /> : <SignIn />} 
        />

        {/* ROTAS PROTEGIDAS COM LAYOUT */}
        <Route element={autenticado ? <AppLayout /> : <Navigate to="/" replace />}>
          
          {/* 1. ACESSO GERAL (PO, SM, DEV) */}
          <Route element={<ProtectedRoute allowedProfiles={["PO", "SM", "DEV"]} />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/kanban" element={<Kanban />} />
          </Route>

          {/* 2. ACESSO RESTRITO (Exemplo: Configurações de Setores) */}
          <Route element={<ProtectedRoute allowedProfiles={["PO", "SM"]} />}>
            {/* <Route path="/admin/setores" element={<SetoresConfig />} /> */}
          </Route>

        </Route>

        {/* ERROS E FALLBACK */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}