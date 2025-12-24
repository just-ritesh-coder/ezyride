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

/* Keyframes */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const typeWriter = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const blink = keyframes`
  50% { border-color: transparent; }
`;

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

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || (isLogin ? "Login failed" : "Signup failed"));
        setLoading(false);
        return;
      }

      login(data.token);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <BackgroundImage />
      <ContentWrapper>
        <GlassCard>
          <SplitLayout>
            <InfoSide>
              <CSMTBackground src={csmtImage} alt="CSMT" />
              <Logo>EzyRide</Logo>
              <HeroTitle>
                <GradientText>Daily</GradientText> Commuting Made Simple.
              </HeroTitle>
              <HeroText>
                "Better for your wallet. Better for the planet. Better for you." The premier carpooling network designed specifically for the modern workforce.
              </HeroText>
              <FeatureList>
                <FeatureItem>
                  <FeatureIcon><FaCar /></FeatureIcon>
                  <FeatureText>Premium Rides</FeatureText>
                </FeatureItem>
                <FeatureItem>
                  <FeatureIcon><FaHeart /></FeatureIcon>
                  <FeatureText>Smart Travel</FeatureText>
                </FeatureItem>
              </FeatureList>
            </InfoSide>

            <FormSide>
              <FormHeader>
                <FormTitle>{isLogin ? "Welcome Back" : "Join Exclusive"}</FormTitle>
                <FormSubtitle>{isLogin ? "Enter your credentials to access" : "Create your premium account"}</FormSubtitle>
              </FormHeader>

              {error && (
                <ErrorBanner>
                  <FaExclamationTriangle /> {error}
                </ErrorBanner>
              )}

              <StyledForm onSubmit={handleSubmit}>
                {!isLogin && (
                  <>
                    <InputGroup>
                      <Input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Full Name"
                        required={!isLogin}
                      />
                      <InputIcon><FaUser /></InputIcon>
                    </InputGroup>
                    <InputGroup>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        required={!isLogin}
                      />
                      <InputIcon><FaPhone /></InputIcon>
                    </InputGroup>
                  </>
                )}

                <InputGroup>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                  />
                  <InputIcon><FaEnvelope /></InputIcon>
                </InputGroup>

                <InputGroup>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                  />
                  <InputIcon><FaLock /></InputIcon>
                </InputGroup>

                {isLogin && (
                  <ForgotPasswordLink to="/forgot-password">
                    Forgot Password?
                  </ForgotPasswordLink>
                )}

                {!isLogin && (
                  <>
                    <InputGroup>
                      <Input
                        type="text"
                        name="vehicle"
                        value={formData.vehicle}
                        onChange={handleChange}
                        placeholder="Vehicle Details (Optional)"
                      />
                      <InputIcon><FaCar /></InputIcon>
                    </InputGroup>
                  </>
                )}

                <SubmitButton type="submit" disabled={loading}>
                  {loading ? <FaSpinner className="spin" /> : <FaArrowRight />}
                  {isLogin ? "Sign In" : "Get Started"}
                </SubmitButton>
              </StyledForm>

              <ToggleContainer>
                {isLogin ? "New to EzyRide?" : "Already a member?"}{" "}
                <ToggleBtn onClick={toggleForm}>
                  {isLogin ? "Apply for access" : "Sign In"}
                </ToggleBtn>
              </ToggleContainer>
            </FormSide>
          </SplitLayout>
        </GlassCard>
      </ContentWrapper>
    </PageContainer>
  );
};

/* Styled Components */

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BackgroundImage = styled.div`
  display: none; /* Remove background artifacts for clean white look */
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1100px;
  padding: 20px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 0;
    min-height: 100vh;
  }
`;

const GlassCard = styled.div`
  background: ${({ theme }) => theme.colors.section.dark}; /* Dark Green Block */
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.glass};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  
  @media (max-width: 768px) {
    border-radius: 0;
    min-height: 100vh;
    border: none;
  }
`;

const SplitLayout = styled.div`
  display: flex;
  min-height: 650px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    min-height: 100vh;
  }
`;

