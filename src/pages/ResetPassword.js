import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaLock, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaSpinner } from "react-icons/fa";

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
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
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
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
  padding: 20px;
`;

const Card = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 48px 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 450px;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 480px) {
    padding: 36px 24px;
    border-radius: 16px;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1e90ff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #0066cc;
    transform: translateX(-4px);
  }
  
  svg {
    font-size: 0.9rem;
  }
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
  font-size: 2rem;
  box-shadow: 0 8px 24px rgba(30, 144, 255, 0.3);
  
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
    font-size: 1.8rem;
    border-radius: 16px;
  }
`;

const Title = styled.h2`
  margin-bottom: 12px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
  text-align: center;
  font-size: 2rem;
  
  @media (max-width: 480px) {
    font-size: 1.7rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 32px;
  font-size: 0.95rem;
  font-weight: 500;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
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
  color: #1e90ff;
  font-size: 1.1rem;
  z-index: 1;
`;

const Input = styled.input`
  padding: 14px 16px 14px 48px;
  width: 100%;
  border-radius: 12px;
  border: 2px solid #e1e5e9;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  background-color: #fafbfc;
  min-height: 52px;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(30, 144, 255, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

const Button = styled.button`
  padding: 16px 24px;
  width: 100%;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  min-height: 52px;
  box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(30, 144, 255, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
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
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 2.5rem;
  box-shadow: 0 8px 24px rgba(40, 167, 69, 0.3);
  animation: ${fadeIn} 0.5s ease-out;
`;

const SuccessTitle = styled.h3`
  color: #28a745;
  font-weight: 800;
  font-size: 1.5rem;
  margin-bottom: 12px;
`;

const SuccessText = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
`;

const ErrorMsg = styled.div`
  color: #d9534f;
  background: linear-gradient(135deg, #ffe5e5 0%, #ffd6d6 100%);
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(217, 83, 79, 0.2);
  
  svg {
    font-size: 1.1rem;
    flex-shrink: 0;
  }
`;
