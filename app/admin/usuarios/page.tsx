'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, 
  query, setLogLevel 
} from 'firebase/firestore';
import { 
  Plus, Edit, Trash2, Save, X, Loader2, Lock, AlertTriangle, Check, 
  Send, Link as LinkIcon, Phone, Truck, Store, Copy
} from 'lucide-react';

// Ativa o log de debug do Firestore (Útil para desenvolvimento)
setLogLevel('debug');

// Configuração de fallback para garantir que o Firebase inicialize
const FALLBACK_FIREBASE_CONFIG = {
  apiKey: "AIzaSy_dummy_api_key_for_fallback",
  authDomain: "dummy-project-123.firebaseapp.com",
  projectId: "dummy-project-123",
  storageBucket: "dummy-project-123.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
};

// Constantes globais fornecidas pelo ambiente Canvas
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Tenta usar a configuração do ambiente, se não houver, usa o fallback.
const envConfig = typeof __firebase_config !== 'undefined' && __firebase_config ? JSON.parse(__firebase_config) : null;
const firebaseConfig = envConfig || FALLBACK_FIREBASE_CONFIG;


// Tipos
/**
 * @typedef {Object} AppUser
 * @property {string} id
 * @property {string} nome
 * @property {string} email
 * @property {string} telefone
 * @property {'Vendedor' | 'Motorista'} tipoUsuario
 * @property {'Pendente' | 'Ativo'} status
 * @property {string} [invitationToken]
 */

/**
 * @typedef {'add' | 'edit'} ModalMode
 */

