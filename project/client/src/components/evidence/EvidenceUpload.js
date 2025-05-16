import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import { FaUpload, FaArrowLeft, FaFile, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';

const UploadContainer = styled.div`
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

const UploadTitle = styled.h1`
  color: var(--primary-color);
  margin-bottom: 2rem;
`;

const UploadForm = styled.form`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 2rem;
`;

const DropzoneContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const StyledDropzone = styled.div`
  border: 2px dashed ${props => props.isDragActive ? 'var(--primary-color)' : 'var(--gray-300)'};
  border-radius: var(--border-radius);
  padding: 2rem;
  text-align: center;
  color: var(--gray-600);
  transition: border-color 0.2s, background-color 0.2s;
  cursor: pointer;
  background-color: ${props => props.isDragActive ? 'rgba(66, 153, 225, 0.05)' : 'transparent'};
  
  &:hover {
    border-color: var(--primary-color);
    background-color: rgba(66, 153, 225, 0.05);
  }
`;

const DropzoneIcon = styled.div`
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const DropzoneText = styled.p`
  margin-bottom: 0.5rem;
`;

const SelectedFile = styled.div`
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  background-color: var(--gray-100);
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const FileIcon = styled.div`
  font-size: 1.5rem;
  color: var(--primary-color);
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 500;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  font-size: 0.85rem;
  color: var(--gray-600);
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  font-size: 1.1rem;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const UploadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary-color);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  
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

const CancelButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  color: var(--gray-700);
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover {
    background-color: var(--gray-100);
  }
`;

const Progress = styled.div`
  height: 6px;
  background-color: var(--gray-200);
  border-radius: 3px;
  margin-top: 1rem;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: var(--primary-color);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

// Format file size
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const EvidenceUpload = () => {
  const { caseId } = useParams();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [caseData, setCaseData] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch case details
  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await axios.get(`/api/cases/${caseId}`);
        setCaseData(response.data);
      } catch (error) {
        console.error('Error fetching case details:', error);
        toast.error('Error loading case details');
      }
    };

    fetchCaseDetails();
  }, [caseId]);

  // Handle file drop
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleCancel = () => {
    navigate(`/cases/${caseId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (!currentUser) {
      toast.error('You must be logged in to upload evidence');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    formData.append('description', description);
    formData.append('uploadedBy', currentUser.address);
    
    try {
      // Upload with progress tracking
      const response = await axios.post('/api/evidence', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      toast.success('Evidence uploaded successfully');
      navigate(`/evidence/${response.data._id}`);
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error(error.response?.data?.msg || 'Error uploading evidence');
      setUploading(false);
    }
  };

  return (
    <UploadContainer>
      <BackLink to={`/cases/${caseId}`}>
        <FaArrowLeft /> Back to Case
      </BackLink>
      
      <UploadTitle>
        Upload Evidence
        {caseData && ` for Case #${caseData.caseNumber}`}
      </UploadTitle>
      
      <UploadForm onSubmit={handleSubmit}>
        <DropzoneContainer>
          <label>Evidence File *</label>
          <StyledDropzone {...getRootProps()} isDragActive={isDragActive}>
            <input {...getInputProps()} />
            <DropzoneIcon>
              <FaUpload />
            </DropzoneIcon>
            <DropzoneText>
              {isDragActive
                ? 'Drop the file here...'
                : 'Drag and drop a file here, or click to select a file'}
            </DropzoneText>
            <small>Maximum file size: 10MB</small>
            
            {uploading && (
              <Progress>
                <ProgressBar progress={uploadProgress} />
              </Progress>
            )}
          </StyledDropzone>
          
          {file && (
            <SelectedFile>
              <FileIcon>
                <FaFile />
              </FileIcon>
              <FileInfo>
                <FileName>{file.name}</FileName>
                <FileSize>{formatBytes(file.size)}</FileSize>
              </FileInfo>
              <RemoveFileButton type="button" onClick={handleRemoveFile} disabled={uploading}>
                <FaTimes />
              </RemoveFileButton>
            </SelectedFile>
          )}
        </DropzoneContainer>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for this evidence"
            disabled={uploading}
          />
        </div>
        
        <ButtonGroup>
          <UploadButton type="submit" disabled={!file || uploading}>
            {uploading ? `Uploading... ${uploadProgress}%` : (
              <>
                <FaUpload /> Upload Evidence
              </>
            )}
          </UploadButton>
          
          <CancelButton type="button" onClick={handleCancel} disabled={uploading}>
            <FaTimes /> Cancel
          </CancelButton>
        </ButtonGroup>
      </UploadForm>
    </UploadContainer>
  );
};

export default EvidenceUpload;