import React, { useState } from "react";
import styled from "styled-components";
import AutocompleteInput from "../components/AutocompleteInput";

const SearchRides = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    if (!origin || !destination) {
      setError("Please enter both origin and destination.");
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams({ origin, destination });
      const response = await fetch(`/api/rides/search?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch rides");
      const data = await response.json();
      setResults(data.rides || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bookRide = async (rideId) => {
    setBookingLoading(true);
    setError(null);
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in to book a ride.");
      setBookingLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rideId, seats: 1 }), // booking 1 seat as example
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Booking failed");
      }
      alert("Ride booked successfully!");
      // Optionally refresh rides to update seats
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Container>
      <Title>Search Rides</Title>
      <SearchForm onSubmit={handleSearch}>
        <AutocompleteInput value={origin} onChange={setOrigin} placeholder="Enter origin" />
        <AutocompleteInput value={destination} onChange={setDestination} placeholder="Enter destination" />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </SearchForm>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!error && !loading && results.length === 0 && <NoResults>No rides found.</NoResults>}

      <Results>
        {results.map((ride) => (
          <RideCard key={ride._id}>
            <RideInfo>
              <strong>{ride.from}</strong> to <strong>{ride.to}</strong>
            </RideInfo>
            <RideDetails>
              <div>
                <b>Date:</b> {new Date(ride.date).toLocaleDateString()} &nbsp; <b>Time:</b>{" "}
                {new Date(ride.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div>
                <b>Seats Available:</b> {ride.seatsAvailable} &nbsp; <b>Price:</b> ₹{ride.pricePerSeat}
              </div>
              <div>
                <b>Driver:</b> {ride.postedBy?.name || "Unknown"}
              </div>
            </RideDetails>
            <BookButton onClick={() => bookRide(ride._id)} disabled={bookingLoading}>
              {bookingLoading ? "Booking..." : "Book Now"}
            </BookButton>
          </RideCard>
        ))}
      </Results>
    </Container>
  );
};

const Container = styled.div`
  max-width: 750px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Poppins", sans-serif;
`;
const Title = styled.h1`
  color: #1e90ff;
  font-weight: 800;
  font-size: 2.6rem;
  margin-bottom: 35px;
  text-align: center;
`;
const SearchForm = styled.form`
  display: flex;
  gap: 16px;
  margin-bottom: 40px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;
const Button = styled.button`
  padding: 0 32px;
  background-color: #1e90ff;
  color: white;
  font-weight: 700;
  font-size: 18px;
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

  @media (max-width: 600px) {
    width: 100%;
    padding: 14px 0;
  }
`;
const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;
const NoResults = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 1.2rem;
  color: #777;
`;
const RideCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  padding: 25px 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const RideInfo = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: #222;
`;
const RideDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  font-size: 1rem;
  color: #555;
`;
const BookButton = styled.button`
  align-self: flex-start;
  margin-top: 15px;
  padding: 12px 24px;
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
  margin-bottom: 20px;
`;

export default SearchRides;