const InfoSide = styled.div`
  flex: 1;
  padding: 60px;
  /* Keep dark green base */
  background: ${({ theme }) => theme.colors.section.dark};
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 40px 20px 20px;
    flex: 0 0 auto;
    text-align: center;
    display: flex; /* Ensure visible */
  }
`;

const FormSide = styled.div`
  flex: 1;
  padding: 60px;
  /* Slightly lighter dark green or just dark green */
  background: ${({ theme }) => theme.colors.section.dark};
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-left: 1px solid rgba(255,255,255,0.05);

  @media (max-width: 768px) {
    padding: 20px 20px 40px;
    border-left: none;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex; /* Ensure visible */
  }
`;

const CSMTBackground = styled.img`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70%; /* Increased height coverage */
  object-fit: cover;
  opacity: 0.5; /* Increased visibility per user request */
  mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
  pointer-events: none;
  z-index: 0;
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary}; /* Mint Green */
  margin-bottom: 40px;
  letter-spacing: -0.02em;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  line-height: 1.1;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.text.inverse}; /* White Text */
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5); /* Added contrast */
  
  /* Animation Effect */
  animation: ${fadeInUp} 0.8s ease-out forwards;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #ffffff 0%, #d2e9d5 100%); /* White to Surf Crest */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3); /* Glow effect */
  display: inline-block;
  
  /* Typewriterish reveal */
  overflow: hidden;
  white-space: nowrap;
  border-right: 3px solid #ffffff; /* White cursor */
  width: 0;
  animation: 
    ${typeWriter} 1s steps(20, end) 0.5s forwards,
    ${blink} 0.75s step-end infinite;
`;

const HeroText = styled.p`
  color: ${({ theme }) => theme.colors.text.inverse}; /* Pure white for better contrast */
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 400px;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5); /* Added contrast */
  font-weight: 500;
  opacity: 0;
  
  /* Staggered Fade In */
  animation: ${fadeInUp} 0.8s ease-out 1.5s forwards;
  
  @media (max-width: 768px) {
    margin: 0 auto;
  }
`;

const FeatureList = styled.div`
  display: flex;
  gap: 30px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FeatureIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ffffff; /* White background for max contrast */
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary}; /* Dark Green Icon */
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  font-size: 1.1rem;
`;

const FeatureText = styled.span`
  color: #ffffff;
  font-weight: 700; /* Bolder */
  font-size: 1.05rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5); /* Shadow for legibility */
`;

const FormHeader = styled.div`
  margin-bottom: 40px;
  text-align: left;
`;

const FormTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text.inverse};
`;

const FormSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.inverseSecondary};
  font-size: 0.95rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 20px 16px 50px;
  background: rgba(255, 255, 255, 0.15); /* Increased visibility */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: #ffffff; /* Explicit white for safety */
  font-weight: 600; /* Bolder text */
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.inverse}; /* Full White */
    opacity: 0.9; /* High opacity */
  }
  
  &:focus {
    background: rgba(255, 255, 255, 0.06);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(197, 237, 203, 0.1);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.secondary};
  pointer-events: none;
`;

const ForgotPasswordLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.inverseSecondary}; /* Light Green */
  font-size: 0.9rem;
  text-align: right;
  margin-top: -10px;
  opacity: 0.8;
  
  &:hover {
    color: #ffffff;
    opacity: 1;
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.accentBright}; /* Surf Crest (Light) */
  color: ${({ theme }) => theme.colors.primary}; /* Tom Thumb (Dark Text) */
  padding: 16px;
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.full};
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(197, 237, 203, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(197, 237, 203, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ToggleContainer = styled.div`
  margin-top: 30px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.inverseSecondary}; /* Light text */
  font-size: 0.95rem;
`;

const ToggleBtn = styled.button`
  background: none;
  border: none;
  color: #ffffff; /* White emphasis */
  font-weight: 600;
  cursor: pointer;
  padding: 0 5px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

const ErrorBanner = styled.div`
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: #f87171;
  padding: 12px;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
`;

export default AuthPage;
