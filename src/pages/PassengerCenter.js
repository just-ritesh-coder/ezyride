// src/pages/PassengerCenter.jsx
import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import ChatPanel from "../components/ChatPanel";

const TABS = ["Active Bookings", "Past Rides", "Saved Searches", "Safety & Payments"];

const PassengerCenter = () => {
  const [tab, setTab] = useState("Active Bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [openChat, setOpenChat] = useState(null); // rideId currently chatting

  // Edit seats modal
  const [editFor, setEditFor] = useState(null);   // booking object
  const [newSeats, setNewSeats] = useState("");

  const token = localStorage.getItem("authToken");

  const fetchBookings = useCallback(async () => {
    setErr("");
    try {
      setLoading(true);
      const res = await fetch("/api/bookings/mybookings", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load bookings");
      setBookings(data.bookings || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const active = bookings.filter((b) => b.ride?.status !== "completed" && b.ride?.status !== "cancelled");
  const past = bookings.filter((b) => b.ride?.status === "completed" || b.ride?.status === "cancelled");

  // Open seats edit
  const openSeats = (booking) => {
    setEditFor(booking);
    setNewSeats(String(booking.seatsBooked ?? 1));
  };

  // Save seats PATCH /api/bookings/:bookingId
  const saveSeats = async () => {
    try {
      const seatsNum = Number(newSeats);
      if (!Number.isInteger(seatsNum) || seatsNum < 1) {
        throw new Error("Seats must be a positive integer");
      }
      const res = await fetch(`/api/bookings/${editFor._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ seats: seatsNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update seats");
      setBookings((prev) => prev.map(b => b._id === editFor._id ? data.booking : b));
      setEditFor(null);
      setNewSeats("");
    } catch (e) {
      setErr(e.message);
    }
  };

  // Cancel booking DELETE /api/bookings/:bookingId
  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel booking");
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <Wrap>
      <Header>
        <Title>Passenger Center</Title>
        <Sub>Manage bookings, saved searches, and safety settings.</Sub>
      </Header>

      <Tabs>
        {TABS.map((t) => (
          <Tab key={t} $active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Tab>
        ))}
      </Tabs>

      {err && <Err>{err}</Err>}

      {tab === "Active Bookings" && (
        <>
          {loading ? (
            <Muted>Loading...</Muted>
          ) : active.length === 0 ? (
            <Muted>No active bookings.</Muted>
          ) : (
            <List>
              {active.map((b) => {
                const ride = b.ride || {};
                const dt = ride.date ? new Date(ride.date) : null;
                const canEdit = ride.status === "posted";
                return (
                  <Card key={b._id}>
                    <Top>
                      <RouteTxt>
                        <b>{ride.from}</b> → <b>{ride.to}</b>
                      </RouteTxt>
                      <Chip>{ride.status || "posted"}</Chip>
                    </Top>

                    <Meta>
                      <span>{dt ? dt.toLocaleDateString() : ""}</span>
                      <span>{dt ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                      <span>₹{ride.pricePerSeat}</span>
                      <span>Seats: {b.seatsBooked}</span>
                    </Meta>

                    {/* Rider Start Code (OTP) */}
                    <OTPRow>
                      <span>Start Code:</span>
                      <Code>{b.ride_start_code || "—"}</Code>
                      {b.ride_start_code && (
                        <CopyBtn onClick={() => navigator.clipboard.writeText(b.ride_start_code)}>Copy</CopyBtn>
                      )}
                      {b.ride_start_code_used && <Used>Used</Used>}
                    </OTPRow>

                    <Actions>
                      <Button onClick={() => setOpenChat(ride._id)}>Chat</Button>
                      <Button
                        as="a"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ride.to || "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Directions
                      </Button>
                    </Actions>

                    <Actions>
                      <Button disabled={!canEdit} onClick={() => openSeats(b)}>Modify Seats</Button>
                      <Button disabled={!canEdit} onClick={() => cancelBooking(b._id)}>Cancel Booking</Button>
                    </Actions>

                    {openChat === ride._id && (
                      <ChatPanel rideId={ride._id} onClose={() => setOpenChat(null)} />
                    )}

                    {/* Edit seats modal */}
                    {editFor && editFor._id === b._id && (
                      <Modal>
                        <ModalCard>
                          <h3>Modify Seats</h3>
                          <Input
                            inputMode="numeric"
                            pattern="\d*"
                            value={newSeats}
                            onChange={(e) => setNewSeats(e.target.value.replace(/\D/g, ""))}
                            placeholder="Seats"
                          />
                          <ActionsRow>
                            <Btn onClick={() => { setEditFor(null); setNewSeats(""); }}>Close</Btn>
                            <Primary onClick={saveSeats}>Save</Primary>
                          </ActionsRow>
                        </ModalCard>
                      </Modal>
                    )}
                  </Card>
                );
              })}
            </List>
          )}
        </>
      )}

      {tab === "Past Rides" && (
        <>
          {loading ? (
            <Muted>Loading...</Muted>
          ) : past.length === 0 ? (
            <Muted>No past rides.</Muted>
          ) : (
            <List>
              {past.map((b) => {
                const ride = b.ride || {};
                const dt = ride.date ? new Date(ride.date) : null;
                return (
                  <Card key={b._id}>
                    <Top>
                      <RouteTxt>
                        <b>{ride.from}</b> → <b>{ride.to}</b>
                      </RouteTxt>
                      <Chip $done>completed</Chip>
                    </Top>
                    <Meta>
                      <span>{dt ? dt.toLocaleString() : ""}</span>
                      <span>₹{ride.pricePerSeat}</span>
                      <span>Seats: {b.seatsBooked}</span>
                    </Meta>
                    <Actions>
                      <Button disabled>Rate & Review</Button>
                      <Button
                        onClick={() => {
                          localStorage.setItem("lastSearch", JSON.stringify({ origin: ride.from, destination: ride.to }));
                          window.location.href = "/home/search-rides";
                        }}
                      >
                        Rebook
                      </Button>
                    </Actions>
                  </Card>
                );
              })}
            </List>
          )}
        </>
      )}
    </Wrap>
  );
};

export default PassengerCenter;

/* styles */
const Wrap = styled.div`max-width:950px;margin:0 auto;padding:10px 20px 60px;font-family:"Poppins",sans-serif;`;
const Header = styled.div`text-align:center;margin:6px 0 18px;`;
const Title = styled.h1`color:#1e90ff;font-weight:900;font-size:2.2rem;margin:0;`;
const Sub = styled.p`color:#666;font-weight:500;margin:6px 0 0;`;
const Tabs = styled.div`display:flex;gap:10px;border-bottom:1px solid #e9eef5;padding-bottom:6px;overflow-x:auto;`;
const Tab = styled.button.withConfig({ shouldForwardProp: (p) => p !== '$active' })`
  padding:10px 14px;border:none;border-radius:999px;font-weight:800;color:${({$active})=>$active?"#fff":"#1e90ff"};
  background:${({$active})=>$active?"#1e90ff":"#e7f0ff"};cursor:pointer;white-space:nowrap;
  &:hover{background:${({$active})=>$active?"#0b74ff":"#dbe9ff"};}
`;
const List = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:10px;`;
const Card = styled.div`background:#fff;border-radius:12px;box-shadow:0 12px 28px rgba(0,0,0,.08);padding:16px;display:flex;flex-direction:column;gap:10px;`;
const Top = styled.div`display:flex;align-items:center;justify-content:space-between;`;
const RouteTxt = styled.div`color:#222;font-weight:800;`;
const Chip = styled.span.withConfig({ shouldForwardProp: (p) => p !== '$done' })`
  text-transform:capitalize;font-weight:800;font-size:.85rem;padding:6px 10px;border-radius:999px;
  color:${({$done})=>$done?"#18794e":"#0b74ff"};background:${({$done})=>$done?"#e6f4ea":"#e7f0ff"};
  border:1px solid ${props=>props.$done?"#bfe3cf":"#cfe1ff"};
`;
const Meta = styled.div`display:flex;gap:12px;flex-wrap:wrap;color:#555;font-weight:600;font-size:.95rem;`;
const Actions = styled.div`display:flex;gap:10px;flex-wrap:wrap;`;
const Button = styled.button`
  padding:10px 14px;border:none;border-radius:12px;font-weight:800;font-size:.95rem;cursor:pointer;
  background:#f0f7ff;color:#005bbb;border:1px solid #cfe1ff;&:hover{background:#e6f0ff;}
`;
const Err = styled.div`color:#b01212;background:#ffe5e5;padding:10px 14px;border-radius:10px;margin:10px 0;font-weight:600;`;
const Muted = styled.div`color:#666;font-style:italic;font-weight:500;`;
const OTPRow = styled.div`display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px;`;
const Code = styled.span`font-family:monospace;font-weight:900;background:#f7f9fc;border:1px dashed #cfe1ff;border-radius:8px;padding:4px 8px;`;
const CopyBtn = styled.button`padding:6px 10px;border:none;border-radius:8px;background:#f0f7ff;color:#005bbb;border:1px solid #cfe1ff;font-weight:800;cursor:pointer;`;
const Used = styled.span`color:#18794e;background:#e6f4ea;border:1px solid #bfe3cf;font-weight:800;padding:4px 8px;border-radius:999px;`;
const Modal = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;z-index:1200;`;
const ModalCard = styled.div`background:#fff;border-radius:12px;padding:16px;min-width:300px;box-shadow:0 12px 28px rgba(0,0,0,.18);`;
const ActionsRow = styled.div`display:flex;gap:10px;justify-content:flex-end;margin-top:12px;`;
const Btn = styled.button`padding:8px 12px;border-radius:10px;border:1px solid #ddd;background:#f7f9fc;`;
const Primary = styled.button`padding:10px 14px;border:none;border-radius:12px;font-weight:800;font-size:.95rem;cursor:pointer;background:#1e90ff;color:#fff;`;
const Input = styled.input`padding:10px 12px;border-radius:10px;border:1px solid #cfe1ff;width:100%;font-weight:800;letter-spacing:1px;margin-top:8px;`;
