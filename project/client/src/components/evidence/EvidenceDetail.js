import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaArrowLeft, 
  FaDownload, 
  FaCheck, 
  FaClock,
  FaExclamationTriangle, 
  FaQuestionCircle,
  FaFileAlt,
  FaHashtag
} from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const EvidenceContainer = styled.div`
  animation: ${fadeIn} 0.3s ease-in-out;
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

const EvidenceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const EvidenceTitle = styled.div`
  flex: 1;
`;

const EvidenceHeading = styled.h1`
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const CaseLabel = styled(Link)`
  font-size: 1.1rem;
  color: var(--gray-600);
  display: inline-block;
  margin-bottom: 0.5rem;
  
  &:hover {
    color: var(--primary-color);
    text-decoration: underline;
  }
`;

const EvidenceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.primary ? 'var(--primary-color)' : 'var(--white)'};
  color: ${props => props.primary ? 'var(--white)' : 'var(--primary-color)'};
  border: ${props => props.primary ? 'none' : '1px solid var(--primary-color)'};
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--primary-light)' : 'var(--gray-100)'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: var(--gray-300);
    border-color: var(--gray-300);
    color: var(--gray-500);
    cursor: not-allowed;
    transform: none;
  }
`;

const DownloadButton = styled(Button)``;

const VerifyButton = styled(Button)``;

const EvidenceCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const CardIcon = styled.div`
  font-size: 1.25rem;
  color: var(--primary-color);
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  width: 120px;
  color: var(--gray-600);
  font-size: 0.9rem;
`;

const InfoValue = styled.div`
  flex: 1;
  word-break: break-all;
`;

const HashValue = styled.div`
  font-family: monospace;
  background-color: var(--gray-100);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  overflow-x: auto;
  white-space: nowrap;
`;

const VerificationCard = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const VerificationTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
`;

const VerificationStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  background-color: ${props => {
    switch(props.status) {
      case 'verified': return 'rgba(72, 187, 120, 0.1)';
      case 'tampered': return 'rgba(245, 101, 101, 0.1)';
      case 'pending': return 'rgba(237, 137, 54, 0.1)';
      default: return 'rgba(160, 174, 192, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'verified': return 'var(--success-color)';
      case 'tampered': return 'var(--error-color)';
      case 'pending': return 'var(--warning-color)';
      default: return 'var(--gray-500)';
    }
  }};
`;

const VerificationIcon = styled.div`
  font-size: 2rem;
