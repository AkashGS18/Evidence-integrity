import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check for saved auth data
    const savedAuth = localStorage.getItem('evidenceIntegrityAuth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setCurrentUser(authData);
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        localStorage.removeItem('evidenceIntegrityAuth');
      }
    }
    setLoading(false);
  }, []);

  const connectWallet = async () => {
    setAuthError(null);
    
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        setAuthError('MetaMask not detected. Please install MetaMask to continue.');
        toast.error('MetaMask not detected. Please install MetaMask.');
        return null;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        setAuthError('No accounts found. Please create or unlock an account in MetaMask.');
        toast.error('No accounts found in MetaMask.');
        return null;
      }

      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setAuthError(error.message || 'Error connecting to wallet');
      toast.error('Error connecting to wallet. Please try again.');
      return null;
    }
  };

  const login = async () => {
    setAuthError(null);

    try {
      // Connect wallet and get address
      const address = await connectWallet();
      if (!address) return false;

      // Request a nonce from the server
      const nonceResponse = await axios.get(`/api/auth/nonce/${address}`);
      const { nonce } = nonceResponse.data;

      // Create the message to sign
      const message = `Sign this message to authenticate with Evidence Integrity System: ${nonce}`;
      
      // Request signature from MetaMask
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });

      // Verify signature with the server
      const verifyResponse = await axios.post('/api/auth/verify', {
        address,
        signature
      });

      const { success, authToken, isAdmin } = verifyResponse.data;

      if (success && isAdmin) {
        // Save auth data
        const authData = {
          address,
          authToken,
          isAdmin
        };
        
        localStorage.setItem('evidenceIntegrityAuth', JSON.stringify(authData));
        setCurrentUser(authData);
        
        toast.success('Successfully logged in!');
        return true;
      } else {
        setAuthError('Authentication failed. You might not have admin privileges.');
        toast.error('Authentication failed.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.response?.data?.msg || 'Error during login process');
      toast.error(error.response?.data?.msg || 'Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('evidenceIntegrityAuth');
    setCurrentUser(null);
    toast.info('You have been logged out');
  };

  // Handle account changes in MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          logout();
        } else if (currentUser && accounts[0].toLowerCase() !== currentUser.address.toLowerCase()) {
          // User switched to a different account
          logout();
          toast.warning('Wallet account changed. Please log in again.');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [currentUser]);

  const value = {
    currentUser,
    login,
    logout,
    connectWallet,
    authError,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}