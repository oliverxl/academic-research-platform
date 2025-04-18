import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCurrentAccount, useCurrentWallet } from '@mysten/dapp-kit';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const currentAccount = useCurrentAccount();
  const { currentWallet, connectionStatus } = useCurrentWallet();
  const isConnected = connectionStatus === 'connected';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isConnected && currentAccount) {
          setIsAuthenticated(true);
          // In a real app, we would fetch user details from the blockchain
          setUser({
            id: currentAccount.address,
            name: 'Academic Researcher',
            email: 'researcher@example.com',
            institution: 'Example University',
          });
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
        setError(null);
      } catch (err) {
        setError('Failed to authenticate. Please try again.');
        console.error('Authentication error:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isConnected, currentAccount]);

  const login = async () => {
    // In a real app, we would handle login logic here
    // For now, we rely on the wallet connection
    try {
      setLoading(true);
      setError(null);
      // The actual connection is handled by the WalletKit
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // In a real app, we would handle logout logic here
    // For now, we rely on the wallet disconnection
    try {
      setLoading(true);
      setError(null);
      // The actual disconnection is handled by the WalletKit
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      setError('Failed to logout. Please try again.');
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
