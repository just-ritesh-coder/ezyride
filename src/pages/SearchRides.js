import React, { useState } from "react";
import styled from "styled-components";
import AutocompleteInput from "../components/AutocompleteInput";

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

      const res = await fetch(`/api/rides/search?${params.toString()}`);
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
      await handleSearch(new Event("submit"));
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Container>
      <Title>Search Available Rides</Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSearch}>
        <AutocompleteInput
          value={origin}
          onChange={setOrigin}
          placeholder="Enter origin"
        />
        <AutocompleteInput
          value={destination}
          onChange={setDestination}
          placeholder="Enter destination"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <FilterGroup>
          <SmallLabel>Min ₹</SmallLabel>
          <SmallNumber
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
          />
          <SmallLabel>Max ₹</SmallLabel>
          <SmallNumber
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
          />
          <SmallLabel>Seats</SmallLabel>
          <SmallNumber
            type="number"
            min="1"
            value={minSeats}
            onChange={(e) => setMinSeats(Number(e.target.value) || 1)}
          />
        </FilterGroup>

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search Rides"}
        </SubmitButton>
      </Form>

      <Results>
        {!loading && results.length === 0 && !error && (
          <NoResults>No rides found.</NoResults>
        )}

        {results.map((ride) => {
          const rideDate = new Date(ride.date);
          const seatsLeft = ride.seatsAvailable ?? 0;
          const driverName =
            ride.postedBy?.fullName || ride.postedBy?.name || "Unknown";

          return (
            <RideCard key={ride._id}>
              <RideHeader>
                <RideRoute>
                  <strong>{ride.from}</strong> → <strong>{ride.to}</strong>
                </RideRoute>
                <Price>₹{ride.pricePerSeat}</Price>
              </RideHeader>

              <RideDetails>
                <DetailItem>
                  <Label>Date</Label>
                  <Value>
                    {rideDate.toLocaleDateString()}{" "}
                    {rideDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Value>
                </DetailItem>
                <DetailItem>
                  <Label>Seats</Label>
                  <Value>{seatsLeft}</Value>
                </DetailItem>
                <DetailItem>
                  <Label>Driver</Label>
                  <Value>{driverName}</Value>
                </DetailItem>
              </RideDetails>

              <CardFooter>
                <BookButton
                  onClick={() => bookRide(ride._id)}
                  disabled={bookingLoading || seatsLeft < 1}
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

/* ===========================
   STYLES - Matching PostRide
=========================== */

const Container = styled.div`
  max-width: 850px;
  margin: 40px auto;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 40px 35px;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  font-family: "Poppins", sans-serif;
  border: 1px solid rgba(30, 144, 255, 0.1);
`;

const Title = styled.h1`
  margin-bottom: 30px;
  color: #1e90ff;
  font-weight: 800;
  font-size: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 14px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  outline: none;
  font-size: 16px;
  background-color: #fafbfc;
  transition: all 0.3s ease;

  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 8px;
`;

const SmallLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #333;
`;

const SmallNumber = styled.input`
  width: 90px;
  padding: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  outline: none;
  background-color: #fafbfc;
  transition: all 0.3s ease;

  &:focus {
    border-color: #1e90ff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
  }
`;

const SubmitButton = styled.button`
  margin-top: 18px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  font-weight: 800;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(30, 144, 255, 0.3);
  }

  &:disabled {
    background: linear-gradient(135deg, #a0c4ff 0%, #8bb3ff 100%);
    cursor: not-allowed;
  }
`;

const Results = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const RideCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(30, 144, 255, 0.1);
  padding: 20px 22px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const RideHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RideRoute = styled.h3`
  color: #222;
  font-weight: 700;
  font-size: 1.2rem;
`;

const Price = styled.div`
  background: #e6f4ea;
  color: #0b6b2b;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
`;

const RideDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 14px;
`;

const DetailItem = styled.div`
  background: #f8f9fb;
  padding: 10px 12px;
  border-radius: 10px;
`;

const Label = styled.div`
  color: #6b7a90;
  font-size: 13px;
`;

const Value = styled.div`
  font-weight: 700;
  color: #222;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
`;

const BookButton = styled(SubmitButton)`
  padding: 12px 18px;
  font-size: 0.95rem;
  margin-top: 0;
`;

const NoResults = styled.div`
  text-align: center;
  background: #f9fafc;
  color: #555;
  padding: 20px;
  border-radius: 12px;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #842029;
  padding: 14px 22px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 600;
  border: 1px solid rgba(132, 32, 41, 0.2);
`;

export default SearchRides;
