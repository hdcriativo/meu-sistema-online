// src/lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  setPersistence, 
  browserSessionPersistence 
} from 'firebase/auth';

// ----------------------------------------------------------------------
// CONFIGURAÇÃO VIA VARIÁVEIS DE AMBIENTE
// ----------------------------------------------------------------------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'default-app';

// ----------------------------------------------------------------------
// INICIALIZAÇÃO
// ----------------------------------------------------------------------
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ----------------------------------------------------------------------
// DEBUG (somente em desenvolvimento)
// ----------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  console.log('[Firebase Init] Project ID:', firebaseConfig.projectId);
  console.log('[Firebase Init] App ID:', appId);
  console.log('[Firebase Init] apiKey usada:', firebaseConfig.apiKey);
}

// ----------------------------------------------------------------------
// AUTENTICAÇÃO
// ----------------------------------------------------------------------
export async function ensureAuth() {
  try {
    await setPersistence(auth, browserSessionPersistence);

    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      const userCredential = await signInWithCustomToken(auth, __initial_auth_token);
      return userCredential.user.uid;
    } else {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user.uid;
    }
  } catch (error) {
    console.error("[Auth Error] Falha na autenticação:", error);
    return auth.currentUser?.uid || crypto.randomUUID();
  }
}

// ----------------------------------------------------------------------
// COLEÇÃO PRIVADA DO USUÁRIO
// ----------------------------------------------------------------------
export const getPrivateCollectionPath = (userId) => {
  return `artifacts/${appId}/users/${userId}/concrete_batches`;
};
