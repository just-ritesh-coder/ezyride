import React from "react";
import styled from "styled-components";

const myBookings = [
  {
    id: 1,
    origin: "Mumbai",
    destination: "Pune",
    date: "2025-09-10",
    time: "08:00 AM",
    seatsBooked: 2,
    status: "Confirmed",
    driver: "Ritesh",
  },
  {
    id: 2,
    origin: "Thane",
    destination: "Mumbai",
    date: "2025-09-15",
    time: "06:00 PM",
    seatsBooked: 1,
    status: "Pending",
    driver: "Priya",
  },
];

const MyBookings = () => {
  return (
    <Container>
      <Title>My Bookings</Title>

      {myBookings.length === 0 ? (
        <EmptyMessage>No bookings found.</EmptyMessage>
      ) : (
        <List>
          {myBookings.map((booking) => (
            <BookingCard key={booking.id}>
              <RouteInfo>
                {booking.origin} &rarr; {booking.destination}
              </RouteInfo>
              <BookingDetails>
                <Detail><b>Date:</b> {booking.date}</Detail>
                <Detail><b>Time:</b> {booking.time}</Detail>
                <Detail><b>Seats Booked:</b> {booking.seatsBooked}</Detail>
                <Detail><b>Status:</b> <Status status={booking.status}>{booking.status}</Status></Detail>
                <Detail><b>Driver:</b> {booking.driver}</Detail>
              </BookingDetails>
            </BookingCard>
          ))}
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

const Status = styled.span`
  font-weight: 700;
  color: ${(props) =>
    props.status === "Confirmed" ? "#2d7a2d" : props.status === "Pending" ? "#b47b00" : "#777"};
`;

export default MyBookings;
