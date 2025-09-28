// src/lib/firebase.js (ou onde quer que seu Firebase seja inicializado)

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, setPersistence, browserSessionPersistence } from 'firebase/auth';

// ----------------------------------------------------------------------
// CONFIGURAÇÃO DO FIREBASE
// As credenciais do projeto 'Appagendamento-8C0E2'
// ----------------------------------------------------------------------
const CORRECT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCVlc2R9F3Iq8C5hTsy8I9ic7ZYLtOirMc",
  authDomain: "appagendamento-8c0e2.firebaseapp.com",
  projectId: "appagendamento-8c0e2",
  storageBucket: "appagendamento-8c0e2.firebasestorage.app",
  messagingSenderId: "122801679806",
  appId: "1:122801679806:web:c99fc49124d078645f5def"
};

const CORRECT_APP_ID = 'default-appagendamento-app'; // ID da aplicação correto para o projeto

// Decide qual configuração usar:
// Para depuração, vamos forçar o uso da configuração CORRETA.
// No ambiente de produção, você pode querer voltar à lógica de __firebase_config
// se tiver certeza de que seu ambiente de CI/CD o configura corretamente.
const firebaseConfig = CORRECT_FIREBASE_CONFIG;
export const appId = CORRECT_APP_ID;

// ----------------------------------------------------------------------
// INICIALIZAÇÃO
// ----------------------------------------------------------------------
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Adiciona logs de debug MUITO IMPORTANTES
console.log(`%c[Firebase Init] --- Iniciando com configuração forçada ---`, 'color: yellow; background: blue; font-weight: bold;');
console.log(`%c[Firebase Init] App ID: ${appId}`, 'color: yellow;');
console.log(`%c[Firebase Init] Project ID: ${firebaseConfig.projectId}`, 'color: yellow;');
console.log(`%c[Firebase Init] apiKey usada: ${firebaseConfig.apiKey}`, 'color: yellow;');
console.log(`%c[Firebase Init] ---------------------------------------`, 'color: yellow; background: blue; font-weight: bold;');


/**
 * Autentica o usuário usando o token customizado do ambiente Canvas
 * ou de forma anônima. Define a persistência de sessão.
 * @returns {Promise<string>} O ID do usuário (UID).
 */
export async function ensureAuth() {
  try {
    await setPersistence(auth, browserSessionPersistence);

    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      console.log(`%c[Auth] Tentando autenticar com token customizado...`, 'color: lightblue;');
      const userCredential = await signInWithCustomToken(auth, __initial_auth_token);
      console.log(`%c[Auth] Signed in with custom token. User ID: ${userCredential.user.uid}`, 'color: lightgreen;');
      return userCredential.user.uid;
    } else {
      console.log(`%c[Auth] Tentando autenticar anonimamente (fallback)...`, 'color: lightblue;');
      const userCredential = await signInAnonymously(auth);
      console.log(`%c[Auth] Signed in anonymously. User ID: ${userCredential.user.uid}`, 'color: lightgreen;');
      return userCredential.user.uid;
    }
  } catch (error) {
    console.error("%c[Auth Error] Falha na autenticação:", 'color: red; font-weight: bold;', error);
    // Em caso de falha, retorna um UID aleatório para continuar a execução
    return auth.currentUser?.uid || crypto.randomUUID();
  }
}

/**
 * Retorna o caminho completo da coleção de dados privados para o usuário.
 * Estrutura: /artifacts/{appId}/users/{userId}/concrete_batches
 * @param {string} userId O ID do usuário atual.
 * @returns {string} O caminho completo da coleção.
 */
export const getPrivateCollectionPath = (userId) => {
  return `artifacts/${appId}/users/${userId}/concrete_batches`;
};