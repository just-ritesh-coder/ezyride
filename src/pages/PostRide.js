import React, { useState } from "react";
import styled from "styled-components";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const PostRide = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    seats: 1,
    price: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origin || !destination) {
      alert("Please select both origin and destination addresses.");
      return;
    }

    // Combine all form data
    const rideData = {
      origin: origin.label,
      destination: destination.label,
      ...formData,
    };
    console.log("Ride posted:", rideData);
    setSubmitted(true);

    setOrigin(null);
    setDestination(null);
    setFormData({
      date: "",
      time: "",
      seats: 1,
      price: "",
      notes: "",
    });
  };

  return (
    <Container>
      <Title>Post a New Ride</Title>
      {submitted && <SuccessMessage>Ride posted successfully!</SuccessMessage>}
      <Form onSubmit={handleSubmit}>
        <Label>Origin</Label>
        <PlacesAutocompleteWrapper>
          <GooglePlacesAutocomplete
            apiKey="YOUR_GOOGLE_API_KEY"
            selectProps={{
              origin,
              onChange: setOrigin,
              placeholder: "Enter starting point",
            }}
          />
        </PlacesAutocompleteWrapper>

        <Label>Destination</Label>
        <PlacesAutocompleteWrapper>
          <GooglePlacesAutocomplete
            apiKey="YOUR_GOOGLE_API_KEY"
            selectProps={{
              destination,
              onChange: setDestination,
              placeholder: "Enter destination",
            }}
          />
        </PlacesAutocompleteWrapper>

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

        <SubmitButton type="submit">Post Ride</SubmitButton>
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
  font-family: 'Poppins', sans-serif;
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

const PlacesAutocompleteWrapper = styled.div`
  .react-google-places-autocomplete__input {
    font-size: 16px;
    padding: 12px 15px;
    border-radius: 8px;
    border: 1px solid #ccc;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .react-google-places-autocomplete__suggestions-container {
    border-radius: 0 0 8px 8px;
    box-shadow: 0 9px 20px rgba(32, 35, 42, 0.2);
    margin-top: -8px;
    z-index: 1000;
  }

  .react-google-places-autocomplete__suggestion {
    padding: 14px 15px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f0f4ff;
    }
  }
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
`;

export default PostRide;
