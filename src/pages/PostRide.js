import React, { useState } from "react";
import styled from "styled-components";
import AutocompleteInput from "../components/AutocompleteInput";

const PostRide = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    seats: 1,
    price: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!origin || !destination) {
      setError("Please select both origin and destination addresses.");
      return;
    }

    const rideData = {
      origin,
      destination,
      ...formData,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await fetch("http://localhost:5000/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rideData),
      });

      if (!response.ok) {
        const errorData = await response.json();
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Post a New Ride</Title>

      {submitted && (
        <SuccessMessage>
          Ride posted successfully! You can post another or go to dashboard.
        </SuccessMessage>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <Label>Origin</Label>
        <AutocompleteInput
          value={origin}
          onChange={setOrigin}
          placeholder="Enter starting point"
        />

        <Label>Destination</Label>
        <AutocompleteInput
          value={destination}
          onChange={setDestination}
          placeholder="Enter destination"
        />

        <Label>Date</Label>
        <Input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <Label>Time</Label>
        <Input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        />

        <Label>Available Seats</Label>
        <Select
          name="seats"
          value={formData.seats}
          onChange={handleChange}
          required
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </Select>

        <Label>Price per Seat (₹)</Label>
        <Input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="e.g., 150"
          min="0"
          required
        />

        <Label>Additional Notes (Optional)</Label>
        <TextArea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any special instructions or details"
          rows="4"
        />

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Ride"}
        </SubmitButton>
      </Form>
    </Container>
  );
};

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
  font-size: 2.8rem;
  text-align: center;
`;

const SuccessMessage = styled.p`
  background-color: #d4edda;
  color: #155724;
  padding: 14px 22px;
  border-radius: 8px;
  margin-bottom: 28px;
  font-weight: 600;
  text-align: center;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.p`
  background-color: #f8d7da;
  color: #842029;
  padding: 14px 22px;
  border-radius: 8px;
  margin-bottom: 28px;
  font-weight: 600;
  text-align: center;
  font-size: 1.1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 10px;
  margin-top: 20px;
  font-weight: 700;
  color: #222;
  font-size: 1.1rem;
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 17px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #1e90ff;
    box-shadow: 0 0 10px #a3c6ff88;
  }
`;

const Select = styled.select`
  padding: 14px 16px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 17px;
  outline: none;

  &:focus {
    border-color: #1e90ff;
    box-shadow: 0 0 10px #a3c6ff88;
  }
`;

const TextArea = styled.textarea`
  padding: 14px 16px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 17px;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #1e90ff;
    box-shadow: 0 0 10px #a3c6ff88;
  }
`;

const SubmitButton = styled.button`
  margin-top: 40px;
  padding: 16px;
  background-color: #1e90ff;
  color: white;
  font-weight: 800;
  font-size: 20px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: background-color 0.35s ease;

  &:hover {
    background-color: #005bbb;
  }

  &:disabled {
    background-color: #a0c4ff;
    cursor: not-allowed;
  }
`;

export default PostRide;
