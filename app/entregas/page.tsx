'use client';

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, Auth as FirebaseAuth, User } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, addDoc, Timestamp, doc, deleteDoc, Firestore } from 'firebase/firestore';
import { Loader, XCircle, Truck, Calendar, User as UserIcon, MapPin, Trash2, Shield, AlertTriangle } from 'lucide-react';

// ====================================================================
// --- DADOS DE CONFIGURAÇÃO (SOLUÇÃO DEFINITIVA PARA CARREGAMENTO) ---
// ====================================================================

// ⚠️ ESTE É O OBJETO DE CONFIGURAÇÃO REAL DO SEU PROJETO FIREBASE.
// Ele foi preenchido com as credenciais que você forneceu para 'Appagendamento-8C0E2'.
// NÃO ALTERE ESTE OBJETO, A MENOS QUE SUAS CREDENCIAIS DO FIREBASE MUDEM.
const PROJECT_ID_REAL = 'appagendamento-8c0e2'; 

const REAL_FIREBASE_CONFIG = {
    apiKey: "AIzaSyCVlc2R9F3Iq8C5hTsy8I9ic7ZYLtOirMc",
    authDomain: `${PROJECT_ID_REAL}.firebaseapp.com`,
    projectId: PROJECT_ID_REAL,
    storageBucket: `${PROJECT_ID_REAL}.firebasestorage.app`,
    messagingSenderId: "122801679806",
    appId: "1:122801679806:web:c99fc49124d078645f5def"
};

// --- CONFIGURAÇÃO GLOBAL E VARIÁVEIS DE AMBIENTE ---
// Estas variáveis são tipicamente injetadas por ambientes de execução (como Vercel, Canvas).
// O fallback agora reflete o ID do projeto correto.
const appId = typeof __app_id !== 'undefined' ? __app_id : `default-${PROJECT_ID_REAL}-app`;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Por padrão, usa a configuração REAL_FIREBASE_CONFIG.
let firebaseConfig = REAL_FIREBASE_CONFIG;
let configParseError: string | null = null;

// Tenta usar a variável de ambiente __firebase_config, se ela for fornecida e VÁLIDA.
// Caso contrário, mantém REAL_FIREBASE_CONFIG.
try {
    const configString = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
    const envConfig = JSON.parse(configString);
    
    // Se a variável de ambiente for válida (com projectId e apiKey), usa ela.
    if (envConfig && envConfig.projectId && envConfig.apiKey) { 
        firebaseConfig = envConfig;
        console.log(`%c[Firebase Config] Usando configuração injetada via '__firebase_config'.`, 'color: green; font-weight: bold;');
    } else if (configString !== '{}' && configString !== '') {
        // Se a variável existe mas é inválida, exibe um aviso.
        configParseError = "A variável de ambiente '__firebase_config' foi detectada, mas está incompleta ou inválida (Falta 'projectId' ou 'apiKey'). Usando a configuração REAL_FIREBASE_CONFIG definida no código.";
        console.warn(`%c[Firebase Config WARN] ${configParseError}`, 'color: orange; font-weight: bold;');
    } else {
        console.log(`%c[Firebase Config] Usando configuração REAL_FIREBASE_CONFIG definida no código (nenhuma '__firebase_config' válida detectada).`, 'color: green; font-weight: bold;');
    }
} catch (e: any) {
    configParseError = `Erro na Configuração Global: O objeto '__firebase_config' não é um JSON válido. Usando a configuração REAL_FIREBASE_CONFIG do código. Mensagem: ${e.message}`;
    console.error(`%c[Firebase Config ERROR] ${configParseError}`, 'color: red; font-weight: bold;');
}

// Define o caminho da coleção pública para agendamentos
const COLLECTION_NAME = 'agendamentos_frota';
const getCollectionPath = () => `artifacts/${appId}/public/data/${COLLECTION_NAME}`;

