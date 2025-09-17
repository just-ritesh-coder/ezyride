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
  background: white;
  padding: 40px 35px;
  border-radius: 14px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  font-family: "Poppins", sans-serif;
`;

const Title = styled.h1`
  margin-bottom: 35px;
  color: #1e90ff;
  font-weight: 800;
  font-size: 2.2rem;
  text-align: center;
`;

const SuccessMessage = styled.p`
  background-color: #d4edda;
  color: #155724;
  padding: 14px 22px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  background-color: #f8d7da;
  color: #842029;
  padding: 14px 22px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
`;

const Form = styled.form`display: flex; flex-direction: column;`;
const Label = styled.label`margin-top: 20px; font-weight: 700; color: #222;`;
const Input = styled.input`
  padding: 14px 16px; border: 1px solid #ccc; border-radius: 10px; outline: none;
  &:focus { border-color: #1e90ff; box-shadow: 0 0 10px #a3c6ff88; }
`;
const Select = styled.select`
  padding: 14px 16px; border: 1px solid #ccc; border-radius: 10px; outline: none;
  &:focus { border-color: #1e90ff; box-shadow: 0 0 10px #a3c6ff88; }
`;
const TextArea = styled.textarea`
  padding: 14px 16px; border: 1px solid #ccc; border-radius: 10px; outline: none; resize: vertical;
  &:focus { border-color: #1e90ff; box-shadow: 0 0 10px #a3c6ff88; }
`;
const SubmitButton = styled.button`
  margin-top: 28px; padding: 14px 16px; background-color: #1e90ff; color: white;
  font-weight: 800; border-radius: 12px; border: none; cursor: pointer;
  &:hover { background-color: #005bbb; }
  &:disabled { background-color: #a0c4ff; cursor: not-allowed; }
`;
