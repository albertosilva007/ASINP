import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

// Componentes de Ícones (Lucide React)
const HomeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const VideoIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 8-6 4 6 4V8Z" />
    <path d="M14 15V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2Z" />
  </svg>
);
const HistoryIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const SupportIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a10 10 0 0 0-9.22 6.8c1.7.5 3.3.8 4.7 1.2s2.5.8 3.5 1.5c.8.5 1.4 1.2 1.8 2.1l-.8 1.4A4 4 0 0 0 12 19c.4 0 .8-.1 1.2-.4.4-.3.7-.6 1.1-1.2.4-.6.8-1 1.4-1.2l1-.4c.3 0 .7.1 1.2.2 2.6.4 4.8 1.5 6.4 3.1A10 10 0 0 0 12 2Z" />
  </svg>
);
const CalendarIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);
const SendIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
  </svg>
);
const FilterIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const XIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// --- CONFIGURAÇÃO FIREBASE (SUBSTITUA AQUI OS SEUS VALORES REAIS) ---

// 1. ID Único para o App (pode ser qualquer string)
const appId = "seu-app-fissura-teste";

// 2. Cole AQUI o objeto de configuração que você encontrou no Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAa9IofAyiRYwApZF5V0w86HwO-3Js4SXo",
  authDomain: "cuidafissura-app.firebaseapp.com",
  projectId: "cuidafissura-app",
  storageBucket: "cuidafissura-app.firebasestorage.app",
  messagingSenderId: "362489216538",
  appId: "1:362489216538:web:fc7b0d823f9f35a7599ba3",
  measurementId: "G-J3T5JPN19W",
};

// 3. O Token de autenticação é nulo no ambiente de desenvolvimento, forçando o login anônimo.
const initialAuthToken = null;

// --- FIM DA CONFIGURAÇÃO FIREBASE ---

// Mock data for the Video Library
const MOCK_VIDEOS = [
  {
    id: 1,
    title: "Sopa Cremosa para Pós-Cirurgia",
    type: "Nutricional",
    tags: ["textura líquida", "pós-cirúrgico", "bebês"],
    url: "https://placehold.co/400x200/4c7c8c/ffffff?text=Video+Nutricional+1",
  },
  {
    id: 2,
    title: "Pega Correta na Amamentação",
    type: "Alimentação",
    tags: ["amamentação", "recém-nascido"],
    url: "https://placehold.co/400x200/86a873/ffffff?text=Video+Amamentacao+1",
  },
  {
    id: 3,
    title: "Exercícios Fonoaudiológicos Básicos",
    type: "Fonoaudiologia",
    tags: ["fala", "início de tratamento"],
    url: "https://placehold.co/400x200/c7b299/ffffff?text=Video+Fono+1",
  },
  {
    id: 4,
    title: "Purê Enriquecido Sem Alergênicos",
    type: "Nutricional",
    tags: ["textura pastosa", "alergia leite"],
    url: "https://placehold.co/400x200/4c7c8c/ffffff?text=Video+Nutricional+2",
  },
  {
    id: 5,
    title: "Higiene Bucal Pós-Cirurgia",
    type: "Higiene Bucal",
    tags: ["pós-cirúrgico", "cuidados bucais"],
    url: "https://placehold.co/400x200/c7b299/ffffff?text=Video+Higiene+1",
  },
];

const MOCK_APPOINTMENTS = [
  {
    id: 101,
    type: "Consulta",
    specialist: "Fonoaudiólogo",
    date: "2025-12-05",
    time: "14:00",
  },
  {
    id: 102,
    type: "Exame",
    specialist: "Radiologia",
    date: "2025-12-18",
    time: "09:30",
  },
  {
    id: 103,
    type: "Cirurgia",
    specialist: "Plástica",
    date: "2026-01-20",
    time: "07:00",
  },
];

// --- FUNÇÕES DE CAMINHO FIREBASE ---

const getMedicalRecordPath = (userId) => {
  return `artifacts/${appId}/users/${userId}/medical_records`;
};

// Coleção pública para o chat de suporte (simulando um canal com a equipe)
const getSupportChatPath = () => {
  return `artifacts/${appId}/public/data/support_chat`;
};

// --- COMPONENTES DE TELA ---

