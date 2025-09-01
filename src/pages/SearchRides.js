import React, { useState } from "react";
import styled from "styled-components";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const dummyRides = [
  {
    id: 1,
    origin: "Mumbai",
    destination: "Pune",
    date: "2025-09-10",
    time: "08:00 AM",
    seatsAvailable: 3,
    price: 150,
    driver: "Ritesh",
  },
  {
    id: 2,
    origin: "Thane",
    destination: "Mumbai",
    date: "2025-09-11",
    time: "06:30 PM",
    seatsAvailable: 2,
    price: 100,
    driver: "Priya",
  },
];

const SearchRides = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!origin || !destination) {
      alert("Please select both origin and destination.");
      return;
    }

    const filtered = dummyRides.filter(
      (ride) =>
        ride.origin.toLowerCase().includes(origin.label.toLowerCase()) &&
        ride.destination.toLowerCase().includes(destination.label.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <Container>
      <Title>Search Rides</Title>
      <SearchForm onSubmit={handleSearch}>
        <PlacesAutocompleteWrapper>
          <GooglePlacesAutocomplete
            apiKey="YOUR_GOOGLE_API_KEY"
            selectProps={{
              origin,
              onChange: setOrigin,
              placeholder: "Enter origin",
            }}
          />
        </PlacesAutocompleteWrapper>

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

        <Button type="submit">Search</Button>
      </SearchForm>

      <Results>
        {results.length === 0 && <NoResults>No rides found.</NoResults>}
        {results.map((ride) => (
          <RideCard key={ride.id}>
            <RideInfo>
              <strong>{ride.origin}</strong> to <strong>{ride.destination}</strong>
            </RideInfo>
            <RideDetails>
              <div>
                <b>Date:</b> {ride.date} &nbsp; <b>Time:</b> {ride.time}
              </div>
              <div>
                <b>Seats Available:</b> {ride.seatsAvailable} &nbsp; <b>Price:</b> ₹{ride.price}
              </div>
              <div>
                <b>Driver:</b> {ride.driver}
              </div>
            </RideDetails>
            <BookButton>Book Now</BookButton>
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
  font-family: 'Poppins', sans-serif;
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

const PlacesAutocompleteWrapper = styled.div`
  flex: 1;

  .react-google-places-autocomplete__input {
    font-size: 16px;
    padding: 14px 15px;
    border-radius: 10px;
    border: 1px solid #ccc;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .react-google-places-autocomplete__suggestions-container {
    border-radius: 0 0 10px 10px;
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
`;

export default SearchRides;
