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

  // Edit modal state
  const [editFor, setEditFor] = useState(null);   // ride object
  const [editForm, setEditForm] = useState({
    from: "",
    to: "",
    date: "",
    seatsAvailable: "",
    pricePerSeat: "",
    notes: "",
  });

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

  useEffect(() => { fetchActive(); }, []);

  // Start via OTP
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

  // Complete ride (existing)
  const completeRide = async (rideId) => {
    setRides((prev) => prev.filter((r) => r._id !== rideId));
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/rides/${rideId}/complete`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to complete ride");
    } catch (e) {
      setErr(e.message);
      await fetchActive();
    }
  };

  // Open edit modal with prefill
  const openEdit = (ride) => {
    setEditFor(ride);
    setEditForm({
      from: ride.from || "",
      to: ride.to || "",
      date: ride.date ? new Date(ride.date).toISOString().slice(0,16) : "", // datetime-local
      seatsAvailable: "", // interpret as total capacity; leave blank if not changing
      pricePerSeat: ride.pricePerSeat ?? "",
      notes: ride.notes ?? "",
    });
  };

  // Save edit PATCH /api/rides/:rideId
  const saveEdit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const payload = {};
      if (editForm.from) payload.from = editForm.from;
      if (editForm.to) payload.to = editForm.to;
      if (editForm.date) payload.date = new Date(editForm.date).toISOString();
      if (editForm.seatsAvailable !== "") payload.seatsAvailable = Number(editForm.seatsAvailable);
      if (editForm.pricePerSeat !== "") payload.pricePerSeat = Number(editForm.pricePerSeat);
      if (editForm.notes !== "") payload.notes = editForm.notes;

      const res = await fetch(`/api/rides/${editFor._id}`, {
        method: "PATCH",
        headers: { "Content-Type":"application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update ride");

      setRides(prev => prev.map(r => r._id === editFor._id ? data.ride : r));
      setEditFor(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  // Cancel ride DELETE /api/rides/:rideId
  const cancelRide = async (rideId) => {
    if (!window.confirm("Cancel this ride? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/rides/${rideId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel ride");
      setRides(prev => prev.filter(r => r._id !== rideId));
    } catch (e) {
      setErr(e.message);
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
          const canEditOrCancel = status === "posted";

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

              <Actions>
                <Secondary disabled={!canEditOrCancel} onClick={() => openEdit(ride)}>
                  Modify
                </Secondary>
                <Secondary disabled={!canEditOrCancel} onClick={() => cancelRide(ride._id)}>
                  Cancel
                </Secondary>
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

              {/* Edit Modal */}
              {editFor && editFor._id === ride._id && (
                <Modal>
                  <ModalCard>
                    <h3>Edit Ride</h3>
                    <FormGrid>
                      <Input placeholder="From" value={editForm.from}
                        onChange={e=>setEditForm(f=>({...f,from:e.target.value}))}/>
                      <Input placeholder="To" value={editForm.to}
                        onChange={e=>setEditForm(f=>({...f,to:e.target.value}))}/>
                      <Input type="datetime-local" value={editForm.date}
                        onChange={e=>setEditForm(f=>({...f,date:e.target.value}))}/>
                      <Input placeholder="Total seats (capacity)" inputMode="numeric"
                        value={editForm.seatsAvailable}
                        onChange={e=>setEditForm(f=>({...f,seatsAvailable:e.target.value.replace(/\D/g,"")}))}/>
                      <Input placeholder="Price per seat" inputMode="decimal"
                        value={editForm.pricePerSeat}
                        onChange={e=>setEditForm(f=>({...f,pricePerSeat:e.target.value}))}/>
                      <TextArea placeholder="Notes"
                        value={editForm.notes}
                        onChange={e=>setEditForm(f=>({...f,notes:e.target.value}))}/>
                    </FormGrid>
                    <ActionsRow>
                      <Btn onClick={()=> setEditFor(null)}>Close</Btn>
                      <Primary onClick={saveEdit}>Save</Primary>
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
const Container = styled.div`max-width: 950px;margin: 0 auto;padding: 10px 20px 60px;font-family: "Poppins", sans-serif;`;
const Header = styled.div`text-align: center;margin: 10px 0 24px;`;
const Title = styled.h1`color: #1e90ff;font-weight: 900;font-size: 2.2rem;margin: 0 0 6px;`;
const Subtitle = styled.p`color: #666;font-weight: 500;font-size: 1rem;margin: 0;`;
const Info = styled.p`text-align: center;color: #555;font-weight: 600;`;
const Error = styled.p`text-align: center;color: #d9534f;font-weight: 700;margin-bottom: 14px;`;
const Empty = styled.p`text-align: center;color: #777;font-weight: 600;`;
const List = styled.div`display: grid;grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));gap: 18px;`;
const Card = styled.div`background: #fff;border-radius: 14px;box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);padding: 18px;display: flex;flex-direction: column;gap: 12px;`;
const Top = styled.div`display: flex;align-items: center;justify-content: space-between;`;
const RouteText = styled.div`color: #222;font-weight: 800;font-size: 1.05rem;`;
const Chip = styled.span`
  text-transform: capitalize;font-weight: 800;font-size: 0.85rem;padding: 6px 10px;border-radius: 999px;
  color: ${({ status }) => status === "posted" ? "#0b74ff" : status === "ongoing" ? "#b76e00" : "#18794e"};
  background: ${({ status }) => status === "posted" ? "#e7f0ff" : status === "ongoing" ? "#fff3cd" : "#e6f4ea"};
  border: 1px solid ${({ status }) => status === "posted" ? "#cfe1ff" : status === "ongoing" ? "#ffe69c" : "#bfe3cf"};
`;
const Meta = styled.div`display: flex;gap: 14px;flex-wrap: wrap;color: #555;font-size: 0.95rem;`;
const Actions = styled.div`display: flex;gap: 10px;flex-wrap: wrap;`;
const Btn = styled.button`
  flex: 1;padding: 10px 14px;border: none;border-radius: 12px;font-weight: 800;font-size: 0.95rem;cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease; &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
const Primary = styled(Btn)`background-color: #1e90ff;color: #fff;&:hover:not(:disabled){ background-color: #0b74ff; }`;
const Secondary = styled(Btn)`background-color: #f0f7ff;color: #005bbb;border: 1px solid #cfe1ff;&:hover:not(:disabled){ background-color: #e6f0ff; }`;
const Modal = styled.div`position: fixed;inset: 0;background: rgba(0,0,0,.25);display: flex;align-items: center;justify-content: center;z-index: 1200;`;
const ModalCard = styled.div`background: #fff;border-radius: 12px;padding: 16px;min-width: 320px;max-width: 520px;width: 100%;box-shadow: 0 12px 28px rgba(0,0,0,.18);`;
const ActionsRow = styled.div`display: flex;gap: 10px;justify-content: flex-end;margin-top: 12px;`;
const Input = styled.input`padding: 10px 12px;border-radius: 10px;border: 1px solid #cfe1ff;width: 100%;font-weight: 800;letter-spacing: 1px;margin-top: 8px;`;
const TextArea = styled.textarea`padding: 10px 12px;border-radius: 10px;border: 1px solid #cfe1ff;width: 100%;min-height: 90px;`;
const FormGrid = styled.div`display: grid;gap: 10px;`;
