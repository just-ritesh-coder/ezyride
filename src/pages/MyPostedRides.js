// src/pages/MyPostedRides.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ChatPanel from "../components/ChatPanel";

// Drawer shell (same pattern used in PassengerCenter)
const Backdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  opacity: ${({open})=>open?1:0};
  pointer-events: ${({open})=>open?'auto':'none'};
  transition: opacity .25s ease;
  z-index: 2000;
`;
const Drawer = styled.aside`
  position: fixed; top:0; right:0; height:100vh; width:min(500px,100%);
  background:#fff; box-shadow:-24px 0 48px rgba(0,0,0,.22);
  transform: translateX(${({open})=>open?'0':'100%'});
  transition: transform .28s ease;
  z-index: 2001; display:flex; flex-direction:column;
  @media (max-width: 640px) { width: 100%; }
`;
const DrawerHead = styled.div`
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 14px; border-bottom:1px solid #eef2f7;
`;
const DrawerTitle = styled.div`
  font-weight:900; color:#0b1b2b; display:flex; gap:10px; align-items:center;
`;
const RouteBadge = styled.span`
  background:#e7f0ff; color:#0b74ff; border:1px solid #cfe1ff;
  font-weight:800; padding:2px 8px; border-radius:999px; font-size:.8rem;
`;
const CloseX = styled.button`
  border:none; background:transparent; font-size:1.6rem; line-height:1;
  cursor:pointer; color:#475569; &:hover{ color:#0f172a; }
`;
const DrawerBody = styled.div`
  flex:1; min-height:0; display:flex; flex-direction:column;
`;

const MyPostedRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Drawer chat state
  const [chat, setChat] = useState({ open:false, ride:null }); // { open, ride:{ id, from, to } }

  const [openFor, setOpenFor] = useState(null);   // rideId for OTP modal
  const [code, setCode] = useState("");

  // Edit modal state
  const [editFor, setEditFor] = useState(null);   // ride object
  const [editForm, setEditForm] = useState({
    from: "", to: "", date: "", seatsAvailable: "", pricePerSeat: "", notes: "",
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
    } catch (e) { setErr(e.message); }
  };

  // Complete ride
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
      date: ride.date ? new Date(ride.date).toISOString().slice(0,16) : "",
      seatsAvailable: "",
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
    } catch (e) { setErr(e.message); }
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
    } catch (e) { setErr(e.message); }
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
                <RouteText><b>{ride.from}</b> → <b>{ride.to}</b></RouteText>
                <Chip status={status}>{status}</Chip>
              </Top>

              <Meta>
                <span>{dt.toLocaleDateString()}</span>
                <span>{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span>Seats: {ride.seatsAvailable}</span>
                <span>₹{ride.pricePerSeat}</span>
              </Meta>

              <Actions>
                <Primary disabled={!canStart} onClick={() => setOpenFor(ride._id)}>Start Ride</Primary>
                <Secondary disabled={!canComplete} onClick={() => completeRide(ride._id)}>Complete Ride</Secondary>
                <Secondary onClick={() => setChat({ open:true, ride:{ id: ride._id, from: ride.from, to: ride.to } })}>Chat</Secondary>
              </Actions>

              <Actions>
                <Secondary disabled={!canEditOrCancel} onClick={() => openEdit(ride)}>Modify</Secondary>
                <Secondary disabled={!canEditOrCancel} onClick={() => cancelRide(ride._id)}>Cancel</Secondary>
              </Actions>

              {/* OTP Modal */}
              {openFor === ride._id && (
                <Modal>
                  <ModalCard>
                    <h3>Enter Rider Start Code</h3>
                    <Input
                      inputMode="numeric" pattern="\d*" maxLength={6}
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

      {/* Chat drawer renders once */}
      <Backdrop open={chat.open} onClick={() => setChat({ open:false, ride:null })} />
      <Drawer open={chat.open} aria-hidden={!chat.open} aria-label="Ride chat">
        <DrawerHead>
          <DrawerTitle>
            <span>Ride Chat</span>
            {chat.ride?.from && chat.ride?.to && (
              <RouteBadge>{chat.ride.from} → {chat.ride.to}</RouteBadge>
            )}
          </DrawerTitle>
          <CloseX aria-label="Close chat" onClick={() => setChat({ open:false, ride:null })}>×</CloseX>
        </DrawerHead>
        <DrawerBody>
          {chat.open && chat.ride?.id && (
            <ChatPanel rideId={chat.ride.id} onClose={() => setChat({ open:false, ride:null })} />
          )}
        </DrawerBody>
      </Drawer>
    </Container>
  );
};

export default MyPostedRides;

/* Styles */
const Container = styled.div`
  max-width: 950px; margin: 0 auto; padding: 10px 20px 60px; font-family: "Poppins", sans-serif;
  @media (max-width: 768px) { padding: 10px 15px 50px; }
  @media (max-width: 480px) { padding: 10px 12px 40px; }
