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
  height: 100vh;
  font-family: 'Poppins', sans-serif;
`;

const LeftPane = styled.div`
  flex: 1;
  background-color: #1e90ff;
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
`;

const Title = styled.h1`
  font-weight: 700;
  font-size: 3rem;
  margin: 0;
`;

const Tagline = styled.p`
  font-size: 1.2rem;
  max-width: 400px;
  margin: 0;
`;

const Image = styled.img`
  margin-top: 20px;
  border-radius: 10px;
  max-width: 100%;
  max-height: 320px;
  width: auto;
  height: auto;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  display: block;
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
`;

const FormTitle = styled.h2`
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #1e90ff;
  }
`;

const ForgotPasswordLink = styled.div`
  margin-bottom: 16px;
  text-align: right;
  a {
    color: #1e90ff;
    text-decoration: none;
    font-size: 14px;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SubmitButton = styled.button`
  padding: 14px;
  background-color: #1e90ff;
  color: white;
  font-weight: 700;
  font-size: 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0067d1;
  }
`;

const ToggleText = styled.p`
  margin-top: 20px;
  font-size: 14px;
  color: #555;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #1e90ff;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  padding: 0;
`;

export default AuthPage;
