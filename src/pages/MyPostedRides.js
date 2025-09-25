// src/pages/MyPostedRides.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ChatPanel from "../components/ChatPanel";

const MyPostedRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [openChat, setOpenChat] = useState(null); // rideId
  const [openFor, setOpenFor] = useState(null);   // rideId for OTP modal
  const [code, setCode] = useState("");

  const fetchActive = async () => {
    setErr("");
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/users/me/rides/active", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load rides");
      setRides(data.rides || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  // NEW: verify rider OTP and start ride
  const verifyAndStart = async (rideId) => {
    setErr("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/rides/${rideId}/start/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid code");
      setRides((prev) => prev.map((r) => (r._id === rideId ? { ...r, status: "ongoing" } : r)));
      setOpenFor(null);
      setCode("");
    } catch (e) {
      setErr(e.message);
    }
  };

  // Keep complete via status endpoint
  const completeRide = async (rideId) => {
    // Optimistic remove from active list
    setRides((prev) => prev.filter((r) => r._id !== rideId));
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/rides/${rideId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "completed" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to complete ride");
      // No re-add; this page shows active only
    } catch (e) {
      setErr(e.message);
      // Re-sync if failed
      await fetchActive();
    }
  };

  return (
    <Container>
      <Header>
        <Title>My Posted Rides</Title>
        <Subtitle>Active rides only. Completed rides appear in Ride History.</Subtitle>
      </Header>

      {loading && <Info>Loading your rides...</Info>}
      {err && <Error>{err}</Error>}
      {!loading && !err && rides.length === 0 && <Empty>No active rides right now.</Empty>}

      <List>
        {rides.map((ride) => {
          const dt = new Date(ride.date);
          const status = ride.status || "posted";
          const canStart = status === "posted";
          const canComplete = status === "ongoing";

          return (
            <Card key={ride._id}>
              <Top>
                <RouteText>
                  <b>{ride.from}</b> → <b>{ride.to}</b>
                </RouteText>
                <Chip status={status}>{status}</Chip>
              </Top>

              <Meta>
                <span>{dt.toLocaleDateString()}</span>
                <span>{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span>Seats: {ride.seatsAvailable}</span>
                <span>₹{ride.pricePerSeat}</span>
              </Meta>

              <Actions>
                <Primary disabled={!canStart} onClick={() => setOpenFor(ride._id)}>
                  Start Ride
                </Primary>
                <Secondary disabled={!canComplete} onClick={() => completeRide(ride._id)}>
                  Complete Ride
                </Secondary>
                <Secondary onClick={() => setOpenChat(ride._id)}>Chat</Secondary>
              </Actions>

              {openChat === ride._id && (
                <ChatPanel rideId={ride._id} onClose={() => setOpenChat(null)} />
              )}

              {/* OTP Modal */}
              {openFor === ride._id && (
                <Modal>
                  <ModalCard>
                    <h3>Enter Rider Start Code</h3>
                    <Input
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="6-digit code"
                    />
                    <ActionsRow>
                      <Btn onClick={() => { setOpenFor(null); setCode(""); }}>Cancel</Btn>
                      <Primary onClick={() => verifyAndStart(ride._id)}>Verify & Start</Primary>
                    </ActionsRow>
                  </ModalCard>
                </Modal>
              )}
            </Card>
          );
        })}
      </List>
    </Container>
  );
};

export default MyPostedRides;

// Styles
const Container = styled.div`
  max-width: 950px;
  margin: 0 auto;
  padding: 10px 20px 60px;
  font-family: "Poppins", sans-serif;
`;
const Header = styled.div`
  text-align: center;
  margin: 10px 0 24px;
`;
const Title = styled.h1`
  color: #1e90ff;
  font-weight: 900;
  font-size: 2.2rem;
  margin: 0 0 6px;
`;
const Subtitle = styled.p`
  color: #666;
  font-weight: 500;
  font-size: 1rem;
  margin: 0;
`;
const Info = styled.p`
  text-align: center;
  color: #555;
  font-weight: 600;
`;
const Error = styled.p`
  text-align: center;
  color: #d9534f;
  font-weight: 700;
  margin-bottom: 14px;
`;
const Empty = styled.p`
  text-align: center;
  color: #777;
  font-weight: 600;
`;
const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
`;
const Card = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const RouteText = styled.div`
  color: #222;
  font-weight: 800;
  font-size: 1.05rem;
`;
const Chip = styled.span`
  text-transform: capitalize;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: 999px;
  color: ${({ status }) =>
    status === "posted" ? "#0b74ff" : status === "ongoing" ? "#b76e00" : "#18794e"};
  background: ${({ status }) =>
    status === "posted" ? "#e7f0ff" : status === "ongoing" ? "#fff3cd" : "#e6f4ea"};
  border: 1px solid
    ${({ status }) =>
      status === "posted" ? "#cfe1ff" : status === "ongoing" ? "#ffe69c" : "#bfe3cf"};
`;
const Meta = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  color: #555;
  font-size: 0.95rem;
`;
const Actions = styled.div`
  display: flex;
  gap: 10px;
`;
const Btn = styled.button`
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
const Primary = styled(Btn)`
  background-color: #1e90ff;
  color: #fff;
  &:hover:not(:disabled) {
    background-color: #0b74ff;
  }
`;
const Secondary = styled(Btn)`
  background-color: #f0f7ff;
  color: #005bbb;
  border: 1px solid #cfe1ff;
  &:hover:not(:disabled) {
    background-color: #e6f0ff;
  }
`;

/* Modal */
const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
`;
const ModalCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  min-width: 300px;
  box-shadow: 0 12px 28px rgba(0,0,0,.18);
`;
const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 12px;
`;
const Input = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #cfe1ff;
  width: 100%;
  font-weight: 800;
  letter-spacing: 2px;
  margin-top: 8px;
`;
