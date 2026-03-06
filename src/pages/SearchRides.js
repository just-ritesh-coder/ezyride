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
                    <DetailValue>
                      {driverName}
                      {ride.postedBy?.kyc?.status === 'verified' && (
                        <FaCheckCircle style={{ marginLeft: '6px', color: '#10b981', fontSize: '0.9em' }} title="Verified Driver" />
                      )}
                    </DetailValue>
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
   STYLES - Rido Premium Theme (Forest/Mint)
=========================== */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px 40px;
  
  @media (max-width: 768px) {
    margin: 20px auto;
  }
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
  font-size: 2.5rem;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
`;

const SearchCard = styled.div`
  background: ${({ theme }) => theme.colors.section.dark}; /* Dark Green Block */
  padding: 32px;
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.glass};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  margin-bottom: 40px;
  animation: ${fadeIn} 0.6s ease-out 0.2s both;
  
  @media (max-width: 768px) {
    padding: 24px;
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
  color: ${({ theme }) => theme.colors.text.inverse}; /* White text on Dark Card */
  font-size: 14px;
  
  svg {
    color: ${({ theme }) => theme.colors.accentBright};
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  outline: none;
  font-size: 16px;
  background-color: rgba(255, 255, 255, 0.05); /* Glass input */
  color: ${({ theme }) => theme.colors.text.inverse}; /* White text for input inside dark card */
  transition: all 0.3s ease;
  min-height: 52px;
  font-family: inherit;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 0 4px ${({ theme }) => theme.colors.surfaceHover};
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.inverseSecondary};
    opacity: 0.5;
  }
`;

const FilterSection = styled.div`
  margin-top: 10px;
`;

const FilterTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: 800;
  font-size: 1.1rem;
  margin-bottom: 16px;
  
  svg {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.accentBright};
  }
`;

const FilterGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;

  @media(max-width: 480px) {
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
  color: ${({ theme }) => theme.colors.text.inverse}; /* High Contrast */
  
  svg {
    color: ${({ theme }) => theme.colors.accentBright};
    font-size: 0.85rem;
  }
`;

const SmallNumber = styled.input`
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  outline: none;
  background-color: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.text.inverse};
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 600;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(197, 237, 203, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.inverseSecondary};
    opacity: 0.5;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

const SubmitButton = styled.button`
  padding: 18px 32px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: 800;
  border-radius: ${({ theme }) => theme.borders.radius.full};
  border: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 17px;
  transition: all 0.3s ease;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 6px 20px ${({ theme }) => theme.colors.glass.border};
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.neon};
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.glass.border};
    opacity: 0.7;
    color: ${({ theme }) => theme.colors.text.secondary};
    box-shadow: none;
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
  background: ${({ theme }) => theme.colors.glass.light};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  font-size: 1.1rem;
  
  svg {
    font-size: 2rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 40px;
  background: ${({ theme }) => theme.colors.glass.light};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  border: 1px dashed ${({ theme }) => theme.colors.glass.border};
  animation: ${fadeIn} 0.6s ease-out;

  @media(max-width: 480px) {
    padding: 50px 30px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.palette.tomThumb};
  margin-bottom: 20px;
  opacity: 1; /* Removed blur/dullness */
`;

const EmptyTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 800;
  font-size: 1.5rem;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  font-weight: 500;
`;

const RideCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt}; /* Light Mint Grey on White */
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${slideIn} 0.5s ease-out ${({ delay }) => delay || 0}s both;
  position: relative;
  overflow: hidden;

  /* Accent line on left instead of top for Rido feel */
  border-left: 4px solid ${({ theme }) => theme.colors.section.dark};

  &:hover {
    transform: translateY(-6px) scale(1.01);
    background: white;
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media(max-width: 480px) {
    padding: 20px;
  }
`;

const RideHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;

  @media(max-width: 480px) {
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
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  margin-top: 4px;
  flex-shrink: 0;
`;

const ArrowIcon = styled.span`
  color: ${({ theme }) => theme.colors.palette.tomThumb};
  margin: 0 8px;
  font-size: 0.9rem;
`;

const RideRoute = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 800;
  font-size: 1.3rem;
  line-height: 1.4;
  margin: 0;
  
  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Price = styled.div`
  background: rgba(16, 185, 129, 0.1);
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 800;
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.2rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
  flex-shrink: 0;
`;

const PriceIcon = styled.span`
  font-size: 0.9rem;
`;

const RideDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;

  @media(max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const DetailItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }
`;

const DetailIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.3rem;
  flex-shrink: 0;
`;

const DetailContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const DetailLabel = styled.div`
  color: ${({ theme }) => theme.colors.palette.tomThumb}; /* Enforced Dark Green */
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

const BookButton = styled.button`
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.primary}; /* Mint Green */
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.full}; /* Pill shape from Rido */
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 1rem;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(197, 237, 203, 0.3);
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.glass.border};
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  color: ${({ theme }) => theme.colors.error};
  padding: 16px;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

export default SearchRides;