`;

const Header = styled.div`
  text-align: center; margin: 10px 0 24px;
  @media (max-width: 768px) { margin: 10px 0 20px; }
  @media (max-width: 480px) { margin: 10px 0 18px; }
`;

const Title = styled.h1`
  color: #1e90ff; font-weight: 900; font-size: 2.2rem; margin: 0 0 6px; line-height: 1.2;
  @media (max-width: 768px) { font-size: 1.9rem; }
  @media (max-width: 480px) { font-size: 1.6rem; }
`;

const Subtitle = styled.p`
  color: #666; font-weight: 500; font-size: 1rem; margin: 0;
  @media (max-width: 768px) { font-size: 0.95rem; }
  @media (max-width: 480px) { font-size: 0.9rem; }
`;

const Info = styled.p`
  text-align: center; color: #555; font-weight: 600; padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; border: 1px solid rgba(0,0,0,.05);
  @media (max-width: 480px) { padding: 15px; font-size: 0.95rem; }
`;

const Error = styled.p`
  text-align: center; color: #d9534f; font-weight: 700; margin-bottom: 14px; padding: 15px;
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%); border-radius: 12px; border: 1px solid rgba(220,53,69,.2);
  @media (max-width: 480px) { padding: 12px; font-size: 0.95rem; }
`;

const Empty = styled.p`
  text-align: center; color: #777; font-weight: 600; padding: 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; border: 1px solid rgba(0,0,0,.05);
  @media (max-width: 480px) { padding: 20px; font-size: 0.95rem; }
`;

const List = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px;
  @media (max-width: 768px) { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
  @media (max-width: 480px) { grid-template-columns: 1fr; gap: 12px; }
  @media (max-width: 360px) { grid-template-columns: 1fr; gap: 10px; }
`;

const Card = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 14px; box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  padding: 18px; display: flex; flex-direction: column; gap: 12px;
  border: 1px solid rgba(30, 144, 255, 0.1); transition: all 0.3s ease; position: relative; overflow: hidden;

  &::before{
    content:''; position:absolute; top:0; left:-100%; width:100%; height:100%;
    background:linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent);
    transition:left .5s;
  }
  &:hover{ transform: translateY(-3px); box-shadow: 0 16px 35px rgba(0,0,0,.12); }
  &:hover::before{ left:100%; }

  @media (max-width: 768px) { padding: 15px; border-radius: 12px; }
  @media (max-width: 480px) { padding: 12px; border-radius: 10px; }
`;

const Top = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  @media (max-width: 480px) { flex-direction: column; align-items: flex-start; gap: 8px; }
`;

const RouteText = styled.div`
  color: #222; font-weight: 800; font-size: 1.05rem; line-height: 1.3;
  @media (max-width: 768px) { font-size: 1rem; }
  @media (max-width: 480px) { font-size: 0.95rem; }
`;

