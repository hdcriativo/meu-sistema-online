import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { Copy, Plus, X, AlertTriangle, CheckCircle, Clock, Send } from 'lucide-react';

// ====================================================================
// CONFIGURAÇÃO REAL DO FIREBASE - CHAVES INSERIDAS PELO USUÁRIO
// ====================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCtn1ydc2wL7Eygl5mbrwqE9TFxu9BmwbY", 
  authDomain: "convites-logistica-app.firebaseapp.com",
  projectId: "convites-logistica-app",
  storageBucket: "convites-logistica-app.firebasestorage.app",
  messagingSenderId: "400655292541",
  appId: "1:400655292541:web:f46e636bfcfdaa1e46f914",
};

// Define um ID fixo para a coleção (para simplificar o path)
const appId = 'painel-logistica'; 
const initialAuthToken = null; 

// Base URL para a Cloud Function que processará o link de confirmação
// 'convites-logistica-app' é o seu ID de projeto
const CONFIRMATION_BASE_URL = "https://us-central1-convites-logistica-app.cloudfunctions.net/confirmarCadastro";

// ====================================================================
// Estrutura do Painel de Administração
// ====================================================================

function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentInvitation, setCurrentInvitation] = useState(null);

  // Formulário
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formUserType, setFormUserType] = useState('Vendedor');

  // 1. Inicialização do Firebase e Autenticação
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);

      setDb(firestore);
      setAuth(authInstance);

      // Tenta autenticar
      const authenticate = async () => {
        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
        } else {
          // Autenticação anônima para simplicidade (ideal para admins que não precisam de login complexo)
          await signInAnonymously(authInstance);
        }
      };

      onAuthStateChanged(authInstance, (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          // Garante que a autenticação ocorra se o usuário não estiver logado
          authenticate().catch(err => {
            console.error("Erro na autenticação:", err);
            setError("Falha ao autenticar no Firebase.");
          });
        }
        setLoading(false);
      });

    } catch (err) {
      console.error("Erro na inicialização do Firebase:", err);
      setError("Verifique as credenciais do Firebase.");
      setLoading(false);
    }
  }, []);

  // 2. Listener do Firestore (Busca de Dados em Tempo Real)
  useEffect(() => {
    if (!db || !userId) return;

    // Define o caminho para a coleção (simplificado para 'invitations')
    const collectionPath = 'invitations';
    const invitationsCollection = collection(db, collectionPath);
    
    // Cria uma consulta para buscar todos os convites (sem orderBy para evitar erros de index)
    const q = query(invitationsCollection);

    // Adiciona o listener em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invitesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Garantir que a data de criação seja uma string para exibição
        dataCriacao: doc.data().dataCriacao ? new Date(doc.data().dataCriacao.toDate()).toLocaleString('pt-BR') : 'N/A'
      }));
      // Ordena localmente pela data de criação, do mais novo para o mais antigo
      invitesList.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
      setInvitations(invitesList);
    }, (err) => {
      console.error("Erro ao carregar convites:", err);
      setError("Não foi possível carregar os dados. Verifique as regras do Firestore.");
    });

    return () => unsubscribe();
  }, [db, userId]);


  // 3. Funções de CRUD (Create, Read, Update, Delete)

  const generateToken = () => {
    // Gera um token UUID simples para o link de confirmação
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!db || !formName || !formEmail) return;

    try {
      const invitationToken = generateToken();
      
      const newInvite = {
        nome: formName,
        email: formEmail,
        tipoUsuario: formUserType,
        status: 'Pendente',
        invitationToken: invitationToken, // Token usado para o link de confirmação
        dataCriacao: serverTimestamp(),
        criadoPor: userId,
      };

      const docRef = await addDoc(collection(db, 'invitations'), newInvite);
      
      // Abre o modal para exibir o link
      setCurrentInvitation({
        ...newInvite,
        id: docRef.id,
        invitationToken: invitationToken,
        dataCriacao: new Date().toLocaleString('pt-BR')
      });
      setShowModal(true);

      // Limpa o formulário
      setFormName('');
      setFormEmail('');
      setFormUserType('Vendedor');
    } catch (err) {
      console.error("Erro ao enviar convite:", err);
      setError("Falha ao salvar o convite. Tente novamente.");
    }
  };

  const handleDeleteInvitation = async (id) => {
    if (!db) return;
    try {
      if (window.confirm("Tem certeza que deseja DELETAR este convite?")) {
         await deleteDoc(doc(db, 'invitations', id));
      }
    } catch (err) {
      console.error("Erro ao deletar convite:", err);
      setError("Falha ao deletar o convite.");
    }
  };

  const handleReactivateInvitation = async (invitation) => {
    if (!db) return;
    try {
      const newInvitationToken = generateToken();
      await updateDoc(doc(db, 'invitations', invitation.id), {
        status: 'Pendente',
        invitationToken: newInvitationToken,
        dataReativacao: serverTimestamp()
      });
      // Exibe o novo link no modal
      setCurrentInvitation({ ...invitation, id: invitation.id, invitationToken: newInvitationToken, status: 'Pendente' });
      setShowModal(true);
    } catch (err) {
      console.error("Erro ao reativar convite:", err);
      setError("Falha ao reativar o convite.");
    }
  };
  
  // 4. Componentes UI (Design e Estilo)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Ativo':
        return <CheckCircle className="w-5 h-5 text-green-500 mr-2" />;
      case 'Pendente':
        return <Clock className="w-5 h-5 text-yellow-500 mr-2" />;
      case 'Expirado':
        return <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />;
      default:
        return null;
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Expirado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const Card = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg ${className}`}>
      {children}
    </div>
  );

  const LinkDisplayModal = ({ invitation, onClose }) => {
    if (!invitation) return null;

    // Constrói o link real para a Cloud Function
    const confirmationLink = `${CONFIRMATION_BASE_URL}?token=${invitation.invitationToken}&id=${invitation.id}`;

    const copyToClipboard = () => {
      // Uso de document.execCommand('copy') por compatibilidade em alguns ambientes
      const el = document.createElement('textarea');
      el.value = confirmationLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      alert('Link copiado para a área de transferência!'); // Usando alert simples para esta funcionalidade, mas em apps reais, use um Toast.
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-xl w-full">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-800">Convite Criado com Sucesso!</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-4 text-gray-600">Envie o link abaixo para **{invitation.nome}** ({invitation.email}).</p>
          <p className="text-sm font-semibold text-indigo-600 mt-1">Tipo: {invitation.tipoUsuario}</p>

          <div className="mt-4 bg-gray-100 p-4 rounded-lg flex items-center justify-between shadow-inner">
            <input
              type="text"
              readOnly
              value={confirmationLink}
              className="flex-grow bg-transparent text-sm text-gray-700 font-mono overflow-hidden whitespace-nowrap overflow-ellipsis mr-4 border-none focus:ring-0"
              aria-label="Link de Confirmação"
            />
            <button
              onClick={copyToClipboard}
              className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-150 shadow-md flex items-center text-sm"
            >
              <Copy className="w-4 h-4 mr-1" /> Copiar Link
            </button>
          </div>
          
          <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
            <p className="font-semibold">AVISO CRÍTICO:</p>
            <p className="text-sm">O link só funcionará após o deploy da **Cloud Function** (Passo 3.6 do guia), mas o ID do projeto já foi configurado.</p>
          </div>

          <div className="mt-6 flex justify-end">
             <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150"
             >
                Fechar
             </button>
          </div>
        </Card>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-indigo-600">Carregando Painel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-red-50 text-red-700">
        <AlertTriangle className="w-6 h-6 mr-2" />
        <span className="font-semibold">Erro:</span> {error}
        {userId && <p className="text-sm mt-2">ID do Usuário Logado: <span className="font-mono text-gray-600">{userId}</span></p>}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
      {/* Exibe o ID do usuário autenticado no canto superior para referência de segurança */}
      <p className="text-xs text-right text-gray-500 mb-4">
          ID do Admin (Firestore): <span className="font-mono">{userId || 'N/A'}</span>
      </p>

      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Painel de Convites - Logística
        </h1>
        <p className="text-gray-500 mt-1">Gerencie convites para Vendedores e Motoristas da sua plataforma.</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Criação de Convite (Coluna 1) */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-indigo-500" />
              Enviar Novo Convite
            </h2>
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuário
                </label>
                <select
                  id="userType"
                  value={formUserType}
                  onChange={(e) => setFormUserType(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                  required
                >
                  <option value="Vendedor">Vendedor</option>
                  <option value="Motorista">Motorista</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                  placeholder="Ex: João da Silva"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                  placeholder="exemplo@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
              >
                <Send className="w-5 h-5 mr-2" />
                Gerar & Enviar Convite
              </button>
            </form>
          </Card>
        </div>

        {/* Lista de Convites (Colunas 2 e 3) */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Convites Recentes ({invitations.length})
          </h2>
          <div className="space-y-4">
            {invitations.length === 0 ? (
              <Card className="text-center text-gray-500">
                Nenhum convite encontrado. Crie o primeiro!
              </Card>
            ) : (
              invitations.map((invite) => (
                <Card key={invite.id} className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex-1 min-w-0 mb-3 md:mb-0">
                    <div className="flex items-center">
                      {getStatusIcon(invite.status)}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(invite.status)}`}>
                        {invite.status}
                      </span>
                      <span className="ml-3 text-sm font-medium text-gray-900 truncate">
                        {invite.nome}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 ml-7 truncate">{invite.email}</p>
                    <p className="text-xs text-gray-400 ml-7 mt-1">
                        Criado em: {invite.dataCriacao} | Tipo: {invite.tipoUsuario}
                    </p>
                  </div>

                  <div className="flex space-x-2 flex-shrink-0">
                    {invite.status === 'Pendente' && (
                        <button 
                            onClick={() => {
                                setCurrentInvitation(invite);
                                setShowModal(true);
                            }}
                            className="px-3 py-2 text-sm font-medium rounded-lg text-indigo-700 border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition duration-150"
                        >
                            <span className="hidden sm:inline">Ver Link</span> <Send className="w-4 h-4 sm:ml-1 inline" />
                        </button>
                    )}
                    {invite.status === 'Ativo' && (
                        <span className="px-3 py-2 text-sm font-medium rounded-lg text-green-700 bg-green-50 border border-green-300">
                           Ativado
                        </span>
                    )}
                    <button
                        onClick={() => handleDeleteInvitation(invite.id)}
                        className="px-3 py-2 text-sm font-medium rounded-lg text-red-700 border border-red-300 bg-red-50 hover:bg-red-100 transition duration-150"
                    >
                        <X className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal para Exibir o Link de Confirmação */}
      {showModal && (
        <LinkDisplayModal
          invitation={currentInvitation}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default App;
