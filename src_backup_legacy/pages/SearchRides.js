import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import AutocompleteInput from "../components/AutocompleteInput";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaUser,
  FaRupeeSign,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowRight,
  FaFilter
} from "react-icons/fa";
import { API_BASE_URL } from "../utils/config";

const SearchRides = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minSeats, setMinSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResults([]);

    if (!origin || !destination) {
      setError("Please enter both origin and destination.");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({ from: origin, to: destination });
      if (date) params.set("date", date);

      const res = await fetch(`${API_BASE_URL}/api/rides/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch rides");

      const data = await res.json();
      setResults(data.rides || []);
    } catch (err) {
      setError(err.message || "Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  };

  const bookRide = async (rideId) => {
    setError("");
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to book a ride.");
      return;
    }

    try {
      setBookingLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rideId, seats: 1 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert("Ride booked successfully!");
      await handleSearch(new Event("submit"));
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Search Available Rides</Title>
        <Subtitle>Find the perfect ride for your journey</Subtitle>
      </Header>

      {error && (
        <ErrorMessage>
          <FaExclamationTriangle /> {error}
        </ErrorMessage>
      )}

      <SearchCard>
        <Form onSubmit={handleSearch}>
          <InputGroup>
            <InputLabel><FaMapMarkerAlt /> Origin</InputLabel>
            <AutocompleteInput
              value={origin}
              onChange={setOrigin}
              placeholder="Enter origin location"
            />
          </InputGroup>

          <InputGroup>
            <InputLabel><FaMapMarkerAlt /> Destination</InputLabel>
            <AutocompleteInput
              value={destination}
              onChange={setDestination}
              placeholder="Enter destination location"
            />
          </InputGroup>

          <InputGroup>
            <InputLabel><FaCalendarAlt /> Date (Optional)</InputLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </InputGroup>

          <FilterSection>
            <FilterTitle>
              <FaFilter /> Filters
            </FilterTitle>
            <FilterGroup>
              <FilterItem>
                <FilterLabel><FaRupeeSign /> Min Price</FilterLabel>
                <SmallNumber
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </FilterItem>
              <FilterItem>
                <FilterLabel><FaRupeeSign /> Max Price</FilterLabel>
                <SmallNumber
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                  placeholder="10000"
                />
              </FilterItem>
              <FilterItem>
                <FilterLabel><FaUsers /> Min Seats</FilterLabel>
                <SmallNumber
                  type="number"
                  min="1"
                  value={minSeats}
                  onChange={(e) => setMinSeats(Number(e.target.value) || 1)}
                  placeholder="1"
                />
              </FilterItem>
            </FilterGroup>
          </FilterSection>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner /> Searching...
              </>
            ) : (
              <>
                <FaSearch /> Search Rides
              </>
            )}
          </SubmitButton>
        </Form>
      </SearchCard>

      <Results>
        {loading && (
          <LoadingState>
            <Spinner /> Searching for rides...
          </LoadingState>
        )}

        {!loading && results.length === 0 && !error && (
          <EmptyState>
            <EmptyIcon><FaSearch /></EmptyIcon>
            <EmptyTitle>No rides found</EmptyTitle>
            <EmptyText>Try adjusting your search criteria or filters</EmptyText>
          </EmptyState>
        )}

        {results.map((ride, index) => {
          const rideDate = new Date(ride.date);
          const seatsLeft = ride.seatsAvailable ?? 0;
          const driverName =
            ride.postedBy?.fullName || ride.postedBy?.name || "Unknown";

          return (
            <RideCard key={ride._id} delay={index * 0.1}>
              <RideHeader>
                <RouteInfo>
                  <RouteIcon><FaMapMarkerAlt /></RouteIcon>
                  <RideRoute>
                    <strong>{ride.from}</strong> <ArrowIcon><FaArrowRight /></ArrowIcon> <strong>{ride.to}</strong>
                  </RideRoute>
                </RouteInfo>
                <Price>
                  <PriceIcon><FaRupeeSign /></PriceIcon>
                  {ride.pricePerSeat}
                </Price>
              </RideHeader>

              <RideDetails>
                <DetailItem>
                  <DetailIcon><FaCalendarAlt /></DetailIcon>
                  <DetailContent>
                    <DetailLabel>Date & Time</DetailLabel>
                    <DetailValue>
                      {rideDate.toLocaleDateString()} at {rideDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </DetailValue>
                  </DetailContent>
                </DetailItem>
                <DetailItem>
                  <DetailIcon><FaUsers /></DetailIcon>
                  <DetailContent>
                    <DetailLabel>Available Seats</DetailLabel>
                    <DetailValue>{seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'}</DetailValue>
                  </DetailContent>
                </DetailItem>
                <DetailItem>
                  <DetailIcon><FaUser /></DetailIcon>
                  <DetailContent>
                    <DetailLabel>Driver</DetailLabel>
                    <DetailValue>{driverName}</DetailValue>
                  </DetailContent>
                </DetailItem>
              </RideDetails>

              <CardFooter>
                <BookButton
                  onClick={() => bookRide(ride._id)}
                  disabled={bookingLoading || seatsLeft < 1}
                >
                  {bookingLoading ? (
                    <>
                      <Spinner /> Booking...
                    </>
                  ) : seatsLeft < 1 ? (
                    <>
                      <FaExclamationTriangle /> No Seats
                    </>
                  ) : (
                    <>
                      <FaCheckCircle /> Book Now
                    </>
                  )}
                </BookButton>
              </CardFooter>
            </RideCard>
          );
        })}
      </Results>
    </Container>
  );
};

/* ===========================
   STYLES - Premium Design
=========================== */

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

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px 40px;
  font-family: "Poppins", sans-serif;
  
  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 0 15px 30px;
  }
  
  @media (max-width: 480px) {
    margin: 15px auto;
    padding: 0 12px 25px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 480px) {
    margin-bottom: 30px;
  }
`;

const Title = styled.h1`
  margin-bottom: 12px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
  font-size: 2.5rem;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.9rem;
    margin-bottom: 10px;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const SearchCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 32px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(30, 144, 255, 0.1);
  margin-bottom: 40px;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
  
  @media (max-width: 768px) {
    padding: 28px 24px;
    border-radius: 16px;
    margin-bottom: 30px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 20px;
    border-radius: 14px;
    margin-bottom: 25px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #222;
  font-size: 14px;
  
  svg {
    color: #1e90ff;
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  outline: none;
  font-size: 16px;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  min-height: 52px;
  font-family: "Poppins", sans-serif;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(30, 144, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover:not(:focus) {
    border-color: #b8c5d1;
    background-color: #fff;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const FilterSection = styled.div`
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  padding: 20px;
  border-radius: 14px;
  border: 1px solid rgba(30, 144, 255, 0.15);
`;

const FilterTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1e90ff;
  font-weight: 800;
  font-size: 1.1rem;
  margin-bottom: 16px;
  
  svg {
    font-size: 1rem;
  }
`;

const FilterGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  
  svg {
    color: #1e90ff;
    font-size: 0.85rem;
  }
`;

const SmallNumber = styled.input`
  padding: 12px 14px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  outline: none;
  background-color: #fff;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 600;
  
  &:focus {
    border-color: #1e90ff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

const SubmitButton = styled.button`
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
    background: linear-gradient(135deg, #a0c4ff 0%, #8bb3ff 100%);
    opacity: 0.7;
  }
  
  svg {
    font-size: 1rem;
  }
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  border: 1px solid rgba(30, 144, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #1e90ff;
  font-weight: 700;
  font-size: 1.1rem;
  
  svg {
    font-size: 2rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 40px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  border: 2px dashed rgba(30, 144, 255, 0.2);
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 480px) {
    padding: 50px 30px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #1e90ff;
  margin-bottom: 20px;
  opacity: 0.6;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  @media (max-width: 480px) {
    font-size: 3rem;
    margin-bottom: 16px;
  }
`;

const EmptyTitle = styled.h3`
  color: #1e90ff;
  font-weight: 800;
  font-size: 1.5rem;
  margin-bottom: 12px;
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const EmptyText = styled.p`
  color: #666;
  font-size: 1rem;
  font-weight: 500;
`;

const RideCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(30, 144, 255, 0.1);
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${slideIn} 0.5s ease-out ${({ delay }) => delay || 0}s both;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1e90ff, #0066cc, #1e90ff);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }

  &:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 16px 48px rgba(30, 144, 255, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: rgba(30, 144, 255, 0.3);
  }
  
  &:hover::before {
    transform: scaleX(1);
  }
  
  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 14px;
  }
`;

const RideHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const RouteInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const RouteIcon = styled.div`
  color: #1e90ff;
  font-size: 1.5rem;
  margin-top: 4px;
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const ArrowIcon = styled.span`
  color: #1e90ff;
  margin: 0 8px;
  font-size: 0.9rem;
`;

const RideRoute = styled.h3`
  color: #222;
  font-weight: 800;
  font-size: 1.3rem;
  line-height: 1.4;
  margin: 0;
  
  strong {
    color: #1e90ff;
  }
  
  @media (max-width: 480px) {
    font-size: 1.15rem;
  }
`;

const Price = styled.div`
  background: linear-gradient(135deg, #e6f4ea 0%, #d4edda 100%);
  color: #0b6b2b;
  font-weight: 800;
  padding: 10px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.2rem;
  border: 1px solid rgba(11, 107, 43, 0.2);
  box-shadow: 0 2px 8px rgba(11, 107, 43, 0.1);
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    padding: 8px 14px;
  }
`;

const PriceIcon = styled.span`
  font-size: 0.9rem;
`;

const RideDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const DetailItem = styled.div`
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(30, 144, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #e8f4ff 0%, #e0f0ff 100%);
    transform: translateY(-2px);
  }
`;

const DetailIcon = styled.div`
  color: #1e90ff;
  font-size: 1.3rem;
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const DetailContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const DetailLabel = styled.div`
  color: #666;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  font-weight: 800;
  color: #222;
  font-size: 0.95rem;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(30, 144, 255, 0.1);
`;

const BookButton = styled(SubmitButton)`
  padding: 14px 24px;
  font-size: 15px;
  min-height: 48px;
  margin-top: 0;
  
  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 20px;
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
`;

export default SearchRides;
