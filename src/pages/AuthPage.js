import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { AuthContext } from "../context/AuthContext";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaCar,
  FaHeart,
  FaArrowRight,
  FaExclamationTriangle,
  FaSpinner
} from "react-icons/fa";
import { API_BASE_URL } from "../utils/config";

import csmtImage from "../assets/csmt_img.png";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    vehicle: "",
    preferences: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      password: "",
      vehicle: "",
      preferences: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Login failed");
          setLoading(false);
          return;
        }

        login(data.token);
        navigate("/home");
      } catch (err) {
        setError("Login failed: " + err.message);
        setLoading(false);
      }
    } else {
      if (!formData.fullName || !formData.phone) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Signup failed");
          setLoading(false);
          return;
        }

        login(data.token);
        navigate("/home");
      } catch (err) {
        setError("Signup failed: " + err.message);
        setLoading(false);
      }
    }
  };

  return (
    <Container>
      <LeftPane>
        <Title>Share Your Ride</Title>
        <Tagline>
          Connecting riders and drivers, saving money & the environment together.
        </Tagline>
        <Image
          src={csmtImage}
          alt="Chhatrapati Shivaji Maharaj Terminus (CSMT)"
        />
      </LeftPane>

      <RightPane>
        <FormTitle>{isLogin ? "Welcome Back" : "Create Account"}</FormTitle>
        <FormSubtitle>{isLogin ? "Login to continue your journey" : "Join EzyRide today"}</FormSubtitle>
        {error && <ErrorMessage><FaExclamationTriangle /> {error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <InputWrapper>
                <InputIcon><FaUser /></InputIcon>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required={!isLogin}
                />
              </InputWrapper>

              <InputWrapper>
                <InputIcon><FaPhone /></InputIcon>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required={!isLogin}
                />
              </InputWrapper>
            </>
          )}

          <InputWrapper>
            <InputIcon><FaEnvelope /></InputIcon>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
            />
          </InputWrapper>

          <InputWrapper>
            <InputIcon><FaLock /></InputIcon>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </InputWrapper>

          {isLogin && (
            <ForgotPasswordLink>
              <Link to="/forgot-password">Forgot password?</Link>
            </ForgotPasswordLink>
          )}

          {!isLogin && (
            <>
              <InputWrapper>
                <InputIcon><FaCar /></InputIcon>
                <Input
                  type="text"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  placeholder="Vehicle Info (optional)"
                />
              </InputWrapper>

              <InputWrapper>
                <InputIcon><FaHeart /></InputIcon>
                <Input
                  type="text"
                  name="preferences"
                  value={formData.preferences}
                  onChange={handleChange}
                  placeholder="Preferences (optional)"
                />
              </InputWrapper>
            </>
          )}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner /> {isLogin ? "Logging in..." : "Signing up..."}
              </>
            ) : (
              <>
                {isLogin ? "Login" : "Sign Up"} <FaArrowRight />
              </>
            )}
          </SubmitButton>
        </Form>

        <ToggleText>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <ToggleButton onClick={toggleForm}>
            {isLogin ? "Sign up here" : "Log in here"}
          </ToggleButton>
        </ToggleText>
      </RightPane>
    </Container>
  );
};

/* Styled Components */

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



const Container = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  
  @media (max-width: 768px) {
    flex-direction: column;
    min-height: 100vh;
  }
`;

const LeftPane = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding: 40px 20px;
    text-align: center;
    align-items: center;
    min-height: 40vh;
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 30px 15px;
    min-height: 35vh;
    gap: 12px;
  }
`;

const Title = styled.h1`
  font-weight: 700;
  font-size: 3rem;
  margin: 0;
  line-height: 1.2;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const Tagline = styled.p`
  font-size: 1.2rem;
  max-width: 400px;
  margin: 0;
  line-height: 1.5;
  opacity: 0.95;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Image = styled.img`
  margin-top: 20px;
  border-radius: 12px;
  max-width: 100%;
  max-height: 320px;
  width: auto;
  height: auto;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  display: block;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 768px) {
    max-height: 200px;
    margin-top: 15px;
    border-radius: 8px;
  }
  
  @media (max-width: 480px) {
    max-height: 150px;
    margin-top: 10px;
  }
`;

const RightPane = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 480px;
  margin: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 20px;
  position: relative;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: 40px 24px;
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    flex: 1;
    min-height: 60vh;
  }
  
  @media (max-width: 480px) {
    padding: 30px 20px;
    min-height: 65vh;
  }
`;

const FormTitle = styled.h2`
  margin-bottom: 8px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.4rem;
  font-weight: 900;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 5px;
  }
`;

const FormSubtitle = styled.p`
  margin-bottom: 32px;
  color: #666;
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 24px;
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ffe5e5 0%, #ffd6d6 100%);
  color: #d9534f;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(217, 83, 79, 0.2);
  animation: ${fadeIn} 0.3s ease-out;
  
  svg {
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;



const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  color: #1e90ff;
  font-size: 1.1rem;
  z-index: 1;
  display: flex;
  align-items: center;
  pointer-events: none;
  
  svg {
    width: 100%;
    height: 100%;
  }
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
  font-family: 'Poppins', sans-serif;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(30, 144, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover:not(:focus) {
    border-color: #b8c5d1;
    background-color: #fff;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  @media (max-width: 480px) {
    padding: 12px 14px 12px 44px;
    margin-bottom: 16px;
    font-size: 16px;
    min-height: 48px;
    border-radius: 10px;
  }
`;

const ForgotPasswordLink = styled.div`
  margin-bottom: 16px;
  text-align: right;
  
  a {
    color: #1e90ff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover {
      text-decoration: underline;
      background-color: rgba(30, 144, 255, 0.1);
    }
    
    &:active {
      transform: translateY(1px);
    }
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    
    a {
      font-size: 13px;
    }
  }
`;

const Spinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SubmitButton = styled.button`
  padding: 16px 24px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  font-weight: 700;
  font-size: 16px;
  border-radius: 12px;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  min-height: 52px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
  }
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(30, 144, 255, 0.4);
  }
  
  &:hover:not(:disabled)::before {
    left: 100%;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 14px 20px;
    font-size: 15px;
    min-height: 48px;
    border-radius: 10px;
  }
`;

const ToggleText = styled.p`
  margin-top: 24px;
  font-size: 14px;
  color: #555;
  text-align: center;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    margin-top: 20px;
    font-size: 13px;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #1e90ff;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-left: 4px;
  
  &:hover {
    background-color: rgba(30, 144, 255, 0.1);
    text-decoration: underline;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 3px 6px;
  }
`;

export default AuthPage;
