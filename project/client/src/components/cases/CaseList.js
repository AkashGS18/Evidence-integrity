import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaSearch, FaFilter, FaBoxOpen, FaSortAmountDown } from 'react-icons/fa';
import styled from 'styled-components';

const CaseListContainer = styled.div`
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const CaseListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const CaseListTitle = styled.h1`
  color: var(--primary-color);
  margin-bottom: 0;
`;

const FiltersContainer = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInput = styled.div`
  position: relative;
  
  input {
    padding-left: 2.5rem;
  }
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-500);
  }
`;

const FilterSelect = styled.div`
  position: relative;
  
  select {
    padding-left: 2.5rem;
    appearance: none;
  }
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-500);
    pointer-events: none;
  }
`;

const SortSelect = styled.div`
  position: relative;
  
  select {
    padding-left: 2.5rem;
    appearance: none;
  }
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-500);
    pointer-events: none;
  }
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

const CaseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CaseCard = styled(Link)`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const CaseNumber = styled.div`
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const CaseTitle = styled.h3`
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const CaseDescription = styled.p`
  color: var(--gray-600);
  font-size: 0.95rem;
  flex-grow: 1;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CaseFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const CaseDate = styled.div`
  color: var(--gray-500);
  font-size: 0.85rem;
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

const NoData = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--gray-500);
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const NoDataIcon = styled.div`
  font-size: 3rem;
  color: var(--gray-400);
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  grid-column: 1 / -1;
`;

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await axios.get('/api/cases');
        setCases(Array.isArray(response.data) ? response.data : response.data.cases);

      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter and sort cases
  const filteredCases = cases
    .filter(caseItem => {
      const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            caseItem.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === '' || caseItem.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'caseNumber':
          return a.caseNumber.localeCompare(b.caseNumber);
        default:
          return 0;
      }
    });

  return (
    <CaseListContainer>
      <CaseListHeader>
        <CaseListTitle>All Cases</CaseListTitle>
        <CreateButton to="/cases/new">
          <FaPlus /> New Case
        </CreateButton>
      </CaseListHeader>

      <FiltersContainer>
        <SearchInput>
          <FaSearch />
          <input 
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
        
        <FilterSelect>
          <FaFilter />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
          </select>
        </FilterSelect>
        
        <SortSelect>
          <FaSortAmountDown />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
            <option value="caseNumber">Case Number</option>
          </select>
        </SortSelect>
      </FiltersContainer>

      <CaseGrid>
        {loading ? (
          <LoadingContainer>
            Loading cases...
          </LoadingContainer>
        ) : filteredCases.length > 0 ? (
          filteredCases.map(caseItem => (
            <CaseCard to={`/cases/${caseItem._id}`} key={caseItem._id}>
              <CaseNumber>{caseItem.caseNumber}</CaseNumber>
              <CaseTitle>{caseItem.title}</CaseTitle>
              <CaseDescription>{caseItem.description}</CaseDescription>
              <CaseFooter>
                <CaseDate>{formatDate(caseItem.createdAt)}</CaseDate>
                <Status status={caseItem.status}>
                  {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                </Status>
              </CaseFooter>
            </CaseCard>
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
      </CaseGrid>
    </CaseListContainer>
  );
};

export default CaseList;