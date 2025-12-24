import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaLock, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { API_BASE_URL } from "../utils/config";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");
  const email = query.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    if (!password || !confirm) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setMsg("Password reset! Redirecting to login...");
      setDone(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Card>
        <BackLink to="/">
          <FaArrowLeft /> Back to Login
        </BackLink>
        <IconWrapper>
          <FaLock />
        </IconWrapper>
        <Title>Reset Password</Title>
        <Subtitle>Enter your new password below</Subtitle>
        {done ? (
          <Success>
            <SuccessIcon><FaCheckCircle /></SuccessIcon>
            <SuccessTitle>Password Reset!</SuccessTitle>
            <SuccessText>{msg}</SuccessText>
          </Success>
        ) : (
          <Form onSubmit={handleSubmit}>
            <InputWrapper>
              <InputIcon><FaLock /></InputIcon>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New Password"
                required
              />
            </InputWrapper>
            <InputWrapper>
              <InputIcon><FaLock /></InputIcon>
              <Input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm Password"
                required
              />
            </InputWrapper>
            {error && (
              <ErrorMsg>
                <FaExclamationTriangle /> {error}
              </ErrorMsg>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner /> Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </Form>
        )}
      </Card>
    </Wrapper>
  );
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
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

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  padding: 20px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.section.dark}; /* Dark Section Card */
  padding: 48px 40px;
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.glass};
  width: 100%;
  max-width: 450px;
  animation: ${fadeIn} 0.6s ease-out;
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  
  @media (max-width: 480px) {
    padding: 36px 24px;
    border-radius: 16px;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text.accentBright};
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    transform: translateX(-4px);
  }
  
  svg {
    font-size: 0.9rem;
  }
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: 2rem;
  box-shadow: 0 8px 24px rgba(43, 73, 44, 0.3);
  
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    font-size: 1.8rem;
    border-radius: 16px;
  }
`;

const Title = styled.h2`
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: 900;
  text-align: center;
  font-size: 2rem;
  
  @media (max-width: 480px) {
    font-size: 1.7rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.inverseSecondary};
  text-align: center;
  margin-bottom: 32px;
  font-size: 0.95rem;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.accentBright};
  font-size: 1.1rem;
  z-index: 1;
`;

const Input = styled.input`
  padding: 14px 16px 14px 48px;
  width: 100%;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.05); /* Glass input */
  color: ${({ theme }) => theme.colors.text.inverse};
  min-height: 52px;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.surfaceHover};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.inverseSecondary};
    opacity: 0.5;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

const Button = styled.button`
  padding: 16px 24px;
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  font-weight: 700;
  font-size: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  min-height: 52px;
  box-shadow: ${({ theme }) => theme.shadows.glass};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.neon};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    background: ${({ theme }) => theme.colors.glass.border};
  }
  
  svg {
    font-size: 0.9rem;
  }
`;

const Success = styled.div`
  text-align: center;
  padding: 32px 24px;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: 2.5rem;
  box-shadow: ${({ theme }) => theme.shadows.glass};
  animation: ${fadeIn} 0.5s ease-out;
`;

const SuccessTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: 800;
  font-size: 1.5rem;
  margin-bottom: 12px;
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.colors.text.inverseSecondary};
  font-size: 1rem;
  line-height: 1.6;
`;

const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.error || "#ff6b6b"};
  background: rgba(239, 68, 68, 0.1);
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  
  svg {
    font-size: 1.1rem;
    flex-shrink: 0;
  }
`;