// 1. Tela de Login (Simulação)
const LoginScreen = ({ auth, setUserId, setIsAuthReady, setError }) => {
  const handleLogin = async () => {
    try {
      if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken);
      } else {
        await signInAnonymously(auth);
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      setError("Falha ao iniciar a sessão. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-white">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">
        Plataforma de Apoio
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        Acompanhe o tratamento do seu familiar, acesse conteúdos e tire dúvidas
        com a equipe.
      </p>
      <button
        onClick={handleLogin}
        className="w-full max-w-xs bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition duration-200"
      >
        Entrar / Iniciar Sessão
      </button>
      <p className="mt-4 text-sm text-gray-500">
        <span className="font-bold">Atenção:</span> O login é feito de forma
        automática/anônima no ambiente de prototipagem para simular o acesso
        autenticado.
      </p>
    </div>
  );
};

// 2. Tela Inicial (Home)
const HomeScreen = ({ userId, appointments }) => (
  <div className="p-4 overflow-y-auto">
    <h1 className="text-2xl font-bold text-gray-800 mb-4">Bem-vindo(a)!</h1>

    {/* Linha do Tempo do Tratamento (Mockup) */}
    <div className="bg-white p-4 rounded-xl shadow-md mb-6">
      <h2 className="text-lg font-semibold text-teal-600 mb-3">
        Linha do Tempo (Motivação)
      </h2>
      <div className="flex justify-between items-center text-center">
        <TimelineStep label="Diagnóstico" active={true} />
        <div className="flex-grow h-0.5 bg-teal-200 mx-2"></div>
        <TimelineStep label="1ª Cirurgia" active={true} current={true} />
        <div className="flex-grow h-0.5 bg-gray-200 mx-2"></div>
        <TimelineStep label="Fono/Acompanhamento" active={false} />
      </div>
      <p className="mt-4 text-sm text-gray-600">
        <span className="font-semibold">Fase Atual:</span> Pós-operatório, foco
        na recuperação e nutrição.
      </p>
    </div>

    {/* Agenda e Lembretes */}
    <div className="bg-white p-4 rounded-xl shadow-md mb-6">
      <h2 className="text-lg font-semibold text-teal-600 mb-3 flex items-center">
        <CalendarIcon className="w-5 h-5 mr-2" /> Próximos Compromissos
      </h2>
      {appointments.length > 0 ? (
        appointments.slice(0, 2).map((app) => (
          <div
            key={app.id}
            className="border-l-4 border-yellow-500 p-3 bg-yellow-50 rounded-lg mb-2"
          >
            <p className="font-semibold text-gray-800">
              {app.type} ({app.specialist})
            </p>
            <p className="text-sm text-gray-600">
              {new Date(app.date).toLocaleDateString("pt-BR")} às {app.time}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">
          Nenhum compromisso agendado por enquanto.
        </p>
      )}
      <button className="text-sm text-teal-500 mt-2 font-medium">
        Ver Agenda Completa
      </button>
    </div>

    <div className="text-center mt-6">
      <p className="text-xs text-gray-400">ID do Usuário: {userId}</p>
    </div>
  </div>
);

const TimelineStep = ({ label, active, current }) => (
  <div className="flex flex-col items-center">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
        current
          ? "bg-teal-500 shadow-lg"
          : active
          ? "bg-teal-400"
          : "bg-gray-300"
      }`}
    >
      {current ? "★" : "✓"}
    </div>
    <span className="text-xs mt-1 text-center max-w-[60px] leading-tight text-gray-600">
      {label}
    </span>
  </div>
);

// 3. Tela de Histórico Médico
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
      await setDoc(
        docRef,
        {
          records: arrayUnion(newProcedure),
        },
        { merge: true }
      );
      setNewRecordDesc("");
    } catch (e) {
      console.error("Erro ao adicionar registro: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedRecords = useMemo(() => {
    return [...(medicalRecords || [])].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [medicalRecords]);

  return (
    <div className="p-4 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Histórico de Procedimentos
      </h1>

      {/* Formulário para Adicionar Novo Procedimento */}
      <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
        <h2 className="text-lg font-semibold text-teal-600 mb-3">
          Adicionar Novo Procedimento
        </h2>
        <div className="space-y-3">
          <select
            value={newRecordType}
            onChange={(e) => setNewRecordType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          >
            {["Consulta", "Exame", "Laudo", "Cirurgia", "Medicação"].map(
              (type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              )
            )}
          </select>
          <textarea
            value={newRecordDesc}
            onChange={(e) => setNewRecordDesc(e.target.value)}
            placeholder="Descreva o procedimento realizado (Ex: Cirurgia de Palato, Laudo de Fonoaudiologia, etc.)"
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
          ></textarea>
          <button
            onClick={handleAddRecord}
            disabled={isLoading || !newRecordDesc}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Salvar Procedimento"}
          </button>
        </div>
      </div>

      {/* Lista de Procedimentos */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">
          Registros Anteriores
        </h2>
        {sortedRecords.length > 0 ? (
          sortedRecords.map((record, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-md border-l-4 border-teal-400"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-lg text-teal-700">
                  {record.type}
                </span>
                <span className="text-xs text-gray-500">
                  {record.date
                    ? new Date(record.date).toLocaleDateString("pt-BR")
                    : "Data Indefinida"}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{record.description}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
            Nenhum registro encontrado. Adicione o primeiro!
          </p>
        )}
      </div>
    </div>
  );
};

// 4. Tela de Vídeos
const VideosScreen = () => {
  const allTags = useMemo(
    () => [...new Set(MOCK_VIDEOS.flatMap((v) => v.tags))],
    []
  );
  const allTypes = useMemo(
    () => [...new Set(MOCK_VIDEOS.map((v) => v.type))],
    []
  );

  const [selectedType, setSelectedType] = useState("Todos");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVideos = useMemo(() => {
    return MOCK_VIDEOS.filter((video) => {
      const typeMatch = selectedType === "Todos" || video.type === selectedType;
      const tagMatch =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => video.tags.includes(tag));
      const searchMatch = video.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return typeMatch && tagMatch && searchMatch;
    });
  }, [selectedType, selectedTags, searchTerm]);

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 bg-white shadow-md flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">
          Biblioteca de Conteúdo
        </h1>
        <button
          onClick={() => setShowFilters(true)}
          className="p-2 rounded-full text-teal-500 hover:bg-teal-100 transition duration-150"
        >
          <FilterIcon className="w-6 h-6" />
        </button>
      </header>

      {/* Search Bar */}
      <div className="p-4 pt-2 bg-white sticky top-[60px] z-10 shadow-sm">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      {/* Lista de Vídeos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <img
                src={video.url}
                alt={`Thumbnail do vídeo: ${video.title}`}
                className="w-full h-40 object-cover"
                onError={(e) =>
                  (e.target.src =
                    "https://placehold.co/400x200/999999/ffffff?text=Video+Indisponivel")
                }
              />
              <div className="p-4">
                <h2 className="font-semibold text-lg text-teal-700">
                  {video.title}
                </h2>
                <p className="text-sm text-gray-500 mb-2">{video.type}</p>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <button className="w-full bg-teal-500 text-white font-medium py-2 hover:bg-teal-600 transition duration-150">
                Assistir Vídeo
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-lg">
            <p>Nenhum vídeo encontrado com os filtros aplicados.</p>
            <button
              onClick={() => {
                setSelectedType("Todos");
                setSelectedTags([]);
                setSearchTerm("");
              }}
              className="mt-4 text-teal-500 font-medium text-sm"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal de Filtros (Simulação de tela separada) */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-20">
          <div className="bg-white w-full p-6 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-teal-600">
                Filtrar Conteúdo
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <XIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <h3 className="font-semibold mt-4 mb-2">Categoria (Tipo)</h3>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="Todos">Todas as Categorias</option>
              {allTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <h3 className="font-semibold mt-6 mb-2">
              Filtros Avançados (Tags)
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition duration-150 ${
                    selectedTags.includes(tag)
                      ? "bg-teal-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="w-full bg-teal-500 text-white font-semibold py-3 rounded-xl mt-8 hover:bg-teal-600"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={() => {
                setSelectedTags([]);
                setSelectedType("Todos");
                setSearchTerm("");
                setShowFilters(false);
              }}
              className="w-full text-teal-500 font-medium py-3 mt-2"
            >
              Limpar Todos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Tela de Suporte/Chat
const SupportScreen = ({ db, userId, isAuthReady }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = React.useRef(null);

  // Listener de Mensagens (Real-Time)
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const chatRef = collection(db, getSupportChatPath());
    // A query não tem orderBy() para evitar erro de índice no Canvas. Ordenaremos em memória.
    const q = query(chatRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedMessages = [];
        snapshot.forEach((doc) => {
          fetchedMessages.push(doc.data());
        });

        // Ordena em memória pela data de criação
        fetchedMessages.sort(
          (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
        );
        setMessages(fetchedMessages);
      },
      (error) => {
        console.error("Erro ao ouvir mensagens: ", error);
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, userId, db]);

  // Scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !db) return;

    setIsSending(true);
    const textToSend = newMessage.trim();
    setNewMessage("");

    const messageData = {
      userId: userId,
      text: textToSend,
      createdAt: serverTimestamp(),
      // Simulação de metadados para saber quem enviou (Paciente/Equipe)
      senderRole: "Paciente/Familiar",
      isPhoto: false, // Flag para mensagens de texto simples
    };

    try {
      await addDoc(collection(db, getSupportChatPath()), messageData);
    } catch (e) {
      console.error("Erro ao enviar mensagem: ", e);
      // Reverter newMessage se falhar
      setNewMessage(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPhotoMock = async () => {
    if (!userId || !db) return;

    setIsSending(true);

    const photoMessage = {
      userId: userId,
      text: "Nova foto de acompanhamento enviada. (Simulação de Upload de Imagem/Foto)",
      photoUrl: `https://placehold.co/150x150/a8dadc/1d3557?text=Foto+${
        Date.now() % 100
      }`, // Mock URL
      createdAt: serverTimestamp(),
      senderRole: "Paciente/Familiar",
      isPhoto: true,
    };

    try {
      await addDoc(collection(db, getSupportChatPath()), photoMessage);
    } catch (e) {
      console.error("Erro ao enviar foto: ", e);
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="p-4 text-center text-gray-500">Carregando Chat...</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 bg-teal-500 text-white shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold">Chat de Suporte (Canal de Apoio)</h1>
        <p className="text-sm">Envie dúvidas e fotos para a equipe.</p>
      </header>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMyMessage = msg.userId === userId;
          const timestamp = msg.createdAt?.toDate
            ? msg.createdAt.toDate().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "...";

          return (
            <div
              key={index}
              className={`flex ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl shadow-md ${
                  isMyMessage
                    ? "bg-teal-500 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                }`}
              >
                {!isMyMessage && (
                  <p className="font-semibold text-xs mb-1 text-teal-800">
                    {msg.senderRole}
                  </p>
                )}
                {msg.isPhoto ? (
                  <>
                    <img
                      src={msg.photoUrl}
                      alt="Foto de acompanhamento"
                      className="w-36 h-36 object-cover rounded-lg mb-1"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/150x150/999999/ffffff?text=Falha+na+Foto")
                      }
                    />
                    <p className="text-sm">{msg.text}</p>
                  </>
                ) : (
                  <p className="text-sm">{msg.text}</p>
                )}
                <span
                  className={`block text-xs mt-1 ${
                    isMyMessage
                      ? "text-teal-100 text-right"
                      : "text-gray-400 text-right"
                  }`}
                >
                  {timestamp}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSendPhotoMock}
            disabled={isSending}
            className="p-2 text-teal-600 hover:text-teal-700 disabled:opacity-50"
            title="Simular Envio de Foto"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.865-1.297A2 2 0 0110.424 4h3.152a2 2 0 011.664.89l.865 1.297a2 2 0 001.664.89H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Escreva sua mensagem ou dúvida..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-teal-500 focus:border-teal-500"
            disabled={isSending}
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition duration-150 disabled:opacity-50"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (APP) ---
export default function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [error, setError] = useState(null);

  // Dados de Escuta do Firestore
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS); // Usando mock para Agenda/Lembretes no MVP

  // 1. Inicialização do Firebase e Autenticação
  useEffect(() => {
    if (!firebaseConfig) {
      console.error("Firebase config not available. Cannot initialize.");
      setError("Erro: Configuração do Firebase indisponível.");
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      // Tenta logar (ou anônimo) e configura o listener de autenticação
      if (initialAuthToken) {
        signInWithCustomToken(firebaseAuth, initialAuthToken).catch((e) => {
          console.error("Custom token sign in failed, trying anonymous.", e);
          signInAnonymously(firebaseAuth).catch((err) =>
            console.error("Anonymous sign in failed.", err)
          );
        });
      } else {
        signInAnonymously(firebaseAuth).catch((err) =>
          console.error("Anonymous sign in failed.", err)
        );
      }

      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          setUserId(null);
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Initialization failed: ", e);
      setError("Erro durante a inicialização do aplicativo.");
    }
  }, []);

  // 2. Listener para o Histórico Médico
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const docRef = doc(db, getMedicalRecordPath(userId), "procedures");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().records) {
          setMedicalRecords(docSnap.data().records);
        } else {
          setMedicalRecords([]);
        }
      },
      (error) => {
        console.error("Erro ao ouvir histórico médico: ", error);
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, userId, db]);

  // Renderiza a tela atual
  const renderContent = () => {
    if (error) {
      return (
        <div className="p-4 text-center text-red-600 font-bold">{error}</div>
      );
    }

    if (!isAuthReady || !auth || !db) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mr-3"></div>
          Carregando App...
        </div>
      );
    }

    if (!userId) {
      return (
        <LoginScreen
          auth={auth}
          setUserId={setUserId}
          setIsAuthReady={setIsAuthReady}
          setError={setError}
        />
      );
    }

    switch (currentPage) {
      case "home":
        return <HomeScreen userId={userId} appointments={appointments} />;
      case "history":
        return (
          <HistoryScreen
            medicalRecords={medicalRecords}
            db={db}
            userId={userId}
          />
        );
      case "videos":
        return <VideosScreen />;
      case "support":
        return (
          <SupportScreen db={db} userId={userId} isAuthReady={isAuthReady} />
        );
      case "calendar":
        return (
          <div className="p-4 overflow-y-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Agenda e Lembretes
            </h1>
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold text-teal-600 mb-3">
                Próximos Itens
              </h2>
              {appointments.map((app) => (
                <div
                  key={app.id}
                  className="border-b py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {app.type} ({app.specialist})
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(app.date).toLocaleDateString("pt-BR")} às{" "}
                      {app.time}
                    </p>
                  </div>
                  <button className="text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded-full">
                    Lembrete OK
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                Esta tela de Agenda real implementaria também a funcionalidade
                de <span className="font-bold">Notificações Push Nativas</span>{" "}
                para garantir que você nunca perca um compromisso ou horário de
                medicação.
              </p>
            </div>
          </div>
        );
      default:
        return <HomeScreen userId={userId} appointments={appointments} />;
    }
  };

  // Estrutura do Mobile App (Visual)
  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto my-4 border-8 border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl bg-gray-100 font-sans">
      <div className="flex-1 overflow-hidden relative">{renderContent()}</div>

      {/* Navigation Bar (Mobile) */}
      <nav className="bg-white border-t border-gray-200 p-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] sticky bottom-0 z-10">
        <div className="flex justify-around">
          <NavItem
            icon={HomeIcon}
            label="Início"
            current={currentPage === "home"}
            onClick={() => setCurrentPage("home")}
          />
          <NavItem
            icon={HistoryIcon}
            label="Histórico"
            current={currentPage === "history"}
            onClick={() => setCurrentPage("history")}
          />
          <NavItem
            icon={VideoIcon}
            label="Vídeos"
            current={currentPage === "videos"}
            onClick={() => setCurrentPage("videos")}
          />
          <NavItem
            icon={CalendarIcon}
            label="Agenda"
            current={currentPage === "calendar"}
            onClick={() => setCurrentPage("calendar")}
          />
          <NavItem
            icon={SupportIcon}
            label="Apoio"
            current={currentPage === "support"}
            onClick={() => setCurrentPage("support")}
          />
        </div>
      </nav>
    </div>
  );
}

// Componente de Item da Barra de Navegação

const NavItem = ({ icon: Icon, label, current, onClick }) => (
  <button
    className={`flex flex-col items-center p-1 rounded-lg transition duration-200 ${
      current ? "text-teal-600" : "text-gray-500 hover:text-teal-500"
    }`}
    onClick={onClick}
  >
    <Icon className="w-6 h-6" />
    <span className="text-xs mt-1 font-medium">{label}</span>
  </button>
);
