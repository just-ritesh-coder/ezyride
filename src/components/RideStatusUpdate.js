import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaPlay, FaStop, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { API_BASE_URL } from '../utils/config';

const RideStatusUpdate = ({ rideId, initialStatus }) => {
  const [status, setStatus] = useState(initialStatus || 'posted');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const updateStatus = async (newStatus) => {
    setErr('');
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      setStatus(data.ride.status);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const canStart = status === 'posted';
  const canComplete = status === 'ongoing';

  const getStatusColor = () => {
    if (status === 'posted') return '#0b74ff';
    if (status === 'ongoing') return '#b76e00';
    if (status === 'completed') return '#18794e';
    return '#666';
  };

  const getStatusBg = () => {
    if (status === 'posted') return '#e7f0ff';
    if (status === 'ongoing') return '#fff3cd';
    if (status === 'completed') return '#e6f4ea';
    return '#f5f5f5';
  };

  return (
    <Container>
      <StatusDisplay>
        <StatusLabel>Status:</StatusLabel>
        <StatusBadge $color={getStatusColor()} $bg={getStatusBg()}>
          {status === 'posted' && <FaCheckCircle />}
          {status === 'ongoing' && <FaPlay />}
          {status === 'completed' && <FaCheckCircle />}
          {status}
        </StatusBadge>
      </StatusDisplay>

      {err && (
        <ErrorMessage>
          <FaExclamationTriangle /> {err}
        </ErrorMessage>
      )}

      <Actions>
        <ActionButton
          disabled={!canStart || loading}
          onClick={() => updateStatus('ongoing')}
          $variant="primary"
        >
          {loading && canStart ? (
            <>
              <Spinner /> Updating...
            </>
          ) : (
            <>
              <FaPlay /> Start Ride
            </>
          )}
        </ActionButton>

        <ActionButton
          disabled={!canComplete || loading}
          onClick={() => updateStatus('completed')}
          $variant="success"
        >
          {loading && canComplete ? (
            <>
              <Spinner /> Completing...
            </>
          ) : (
            <>
              <FaStop /> Complete Ride
            </>
          )}
        </ActionButton>
      </Actions>
    </Container>
  );
};

export default RideStatusUpdate;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  border: 1px solid rgba(30, 144, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  animation: ${fadeIn} 0.4s ease-out;
`;

const StatusDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusLabel = styled.span`
  font-weight: 700;
  color: #333;
  font-size: 0.95rem;
`;

const StatusBadge = styled.span`
  text-transform: capitalize;
  font-weight: 800;
  font-size: 0.9rem;
  padding: 8px 16px;
  border-radius: 999px;
  color: ${props => props.$color};
  background: ${props => props.$bg};
  border: 1px solid ${props => props.$color}33;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 0.85rem;
  }
`;

const ErrorMessage = styled.div`
  color: #d9534f;
  background: linear-gradient(135deg, #ffe5e5 0%, #ffd6d6 100%);
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(217, 83, 79, 0.2);
  
  svg {
    font-size: 1rem;
    flex-shrink: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  flex: 1;
  min-width: 140px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  
  svg {
    font-size: 0.9rem;
  }
  
  ${props => props.$variant === 'primary' && `
    background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(30, 144, 255, 0.4);
    }
  `}
  
  ${props => props.$variant === 'success' && `
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;
