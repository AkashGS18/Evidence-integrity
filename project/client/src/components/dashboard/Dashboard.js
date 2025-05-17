import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { FaFileAlt, FaPlus, FaBoxOpen, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const DashboardTitle = styled.h1`
  color: var(--primary-color);
  margin-bottom: 0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props => props.color};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: var(--gray-600);
`;

const RecentCasesSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 0;
`;

const CaseTable = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  padding: 1rem;
  background-color: var(--primary-color);
  color: var(--white);
  font-weight: 600;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 2fr 1fr;
  }
`;

const TableHeaderCell = styled.div`
  &:last-child {
    text-align: right;
  }
  
  @media (max-width: 768px) {
    &:nth-child(3) {
      display: none;
    }
  }
`;

const TableRow = styled(Link)`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid var(--gray-200);
  color: var(--gray-800);
  transition: background-color 0.2s;
  text-decoration: none;
  
  &:hover {
    background-color: var(--gray-100);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 2fr 1fr;
  }
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;
  
  &:last-child {
    text-align: right;
    justify-content: flex-end;
  }
  
  @media (max-width: 768px) {
    &:nth-child(3) {
      display: none;
    }
  }
`;

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${props => {
    switch(props.status) {
      case 'open': return 'rgba(66, 153, 225, 0.1)';
      case 'closed': return 'rgba(72, 187, 120, 0.1)';
      case 'pending': return 'rgba(237, 137, 54, 0.1)';
      default: return 'rgba(160, 174, 192, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'open': return 'var(--secondary-color)';
      case 'closed': return 'var(--success-color)';
      case 'pending': return 'var(--warning-color)';
      default: return 'var(--gray-500)';
    }
  }};
`;

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary-color);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover {
    background-color: var(--primary-light);
    color: var(--white);
    transform: translateY(-2px);
  }
`;

const NoData = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const NoDataIcon = styled.div`
  font-size: 3rem;
  color: var(--gray-400);
`;

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({
    totalCases: 0,
    totalEvidence: 0,
    verifiedEvidence: 0,
    tamperedEvidence: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch cases
        const response = await axios.get('/api/cases');
        setCases(response.data.cases);
        setStats(response.data.stats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Dashboard</DashboardTitle>
        <CreateButton to="/cases/new">
          <FaPlus /> New Case
        </CreateButton>
      </DashboardHeader>

      <StatsContainer>
        <StatCard>
          <StatIcon color="var(--primary-color)">
            <FaFileAlt />
          </StatIcon>
          <StatValue>{stats.totalCases}</StatValue>
          <StatLabel>Total Cases</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--secondary-color)">
            <FaBoxOpen />
          </StatIcon>
          <StatValue>{stats.totalEvidence}</StatValue>
          <StatLabel>Total Evidence Items</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--success-color)">
            <FaCheckCircle />
          </StatIcon>
          <StatValue>{stats.verifiedEvidence}</StatValue>
          <StatLabel>Verified Evidence</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--error-color)">
            <FaExclamationTriangle />
          </StatIcon>
          <StatValue>{stats.tamperedEvidence}</StatValue>
          <StatLabel>Potentially Tampered</StatLabel>
        </StatCard>
      </StatsContainer>

      <RecentCasesSection>
        <SectionHeader>
          <SectionTitle>Recent Cases</SectionTitle>
          <Link to="/cases" className="btn-link">View All</Link>
        </SectionHeader>
        
        <CaseTable>
          <TableHeader>
            <TableHeaderCell>Case #</TableHeaderCell>
            <TableHeaderCell>Title</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableHeader>
          
          {loading ? (
            <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>
          ) : cases.length > 0 ? (
            cases.slice(0, 5).map(caseItem => (
              <TableRow to={`/cases/${caseItem._id}`} key={caseItem._id}>
                <TableCell>{caseItem.caseNumber}</TableCell>
                <TableCell>{caseItem.title}</TableCell>
                <TableCell>{formatDate(caseItem.createdAt)}</TableCell>
                <TableCell>
                  <Status status={caseItem.status}>
                    {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                  </Status>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <NoData>
              <NoDataIcon>
                <FaBoxOpen />
              </NoDataIcon>
              <p>No cases found. Create your first case to get started!</p>
              <CreateButton to="/cases/new">
                <FaPlus /> Create Case
              </CreateButton>
            </NoData>
          )}
        </CaseTable>
      </RecentCasesSection>
    </DashboardContainer>
  );
};

export default Dashboard;