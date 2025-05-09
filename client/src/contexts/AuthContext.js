import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    // Check for existing session on load
    const checkSession = async () => {
      try {
        const res = await axios.get('/api/session/profile', { withCredentials: true });
        if (res.data.success) {
          setCurrentUser(res.data.user);
          setSessionId(res.data.sessionId);
        }
      } catch (error) {
        // Session not found or expired
        console.log('No active session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Create a new session
  const startNewSession = async (name) => {
    try {
      const res = await axios.post('/api/session/start-new', { name }, { withCredentials: true });
      if (res.data.success) {
        setCurrentUser({ name: res.data.name });
        setSessionId(res.data.uniqueId);
        return { success: true, sessionId: res.data.uniqueId };
      }
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  };

  // Continue an existing session
  const continueSession = async (uniqueId) => {
    try {
      const res = await axios.post('/api/session/continue', { uniqueId }, { withCredentials: true });
      if (res.data.success) {
        setCurrentUser({ name: res.data.name });
        setSessionId(uniqueId);
        return { success: true };
      }
    } catch (error) {
      console.error('Error continuing session:', error);
      throw error;
    }
  };

  // End session
  const endSession = async () => {
    try {
      await axios.get('/api/session/end', { withCredentials: true });
      setCurrentUser(null);
      setSessionId(null);
      return { success: true };
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    sessionId,
    loading,
    startNewSession,
    continueSession,
    endSession
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}