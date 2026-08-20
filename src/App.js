import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import ChatIA from './components/ChatIA';

// Ícones SVG
const HomeIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const VideoIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z" />
    <path d="M14 15V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2Z" />
  </svg>
);

const HistoryIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SupportIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/>
    <path d="M6.5 8a6.5 6.5 0 1 1 11 0"/>
    <path d="M12 11v10"/>
    <path d="m8 15 4-2 4 2"/>
  </svg>
);

const CalendarIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const FilterIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const XIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const appId = "cuidafissura-app";

const firebaseConfig = {
  apiKey: "AIzaSyAa9IofAyiRYwApZF5V0w86HwO-3Js4SXo",
  authDomain: "cuidafissura-app.firebaseapp.com",
  projectId: "cuidafissura-app",
  storageBucket: "cuidafissura-app.firebasestorage.app",
  messagingSenderId: "362489216538",
  appId: "1:362489216538:web:fc7b0d823f9f35a7599ba3",
  measurementId: "G-J3T5JPN19W",
};

const MOCK_VIDEOS = [
  {
    id: 1,
    title: "Fonoaudiologia na Fissura Labiopalatina",
    type: "Fonoaudiologia",
    tags: ["fala", "fonoaudiologia", "reabilitação", "tratamento"],
    youtubeId: "wPE3atuMn7c",
    thumbnail: "https://img.youtube.com/vi/wPE3atuMn7c/mqdefault.jpg",
    description: "Conheça o trabalho da fonoaudiologia no tratamento e reabilitação de pacientes com fissura labiopalatina."
  },
  {
    id: 2,
    title: "Cuidados Pós-Operatórios em Fissura Labiopalatina",
    type: "Pós-Cirúrgico",
    tags: ["cirurgia", "recuperação", "cuidados", "pós-operatório"],
    youtubeId: "p1Q6jTyr2FU",
    thumbnail: "https://img.youtube.com/vi/p1Q6jTyr2FU/mqdefault.jpg",
    description: "Orientações essenciais sobre os cuidados necessários após a cirurgia de correção de fissura labiopalatina."
  },
  {
    id: 3,
    title: "Tratamento para Fissura Labiopalatina",
    type: "Tratamento",
    tags: ["tratamento", "cirurgia", "reabilitação", "equipe multidisciplinar"],
    youtubeId: "IfCz5hNauIo",
    thumbnail: "https://img.youtube.com/vi/IfCz5hNauIo/mqdefault.jpg",
    description: "Conheça as etapas e opções de tratamento disponíveis para fissura labiopalatina."
  },
  {
    id: 4,
    title: "Alimentação em Crianças com Fissura Labiopalatina: Guia para Idades",
    type: "Alimentação",
    tags: ["alimentação", "nutrição", "crianças", "desenvolvimento"],
    youtubeId: "-KePQ0sFzYI",
    thumbnail: "https://img.youtube.com/vi/-KePQ0sFzYI/mqdefault.jpg",
    description: "Guia completo sobre alimentação adequada para crianças com fissura labiopalatina em diferentes fases do desenvolvimento."
  },
  {
    id: 5,
    title: "O Que é Fissura Labiopalatina?",
    type: "Educativo",
    tags: ["informação", "diagnóstico", "causas", "tipos"],
    youtubeId: "Dz6OGVW3kRc",
    thumbnail: "https://img.youtube.com/vi/Dz6OGVW3kRc/mqdefault.jpg",
    description: "Explicação completa sobre o que é fissura labiopalatina, suas causas, tipos e como acontece."
  },
  {
    id: 6,
    title: "Nutrição Para Crianças com Fissura Labiopalatina",
    type: "Nutricional",
    tags: ["nutrição", "dieta", "alimentação saudável", "desenvolvimento"],
    youtubeId: "n6E1s-ybQzg",
    thumbnail: "https://img.youtube.com/vi/n6E1s-ybQzg/mqdefault.jpg",
    description: "Orientações nutricionais específicas e dicas de alimentação para crianças com fissura labiopalatina."
  },
  {
    id: 7,
    title: "Higiene Bucal: Para Crianças Com Fissura Labiopalatina",
    type: "Higiene Bucal",
    tags: ["higiene", "cuidados bucais", "limpeza", "saúde bucal"],
    youtubeId: "0enDhL-YZSY",
    thumbnail: "https://img.youtube.com/vi/0enDhL-YZSY/mqdefault.jpg",
    description: "Como realizar a higiene bucal adequada em crianças com fissura labiopalatina, técnicas e cuidados especiais."
  },
  {
    id: 8,
    title: "Depoimentos de Famílias - Superação",
    type: "Depoimentos",
    tags: ["depoimentos", "histórias reais", "superação", "esperança", "famílias"],
    youtubeId: "tNP3BSBv2F8",
    thumbnail: "https://img.youtube.com/vi/tNP3BSBv2F8/mqdefault.jpg",
    description: "Histórias inspiradoras e emocionantes de famílias que passaram pelo tratamento de fissura labiopalatina. Depoimentos reais de superação e esperança."
  },
];

