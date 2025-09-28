import React, { useState } from "react";
import styled from "styled-components";
import AutocompleteInput from "../components/AutocompleteInput";

const PostRide = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [formData, setFormData] = useState({
    date: "", // yyyy-mm-dd
    time: "", // HH:mm
    seats: 1,
    price: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "seats") {
      const n = Math.max(1, Number(value || 1));
      setFormData((prev) => ({ ...prev, seats: n }));
      return;
    }
    if (name === "price") {
      const p = Math.max(0, Number(value || 0));
      setFormData((prev) => ({ ...prev, price: p }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);

    if (!origin || !destination) {
      setError("Please select both origin and destination.");
      return;
    }
    if (!formData.date || !formData.time) {
      setError("Please select both date and time.");
      return;
    }
    if (!formData.seats || !formData.price) {
      setError("Please fill seats and price.");
      return;
    }

    const rideISODate = new Date(`${formData.date}T${formData.time}:00`).toISOString();

    // Updated field names to match backend Ride model
    const rideData = {
      from: origin,
      to: destination,
      seatsAvailable: Number(formData.seats),
      pricePerSeat: Number(formData.price),
      notes: formData.notes || "",
      date: rideISODate,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rideData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to post ride");
      }

      setSubmitted(true);
      setOrigin("");
      setDestination("");
      setFormData({
        date: "",
        time: "",
        seats: 1,
        price: "",
        notes: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Post a New Ride</Title>

      {submitted && <SuccessMessage>Ride posted successfully!</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <Label>Origin</Label>
        <AutocompleteInput value={origin} onChange={setOrigin} placeholder="Enter origin" />

        <Label>Destination</Label>
        <AutocompleteInput value={destination} onChange={setDestination} placeholder="Enter destination" />

        <Label>Date</Label>
        <Input type="date" name="date" value={formData.date} onChange={handleChange} required />

        <Label>Time</Label>
        <Input type="time" name="time" value={formData.time} onChange={handleChange} required />

        <Label>Available Seats</Label>
        <Select name="seats" value={formData.seats} onChange={handleChange}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>

        <Label>Price per Seat (₹)</Label>
        <Input type="number" name="price" min="0" step="1" value={formData.price} onChange={handleChange} required />

        <Label>Additional Notes (Optional)</Label>
        <TextArea name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder="Any notes for passengers" />

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Ride"}
        </SubmitButton>
      </Form>
    </Container>
  );
};

export default PostRide;

/* Styled components */
const Container = styled.div`
  max-width: 650px;
  margin: 40px auto;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 40px 35px;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  font-family: "Poppins", sans-serif;
  border: 1px solid rgba(30, 144, 255, 0.1);
  
  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 30px 25px;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    margin: 15px auto;
    padding: 25px 20px;
    border-radius: 12px;
  }
`;

const Title = styled.h1`
  margin-bottom: 35px;
  color: #1e90ff;
  font-weight: 800;
  font-size: 2.2rem;
  text-align: center;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.9rem;
    margin-bottom: 30px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
    margin-bottom: 25px;
  }
`;

const SuccessMessage = styled.p`
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  padding: 14px 22px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
  border: 1px solid rgba(21, 87, 36, 0.2);
  
  @media (max-width: 768px) {
    padding: 12px 18px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.p`
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #842029;
  padding: 14px 22px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
  border: 1px solid rgba(132, 32, 41, 0.2);
  
  @media (max-width: 768px) {
    padding: 12px 18px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  margin-top: 20px;
  font-weight: 700;
  color: #222;
  font-size: 14px;
  
  @media (max-width: 768px) {
    margin-top: 18px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    margin-top: 16px;
    font-size: 13px;
  }
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  outline: none;
  font-size: 16px;
  background-color: #fafbfc;
  transition: all 0.3s ease;
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
  
  @media (max-width: 768px) {
    padding: 12px 14px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    min-height: 42px;
  }
`;

const Select = styled.select`
  padding: 14px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  outline: none;
  font-size: 16px;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  min-height: 48px;
  cursor: pointer;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
  }
  
  &:hover {
    border-color: #b8c5d1;
  }
  
  @media (max-width: 768px) {
    padding: 12px 14px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 44px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    min-height: 42px;
  }
`;

const TextArea = styled.textarea`
  padding: 14px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  outline: none;
  resize: vertical;
  font-size: 16px;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  font-family: inherit;
  min-height: 100px;
  
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
  
  @media (max-width: 768px) {
    padding: 12px 14px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 90px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    min-height: 80px;
  }
`;

const SubmitButton = styled.button`
  margin-top: 28px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  font-weight: 800;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 16px;
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
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(30, 144, 255, 0.3);
  }
  
  &:hover:not(:disabled)::before {
    left: 100%;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #a0c4ff 0%, #8bb3ff 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    margin-top: 25px;
    padding: 14px 20px;
    font-size: 15px;
    min-height: 44px;
  }
  
  @media (max-width: 480px) {
    margin-top: 22px;
    padding: 12px 18px;
    font-size: 15px;
    min-height: 42px;
  }
`;
