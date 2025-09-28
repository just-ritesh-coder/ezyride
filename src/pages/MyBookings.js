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
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 30px 35px;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  font-family: 'Poppins', sans-serif;
  border: 1px solid rgba(30, 144, 255, 0.1);
  
  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 25px 20px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    margin: 15px auto;
    padding: 20px 15px;
    border-radius: 10px;
  }
`;

const Title = styled.h1`
  font-weight: 800;
  font-size: 2.6rem;
  color: #1e90ff;
  margin-bottom: 30px;
  text-align: center;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
    margin-bottom: 25px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 20px;
  }
`;

const EmptyMessage = styled.p`
  font-size: 1.3rem;
  text-align: center;
  color: #777;
  font-weight: 600;
  padding: 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 25px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    padding: 20px;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  
  @media (max-width: 768px) {
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const BookingCard = styled.div`
  padding: 22px 25px;
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #f3f9ff 0%, #e8f4ff 100%);
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
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  @media (max-width: 768px) {
    padding: 18px 20px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 15px 18px;
    border-radius: 10px;
  }
`;

const RouteInfo = styled.div`
  font-weight: 700;
  font-size: 1.5rem;
  color: #005bbb;
  margin-bottom: 14px;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 10px;
  }
`;

const BookingDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 1rem;
  color: #444;
  
  @media (max-width: 768px) {
    gap: 12px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
    font-size: 0.9rem;
  }
`;

const Detail = styled.div`
  min-width: 140px;
  padding: 4px 0;
  
  b {
    color: #333;
    font-weight: 600;
  }
  
  @media (max-width: 480px) {
    min-width: auto;
    padding: 3px 0;
  }
`;

const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.3rem;
  color: #555;
  font-weight: 600;
  padding: 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 25px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    padding: 20px;
  }
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-weight: 600;
  color: #d9534f;
  font-size: 1.2rem;
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border-radius: 12px;
  border: 1px solid rgba(220, 53, 69, 0.2);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-top: 25px;
    padding: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-top: 20px;
    padding: 15px;
  }
`;

export default MyBookings;