const MOCK_APPOINTMENTS = [
  { id: 101, type: "Consulta", specialist: "Fonoaudiólogo", date: "2025-12-05", time: "14:00" },
  { id: 102, type: "Exame", specialist: "Radiologia", date: "2025-12-18", time: "09:30" },
  { id: 103, type: "Cirurgia", specialist: "Plástica", date: "2026-01-20", time: "07:00" },
];

const getMedicalRecordPath = (userId) => `artifacts/${appId}/users/${userId}/medical_records`;

const LoginScreen = ({ auth, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Erro no login:", error);
      if (error.code === "auth/user-not-found") {
        setError("Usuário não encontrado. Crie uma conta primeiro!");
      } else if (error.code === "auth/wrong-password") {
        setError("Senha incorreta. Tente novamente.");
      } else if (error.code === "auth/invalid-email") {
        setError("Email inválido.");
      } else if (error.code === "auth/invalid-credential") {
        setError("Email ou senha incorretos.");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Erro:", error);
      setError("Erro ao entrar como visitante.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 bg-asinp-verde rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl animate-bounce-slow">
            <span className="text-5xl">🏥</span>
          </div>
          <h1 className="text-5xl font-bold text-asinp-laranja mb-2">
            ASINP Apoio
          </h1>
          <p className="text-gray-600 text-lg">Bem-vindo de volta!</p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-asinp-verde focus:border-asinp-verde transition-all bg-yellow-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-asinp-verde focus:border-asinp-verde transition-all bg-yellow-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-asinp-laranja hover:bg-asinp-verde text-white font-bold py-5 px-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? "⏳ Entrando..." : "🔐 Entrar"}
            </button>
          </form>

          {/* Link para Criar Conta */}
          <button
            onClick={onSwitchToRegister}
            className="w-full mt-6 text-asinp-verde font-semibold py-3 hover:text-asinp-laranja transition-colors text-center"
          >
            Não tem conta? <span className="underline">Criar agora</span>
          </button>

          {/* Divisor */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-semibold">ou</span>
              </div>
            </div>
          </div>
          {/* Botão Visitante */}
          <button
            onClick={handleAnonymousLogin}
            disabled={isLoading}
            className="w-full bg-white border-2 border-asinp-laranja text-asinp-laranja hover:bg-asinp-laranja hover:text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "⏳ Entrando..." : "👤 Entrar como Visitante"}
          </button>
        </div>

        {/* Rodapé */}
        <p className="text-center text-gray-500 text-sm mt-8">
          © 2025 ASINP - Associação de Apoio
        </p>
      </div>
    </div>
  );
};

const RegisterScreen = ({ auth, db, onSwitchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setIsLoading(true);

    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error) {
      console.error("Erro no cadastro:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("Este email já está cadastrado!");
      } else if (error.code === "auth/invalid-email") {
        setError("Email inválido!");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-8">
        {/* Logo e Título */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 bg-asinp-verde rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl animate-bounce-slow">
            <span className="text-5xl">✨</span>
          </div>
          <h1 className="text-5xl font-bold text-asinp-laranja mb-2">
            Criar Conta
          </h1>
          <p className="text-gray-600 text-lg">Junte-se à nossa comunidade de apoio</p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João Silva"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-asinp-verde focus:border-asinp-verde transition-all bg-yellow-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-asinp-verde focus:border-asinp-verde transition-all bg-yellow-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-asinp-verde focus:border-asinp-verde transition-all bg-yellow-50"
              />
              <p className="text-xs text-gray-500 mt-1">A senha deve ter pelo menos 6 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
                required
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-asinp-verde focus:border-asinp-verde transition-all bg-yellow-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-asinp-laranja hover:bg-asinp-verde text-white font-bold py-5 px-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? "⏳ Criando conta..." : "✨ Criar Conta"}
            </button>
          </form>

          {/* Link para Login */}
          <button
            onClick={onSwitchToLogin}
            className="w-full mt-6 text-asinp-verde font-semibold py-3 hover:text-asinp-laranja transition-colors text-center"
          >
            Já tem conta? <span className="underline">Fazer login</span>
          </button>
        </div>

        {/* Rodapé */}
        <p className="text-center text-gray-500 text-sm mt-8">
          © 2025 ASINP - Associação de Apoio
        </p>
      </div>
    </div>
  );
};

const AuthScreen = ({ auth, db }) => {
  const [showRegister, setShowRegister] = useState(false);

  return showRegister ? (
    <RegisterScreen
      auth={auth}
      db={db}
      onSwitchToLogin={() => setShowRegister(false)}
    />
  ) : (
    <LoginScreen
      auth={auth}
      onSwitchToRegister={() => setShowRegister(true)}
    />
  );
};

const TimelineStep = ({ label, active, current }) => (
  <div className="flex flex-col items-center">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${current ? "bg-asinp-laranja text-white shadow-lg scale-110" : active ? "bg-asinp-verde text-white" : "bg-gray-300 text-gray-500"}`}>
      {current ? "★" : active ? "✓" : "○"}
    </div>
    <span className="text-xs mt-2 text-center max-w-[70px] leading-tight font-medium">{label}</span>
  </div>
);

const HomeScreen = ({ userId, appointments, onNavigate }) => {
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-4 lg:p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-6">Bem-vindo(a)! 👋</h1>

        {/* Grid responsivo para desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Linha do Tempo */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-asinp-verde hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => alert("🎯 Linha do Tempo:\n\n✓ Diagnóstico - Concluído\n★ 1ª Cirurgia - Fase Atual\n○ Fono/Acompanhamento - Próxima fase\n\nEm breve você poderá editar essas fases!")}>
            <h2 className="text-lg lg:text-xl font-semibold text-asinp-verde mb-4 flex items-center">
              <span className="mr-2">🎯</span> Linha do Tempo
              <span className="ml-auto text-xs bg-asinp-amarelo text-white px-3 py-1 rounded-full">Clique</span>      
            </h2>
            <div className="flex justify-between items-center mb-4">
              <TimelineStep label="Diagnóstico" active={true} />
              <div className="flex-grow h-1 bg-asinp-verde mx-2 rounded"></div>
              <TimelineStep label="1ª Cirurgia" active={true} current={true} />
              <div className="flex-grow h-1 bg-gray-200 mx-2 rounded"></div>
              <TimelineStep label="Fono/Acomp." active={false} />
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-asinp-laranja">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-asinp-laranja">Fase Atual:</span> Pós-operatório, foco na recuperação e nutrição adequada.
              </p>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-asinp-verde p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 flex items-center">
              ⚡ Ações Rápidas
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('history')}
                className="bg-white/20 hover:bg-white/30 text-white p-3 lg:p-4 rounded-xl transition-all backdrop-blur-sm font-semibold text-sm lg:text-base" 
              >
                📋 Adicionar<br />Procedimento
              </button>
              <button
                onClick={() => onNavigate('videos')}
                className="bg-white/20 hover:bg-white/30 text-white p-3 lg:p-4 rounded-xl transition-all backdrop-blur-sm font-semibold text-sm lg:text-base" 
              >
                🎥 Ver<br />Vídeos
              </button>
              <button
                onClick={() => onNavigate('support')}
                className="bg-white/20 hover:bg-white/30 text-white p-3 lg:p-4 rounded-xl transition-all backdrop-blur-sm font-semibold text-sm lg:text-base" 
              >
                💬 Falar com<br />Equipe
              </button>
              <button
                onClick={() => alert("📊 Relatórios em desenvolvimento!\n\nEm breve você poderá ver:\n• Progresso do tratamento\n• Histórico completo\n• Estatísticas")}
                className="bg-white/20 hover:bg-white/30 text-white p-3 lg:p-4 rounded-xl transition-all backdrop-blur-sm font-semibold text-sm lg:text-base" 
              >
                📊 Ver<br />Relatórios
              </button>
            </div>
          </div>
        </div>

        {/* Próximos Compromissos - Largura Total */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-asinp-amarelo mb-6">
          <h2 className="text-lg lg:text-xl font-semibold text-asinp-verde mb-4 flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2" /> Próximos Compromissos
          </h2>

          {appointments.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(showAllAppointments ? appointments : appointments.slice(0, 4)).map((app) => (
                  <div
                    key={app.id}
                    className="border-l-4 border-asinp-amarelo p-4 bg-yellow-50 rounded-xl hover:shadow-md hover:bg-yellow-100 transition-all cursor-pointer"
                    onClick={() => {
                      const confirmMsg = `📅 ${app.type}\n\nEspecialista: ${app.specialist}\nData: ${new Date(app.date).toLocaleDateString("pt-BR")}\nHorário: ${app.time}\n\nDeseja adicionar um lembrete?`;
                      if (window.confirm(confirmMsg)) {
                        alert("✅ Lembrete configurado!\n\nVocê receberá uma notificação 1 dia antes.");
                      }
                    }}
                  >
                    <p className="font-bold text-gray-800 text-base lg:text-lg">{app.type}</p>
                    <p className="text-gray-600 text-sm">{app.specialist}</p>
                    <p className="text-xs lg:text-sm text-gray-500 mt-1 flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {new Date(app.date).toLocaleDateString("pt-BR")} às {app.time}
                    </p>
                    <button className="mt-2 text-xs bg-asinp-amarelo text-white px-3 py-1 rounded-full hover:bg-asinp-laranja transition-colors">
                      Adicionar Lembrete
                    </button>
                  </div>
                ))}
              </div>

              {appointments.length > 4 && (
                <button
                  onClick={() => setShowAllAppointments(!showAllAppointments)}
                  className="w-full mt-4 text-sm text-asinp-verde font-semibold hover:text-asinp-laranja transition-colors py-2 bg-green-50 rounded-xl hover:bg-green-100"
                >
                  {showAllAppointments ? "▲ Ver Menos" : `▼ Ver Todos (${appointments.length} compromissos)`}
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum compromisso agendado.</p>
          )}
        </div>

        <div className="h-20"></div>
      </div>
    </div>
  );
};

const HistoryScreen = ({ medicalRecords, db, userId }) => {
  const [newRecordType, setNewRecordType] = useState("Consulta");
  const [newRecordDesc, setNewRecordDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddRecord = async () => {
    if (!newRecordDesc || !userId) return;
    setIsLoading(true);

    const newProcedure = {
      type: newRecordType,
      description: newRecordDesc,
      date: new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = doc(db, getMedicalRecordPath(userId), "procedures");
      await setDoc(docRef, { records: arrayUnion(newProcedure) }, { merge: true });
      setNewRecordDesc("");
    } catch (e) {
      console.error("Erro:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedRecords = useMemo(() => {
    return [...(medicalRecords || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [medicalRecords]);

  return (
    <div className="p-6 overflow-y-auto bg-white min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📋 Histórico Médico</h1>

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-asinp-verde">
        <h2 className="text-xl font-semibold text-asinp-verde mb-4">Adicionar Procedimento</h2>
        <select
          value={newRecordType}
          onChange={(e) => setNewRecordType(e.target.value)}
          className="w-full p-4 border-2 border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-asinp-verde focus:border-asinp-verde transition-all"
        >
          {["Consulta", "Exame", "Laudo", "Cirurgia", "Medicação"].map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <textarea
          value={newRecordDesc}
          onChange={(e) => setNewRecordDesc(e.target.value)}
          placeholder="Descreva o procedimento..."
          rows="3"
          className="w-full p-4 border-2 border-gray-200 rounded-xl mb-3 focus:ring-2 focus:ring-asinp-verde focus:border-asinp-verde transition-all"
        ></textarea>
        <button
          onClick={handleAddRecord}
          disabled={isLoading || !newRecordDesc}
          className="w-full bg-gradient-to-r from-asinp-verde to-asinp-verde hover:from-asinp-verde hover:to-asinp-verde text-white font-semibold py-4 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? "Salvando..." : "💾 Salvar Procedimento"}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Registros Anteriores</h2>
        {sortedRecords.length > 0 ? (
          sortedRecords.map((record, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-asinp-laranja hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-xl text-asinp-laranja">{record.type}</span>
                <span className="text-xs bg-asinp-verde text-white px-3 py-1 rounded-full">
                  {record.date ? new Date(record.date).toLocaleDateString("pt-BR") : "Data Indefinida"}
                </span>
              </div>
              <p className="text-gray-600">{record.description}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 mb-3">📝 Nenhum registro ainda</p>
            <p className="text-sm text-gray-400">Adicione seu primeiro procedimento acima</p>
          </div>
        )}
      </div>
      <div className="h-20"></div>
    </div>
  );
};

const VideosScreen = () => {
  const [selectedType, setSelectedType] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);

  const allTypes = useMemo(() => {
    const types = [...new Set(MOCK_VIDEOS.map((v) => v.type))];
    return types.sort();
  }, []);

  const filteredVideos = useMemo(() => {
    return MOCK_VIDEOS.filter((video) => {
      const matchesType = selectedType === "Todos" || video.type === selectedType;
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          video.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [selectedType, searchTerm]);

  const handleWatchVideo = (video) => {
    setPlayingVideo(video);
  };

  const closeVideo = () => {
    setPlayingVideo(null);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Modal de Vídeo */}
      {playingVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closeVideo}
        >
          <div 
            className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="bg-asinp-verde p-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">{playingVideo.title}</h2>
              <button
                onClick={closeVideo}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Player do Vídeo */}
            <div className="relative pt-[56.25%] bg-black">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=1`}
                title={playingVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            {/* Informações do Vídeo */}
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-asinp-verde font-semibold mb-2">{playingVideo.type}</p>
              <p className="text-gray-700 mb-4">{playingVideo.description}</p>
              <div className="flex flex-wrap gap-2">
                {playingVideo.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-green-50 text-asinp-verde px-3 py-1 rounded-full border border-asinp-verde">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-white shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-asinp-verde">🎥 Vídeos</h1>
          <button
            onClick={() => setShowFilters(true)}
            className="bg-asinp-laranja text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-asinp-amarelo transition-colors shadow-md"
          >
            <FilterIcon className="w-5 h-5" />
            <span className="font-semibold">Filtros</span>
          </button>
        </div>
        <input
          type="text"
          placeholder="🔍 Buscar vídeos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-asinp-verde focus:border-asinp-verde transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-transparent hover:border-asinp-verde">   
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => handleWatchVideo(video)}
              />
              <div className="p-5">
                <h2 className="font-bold text-lg text-asinp-verde mb-2">{video.title}</h2>
                <p className="text-sm text-asinp-verde mb-2 font-semibold">{video.type}</p>
                {video.description && (
                  <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {video.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-green-50 text-asinp-verde px-3 py-1 rounded-full border border-asinp-verde"> 
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleWatchVideo(video)}
                className="w-full bg-asinp-amarelo text-white font-semibold py-4 hover:bg-asinp-laranja transition-all"
              >
                ▶️ Assistir Vídeo
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl shadow-md">
            <p className="text-gray-500 mb-2">📹 Nenhum vídeo encontrado</p>
            <button onClick={() => { setSelectedType("Todos"); setSearchTerm(""); }} className="text-asinp-verde font-semibold hover:text-asinp-verde">   
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-20">
          <div className="bg-white w-full p-6 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-asinp-verde">🎯 Filtros</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <h3 className="font-semibold mb-3">Categoria</h3>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-asinp-verde"
            >
              <option value="Todos">Todas</option>
              {allTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(false)}
              className="w-full bg-gradient-to-r from-asinp-verde to-asinp-verde text-white font-semibold py-4 rounded-xl hover:from-asinp-verde hover:to-asinp-verde transition-all shadow-lg"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SupportScreen = () => {
  return <ChatIA />;
};

export default function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments] = useState(MOCK_APPOINTMENTS);

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestore);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (user) setUserId(user.uid);
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Erro:", e);
    }
  }, []);

  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;
    const docRef = doc(db, getMedicalRecordPath(userId), "procedures");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().records) {
        setMedicalRecords(docSnap.data().records);
      } else {
        setMedicalRecords([]);
      }
    });

    return () => unsubscribe();
  }, [isAuthReady, userId, db]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      setUserId(null);
      setCurrentPage("home");
    }
  };

  if (!isAuthReady || !userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        {auth && !userId ? <AuthScreen auth={auth} db={db} /> : <div className="text-gray-500">Carregando...</div>}
      </div>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case "home": return <HomeScreen userId={userId} appointments={appointments} onNavigate={setCurrentPage} />;
      case "history": return <HistoryScreen medicalRecords={medicalRecords} db={db} userId={userId} />;
      case "videos": return <VideosScreen />;
      case "support": return <SupportScreen />;
      default: return <HomeScreen userId={userId} appointments={appointments} onNavigate={setCurrentPage} />;
    }
  };

  const NavItem = ({ icon: Icon, label, current, onClick }) => (
    <button
      className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${current ? "text-asinp-verde bg-green-50" : "text-gray-500 hover:text-asinp-verde hover:bg-green-50"}`}
      onClick={onClick}
    >
      <Icon className="w-7 h-7" />
      <span className="text-xs mt-1 font-semibold">{label}</span>
    </button>
  );

  const SidebarButton = ({ icon: Icon, label, current, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        current 
          ? "bg-green-50 text-asinp-verde font-semibold shadow-sm" 
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-6 h-6" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      {/* Header - Responsivo */}
      <div className="bg-asinp-azul px-4 lg:px-12 py-3 lg:py-5 flex justify-between items-center shadow-lg">        
        <div>
          <h1 className="text-lg lg:text-2xl text-white font-bold">APP ASINP APOIO</h1>
          <p className="text-white/90 text-xs lg:text-sm">Plataforma de Apoio</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white/20 hover:bg-white/30 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all flex items-center space-x-1 lg:space-x-2"
        >
          <span>🚪</span>
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>

      {/* Layout Desktop com Sidebar (telas >= 1024px) */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Sidebar - Apenas Desktop */}
        <nav className="w-64 xl:w-80 bg-white border-r-2 border-gray-200 p-6 flex flex-col shadow-lg">
          <div className="mb-8">
            <h2 className="text-asinp-verde font-bold text-xl mb-1">Menu</h2>
            <p className="text-gray-500 text-sm">Navegação principal</p>
          </div>
          
          <div className="space-y-2 flex-1">
            <SidebarButton 
              icon={HomeIcon} 
              label="Início" 
              current={currentPage === "home"} 
              onClick={() => setCurrentPage("home")} 
            />
            <SidebarButton 
              icon={HistoryIcon} 
              label="Histórico Médico" 
              current={currentPage === "history"} 
              onClick={() => setCurrentPage("history")} 
            />
            <SidebarButton 
              icon={VideoIcon} 
              label="Vídeos Educativos" 
              current={currentPage === "videos"} 
              onClick={() => setCurrentPage("videos")} 
            />
            <SidebarButton 
              icon={SupportIcon} 
              label="Chat de Apoio" 
              current={currentPage === "support"} 
              onClick={() => setCurrentPage("support")} 
            />
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-asinp-verde/20">
            <p className="text-xs text-gray-600 mb-2 font-semibold">💡 Dica do Dia</p>
            <p className="text-sm text-gray-700">Explore os vídeos educativos para aprender mais!</p>
          </div>
        </nav>
        
        {/* Conteúdo Principal Desktop */}
        <div className="flex-1 overflow-hidden bg-gray-50">{renderContent()}</div>
      </div>

      {/* Layout Mobile (telas < 1024px) */}
      <div className="flex lg:hidden flex-1 overflow-hidden">{renderContent()}</div>

      {/* Navegação Inferior - Apenas Mobile */}
      <nav className="lg:hidden bg-white border-t-2 border-gray-200 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around">
          <NavItem icon={HomeIcon} label="Início" current={currentPage === "home"} onClick={() => setCurrentPage("home")} />   
          <NavItem icon={HistoryIcon} label="Histórico" current={currentPage === "history"} onClick={() => setCurrentPage("history")} />
          <NavItem icon={VideoIcon} label="Vídeos" current={currentPage === "videos"} onClick={() => setCurrentPage("videos")} />
          <NavItem icon={SupportIcon} label="Apoio" current={currentPage === "support"} onClick={() => setCurrentPage("support")} />
        </div>
      </nav>
    </div>
  );
}