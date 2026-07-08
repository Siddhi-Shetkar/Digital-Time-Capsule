import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Set base URL for API
axios.defaults.baseURL = 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
    } catch (error) {
      console.error(error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('[FRONTEND] Attempting login for:', email);
    console.log(`[FRONTEND] API Target: ${axios.defaults.baseURL}/api/auth/login`);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      console.log('[FRONTEND] Login successful! Response status:', res.status);
      console.log('[FRONTEND] Response body:', res.data);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser({ id: res.data._id, name: res.data.name, email: res.data.email });
      return true;
    } catch (error) {
      console.error('[FRONTEND] Login failed!');
      if (error.response) {
        console.error('[FRONTEND] Axios Error Response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('[FRONTEND] Axios Error Request (No response received):', error.request);
      } else {
        console.error('[FRONTEND] Axios Error Message:', error.message);
      }
      throw error;
    }
  };

  const register = async (name, email, password) => {
    console.log('[FRONTEND] Attempting registration for:', email, 'Name:', name);
    console.log(`[FRONTEND] API Target: ${axios.defaults.baseURL}/api/auth/register`);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      console.log('[FRONTEND] Registration successful! Response status:', res.status);
      console.log('[FRONTEND] Response body:', res.data);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser({ id: res.data._id, name: res.data.name, email: res.data.email });
      return true;
    } catch (error) {
      console.error('[FRONTEND] Registration failed!');
      if (error.response) {
        console.error('[FRONTEND] Axios Error Response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('[FRONTEND] Axios Error Request (No response received):', error.request);
      } else {
        console.error('[FRONTEND] Axios Error Message:', error.message);
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear(); // Clear all localStorage including token and cached form values
    sessionStorage.clear(); // Clear any session storage
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
