import React, { useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token");
  const email = query.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
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
    }
  };

  return (
    <Wrapper>
      <Card>
        <Title>Reset Password</Title>
        {done ? (
          <Success>{msg}</Success>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Label>New Password</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              required
            />
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <Button type="submit">Reset Password</Button>
            {msg && <Success>{msg}</Success>}
          </Form>
        )}
      </Card>
    </Wrapper>
  );
}

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
  box-shadow: 0 4px 24px rgba(30, 144, 255, 0.1);
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
  margin-bottom: 12px;
`;

const ErrorMsg = styled.div`
  color: #d32f2f;
  margin-bottom: 12px;
  font-size: 14px;
  text-align: center;
`;
