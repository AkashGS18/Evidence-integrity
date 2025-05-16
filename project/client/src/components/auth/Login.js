import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaEthereum } from 'react-icons/fa';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const LoginCard = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
  text-align: center;
`;

const LoginTitle = styled.h1`
  color: var(--primary-color);
  margin-bottom: 1.5rem;
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background-color: var(--primary-color);
  color: var(--white);
  padding: 1rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: var(--primary-light);
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: var(--gray-400);
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  background-color: rgba(245, 101, 101, 0.1);
  padding: 1rem;
  border-radius: var(--border-radius);
  margin-bottom: 1.5rem;
  animation: shake 0.5s ease-in-out;

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;

const LoginInfo = styled.p`
  color: var(--gray-600);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Login = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { currentUser, login, authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LoginTitle>Evidence Integrity System</LoginTitle>
        
        <LoginInfo>
          Connect with your MetaMask wallet to access the secure evidence management system. 
          Only authorized administrators can access this system.
        </LoginInfo>
        
        {authError && (
          <ErrorMessage>
            {authError}
          </ErrorMessage>
        )}
        
        <LoginButton 
          onClick={handleLogin} 
          disabled={isLoggingIn}
        >
          <FaEthereum size={24} />
          {isLoggingIn ? 'Connecting...' : 'Connect with MetaMask'}
        </LoginButton>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;