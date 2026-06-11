import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function validarFirebaseConfig(config) {
  const camposObrigatorios = [
    'apiKey',
    'authDomain',
    'projectId',
    'messagingSenderId',
    'appId',
  ];

  const camposFaltando = camposObrigatorios.filter((campo) => !config[campo]);

  if (camposFaltando.length > 0) {
    console.error('Configuração do Firebase incompleta:', {
      camposFaltando,
      firebaseConfig: config,
    });

    throw new Error(
      'Firebase não configurado. Verifique o arquivo .env. Campos faltando: ' +
        camposFaltando.join(', ')
    );
  }
}

validarFirebaseConfig(firebaseConfig);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);