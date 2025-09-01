import React, { useState } from "react";
import styled from "styled-components";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Wrapper>
      <Card>
        <Title>Forgot Password</Title>
        {sent ? (
          <Success>
            If an account exists for <b>{email}</b>, a reset link has been sent.
          </Success>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            {error && <Error>{error}</Error>}
            <Button type="submit">Send Reset Link</Button>
          </Form>
        )}
      </Card>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f8fa;
`;

const Card = styled.div`
  background: #fff;
  padding: 40px 32px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(30, 144, 255, 0.10);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  margin-bottom: 24px;
  color: #1e90ff;
  font-weight: 700;
  text-align: center;
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

const Input = styled.input`
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-bottom: 18px;
  font-size: 16px;
  &:focus {
    border-color: #1e90ff;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 12px;
  background: #1e90ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #0067d1;
  }
`;

const Success = styled.div`
  color: #1e90ff;
  background: #e6f4ff;
  padding: 18px;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
`;

const Error = styled.div`
  color: #d32f2f;
  margin-bottom: 12px;
  font-size: 14px;
  text-align: center;
`;

export default ForgotPassword;
