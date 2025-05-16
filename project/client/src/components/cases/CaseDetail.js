import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUpload, FaArrowLeft, FaExclamationTriangle, FaCheckCircle, FaHourglass, FaQuestionCircle } from 'react-icons/fa';
import styled from 'styled-components';

const CaseContainer = styled.div`
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CaseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const CaseTitle = styled.div`
  flex: 1;
`;

const CaseHeading = styled.h1`
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const CaseNumberLabel = styled.div`
  font-size: 1.1rem;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 1rem;
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

const CaseInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: var(--gray-600);
  font-size: 0.9rem;
`;

const UploadButton = styled(Link)`
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

const CaseDescription = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const DescriptionTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const DescriptionText = styled.p`
  line-height: 1.6;
  margin-bottom: 0;
`;

const EvidenceSection = styled.div`
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
  font-size: 1.25rem;
`;

const EvidenceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const EvidenceCard = styled(Link)`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const EvidenceTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: var(--primary-color);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EvidenceDescription = styled.p`
  color: var(--gray-600);
  font-size: 0.95rem;
  margin-bottom: 1rem;
  flex-grow: 1;
`;

const EvidenceFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const EvidenceDate = styled.div`
  color: var(--gray-500);
  font-size: 0.85rem;
`;

const VerificationStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => {
    switch(props.status) {
      case 'verified': return 'var(--success-color)';
      case 'tampered': return 'var(--error-color)';
      case 'pending': return 'var(--warning-color)';
      default: return 'var(--gray-500)';
    }
  }};
  font-size: 0.9rem;
  font-weight: 500;
`;

const NoEvidenceMessage = styled.div`
  text-align: center;
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 3rem 1.5rem;
  grid-column: 1 / -1;
  color: var(--gray-500);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const NoEvidenceIcon = styled.div`
  font-size: 2.5rem;
  color: var(--gray-400);
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
  grid-column: 1 / -1;
`;

const CaseDetail = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaseAndEvidence = async () => {
      try {
        // Fetch case details
        const caseResponse = await axios.get(`/api/cases/${id}`);
        setCaseData(caseResponse.data);
        
        // Fetch evidence for the case
        const evidenceResponse = await axios.get(`/api/cases/${id}/evidence`);
        setEvidence(evidenceResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching case details:', error);
        toast.error('Error loading case details');
        setLoading(false);
      }
    };

    fetchCaseAndEvidence();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get verification icon based on status
  const getVerificationIcon = (status) => {
    switch(status) {
      case 'verified':
        return <FaCheckCircle />;
      case 'tampered':
        return <FaExclamationTriangle />;
      case 'pending':
        return <FaHourglass />;
      default:
        return <FaQuestionCircle />;
    }
  };

  if (loading) {
    return (
      <CaseContainer>
        <LoadingContainer>
          Loading case details...
        </LoadingContainer>
      </CaseContainer>
    );
  }

  if (!caseData) {
    return (
      <CaseContainer>
        <div>Case not found</div>
      </CaseContainer>
    );
  }

  return (
    <CaseContainer>
      <BackLink to="/cases">
        <FaArrowLeft /> Back to Cases
      </BackLink>
      
      <CaseHeader>
        <CaseTitle>
          <CaseHeading>{caseData.title}</CaseHeading>
          <CaseNumberLabel>
            Case #{caseData.caseNumber}
            <Status status={caseData.status}>
              {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
            </Status>
          </CaseNumberLabel>
          <CaseInfo>
            <div>Created: {formatDate(caseData.createdAt)}</div>
            <div>Last Updated: {formatDate(caseData.updatedAt)}</div>
          </CaseInfo>
        </CaseTitle>
        
        <UploadButton to={`/cases/${id}/evidence/upload`}>
          <FaUpload /> Upload Evidence
        </UploadButton>
      </CaseHeader>
      
      <CaseDescription>
        <DescriptionTitle>Case Details</DescriptionTitle>
        <DescriptionText>{caseData.description}</DescriptionText>
      </CaseDescription>
      
      <EvidenceSection>
        <SectionHeader>
          <SectionTitle>Evidence ({evidence.length})</SectionTitle>
        </SectionHeader>
        
        <EvidenceGrid>
          {evidence.length > 0 ? (
            evidence.map(item => (
              <EvidenceCard to={`/evidence/${item._id}`} key={item._id}>
                <EvidenceTitle>
                  {item.fileName}
                </EvidenceTitle>
                <EvidenceDescription>
                  {item.description || 'No description provided'}
                </EvidenceDescription>
                <EvidenceFooter>
                  <EvidenceDate>{formatDate(item.uploadTimestamp)}</EvidenceDate>
                  <VerificationStatus status={item.verificationStatus}>
                    {getVerificationIcon(item.verificationStatus)}
                    {item.verificationStatus.charAt(0).toUpperCase() + item.verificationStatus.slice(1)}
                  </VerificationStatus>
                </EvidenceFooter>
              </EvidenceCard>
            ))
          ) : (
            <NoEvidenceMessage>
              <NoEvidenceIcon>
                <FaUpload />
              </NoEvidenceIcon>
              <p>No evidence has been added to this case yet.</p>
              <UploadButton to={`/cases/${id}/evidence/upload`}>
                <FaUpload /> Upload First Evidence
              </UploadButton>
            </NoEvidenceMessage>
          )}
        </EvidenceGrid>
      </EvidenceSection>
    </CaseContainer>
  );
};

export default CaseDetail;