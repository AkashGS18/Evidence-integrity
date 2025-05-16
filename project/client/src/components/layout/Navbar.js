import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaFileAlt, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import styled from 'styled-components';

const NavbarContainer = styled.nav`
  background-color: var(--primary-color);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  color: var(--white);
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &:hover {
    color: var(--white);
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  color: var(--white);
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: var(--accent-color);
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const WalletAddress = styled.div`
  color: var(--gray-300);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: var(--white);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
  
  &:hover {
    color: var(--accent-color);
  }
`;

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <NavbarContainer>
      <Logo to="/">
        <FaFileAlt /> Evidence Integrity
      </Logo>
      
      {currentUser && (
        <NavLinks>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/cases">Cases</NavLink>
        </NavLinks>
      )}
      
      {currentUser ? (
        <UserInfo>
          <WalletAddress>
            <FaUserShield /> {truncateAddress(currentUser.address)}
          </WalletAddress>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </LogoutButton>
        </UserInfo>
      ) : (
        <NavLink to="/login">Login</NavLink>
      )}
    </NavbarContainer>
  );
};

export default Navbar;