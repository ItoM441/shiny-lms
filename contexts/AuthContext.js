// contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { recordLogin, recordLogout } from '../services/authLogService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        // ログイン記録
        await recordLogin(result.user.uid, result.user.displayName || 'ユーザー');
      }
      return result;
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  }

  async function logout() {
    if (currentUser) {
      // ログアウト記録
      await recordLogout(currentUser.uid, currentUser.displayName || 'ユーザー');
    }
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}