const Chip = styled.span`
  text-transform: capitalize; font-weight: 800; font-size: 0.85rem; padding: 6px 10px; border-radius: 999px;
  color: ${({ status }) => status === "posted" ? "#0b74ff" : status === "ongoing" ? "#b76e00" : "#18794e"};
  background: ${({ status }) => status === "posted" ? "#e7f0ff" : status === "ongoing" ? "#fff3cd" : "#e6f4ea"};
  border: 1px solid ${({ status }) => status === "posted" ? "#cfe1ff" : status === "ongoing" ? "#ffe69c" : "#bfe3cf"};
  @media (max-width: 480px) { font-size: 0.8rem; padding: 5px 8px; }
`;

const Meta = styled.div`
  display: flex; gap: 14px; flex-wrap: wrap; color: #555; font-size: 0.95rem;
  @media (max-width: 768px) { gap: 12px; font-size: 0.9rem; }
  @media (max-width: 480px) { flex-direction: column; gap: 6px; font-size: 0.85rem; }
`;

const Actions = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap;
  @media (max-width: 480px) { gap: 8px; }
`;

const Btn = styled.button`
  flex: 1; padding: 10px 14px; border: none; border-radius: 12px; font-weight: 800; font-size: 0.95rem; cursor: pointer;
  transition: all 0.3s ease; min-height: 44px;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
  &:hover:not(:disabled) { transform: translateY(-1px); }
  @media (max-width: 768px) { padding: 8px 12px; font-size: 0.9rem; min-height: 40px; }
  @media (max-width: 480px) { padding: 8px 10px; font-size: 0.85rem; min-height: 38px; }
  @media (max-width: 360px) { min-height: 36px; }
`;

const Primary = styled(Btn)`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%); color: #fff;
  &:hover:not(:disabled) { background: linear-gradient(135deg, #0066cc 0%, #004499 100%); box-shadow: 0 4px 15px rgba(30,144,255,.3); }
`;

const Secondary = styled(Btn)`
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%); color: #005bbb; border: 1px solid #cfe1ff;
  &:hover:not(:disabled) { background: linear-gradient(135deg, #e6f0ff 0%, #d6ebff 100%); box-shadow: 0 4px 15px rgba(0,91,187,.2); }
`;

const Modal = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.25); display: flex; align-items: center; justify-content: center; z-index: 1200; padding: 20px;
  @media (max-width: 480px) { padding: 15px; }
`;

const ModalCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border-radius: 12px; padding: 16px; min-width: 320px; max-width: 520px; width: 100%;
  box-shadow: 0 12px 28px rgba(0,0,0,.18); border: 1px solid rgba(30,144,255,.1);
  h3 { margin: 0 0 16px 0; color: #1e90ff; font-weight: 800; font-size: 1.3rem; }
  @media (max-width: 480px) { padding: 14px; min-width: 280px; h3{ font-size:1.2rem; } }
`;

const ActionsRow = styled.div`
  display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px;
  @media (max-width: 480px) { gap: 8px; flex-direction: column; }
`;

const Input = styled.input`
  padding: 10px 12px; border-radius: 10px; border: 2px solid #e1e5e9; width: 100%; font-weight: 600; letter-spacing: 1px; margin-top: 8px;
  background-color: #fafbfc; transition: all 0.3s ease;
  &:focus { border-color: #1e90ff; background-color: #fff; box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1); outline: none; }
  &::placeholder { color: #9ca3af; }
  @media (max-width: 480px) { padding: 8px 10px; font-size: 16px; } /* Prevents iOS zoom */
`;

const TextArea = styled.textarea`
  padding: 10px 12px; border-radius: 10px; border: 2px solid #e1e5e9; width: 100%; min-height: 90px; background-color: #fafbfc;
  transition: all 0.3s ease; font-family: inherit; resize: vertical;
  &:focus { border-color: #1e90ff; background-color: #fff; box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1); outline: none; }
  &::placeholder { color: #9ca3af; }
  @media (max-width: 480px) { padding: 8px 10px; min-height: 80px; }
`;

const FormGrid = styled.div` display: grid; gap: 10px; @media (max-width: 480px) { gap: 8px; } `;