// --- Componente da Linha do Usuário (Listagem) ---
const UserRow = ({ user, onEdit, onDelete, onShowLink, onConfirm }) => {
  const isPending = user.status === 'Pendente';
  const AccessIcon = user.tipoUsuario === 'Motorista' ? Truck : Store;
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 border-b last:border-b-0 transition duration-150 hover:bg-gray-50 dark:hover:bg-gray-700">
      
      <div className="flex-1 min-w-0 pr-4 mb-2 sm:mb-0">
        <div className="flex items-center space-x-2">
            <AccessIcon className={`w-5 h-5 ${user.tipoUsuario === 'Motorista' ? 'text-orange-500' : 'text-purple-500'}`} />
            <p className="text-lg font-medium text-gray-900 dark:text-white truncate">
                {user.nome}
            </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-3">
            <span className="inline-flex items-center">
                {user.email}
            </span>
            <span className="inline-flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {user.telefone}
            </span>
        </div>
      </div>
      
      <div className="ml-0 sm:ml-4 flex flex-wrap items-center space-x-2">
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
            isPending 
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        }`}>
          {user.status}
        </span>

        {isPending && (
            <button 
                onClick={() => onShowLink(user)}
                className="flex items-center text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 transition duration-150 text-sm font-medium"
                title="Compartilhar Link de Confirmação"
            >
                <LinkIcon className="w-4 h-4 mr-1" /> Link
            </button>
        )}

        {isPending && (
            <button 
                onClick={() => onConfirm(user.id, user.invitationToken)}
                className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 text-sm font-medium shadow-sm"
                title="Confirmar Manualmente (Simula clique no link)"
            >
                <Check className="w-4 h-4 mr-1" /> Ativar Agora
            </button>
        )}

        {!isPending && (
            <button 
                onClick={() => onEdit(user)}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 transition duration-150"
                title="Editar Detalhes"
            >
                <Edit className="w-5 h-5" />
            </button>
        )}

        <button 
          onClick={() => onDelete(user.id)}
          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 transition duration-150"
          title="Excluir Convite/Usuário"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- Modal de Formulário (Criar Convite / Editar Usuário) ---
const UserFormModal = ({ isOpen, mode, currentUser, onClose, onSave }) => {
  const [formData, setFormData] = useState({ 
    nome: '', email: '', telefone: '', tipoUsuario: 'Vendedor' 
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
        if (mode === 'edit' && currentUser) {
            setFormData({ 
                nome: currentUser.nome || '', 
                email: currentUser.email || '', 
                telefone: currentUser.telefone || '', 
                tipoUsuario: currentUser.tipoUsuario || 'Vendedor' 
            });
        } else if (mode === 'add') {
            setFormData({ nome: '', email: '', telefone: '', tipoUsuario: 'Vendedor' });
        }
    }
  }, [isOpen, mode, currentUser]);

  const title = mode === 'add' ? 'Criar Novo Convite de Cadastro' : 'Editar Detalhes do Usuário';
  const submitText = mode === 'add' ? 'Gerar e Enviar Convite' : 'Atualizar Detalhes';
  
  const tipoUsuarioOptions = useMemo(() => ['Vendedor', 'Motorista'], []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.nome.trim()) return "O nome é obrigatório.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "O email deve ser um endereço válido.";
    if (!/^\d{8,15}$/.test(formData.telefone.replace(/\D/g, ''))) return "O telefone deve ter entre 8 e 15 dígitos (apenas números).";
    if (!tipoUsuarioOptions.includes(formData.tipoUsuario)) return "Tipo de usuário inválido.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    setIsSaving(true);
    try {
      const dataToSave = mode === 'edit' ? { ...currentUser, ...formData } : formData;
      await onSave(dataToSave, mode);
      if (mode === 'edit') {
         onClose(); // Fechar apenas se for edição, pois na adição o modal de link é aberto
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setError(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition duration-150">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {error && (
            <div className="flex items-center p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-900 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
            <input
              type="text"
              name="nome"
              id="nome"
              required
              value={formData.nome}
              onChange={handleChange}
              placeholder="Nome do Vendedor/Motorista"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Para onde o link será enviado)</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="exemplo@empresa.com"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150"
              disabled={mode === 'edit'} // Email não deve ser editável após o convite
            />
             {mode === 'edit' && <p className="text-xs text-gray-500 mt-1">O email de convite não pode ser alterado após o envio.</p>}
          </div>
          
          {/* Telefone */}
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone (Somente números)</label>
            <input
              type="tel"
              name="telefone"
              id="telefone"
              required
              value={formData.telefone}
              onChange={handleChange}
              placeholder="Ex: 5511987654321"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150"
            />
          </div>

          {/* Tipo de Usuário */}
          <div>
            <label htmlFor="tipoUsuario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Usuário</label>
            <select
              name="tipoUsuario"
              id="tipoUsuario"
              required
              value={formData.tipoUsuario}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none transition duration-150"
            >
              {tipoUsuarioOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition duration-150 shadow-md hover:shadow-lg"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando Link...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  {submitText}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Modal para Exibir o Link de Convite Real ---
const LinkDisplayModal = ({ isOpen, user, onClose, onFormClose }) => {
    const [isCopied, setIsCopied] = useState(false);
    if (!isOpen || !user || !user.invitationToken) return null;

    // URL Real que conteria o token para validação no backend
    const realLink = `https://seudominio.com/confirmacao?token=${user.invitationToken}&id=${user.id}`;

    // Função para copiar o link para a área de transferência
    const copyToClipboard = () => {
        const tempInput = document.createElement('textarea'); // Usar textarea para melhor compatibilidade
        tempInput.value = realLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            document.execCommand('copy');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Falha ao copiar:', err);
        }
        document.body.removeChild(tempInput);
    };
    
    // Fecha o modal e garante que o modal de formulário subjacente também feche
    const handleClose = () => {
        onClose();
        if (onFormClose) onFormClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <LinkIcon className="w-6 h-6 mr-3 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Link de Confirmação Gerado</h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        O link foi gerado com sucesso. Copie e envie para o email **{user.email}** ({user.tipoUsuario}) para que ele possa confirmar o cadastro.
                    </p>

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Link de Cadastro:
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            readOnly
                            value={realLink}
                            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 text-sm overflow-hidden truncate"
                        />
                        <button
                            onClick={copyToClipboard}
                            className={`p-3 text-white rounded-r-lg transition duration-150 flex items-center ${isCopied ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isCopied ? <Check className="w-5 h-5 mr-1" /> : <Copy className="w-5 h-5" />}
                            {isCopied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Este link contém um token de segurança único para o cadastro.
                    </p>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Modal de Confirmação de Exclusão ---
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="p-5 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirmação</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150 shadow-md"
            >
              Confirmar Exclusão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal da Aplicação ---
const App = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  /** @type {[AppUser | null, React.Dispatch<React.SetStateAction<AppUser | null>>]} */
  const [editingUser, setEditingUser] = useState(null);
  
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  /** @type {[AppUser | null, React.Dispatch<React.SetStateAction<AppUser | null>>]} */
  const [linkUser, setLinkUser] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  
  // 1. Inicialização do Firebase e Autenticação
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      
      setDb(dbInstance);

      // Listener de estado de autenticação
      const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          setUserId(user.uid);
          setIsAuthReady(true);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(authInstance, initialAuthToken);
            } else {
              await signInAnonymously(authInstance);
            }
          } catch (error) {
            console.error("Erro de autenticação:", error);
            setFirebaseError(`Falha na autenticação. Verifique as permissões. ${error.message}`);
            setUserId(crypto.randomUUID()); 
            setIsAuthReady(true); 
          }
        }
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Erro ao inicializar Firebase:", e);
      setFirebaseError(`Erro de inicialização do Firebase: ${e.message}`);
      setLoading(false);
    }
  }, []);

  // 2. Listener de Dados do Firestore
  useEffect(() => {
    if (!db || !isAuthReady) return;

    // Caminho da coleção de convites (Público)
    const invitationsCollectionRef = collection(db, `artifacts/${appId}/public/data/invitations`);
    const usersQuery = query(invitationsCollectionRef);

    setLoading(true);

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      try {
        const userList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(/** @type {AppUser[]} */ (userList));
        setLoading(false);
        setFirebaseError(null);
      } catch (e) {
        console.error("Erro ao ler dados do Firestore:", e);
        setFirebaseError(`Erro de leitura: ${e.message}`);
        setLoading(false);
      }
    }, (error) => {
      console.error("Erro no listener onSnapshot:", error);
      setFirebaseError(`Erro de conexão com o Firestore: ${error.message}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, isAuthReady]); 

  // --- Funções de CRUD e Confirmação ---
  
  const handleSaveUser = useCallback(async (user, mode) => {
    if (!db) throw new Error("Database não está pronto.");
    const collectionRef = collection(db, `artifacts/${appId}/public/data/invitations`);

    if (mode === 'add') {
      const token = crypto.randomUUID(); // Gerando token REAL e ÚNICO
      const newUser = {
        ...user,
        status: 'Pendente',
        invitationToken: token,
        dataCriacao: new Date().toISOString(),
      };
      const docRef = await addDoc(collectionRef, newUser);
      
      // Abre o modal para mostrar o link gerado após o convite
      setLinkUser({ ...newUser, id: docRef.id });
      setIsLinkModalOpen(true);
      
    } else if (mode === 'edit' && user.id) {
      // Atualizar dados de um usuário (apenas campos editáveis)
      const userDocRef = doc(db, collectionRef.path, user.id);
      
      const { id, status, invitationToken, dataCriacao, ...dataToUpdate } = user;
      await updateDoc(userDocRef, dataToUpdate);
    }
  }, [db]);

  const handleDeleteUser = useCallback(async (id) => {
    if (!db) {
      console.error("Database não está pronto.");
      return;
    }
    const userDocRef = doc(db, `artifacts/${appId}/public/data/invitations`, id);
    try {
      await deleteDoc(userDocRef);
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      setFirebaseError(`Erro ao deletar: ${error.message}`);
    } finally {
      setIsConfirmOpen(false);
      setUserToDeleteId(null);
    }
  }, [db]);

  // Função para simular o clique no link de confirmação, ativando o usuário
  const handleConfirmUser = useCallback(async (userId, token) => {
    if (!db) {
        console.error("Database não está pronto.");
        return;
    }
    const userDocRef = doc(db, `artifacts/${appId}/public/data/invitations`, userId);
    try {
        await updateDoc(userDocRef, {
            status: 'Ativo',
            invitationToken: null, 
            dataConfirmacao: new Date().toISOString()
        });
        setFirebaseError(null);
    } catch (error) {
        console.error("Erro ao confirmar usuário:", error);
        setFirebaseError(`Falha ao confirmar: ${error.message}`);
    }
  }, [db]);


  // --- Funções de Abertura de Modais ---

  const openAddModal = () => {
    setEditingUser(null);
    setModalMode('add');
    setIsFormModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setModalMode('edit');
    setIsFormModalOpen(true);
  };
  
  const openConfirmModal = (id) => {
    setUserToDeleteId(id);
    setIsConfirmOpen(true);
  };

  const openLinkModal = (user) => {
    setLinkUser(user);
    setIsLinkModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDeleteId) {
      handleDeleteUser(userToDeleteId);
    }
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setUserToDeleteId(null);
  };

  // --- Renderização dos Modais ---
  const MemoizedFormModal = useMemo(() => (
    <UserFormModal
      isOpen={isFormModalOpen}
      mode={modalMode}
      currentUser={editingUser}
      onClose={() => setIsFormModalOpen(false)}
      onSave={handleSaveUser}
    />
  ), [isFormModalOpen, modalMode, editingUser, handleSaveUser]);

  const MemoizedLinkModal = useMemo(() => (
    <LinkDisplayModal
      isOpen={isLinkModalOpen}
      user={linkUser}
      onClose={() => setIsLinkModalOpen(false)}
      onFormClose={() => setIsFormModalOpen(false)}
    />
  ), [isLinkModalOpen, linkUser]);

  const MemoizedConfirmationModal = useMemo(() => (
    <ConfirmationModal
      isOpen={isConfirmOpen}
      message="Tem certeza de que deseja excluir este convite/usuário? Esta ação é irreversível."
      onConfirm={confirmDelete}
      onCancel={cancelDelete}
    />
  ), [isConfirmOpen]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabeçalho do Painel */}
        <header className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <Send className="w-8 h-8 mr-3 text-blue-600" />
            Painel de Convites de Cadastro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie convites e cadastros de **Vendedores** e **Motoristas** da sua plataforma.
          </p>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 flex items-center">
            <Lock className="w-3 h-3 mr-1" />
            Seu ID de Sessão: **{userId || 'Aguardando autenticação...'}**
          </div>
        </header>

        {/* Mensagens de Estado */}
        {firebaseError && (
          <div className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-red-900 dark:text-red-300" role="alert">
            <AlertTriangle className="w-5 h-5 mr-3" />
            <span className="font-medium">Erro/Alerta:</span> {firebaseError}
          </div>
        )}
        
        {/* Ações e Lista de Usuários */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
          
          <div className="p-4 sm:p-6 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Lista de Convites ({users.length})
            </h2>
            <button
              onClick={openAddModal}
              className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              disabled={!db}
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Convite
            </button>
          </div>
          
          {loading && (
            <div className="p-8 text-center text-blue-600 dark:text-blue-400">
              <Loader2 className="w-8 h-8 mx-auto animate-spin mb-3" />
              <p>A carregar dados dos convites...</p>
            </div>
          )}

          {!loading && users.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Check className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <p className="text-lg font-medium">Nenhum convite encontrado.</p>
              <p className="text-sm">Clique em "Novo Convite" para iniciar o processo de cadastro.</p>
            </div>
          )}

          {!loading && users.length > 0 && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={openEditModal}
                  onDelete={openConfirmModal}
                  onShowLink={openLinkModal}
                  onConfirm={handleConfirmUser}
                />
              ))}
            </div>
          )}
          
        </div>

      </div>

      {/* Modais */}
      {MemoizedFormModal}
      {MemoizedLinkModal}
      {MemoizedConfirmationModal}
      
    </div>
  );
};

export default App;
