import React, { useState } from "react";
import styled from "styled-components";
import AutocompleteInput from "../components/AutocompleteInput";

const SearchRides = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(""); // optional filter YYYY-MM-DD

  const [results, setResults] = useState([]);
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
          placeholder="Origin"
        />
        <AutocompleteInput
          value={destination}
          onChange={setDestination}
          placeholder="Destination"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Date (optional)"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </SearchForm>

      <Results>
        {!error && !loading && results.length === 0 && (
          <NoResults>No rides found.</NoResults>
        )}

        {results.map((ride) => {
          const rideDate = new Date(ride.date);
          const seatsLeft = ride.seatsAvailable ?? 0;
          const driverName =
            ride.postedBy?.fullName || ride.postedBy?.name || "Unknown";
          return (
            <RideCard key={ride._id}>
              <RideInfo>
                {ride.from} to {ride.to}
              </RideInfo>

              <RideDetails>
                <div>
                  Date: {rideDate.toLocaleDateString()} Time:{" "}
                  {rideDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div>Seats Available: {seatsLeft}</div>
                <div>Price: ₹{ride.pricePerSeat}</div>
                <div>Driver: {driverName}</div>
              </RideDetails>

              <BookButton
                onClick={() => bookRide(ride._id)}
                disabled={bookingLoading || seatsLeft < 1}
                aria-disabled={bookingLoading || seatsLeft < 1}
              >
                {bookingLoading ? "Booking..." : "Book Now"}
              </BookButton>
            </RideCard>
          );
        })}
      </Results>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  max-width: 750px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Poppins", sans-serif;
`;

const Title = styled.h1`
  color: #1e90ff;
  font-weight: 800;
  font-size: 2.2rem;
  margin-bottom: 25px;
  text-align: center;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  padding: 12px 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  min-width: 160px;
  &:focus {
    border-color: #1e90ff;
    box-shadow: 0 0 10px #a3c6ff88;
  }
`;

const Button = styled.button`
  padding: 0 22px;
  background-color: #1e90ff;
  color: white;
  font-weight: 700;
  font-size: 16px;
  border-radius: 12px;
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
  @media (max-width: 600px) {
    width: 100%;
    padding: 12px 0;
  }
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const NoResults = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: #777;
`;

const RideCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RideInfo = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #222;
`;

const RideDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 1rem;
  color: #555;
`;

const BookButton = styled.button`
  align-self: flex-start;
  margin-top: 8px;
  padding: 10px 18px;
  background-color: #1e90ff;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #005bbb;
  }
  &:disabled {
    background-color: #a0c4ff;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  text-align: center;
  color: #d9534f;
  font-weight: 700;
  margin-bottom: 16px;
`;

export default SearchRides;
