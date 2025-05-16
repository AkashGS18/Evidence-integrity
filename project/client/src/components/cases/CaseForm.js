import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';

const FormContainer = styled.div`
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const FormTitle = styled.h1`
  color: var(--primary-color);
  margin-bottom: 2rem;
`;

const StyledForm = styled.form`
  background-color: var(--white);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  padding: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SubmitButton = styled.button`
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

const CaseForm = () => {
  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    description: '',
    status: 'open'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { caseNumber, title, description, status } = formData;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!caseNumber || !title || !description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await axios.post('/api/cases', formData);
      toast.success('Case created successfully');
      navigate(`/cases/${res.data._id}`);
    } catch (err) {
      console.error('Error creating case:', err);
      toast.error(err.response?.data?.msg || 'Error creating case');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/cases');
  };

  return (
    <FormContainer>
      <FormTitle>Register New Case</FormTitle>
      
      <StyledForm onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="caseNumber">Case Number *</label>
          <input
            type="text"
            id="caseNumber"
            name="caseNumber"
            value={caseNumber}
            onChange={handleChange}
            placeholder="Enter case number"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={handleChange}
            placeholder="Enter case title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleChange}
            placeholder="Enter case description"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={handleChange}
          >
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <ButtonGroup>
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : (
              <>
                <FaCheck /> Create Case
              </>
            )}
          </SubmitButton>
          
          <CancelButton type="button" onClick={handleCancel}>
            <FaTimes /> Cancel
          </CancelButton>
        </ButtonGroup>
      </StyledForm>
    </FormContainer>
  );
};

export default CaseForm;