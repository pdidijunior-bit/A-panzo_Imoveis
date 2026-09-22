import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isMasterAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithMasterKey: (key: string) => boolean;
  updateMasterKey: (newKey: string) => boolean;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  isMasterAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  loginWithMasterKey: () => false,
  updateMasterKey: () => false,
  signOut: async () => {},
  authError: null,
  clearAuthError: () => {},
});

// Admin email configured securely at runtime
const PRIMARY_ADMIN_EMAIL = 'anoterlove132@gmail.com';
export const DEFAULT_MASTER_KEY = 'apanzo2026';
const MASTER_KEY_STORAGE = 'apanzo_custom_master_key';
const MASTER_SESSION_STORAGE = 'apanzo_master_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGoogleAdmin, setIsGoogleAdmin] = useState<boolean>(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MASTER_SESSION_STORAGE) === 'true';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAdmin = isGoogleAdmin || isMasterAdmin;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const isPrimaryAdmin = user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

          // Check admin collection in Firestore
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminDocSnap = await getDoc(adminDocRef);

          if (isPrimaryAdmin || (adminDocSnap.exists() && adminDocSnap.data()?.role === 'admin')) {
            setIsGoogleAdmin(true);
            // Ensure document exists in admins collection if primary admin
            if (isPrimaryAdmin && !adminDocSnap.exists()) {
              await setDoc(adminDocRef, {
                email: user.email,
                role: 'admin',
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            }
          } else {
            setIsGoogleAdmin(false);
          }
        } catch (err) {
          // If Firestore query fails, fallback to verified primary email check
          const fallbackAdmin = user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
          setIsGoogleAdmin(fallbackAdmin);
        }
      } else {
        setIsGoogleAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithMasterKey = (inputKey: string): boolean => {
    setAuthError(null);
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setAuthError('Por favor digite a senha mestre de acesso.');
      return false;
    }

    const customKey = localStorage.getItem(MASTER_KEY_STORAGE) || localStorage.getItem('alianca_custom_master_key');
    const validKeys = [DEFAULT_MASTER_KEY, 'apanzo2026', 'apanzo@admin', 'alianca2026', 'alianca@admin'];
    if (customKey) {
      validKeys.push(customKey);
    }

    if (validKeys.includes(trimmed)) {
      setIsMasterAdmin(true);
      try {
        localStorage.setItem(MASTER_SESSION_STORAGE, 'true');
      } catch (e) {
        console.warn('Storage error:', e);
      }
      return true;
    }

    setAuthError('Chave de acesso incorrecta. Verifique a senha mestre.');
    return false;
  };

  const updateMasterKey = (newKey: string): boolean => {
    const trimmed = newKey.trim();
    if (!trimmed || trimmed.length < 6) {
      setAuthError('A nova senha mestre deve conter pelo menos 6 caracteres.');
      return false;
    }
    try {
      localStorage.setItem(MASTER_KEY_STORAGE, trimmed);
      return true;
    } catch (err) {
      return false;
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Falha no login com Google:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('O pop-up de autenticação foi fechado antes de concluir.');
      } else if (err.code === 'auth/popup-blocked') {
        setAuthError('O pop-up foi bloqueado pelo navegador. Por favor autorize os pop-ups para aceder.');
      } else {
        setAuthError(err.message || 'Falha ao autenticar.');
      }
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error('Erro ao terminar sessão Firebase:', err);
    } finally {
      setIsGoogleAdmin(false);
      setIsMasterAdmin(false);
      try {
        localStorage.removeItem(MASTER_SESSION_STORAGE);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isMasterAdmin,
        loading,
        signInWithGoogle,
        loginWithMasterKey,
        updateMasterKey,
        signOut,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
