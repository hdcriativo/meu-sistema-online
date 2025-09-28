// src/lib/firebase.js

// ... (todo o código que corrigimos) ...

const firebaseConfig = CORRECT_FIREBASE_CONFIG; // Ou como você deixou na última correção
export const appId = CORRECT_APP_ID; // Ou como você deixou na última correção

// Adiciona logs de debug MUITO IMPORTANTES
console.log(`%c[Firebase Init] --- Iniciando com configuração forçada ---`, 'color: yellow; background: blue; font-weight: bold;');
console.log(`%c[Firebase Init] App ID: ${appId}`, 'color: yellow;');
console.log(`%c[Firebase Init] Project ID: ${firebaseConfig.projectId}`, 'color: yellow;');
console.log(`%c[Firebase Init] apiKey usada: ${firebaseConfig.apiKey}`, 'color: yellow;');
console.log(`%c[Firebase Init] ---------------------------------------`, 'color: yellow; background: blue; font-weight: bold;');

debugger; // <-- ADICIONE ESTA LINHA AQUI!

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ... (resto do seu código) ...