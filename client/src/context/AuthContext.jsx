import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { auth, googleProvider, signInWithPopup, signOut as fbSignOut } from '../config/firebase';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on initial mount
  useEffect(() => {
    const savedToken = localStorage.getItem('expiryguard_token');
    const savedUser = localStorage.getItem('expiryguard_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('expiryguard_token');
        localStorage.removeItem('expiryguard_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('expiryguard_token', data.token);
        localStorage.setItem('expiryguard_user', JSON.stringify(data.user));
        toast.success(`Welcome back, ${data.user.name || 'User'}!`, {
          icon: '🛡️',
          style: {
            background: '#1e140c',
            color: '#fbbf24',
            border: '1px solid #f59e0b',
          },
        });
        return { success: true };
      }
      throw new Error(data.message || 'Authentication failed');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to login';
      toast.error(msg, {
        style: {
          background: '#201010',
          color: '#f87171',
          border: '1px solid #ef4444',
        },
      });
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (!import.meta.env.VITE_FIREBASE_API_KEY) {
        throw new Error('Firebase is not configured. Please add VITE_FIREBASE_API_KEY in client/.env');
      }
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const payload = {
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
        email: fbUser.email,
        avatar: fbUser.photoURL || '',
        googleId: fbUser.uid,
      };

      const data = await authService.googleLogin(payload);
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('expiryguard_token', data.token);
        localStorage.setItem('expiryguard_user', JSON.stringify(data.user));
        toast.success(`Welcome, ${data.user.name}!`, {
          icon: '✨',
          style: {
            background: '#1e140c',
            color: '#fbbf24',
            border: '1px solid #f59e0b',
          },
        });
        return { success: true };
      }
      throw new Error(data.message || 'Google authentication failed');
    } catch (error) {
      let msg = error.message || 'Google sign-in failed';
      if (error.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in cancelled';
        return { success: false, error: msg };
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }

      toast.error(msg, {
        style: {
          background: '#201010',
          color: '#f87171',
          border: '1px solid #ef4444',
        },
      });
      return { success: false, error: msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('expiryguard_token', data.token);
        localStorage.setItem('expiryguard_user', JSON.stringify(data.user));
        toast.success('Account created! Welcome to DocAlert.', {
          icon: '✨',
          style: {
            background: '#1e140c',
            color: '#fbbf24',
            border: '1px solid #f59e0b',
          },
        });
        return { success: true };
      }
      throw new Error(data.message || 'Registration failed');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(msg, {
        style: {
          background: '#201010',
          color: '#f87171',
          border: '1px solid #ef4444',
        },
      });
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // Ignore firebase signout error
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('expiryguard_token');
    localStorage.removeItem('expiryguard_user');
    toast.success('Logged out successfully', {
      style: {
        background: '#1e140c',
        color: '#f5eadb',
        border: '1px solid #7d5a3c',
      },
    });
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      const updated = { ...user, ...res.user };
      setUser(updated);
      localStorage.setItem('expiryguard_user', JSON.stringify(updated));
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Could not update profile');
      return { success: false };
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      await authService.updatePreferences(newPreferences);
      const updated = { ...user, preferences: newPreferences };
      setUser(updated);
      localStorage.setItem('expiryguard_user', JSON.stringify(updated));
      toast.success('Notification preferences saved!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update preferences');
      return { success: false };
    }
  };

  const updatePassword = async (passwords) => {
    try {
      await authService.updatePassword(passwords);
      toast.success('Password updated successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        updatePreferences,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