`;

const VerificationMessage = styled.div`
  flex: 1;
  
  h4 {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  
  p {
    margin-bottom: 0;
    line-height: 1.5;
  }
`;

const VerificationTime = styled.div`
  color: var(--gray-600);
  font-size: 0.9rem;
  margin-top: 1rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
`;

const VerificationLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--gray-600);
  
  svg {
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EvidenceDetail = () => {
  const { id } = useParams();
  const [evidence, setEvidence] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchEvidenceDetails = async () => {
      try {
        // Fetch evidence details
        const evidenceResponse = await axios.get(`/api/evidence/${id}`);
        setEvidence(evidenceResponse.data);
        
        // Fetch case details
        const caseResponse = await axios.get(`/api/cases/${evidenceResponse.data.caseId}`);
        setCaseData(caseResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching evidence details:', error);
        toast.error('Error loading evidence details');
        setLoading(false);
      }
    };

    fetchEvidenceDetails();
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/evidence/${id}/file`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', evidence.fileName);
      
      // Append to html
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
    }
  };

  const handleVerify = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to verify evidence');
      return;
    }
    
    setVerifying(true);
    
    try {
      const response = await axios.post(`/api/evidence/${id}/verify`);
      
      // Update evidence with verification results
      setEvidence(prevState => ({
        ...prevState,
        verified: response.data.blockchainVerified && response.data.hashesMatch,
        verificationStatus: response.data.verificationStatus,
        verificationTime: response.data.verificationTime
      }));
      
      toast.success('Verification completed');
    } catch (error) {
      console.error('Error verifying evidence:', error);
      toast.error('Error during verification process');
    } finally {
      setVerifying(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get verification status display elements
  const getVerificationDisplay = () => {
    if (!evidence) return null;
    
    const { verificationStatus } = evidence;
    
    let icon, title, message;
    
    switch(verificationStatus) {
      case 'verified':
        icon = <FaCheck />;
        title = 'Evidence Verified';
        message = 'This evidence has been verified on the blockchain. The file has not been tampered with since it was uploaded.';
        break;
      case 'tampered':
        icon = <FaExclamationTriangle />;
        title = 'Evidence Tampered';
        message = 'The integrity check failed. This evidence may have been modified since it was uploaded.';
        break;
      case 'pending':
        icon = <FaClock />;
        title = 'Verification Pending';
        message = 'This evidence has not been verified yet. Click the "Verify Integrity" button to check its authenticity.';
        break;
      default:
        icon = <FaQuestionCircle />;
        title = 'Verification Unknown';
        message = 'The verification status of this evidence is unknown. Try verifying it again.';
    }
    
    return { icon, title, message };
  };

  if (loading) {
    return (
      <EvidenceContainer>
        <LoadingContainer>
          Loading evidence details...
        </LoadingContainer>
      </EvidenceContainer>
    );
  }

  if (!evidence || !caseData) {
    return (
      <EvidenceContainer>
        <div>Evidence not found</div>
      </EvidenceContainer>
    );
  }

  const verificationDisplay = getVerificationDisplay();

  return (
    <EvidenceContainer>
      <BackLink to={`/cases/${evidence.caseId}`}>
        <FaArrowLeft /> Back to Case
      </BackLink>
      
      <EvidenceHeader>
        <EvidenceTitle>
          <EvidenceHeading>{evidence.fileName}</EvidenceHeading>
          <CaseLabel to={`/cases/${evidence.caseId}`}>
            Case #{caseData.caseNumber} - {caseData.title}
          </CaseLabel>
          <EvidenceInfo>
            <div>Uploaded: {formatDate(evidence.uploadTimestamp)}</div>
            <div>Uploaded by: {formatAddress(evidence.uploadedBy)}</div>
          </EvidenceInfo>
        </EvidenceTitle>
        
        <ActionButtons>
          <DownloadButton onClick={handleDownload}>
            <FaDownload /> Download
          </DownloadButton>
          
          <VerifyButton 
            primary
            onClick={handleVerify} 
            disabled={verifying || evidence.verificationStatus === 'verified'}
          >
            <FaCheck /> {verifying ? 'Verifying...' : 'Verify Integrity'}
          </VerifyButton>
        </ActionButtons>
      </EvidenceHeader>
      
      <VerificationCard>
        <VerificationTitle>
          <FaCheck /> Integrity Verification
        </VerificationTitle>
        
        {verifying ? (
          <VerificationLoading>
            <FaClock size={24} />
            <div>Verifying evidence integrity on the blockchain...</div>
          </VerificationLoading>
        ) : (
          <>
            <VerificationStatus status={evidence.verificationStatus}>
              <VerificationIcon>
                {verificationDisplay.icon}
              </VerificationIcon>
              <VerificationMessage>
                <h4>{verificationDisplay.title}</h4>
                <p>{verificationDisplay.message}</p>
              </VerificationMessage>
            </VerificationStatus>
            
            {evidence.verificationTime && (
              <VerificationTime>
                Last verified: {formatDate(evidence.verificationTime)}
              </VerificationTime>
            )}
          </>
        )}
      </VerificationCard>
      
      <EvidenceCards>
        <Card>
          <CardTitle>
            <CardIcon>
              <FaFileAlt />
            </CardIcon>
            File Details
          </CardTitle>
          
          <InfoRow>
            <InfoLabel>File Type:</InfoLabel>
            <InfoValue>{evidence.fileType}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>File Size:</InfoLabel>
            <InfoValue>{(evidence.fileSize / 1024).toFixed(2)} KB</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Description:</InfoLabel>
            <InfoValue>{evidence.description || 'No description provided'}</InfoValue>
          </InfoRow>
        </Card>
        
        <Card>
          <CardTitle>
            <CardIcon>
              <FaHashtag />
            </CardIcon>
            Blockchain Data
          </CardTitle>
          
          <InfoRow>
            <InfoLabel>Evidence ID:</InfoLabel>
            <InfoValue>{evidence.evidenceId}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>File Hash:</InfoLabel>
            <InfoValue>
              <HashValue>{evidence.fileHash}</HashValue>
            </InfoValue>
          </InfoRow>
          
          {evidence.blockchainTxHash && (
            <InfoRow>
              <InfoLabel>Transaction:</InfoLabel>
              <InfoValue>
                <HashValue>{evidence.blockchainTxHash}</HashValue>
              </InfoValue>
            </InfoRow>
          )}
        </Card>
      </EvidenceCards>
    </EvidenceContainer>
  );
};

export default EvidenceDetail;