import React, { useState } from "react";
import styled from "styled-components";
import AutocompleteInput from "../components/AutocompleteInput";

const SearchRides = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(""); // optional filter YYYY-MM-DD

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
      const params = new URLSearchParams({
        from: origin,        // FIXED: match backend
        to: destination,     // FIXED: match backend
      });
      if (date) params.set("date", date);

      const res = await fetch(`/api/rides/search?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to fetch rides");
      }

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
      const res = await fetch("/api/bookings", {
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
      // Refresh search results to update available seats
      await handleSearch(new Event("submit"));
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Container>
      <Title>Search Rides</Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <SearchForm onSubmit={handleSearch}>
        <AutocompleteInput
          value={origin}
          onChange={setOrigin}
          placeholder="From (e.g., Mumbai, Delhi)"
        />
        <AutocompleteInput
          value={destination}
          onChange={setDestination}
          placeholder="To (e.g., Bangalore, Pune)"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Date (optional)"
        />
        <FilterGroup>
          <SmallLabel>Min Price</SmallLabel>
          <SmallNumber
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
          />
          <SmallLabel>Max Price</SmallLabel>
          <SmallNumber
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
          />
          <SmallLabel>Min Seats</SmallLabel>
          <SmallNumber
            type="number"
            min="1"
            value={minSeats}
            onChange={(e) => setMinSeats(Number(e.target.value) || 1)}
          />
        </FilterGroup>
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search Rides"}
        </Button>
      </SearchForm>

      <Results>
        {!error && !loading && results.length === 0 && (
          <NoResults>No rides found.</NoResults>
        )}

        {results
          .filter((ride) => {
            const price = Number(ride.pricePerSeat) || 0;
            const seats = Number(ride.seatsAvailable) || 0;
            if (price < minPrice) return false;
            if (maxPrice > 0 && price > maxPrice) return false;
            if (seats < minSeats) return false;
            return true;
          })
          .map((ride) => {
          const rideDate = new Date(ride.date);
          const seatsLeft = ride.seatsAvailable ?? 0;
          const driverName =
            ride.postedBy?.fullName || ride.postedBy?.name || "Unknown";
          return (
            <RideCard key={ride._id}>
              <RideInfo>
                <strong>{ride.from}</strong> → <strong>{ride.to}</strong>
              </RideInfo>

              <RideDetails>
                <DetailItem>
                  <DetailLabel>Date</DetailLabel>
                  <DetailValue>
                    {rideDate.toLocaleDateString()} {rideDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Seats</DetailLabel>
                  <DetailValue>{seatsLeft}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Price</DetailLabel>
                  <DetailValue>₹{ride.pricePerSeat}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Driver</DetailLabel>
                  <DetailValue>{driverName}</DetailValue>
                </DetailItem>
              </RideDetails>

              <CardFooter>
              <BookButton
                onClick={() => bookRide(ride._id)}
                disabled={bookingLoading || seatsLeft < 1}
                aria-disabled={bookingLoading || seatsLeft < 1}
              >
                {bookingLoading ? "Booking..." : "Book Now"}
              </BookButton>
              </CardFooter>
            </RideCard>
          );
        })}
      </Results>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Poppins", sans-serif;
  
  @media (max-width: 768px) {
    margin: 30px auto;
    padding: 0 15px;
  }
  
  @media (max-width: 480px) {
    margin: 20px auto;
    padding: 0 12px;
  }
`;

const Title = styled.h1`
  color: #1e90ff;
  font-weight: 800;
  font-size: 2.2rem;
  margin-bottom: 25px;
  text-align: center;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.9rem;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
    margin-bottom: 18px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(30, 144, 255, 0.1);
  
  @media (max-width: 768px) {
    gap: 12px;
    padding: 16px;
    margin-bottom: 24px;
  }
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 14px;
    margin-bottom: 20px;
  }
`;

const FilterGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
  gap: 10px;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SmallLabel = styled.label`
  font-size: 12px;
  color: #444;
`;

const SmallNumber = styled.input`
  padding: 10px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  width: 100%;
  
  &:focus { border-color: #1e90ff; background-color: #fff; box-shadow: 0 0 0 3px rgba(30,144,255,.1); }
`;

const Input = styled.input`
  padding: 12px 14px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  min-width: 160px;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  @media (max-width: 768px) {
    min-width: 140px;
    padding: 10px 12px;
  }
  
  @media (max-width: 600px) {
    min-width: auto;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
`;

const Button = styled.button`
  padding: 12px 22px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  font-weight: 700;
  font-size: 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 44px;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
  }
  
  &:disabled {
    background: #a0c4ff;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px 18px;
    font-size: 15px;
  }
  
  @media (max-width: 600px) {
    width: 100%;
    padding: 12px 0;
    font-size: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 0;
    min-height: 48px;
  }
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 14px;
  }
`;

const NoResults = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: #777;
  padding: 30px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    font-size: 1.05rem;
    padding: 25px 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 20px 14px;
  }
`;

const RideCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgba(30, 144, 255, 0.1);
  transition: all 0.3s ease;
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
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.12);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  @media (max-width: 768px) {
    padding: 18px 20px;
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 16px 18px;
    gap: 8px;
  }
`;

const RideInfo = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #222;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`;

const RideDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  font-size: 1rem;
  color: #555;
  font-weight: 500;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    font-size: 0.95rem;
  }
`;

const DetailItem = styled.div`
  background: #f7f9fc;
  border: 1px solid rgba(0,0,0,.05);
  border-radius: 10px;
  padding: 10px 12px;
`;

const DetailLabel = styled.div`
  color: #6b7a90;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  color: #2a2a2a;
  font-weight: 800;
`;

const BookButton = styled.button`
  align-self: flex-start;
  margin-top: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 44px;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
  }
  
  &:disabled {
    background: #a0c4ff;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px 18px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    align-self: stretch;
    padding: 12px 16px;
    font-size: 0.95rem;
    min-height: 48px;
  }
`;

const ErrorMessage = styled.p`
  text-align: center;
  color: #d9534f;
  font-weight: 700;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #ffe5e5 0%, #ffd6d6 100%);
  border-radius: 12px;
  border: 1px solid rgba(217, 83, 79, 0.2);
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding: 10px 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 10px 12px;
  }
`;

export default SearchRides;
