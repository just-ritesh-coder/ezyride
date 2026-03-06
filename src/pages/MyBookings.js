import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { API_BASE_URL } from "../utils/config";

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
        const response = await fetch(`${API_BASE_URL}/api/bookings/mybookings`, {
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
                <div style={{ marginBottom: '10px', color: '#555', fontWeight: '500' }}>
                  Driver: {ride.postedBy?.fullName || "Unknown"}
                  {ride.postedBy?.kyc?.status === 'verified' && (
                    <span style={{ marginLeft: '6px', color: '#10b981', fontWeight: 'bold' }} title="Verified Driver">
                      ✓ Verified
                    </span>
                  )}
                </div>
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
  background: ${({ theme }) => theme.colors.background};
  padding: 30px 35px;
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.glass};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  
  @media (max-width: 768px) {
    margin: 20px auto;
    padding: 25px 20px;
  }
  
  @media (max-width: 480px) {
    margin: 15px auto;
    padding: 20px 15px;
  }
`;

const Title = styled.h1`
  font-weight: 800;
  font-size: 2.6rem;
  color: ${({ theme }) => theme.colors.text.primary};
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
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  padding: 30px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  border: 1px dashed ${({ theme }) => theme.colors.glass.border};
  
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
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  /* Accent line */
  border-left: 4px solid ${({ theme }) => theme.colors.section.dark};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    background: white;
  }
  
  @media (max-width: 768px) {
    padding: 18px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 15px 18px;
  }
`;

const RouteInfo = styled.div`
  font-weight: 700;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
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
  color: ${({ theme }) => theme.colors.text.secondary};
  
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
    color: ${({ theme }) => theme.colors.text.primary};
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
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
  padding: 30px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  margin: 40px auto;
  max-width: 600px;
  
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
  color: ${({ theme }) => theme.colors.error || "#d9534f"};
  font-size: 1.2rem;
  margin-top: 30px;
  padding: 20px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  border: 1px solid rgba(220, 53, 69, 0.2);
  margin: 40px auto;
  max-width: 600px;
  
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
