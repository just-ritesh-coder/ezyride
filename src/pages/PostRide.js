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
import { API_BASE_URL } from "../utils/config";

const PostRide = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originCoord, setOriginCoord] = useState(null);
  const [destCoord, setDestCoord] = useState(null);
  const [perKm, setPerKm] = useState(12);
  const [suggested, setSuggested] = useState(null);
  const [vehicleType, setVehicleType] = useState('None');
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

      const response = await fetch(`${API_BASE_URL}/api/rides`, {
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

  React.useEffect(() => {
    // Fetch user profile to get vehicleType
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache" // Ensure we don't get a stale profile
          }
        });
        const data = await response.json();
        if (response.ok && data.user) {
          const type = data.user.vehicleType || 'None';
          setVehicleType(type);

          // Ensure formData.seats respects the new limits initially
          if (type === 'Two-Wheeler' && formData.seats > 1) {
            setFormData(prev => ({ ...prev, seats: 1 }));
          } else if (type === 'Four-Wheeler' && formData.seats > 3) {
            setFormData(prev => ({ ...prev, seats: 3 }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUserProfile();
  }, []);

  const getSeatOptions = () => {
    if (vehicleType === 'Two-Wheeler') return [1];
    if (vehicleType === 'Four-Wheeler') return [1, 2, 3];
    return []; // For "None", we'll hide the form
  };

  const isPassengerOnly = !vehicleType || vehicleType === 'None';

  if (isPassengerOnly) {
    return (
      <Container>
        <Header>
          <Title>Post a New Ride</Title>
        </Header>
        <ErrorMessage style={{ flexDirection: 'column', padding: '30px' }}>
          <FaExclamationTriangle style={{ fontSize: '3rem', marginBottom: '15px' }} />
          <h3>Vehicle Required</h3>
          <p style={{ marginTop: '10px' }}>You are currently registered as a passenger.</p>
          <p>Please update your <b>Vehicle Type</b> in your Profile settings before posting a ride.</p>
        </ErrorMessage>
      </Container>
    );
  }

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
              {getSeatOptions().map((n) => (
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
  background: ${({ theme }) => theme.colors.backgroundAlt}; /* Solid background */
  padding: 40px 35px;
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  position: relative;
  z-index: 10;
  
  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 30px 25px;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 800;
  font-size: 2.4rem;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.palette.tomThumb};
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0;
`;

const SuccessMessage = styled.p`
  background: rgba(16, 185, 129, 0.2);
  color: ${({ theme }) => theme.colors.secondary};
  padding: 16px 24px;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  margin-bottom: 24px;
  text-align: center;
  font-weight: 700;
  border: 1px solid rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: ${fadeIn} 0.5s ease-out;
  
  svg {
    font-size: 1.2rem;
  }
`;

const ErrorMessage = styled.p`
  background: rgba(239, 68, 68, 0.2);
  color: ${({ theme }) => theme.colors.error};
  padding: 16px 24px;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  margin-bottom: 24px;
  text-align: center;
  font-weight: 700;
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  animation: ${fadeIn} 0.5s ease-out;
  
  svg {
    font-size: 1.2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
`;

const FormSection = styled.div`
  background: ${({ theme }) => theme.colors.section.dark}; /* Dark Section Card */
  padding: 32px;
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: 800;
  font-size: 1.2rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    font-size: 1.1rem;
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
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.inverse}; /* White Text */
  font-size: 0.9rem;
  
  svg {
    color: ${({ theme }) => theme.colors.accentBright};
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  outline: none;
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.text.inverse}; /* White input text */
  transition: all 0.3s ease;
  min-height: 48px;
  font-family: inherit;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 2px rgba(197, 237, 203, 0.1);
  }
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.inverseSecondary};
    opacity: 0.8;
  }
`;

const PriceHint = styled.div`
  margin-top: 8px;
  color: #10B981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: 10px 12px;
  font-weight: 600;
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  outline: none;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.glass.heavy}; /* Dark green background for dropdown */
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.3s ease;
  min-height: 48px;
  cursor: pointer;
  font-family: inherit;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  outline: none;
  resize: vertical;
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.3s ease;
  font-family: inherit;
  min-height: 100px;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.inverseSecondary};
    opacity: 0.8;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

const SubmitButton = styled.button`
  margin-top: 8px;
  padding: 16px 32px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.dark};
  font-weight: 800;
  border-radius: ${({ theme }) => theme.borders.radius.full};
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 1.1rem;
  transition: all 0.3s ease;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(197, 237, 203, 0.25);
  width: 100%;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(197, 237, 203, 0.4);
    background: #A7F3D0; /* Lighter mint on hover */
  }
  
  &:disabled {
    opacity: 0.7;
    background: ${({ theme }) => theme.colors.glass.border};
    color: ${({ theme }) => theme.colors.text.secondary};
    box-shadow: none;
  }
`;

