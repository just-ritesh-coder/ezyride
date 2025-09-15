import React, { useEffect, useState } from "react";
import styled from "styled-components";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in to view your bookings.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/bookings/mybookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data.bookings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <LoadingMessage>Loading your bookings...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <Container>
      <Title>My Bookings</Title>

      {bookings.length === 0 ? (
        <EmptyMessage>No bookings found.</EmptyMessage>
      ) : (
        <List>
          {bookings.map((booking) => {
            const ride = booking.ride || {};
            const dateObj = new Date(ride.date);
            return (
              <BookingCard key={booking._id}>
                <RouteInfo>
                  {ride.from} &rarr; {ride.to}
                </RouteInfo>
                <BookingDetails>
                  <Detail>
                    <b>Date:</b> {dateObj.toLocaleDateString()}
                  </Detail>
                  <Detail>
                    <b>Time:</b>{" "}
                    {dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Detail>
                  <Detail>
                    <b>Seats Booked:</b> {booking.seatsBooked}
                  </Detail>
                  <Detail>
                    <b>Booking Date:</b>{" "}
                    {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}
                  </Detail>
                </BookingDetails>
              </BookingCard>
            );
          })}
        </List>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 650px;
  margin: 40px auto;
  background: white;
  padding: 30px 35px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  font-family: 'Poppins', sans-serif;
`;

const Title = styled.h1`
  font-weight: 800;
  font-size: 2.6rem;
  color: #1e90ff;
  margin-bottom: 30px;
  text-align: center;
`;

const EmptyMessage = styled.p`
  font-size: 1.3rem;
  text-align: center;
  color: #777;
  font-weight: 600;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const BookingCard = styled.div`
  padding: 22px 25px;
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
  background-color: #f3f9ff;
`;

const RouteInfo = styled.div`
  font-weight: 700;
  font-size: 1.5rem;
  color: #005bbb;
  margin-bottom: 14px;
`;

const BookingDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 1rem;
  color: #444;
`;

const Detail = styled.div`
  min-width: 140px;
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.3rem;
  color: #555;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-weight: 600;
  color: #d9534f;
  font-size: 1.2rem;
  margin-top: 30px;
`;

export default MyBookings;
