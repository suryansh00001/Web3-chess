import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const userRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setError('Firebase is not configured. Add VITE_FIREBASE_* variables.');
      setIsConnected(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      userRef.current = user;
      setIsConnected(Boolean(user));
      if (user) {
        setError(null);
      }
    });

    signInAnonymously(auth).catch((err) => {
      console.error('Firebase auth error:', err);
      setError('Failed to connect to Firebase');
      setIsConnected(false);
    });

    const handleOffline = () => setIsConnected(false);
    const handleOnline = () => {
      if (auth.currentUser) {
        setIsConnected(true);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubscribeAuth();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const value = {
    socket: null,
    db,
    user: userRef.current,
    isConnected,
    error
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
