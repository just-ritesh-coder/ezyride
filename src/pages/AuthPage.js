import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link import
import styled from "styled-components";
import { AuthContext } from "../context/AuthContext";

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

    if (isLogin) {
      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Login failed");
          return;
        }

        login(data.token);
        navigate("/home");
      } catch (err) {
        alert("Login failed: " + err.message);
      }
    } else {
      if (!formData.fullName || !formData.phone) {
        alert("Please fill in all required fields.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Signup failed");
          return;
        }

        login(data.token);
        navigate("/home");
      } catch (err) {
        alert("Signup failed: " + err.message);
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
          src="https://images.timesproperty.com/blog/4980/CSMT_Railway_Station.png"
          alt="Chhatrapati Shivaji Maharaj Terminus (CSMT)"
        />
      </LeftPane>

      <RightPane>
        <FormTitle>{isLogin ? "Login" : "Sign Up"}</FormTitle>
        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <Label>Full Name</Label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required={!isLogin}
              />

              <Label>Phone Number</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                required={!isLogin}
              />
            </>
          )}

          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          {/* Forgot Password Link - Visible only on Login form */}
          {isLogin && (
            <ForgotPasswordLink>
              <Link to="/forgot-password">Forgot password?</Link>
            </ForgotPasswordLink>
          )}

          {!isLogin && (
            <>
              <Label>Vehicle Info (optional)</Label>
              <Input
                type="text"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                placeholder="Car model, registration (e.g., Toyota Corolla)"
              />

              <Label>Preferences (optional)</Label>
              <Input
                type="text"
                name="preferences"
                value={formData.preferences}
                onChange={handleChange}
                placeholder="Non-smoker, music preference, etc."
              />
            </>
          )}

          <SubmitButton type="submit">{isLogin ? "Login" : "Sign Up"}</SubmitButton>
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

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  
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
  background-color: #fff;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 450px;
  margin: auto;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    flex: 1;
    min-height: 60vh;
  }
  
  @media (max-width: 480px) {
    padding: 30px 15px;
    min-height: 65vh;
  }
`;

const FormTitle = styled.h2`
  margin-bottom: 20px;
  color: #333;
  font-size: 2rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.4rem;
    margin-bottom: 12px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  
  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 4px;
  }
`;

const Input = styled.input`
  padding: 14px 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  background-color: #fafbfc;
  min-height: 48px;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
  }
  
  &:hover {
    border-color: #b8c5d1;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  @media (max-width: 480px) {
    padding: 12px 14px;
    margin-bottom: 14px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px;
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

const SubmitButton = styled.button`
  padding: 16px 24px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(30, 144, 255, 0.3);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 15px rgba(30, 144, 255, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 14px 20px;
    font-size: 15px;
    min-height: 44px;
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
