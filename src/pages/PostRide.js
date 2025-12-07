import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import AutocompleteInput from "../components/AutocompleteInput";
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaRupeeSign, 
  FaStickyNote,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner
} from "react-icons/fa";

const PostRide = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originCoord, setOriginCoord] = useState(null);
  const [destCoord, setDestCoord] = useState(null);
  const [perKm, setPerKm] = useState(12);
  const [suggested, setSuggested] = useState(null);
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

  // Haversine distance (km)
  const haversineKm = (a, b) => {
    if (!a || !b) return 0;
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad((b.lat || 0) - (a.lat || 0));
    const dLon = toRad((b.lon || 0) - (a.lon || 0));
    const la1 = toRad(a.lat || 0);
    const la2 = toRad(b.lat || 0);
    const h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  React.useEffect(() => {
    const km = haversineKm(originCoord, destCoord);
    if (km > 0 && perKm > 0) {
      const price = Math.max(0, Math.round(km * perKm));
      setSuggested(price);
    } else {
      setSuggested(null);
    }
  }, [originCoord, destCoord, perKm]);

  return (
    <Container>
      <Header>
        <Title>Post a New Ride</Title>
        <Subtitle>Share your journey and help others travel</Subtitle>
      </Header>

      {submitted && (
        <SuccessMessage>
          <FaCheckCircle /> Ride posted successfully!
        </SuccessMessage>
      )}
      {error && (
        <ErrorMessage>
          <FaExclamationTriangle /> {error}
        </ErrorMessage>
      )}

      <Form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>
            <FaMapMarkerAlt /> Route Details
          </SectionTitle>
          <InputGroup>
            <Label><FaMapMarkerAlt /> Origin</Label>
            <AutocompleteInput
              value={origin}
              onChange={setOrigin}
              onPick={(it) => setOriginCoord(it?.lat && it?.lon ? { lat: it.lat, lon: it.lon } : null)}
              placeholder="Enter origin location"
            />
          </InputGroup>

          <InputGroup>
            <Label><FaMapMarkerAlt /> Destination</Label>
            <AutocompleteInput
              value={destination}
              onChange={setDestination}
              onPick={(it) => setDestCoord(it?.lat && it?.lon ? { lat: it.lat, lon: it.lon } : null)}
              placeholder="Enter destination location"
            />
          </InputGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaCalendarAlt /> Date & Time
          </SectionTitle>
          <InputRow>
            <InputGroup>
              <Label><FaCalendarAlt /> Date</Label>
              <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </InputGroup>

            <InputGroup>
              <Label><FaClock /> Time</Label>
              <Input type="time" name="time" value={formData.time} onChange={handleChange} required />
            </InputGroup>
          </InputRow>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaUsers /> Seats & Pricing
          </SectionTitle>
          <InputGroup>
            <Label><FaUsers /> Available Seats</Label>
            <Select name="seats" value={formData.seats} onChange={handleChange}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'seat' : 'seats'}
                </option>
              ))}
            </Select>
          </InputGroup>

          <InputGroup>
            <Label><FaRupeeSign /> Price per Km (₹)</Label>
            <Input type="number" min="0" step="1" value={perKm} onChange={(e) => setPerKm(Number(e.target.value) || 0)} />
          </InputGroup>

          {suggested != null && (
            <PriceHint>
              💡 Suggested total fare: ₹{suggested} (distance-based). For per-seat price, divide by seats.
            </PriceHint>
          )}

          <InputGroup>
            <Label><FaRupeeSign /> Price per Seat (₹)</Label>
            <Input type="number" name="price" min="0" step="1" value={formData.price} onChange={handleChange} required />
          </InputGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>
            <FaStickyNote /> Additional Information
          </SectionTitle>
          <InputGroup>
            <Label><FaStickyNote /> Notes (Optional)</Label>
            <TextArea name="notes" rows={4} value={formData.notes} onChange={handleChange} placeholder="Any notes for passengers (e.g., luggage space, music preference, etc.)" />
          </InputGroup>
        </FormSection>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner /> Posting Ride...
            </>
          ) : (
            <>
              <FaPaperPlane /> Post Ride
            </>
          )}
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

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Title = styled.h1`
  margin-bottom: 12px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
  font-size: 2.4rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 8px;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.05rem;
  font-weight: 500;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const SuccessMessage = styled.p`
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 700;
  border: 1px solid rgba(21, 87, 36, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: ${fadeIn} 0.5s ease-out;
  
  svg {
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 14px 20px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 12px 18px;
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.p`
  background: linear-gradient(135deg, #ffe5e5 0%, #ffd6d6 100%);
  color: #d9534f;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 700;
  border: 1px solid rgba(217, 83, 79, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: ${fadeIn} 0.5s ease-out;
  
  svg {
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 14px 20px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 12px 18px;
    font-size: 0.9rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
  
  @media (max-width: 480px) {
    gap: 28px;
  }
`;

const FormSection = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(30, 144, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  
  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 12px;
  }
`;

const SectionTitle = styled.h3`
  color: #1e90ff;
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 16px;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 700;
  color: #222;
  font-size: 14px;
  
  svg {
    color: #1e90ff;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    margin-bottom: 8px;
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

const PriceHint = styled.div`
  margin-top: 8px;
  color: #0b6b2b;
  background: #e6f4ea;
  border: 1px solid #bfe3cf;
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 600;
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

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

const SubmitButton = styled.button`
  margin-top: 8px;
  padding: 18px 32px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  font-weight: 800;
  border-radius: 12px;
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 17px;
  transition: all 0.3s ease;
  min-height: 56px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 6px 20px rgba(30, 144, 255, 0.3);
  
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
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(30, 144, 255, 0.4);
  }
  
  &:hover:not(:disabled)::before {
    left: 100%;
  }
  
  &:disabled {
    opacity: 0.7;
  }
  
  svg {
    font-size: 1rem;
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