// ====================================================================
// --- CONTEXTO DE AUTENTICAÇÃO (useAuth) ---
// ====================================================================

interface AuthContextType {
  db: Firestore | null;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

// Provedor de Autenticação e Inicialização do Firebase
const AuthProvider = ({ children }: AuthProviderProps) => {
  const [db, setDb] = useState<Firestore | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(configParseError); 

  useEffect(() => {
    let authUnsubscribe: () => void = () => {};
    let firebaseApp: FirebaseApp;
    let firebaseAuth: FirebaseAuth;

    try {
      // 1. Inicialização dos Serviços
      console.log(`%c[Firebase Init] Inicializando Firebase com Project ID: ${firebaseConfig.projectId} e apiKey: ${firebaseConfig.apiKey}`, 'color: cyan;');
      firebaseApp = initializeApp(firebaseConfig);
      firebaseAuth = getAuth(firebaseApp);
      const firestoreDb = getFirestore(firebaseApp);
      
      setDb(firestoreDb);
      
      // 2. Autenticação (Login)
      const authenticate = async () => {
        try {
          if (initialAuthToken) {
                console.log(`%c[Auth] Tentando autenticar com token customizado...`, 'color: lightblue;');
                await signInWithCustomToken(firebaseAuth, initialAuthToken);
                console.log(`%c[Auth] Autenticado com token customizado.`, 'color: lightgreen;');
          } else {
                console.log(`%c[Auth] Tentando autenticar anonimamente (nenhum token customizado).`, 'color: lightblue;');
                await signInAnonymously(firebaseAuth);
                console.log(`%c[Auth] Autenticado anonimamente.`, 'color: lightgreen;');
          }
          // Limpa qualquer erro de autenticação anterior se o login for bem-sucedido
          setError(prevError => prevError === configParseError ? configParseError : null);

        } catch (e: any) {
          console.warn(`%c[Auth WARN] Falha no login inicial (token personalizado ou anônimo). Mensagem: ${e.message}`, 'color: orange;');
          // Se o token personalizado falhar, tentamos o login anônimo como fallback,
          // mas a lógica já está configurada para tentar anônimo se não houver token.
          // O erro final será capturado pelo onAuthStateChanged se o usuário não for definido.
        }
      };

      // 3. Listener do Estado de Autenticação
      authUnsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
        if (currentUser) {
          setUserId(currentUser.uid);
          // Limpa o erro de autenticação (se houver), mas mantém o aviso de config
          setError(prevError => prevError === configParseError ? configParseError : null); 
          setIsLoading(false);
          console.log(`%c[Auth State] Usuário logado: ${currentUser.uid}`, 'color: lightgreen;');
        } else {
          setUserId(null);
          // Se não há usuário e isLoading ainda é true (primeiro carregamento),
          // significa que a autenticação inicial falhou.
          if (isLoading) { 
              setError(`Falha crítica de autenticação: Nem o token nem o modo anônimo funcionaram. Mensagem: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.). A configuração do Firebase é inválida e o fallback anônimo falhou. Por favor, verifique as suas credenciais.`);
              console.error(`%c[Auth State ERROR] Autenticação inicial falhou ou usuário deslogado.`, 'color: red; font-weight: bold;');
          }
          setIsLoading(false);
        }
      });
      
      authenticate();

    } catch (e: any) {
      console.error("%c[Firebase Init ERROR] Falha na Inicialização do Firebase:", 'color: red; font-weight: bold;', e);
      setError(`Erro Crítico de Inicialização: Configuração do Firebase falhou. Mensagem: ${e.message}.`);
      setIsLoading(false);
    }
    
    return () => {
        authUnsubscribe();
    };
  }, []); // [] para rodar apenas uma vez na montagem do componente

  const value = useMemo(() => ({
    db,
    userId,
    isLoading, 
    error,
  }), [db, userId, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


// ====================================================================
// --- PÁGINA DE AGENDAMENTO (COMPONENT AGENDAMENTO PAGE) ---
// ====================================================================

const AgendamentoPage = () => {
  const { db, userId, isLoading: isAuthLoading, error: authError } = useAuth();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null); 
  const [newAgendamento, setNewAgendamento] = useState({
    veiculo: '',
    motorista: '',
    data: '',
    destino: ''
  });
  
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  // Efeito para carregar dados
  useEffect(() => {
    // Inicia o listener de dados SOMENTE quando o Firebase (db) estiver pronto,
    // houver um usuário (userId) E a autenticação inicial (isAuthLoading) tiver terminado.
    if (db && userId && !isAuthLoading && !authError) { 
      setIsDataLoading(true); // Indica que a busca de dados está ativa
      const collectionPath = getCollectionPath();
      const agendamentosCollection = collection(db, collectionPath);
      const q = query(agendamentosCollection);
      
      let loadingTimeout = setTimeout(() => {
          setDataError("Demora na Conexão. O acesso ao Firestore está demorando. Isso pode indicar um problema de Regras de Segurança.");
          setIsDataLoading(false);
      }, 10000); 

      const unsubscribe = onSnapshot(q, (snapshot) => {
        clearTimeout(loadingTimeout);
        const agendamentosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Converte o campo 'data' (Timestamp) para string legível
          data: doc.data().data?.toDate ? doc.data().data.toDate().toLocaleDateString('pt-BR') : doc.data().data || 'N/A'
        }));
        
        setAgendamentos(agendamentosData);
        setIsDataLoading(false);
        setDataError(null);
      }, (err) => {
        clearTimeout(loadingTimeout);
        console.error("Erro ao ouvir o Firestore:", err);
        // Mensagem clara para o erro 403 (Permissão)
        setDataError(`Erro de Permissão (${err.code || 'unknown'}) ou Falha de Conexão. Se as regras foram publicadas, verifique o caminho da coleção: ${collectionPath}`);
        setIsDataLoading(false);
      });

      return () => {
        unsubscribe();
        clearTimeout(loadingTimeout);
      };
    // Se a autenticação terminou (isAuthLoading=false), mas o usuário não está logado (userId=null), 
    // paramos o carregamento de dados.
    } else if (!isAuthLoading && !userId && !authError) { // Adicionada condição !authError
        setIsDataLoading(false);
        setAgendamentos([]); // Limpa a lista
    }
    // Caso contrário, continua no estado de carregamento até que a autenticação termine.
  }, [db, userId, isAuthLoading, authError]); // Dependências completas

  // Manipuladores de Formulário e CRUD
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAgendamento(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAgendamento = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationMessage(null);

    if (!newAgendamento.veiculo || !newAgendamento.data) {
      setValidationMessage("Por favor, preencha o campo Veículo e a Data.");
      return;
    }
    if (!db) {
      setDataError("Erro: Conexão com o banco de dados indisponível.");
      return;
    }
    // Garante que o usuário está autenticado antes de escrever
    if (!userId) {
        setDataError("Erro: Usuário não autenticado para realizar esta operação.");
        return;
    }

    try {
      const docData = {
        ...newAgendamento,
        // Converte a data string do input para um objeto Timestamp do Firestore
        data: Timestamp.fromDate(new Date(newAgendamento.data)),
        criadoEm: Timestamp.now(),
        userId: userId,
      };

      await addDoc(collection(db, getCollectionPath()), docData);
      setNewAgendamento({ veiculo: '', motorista: '', data: '', destino: '' });
      setValidationMessage("Agendamento adicionado com sucesso!");
      setTimeout(() => setValidationMessage(null), 3000); // Limpa a mensagem após 3 segundos


    } catch (e) {
      console.error("Erro ao adicionar agendamento:", e);
      setDataError("Não foi possível salvar o agendamento. Verifique permissões.");
    }
  }, [newAgendamento, db, userId]);
  
  const handleDeleteClick = (id: string) => {
    setItemToDeleteId(id);
    setIsConfirmingDelete(true);
  };
  
  const cancelDelete = () => {
    setIsConfirmingDelete(false);
    setItemToDeleteId(null);
  };

  const confirmDelete = useCallback(async () => {
    if (!itemToDeleteId || !db) {
      cancelDelete();
      return;
    }
    
    // Garante que o usuário está autenticado antes de escrever
    if (!userId) {
        setDataError("Erro: Usuário não autenticado para realizar esta operação.");
        cancelDelete();
        return;
    }

    try {
      const docRef = doc(db, getCollectionPath(), itemToDeleteId);
      await deleteDoc(docRef);
      setValidationMessage("Agendamento excluído com sucesso!");
      setTimeout(() => setValidationMessage(null), 3000); // Limpa a mensagem após 3 segundos
      cancelDelete();
    } catch (e) {
      console.error("Erro ao deletar agendamento:", e);
      setDataError("Não foi possível deletar o agendamento. Verifique permissões.");
      cancelDelete();
    }
  }, [itemToDeleteId, db, userId]);


  // Componentes de Estado (Carregamento e Erro)
  if (isAuthLoading) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
        <Loader className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        <p className="ml-4 text-gray-700 font-semibold">Carregando inicialização do sistema...</p>
        <p className="text-sm text-gray-500 mt-2">Tentando conectar ao Firebase e autenticar usuário.</p>
      </div>
    );
  }

  // Exibe erros críticos de autenticação (se nem o fallback funcionou)
  if (authError && authError.includes("Falha crítica de autenticação")) {
    return (
      <div className="p-6 text-red-700 bg-red-100 border border-red-400 rounded-xl max-w-lg mx-auto mt-10 shadow-lg">
        <div className="flex items-center mb-3">
            <XCircle className="h-6 w-6 mr-2" />
            <h2 className="font-bold text-xl">Erro Crítico de Autenticação</h2>
        </div>
        <p className="mb-3 font-mono text-sm border-l-2 pl-2 border-red-400">{authError}</p>
        <p className="mt-2 text-sm text-red-600 font-medium">
            A configuração do Firebase é inválida e o fallback anônimo falhou. Por favor, verifique as suas credenciais.
            Se você está vendo isso após a correção, pode ser um problema de cache ou injeção de ambiente.
        </p>
      </div>
    );
  }
  
  const finalError = dataError;
  if (finalError) {
    return (
      <div className="p-6 text-red-700 bg-red-100 border border-red-400 rounded-xl max-w-lg mx-auto mt-10 shadow-lg">
        <div className="flex items-center mb-3">
            <XCircle className="h-6 w-6 mr-2" />
            <h2 className="font-bold text-xl">Erro de Conexão ou Permissão</h2>
        </div>
        <p className="mb-3 font-mono text-sm border-l-2 pl-2 border-red-400">{finalError}</p>
        <p className="mt-2 text-sm text-red-600 font-medium">
            A autenticação funcionou (ou o fallback), mas o acesso aos dados falhou. **Verifique se você publicou as Regras de Segurança no Firestore e se o caminho da coleção está correto.**
        </p>
      </div>
    );
  }

    if (isDataLoading) {
        return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
        <Loader className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        <p className="ml-4 text-gray-700 font-semibold">Buscando agendamentos no Firestore...</p>
      </div>
        );
    }


  // Renderização Principal (Dashboard)
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 border-b-4 border-blue-500 pb-2">
          ConcreteFlow - Agendamento de Frota
        </h1>
        <p className="text-gray-600 mb-6">
          Visão geral e cadastro de veículos agendados para entrega ou viagem.
        </p>

        {/* Aviso de Configuração de Placeholder (se a variável de ambiente for inválida) */}
        {configParseError && (
            <div className="mb-6 p-4 bg-yellow-100 rounded-lg text-sm text-yellow-800 flex items-start border border-yellow-400">
                <AlertTriangle className='h-5 w-5 mr-2 mt-1 flex-shrink-0' />
                <p>
                    <span className="font-bold">Aviso de Configuração:</span> {configParseError}
                    <br />
                    A aplicação está usando a configuração `REAL_FIREBASE_CONFIG` do código.
                </p>
            </div>
        )}

        {/* Informação do Usuário */}
        <div className="mb-6 p-3 bg-blue-100 rounded-lg text-sm text-blue-800 flex items-center">
            <Shield className='h-4 w-4 mr-2' />
            Seu ID de Usuário (Autenticado): <span className="font-mono font-bold break-all ml-2">{userId || 'N/A'}</span>
        </div>

        {/* Formulário de Novo Agendamento */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Novo Agendamento</h2>
          
          {validationMessage && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg flex items-center">
              <AlertTriangle className='h-5 w-5 mr-2' />
              {validationMessage}
            </div>
          )}

          <form onSubmit={handleAddAgendamento} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="veiculo"
                placeholder="Veículo (Ex: Placa ABC-1234)"
                value={newAgendamento.veiculo}
                onChange={handleInputChange}
                required
                className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <input
                type="text"
                name="motorista"
                placeholder="Motorista"
                value={newAgendamento.motorista}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                name="data"
                value={newAgendamento.data}
                onChange={handleInputChange}
                required
                className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <input
                type="text"
                name="destino"
                placeholder="Destino"
                value={newAgendamento.destino}
                onChange={handleInputChange}
                className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-lg shadow-lg transition duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Agendar Veículo
            </button>
          </form>
        </div>

        {/* Lista de Agendamentos */}
        <h2 className="text-3xl font-bold text-gray-900 mb-5 pt-4 border-t border-gray-300">
          Agendamentos Atuais ({agendamentos.length})
        </h2>
        <div className="space-y-4">
            {agendamentos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <AlertTriangle className='h-8 w-8 text-yellow-500 mb-2' />
                    <p className="text-gray-600 italic font-medium">Nenhum agendamento encontrado. Crie o primeiro!</p>
                </div>
            ) : (
                agendamentos.map(agenda => (
                <div key={agenda.id} className="p-4 bg-white shadow-lg rounded-xl border-l-4 border-blue-500 flex justify-between items-center transition duration-300 hover:shadow-xl">
                    <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-gray-800 flex items-center mb-1">
                        <Truck className='h-4 w-4 mr-2 text-blue-500'/> {agenda.veiculo}
                    </p>
                    <div className='grid grid-cols-2 text-sm text-gray-600 gap-1'>
                        <p className='flex items-center'><UserIcon className='h-4 w-4 mr-1 text-gray-400'/> Motorista: {agenda.motorista || 'Não Informado'}</p>
                        <p className='flex items-center'><Calendar className='h-4 w-4 mr-1 text-gray-400'/> Data: <span className="font-bold text-blue-600 ml-1">{agenda.data}</span></p>
                        <p className='col-span-2 flex items-center'><MapPin className='h-4 w-4 mr-1 text-gray-400'/> Destino: {agenda.destino || 'Não Informado'}</p>
                    </div>
                    </div>
                    <button
                    onClick={() => handleDeleteClick(agenda.id)} 
                    className="bg-red-500 hover:bg-red-600 text-white font-bold p-3 rounded-full shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transform hover:scale-110"
                    aria-label={`Deletar agendamento de ${agenda.veiculo}`}
                    >
                    <Trash2 className='h-5 w-5' />
                    </button>
                </div>
                ))
            )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all scale-100">
            <h3 className="text-xl font-bold text-red-600 mb-3">Confirmação de Exclusão</h3>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja deletar este agendamento? Esta ação é irreversível.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition duration-150"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 shadow-lg transition duration-150"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper para fornecer o contexto de autenticação à página
const Page = () => (
    <AuthProvider>
        <AgendamentoPage />
    </AuthProvider>
);

export default Page;