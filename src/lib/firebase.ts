import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDoc, setLogLevel } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || "AIzaSyCzaCBmHHlmc5y_JXGVvzebfF47N4C9jkA",
  authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || "a-panzo-imoveis.firebaseapp.com",
  projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || "a-panzo-imoveis",
  storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || "a-panzo-imoveis.firebasestorage.app",
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || "61143576541",
  appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || "1:61143576541:web:18dd8e6d41f093fe71d034"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Silence Firestore internal transient connection retry logs
try {
  setLogLevel('silent');
} catch {
  // Ignore in environments where setLogLevel might not be permitted
}

let firestoreInstance: ReturnType<typeof getFirestore>;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  });
} catch {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth.currentUser;
  const rawMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: rawMsg,
    operationType,
    path,
    authInfo: {
      userId: currentAuth?.uid ?? null,
      email: currentAuth?.email ?? null,
      emailVerified: currentAuth?.emailVerified ?? null,
      isAnonymous: currentAuth?.isAnonymous ?? null,
      tenantId: currentAuth?.tenantId ?? null,
      providerInfo: currentAuth?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));

  let friendlyMessage = rawMsg;
  const lower = rawMsg.toLowerCase();
  if (lower.includes('permission-denied') || lower.includes('missing or insufficient permissions')) {
    friendlyMessage = 'Permissão negada no Firestore. Certifique-se de publicar as regras atualizadas no Firebase Console (Firestore Database > Regras).';
  } else if (lower.includes('unavailable') || lower.includes('network') || lower.includes('failed to get document')) {
    friendlyMessage = 'Sem ligação ao Firestore. Verifique a sua ligação à internet.';
  } else if (lower.includes('resource-exhausted') || lower.includes('quota')) {
    friendlyMessage = 'Limite temporário de quota do Firestore atingido. Tente novamente em instantes.';
  }

  const enhancedError = new Error(friendlyMessage);
  (enhancedError as any).details = errInfo;
  throw enhancedError;
}

// Validation of Firestore connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDoc(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    console.warn('Firebase connection check: operating in offline or fallback mode.');
    return false;
  }
}
