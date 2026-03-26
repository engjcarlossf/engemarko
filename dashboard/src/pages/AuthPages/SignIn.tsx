import { useState } from "react";
import { useNavigate } from "react-router"; 

const SignIn = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro("");

    try {
      // Chamada para o seu servidor Node na porta 3001
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: usuario,
          senha: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Agora os dados (nome, perfil) vêm direto do seu Postgres!
        const dadosUsuario = {
          nome: data.user.nome,
          usuario: usuario,
          perfil: data.user.perfil,
          logado: true
        };

        localStorage.setItem("@Engemarko:Sessao", JSON.stringify(dadosUsuario));
        navigate("/pipeline");
      } else {
        setErro(data.message || "Usuário ou senha inválidos.");
      }
    } catch (error) {
      setErro("Não foi possível conectar ao servidor. Verifique se o Node está rodando.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">Engemarko Login</h2>
          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Portal de Engenharia</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {erro && (
            <div className="bg-red-50 text-red-500 text-[10px] font-bold p-3 rounded-xl text-center uppercase border border-red-100">
              {erro}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Usuário</label>
            <input 
              required 
              type="text" 
              value={usuario} 
              onChange={(e) => setUsuario(e.target.value)}
              disabled={carregando}
              className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1 disabled:opacity-50" 
              placeholder="ex: jferreira"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Senha</label>
            <input 
              required 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={carregando}
              className="w-full bg-gray-100 dark:bg-gray-700 dark:text-white border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1 disabled:opacity-50" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-400"
          >
            {carregando ? "Verificando..." : "Entrar no Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;