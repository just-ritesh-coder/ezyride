// src/pages/MyPostedRides.jsx
import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import ChatPanel from "../components/ChatPanel";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaRupeeSign,
  FaUsers,
  FaCheckCircle,
  FaPlay,
  FaStop,
  FaEdit,
  FaTrash,
  FaComments,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowRight,
  FaTimes,
  FaKey
} from "react-icons/fa";
import { API_BASE_URL } from "../utils/config";

// Drawer shell (same pattern used in PassengerCenter)
const Backdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  opacity: ${({ open }) => open ? 1 : 0};
  pointer-events: ${({ open }) => open ? 'auto' : 'none'};
  transition: opacity .25s ease;
  z-index: 2000;
`;
const Drawer = styled.aside`
  position: fixed; top:0; right:0; height:100vh; width:min(500px,100%);
  background:#fff; box-shadow:-24px 0 48px rgba(0,0,0,.22);
  transform: translateX(${({ open }) => open ? '0' : '100%'});
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
  border:none; 
  background:transparent; 
  font-size:1.5rem; 
  line-height:1;
  cursor:pointer; 
  color:#475569; 
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  &:hover{ 
    color:#0f172a; 
    background: rgba(0, 0, 0, 0.05);
    transform: rotate(90deg);
  }
`;
const DrawerBody = styled.div`
  flex:1; min-height:0; display:flex; flex-direction:column;
`;

const MyPostedRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Drawer chat state
  const [chat, setChat] = useState({ open: false, ride: null }); // { open, ride:{ id, from, to } }

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
      const res = await fetch(`${API_BASE_URL}/api/users/me/rides/active`, {
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
      const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}/start/verify`, {
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
      const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      date: ride.date ? new Date(ride.date).toISOString().slice(0, 16) : "",
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

      const res = await fetch(`${API_BASE_URL}/api/rides/${editFor._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      const res = await fetch(`${API_BASE_URL}/api/rides/${rideId}`, {
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

      {loading && (
        <Info>
          <FaSpinner /> Loading your rides...
        </Info>
      )}
      {err && (
        <Error>
          <FaExclamationTriangle /> {err}
        </Error>
      )}
      {!loading && !err && rides.length === 0 && (
        <Empty>
          <FaMapMarkerAlt /> No active rides right now.
        </Empty>
      )}

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
                <RouteInfo>
                  <RouteIcon><FaMapMarkerAlt /></RouteIcon>
                  <RouteText><b>{ride.from}</b> <ArrowIcon><FaArrowRight /></ArrowIcon> <b>{ride.to}</b></RouteText>
                </RouteInfo>
                <Chip status={status}>
                  {status === "posted" && <FaCheckCircle />}
                  {status === "ongoing" && <FaPlay />}
                  {status === "completed" && <FaCheckCircle />}
                  {status}
                </Chip>
              </Top>

              <Meta>
                <MetaItem>
                  <MetaIcon><FaCalendarAlt /></MetaIcon>
                  <span>{dt.toLocaleDateString()}</span>
                </MetaItem>
                <MetaItem>
                  <MetaIcon><FaClock /></MetaIcon>
                  <span>{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </MetaItem>
                <MetaItem>
                  <MetaIcon><FaUsers /></MetaIcon>
                  <span>{ride.seatsAvailable} {ride.seatsAvailable === 1 ? 'seat' : 'seats'}</span>
                </MetaItem>
                <MetaItem>
                  <MetaIcon><FaRupeeSign /></MetaIcon>
                  <span>{ride.pricePerSeat}</span>
                </MetaItem>
              </Meta>

              <Actions>
                <Primary disabled={!canStart} onClick={() => setOpenFor(ride._id)}>
                  <FaPlay /> Start Ride
                </Primary>
                <Secondary disabled={!canComplete} onClick={() => completeRide(ride._id)}>
                  <FaStop /> Complete Ride
                </Secondary>
                <Secondary onClick={() => setChat({ open: true, ride: { id: ride._id, from: ride.from, to: ride.to } })}>
                  <FaComments /> Chat
                </Secondary>
              </Actions>

              <Actions>
                <Secondary disabled={!canEditOrCancel} onClick={() => openEdit(ride)}>
                  <FaEdit /> Modify
                </Secondary>
                <Secondary disabled={!canEditOrCancel} onClick={() => cancelRide(ride._id)}>
                  <FaTrash /> Cancel
                </Secondary>
              </Actions>

              {/* OTP Modal */}
              {openFor === ride._id && (
                <Modal>
                  <ModalCard>
                    <ModalHeader>
                      <ModalTitle><FaKey /> Enter Rider Start Code</ModalTitle>
                      <CloseModalBtn onClick={() => { setOpenFor(null); setCode(""); }}>
                        <FaTimes />
                      </CloseModalBtn>
                    </ModalHeader>
                    <Input
                      inputMode="numeric" pattern="\d*" maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="6-digit code"
                    />
                    <ActionsRow>
                      <Btn onClick={() => { setOpenFor(null); setCode(""); }}>
                        <FaTimes /> Cancel
                      </Btn>
                      <Primary onClick={() => verifyAndStart(ride._id)}>
                        <FaCheckCircle /> Verify & Start
                      </Primary>
                    </ActionsRow>
                  </ModalCard>
                </Modal>
              )}

              {/* Edit Modal */}
              {editFor && editFor._id === ride._id && (
                <Modal>
                  <ModalCard>
                    <ModalHeader>
                      <ModalTitle><FaEdit /> Edit Ride</ModalTitle>
                      <CloseModalBtn onClick={() => setEditFor(null)}>
                        <FaTimes />
                      </CloseModalBtn>
                    </ModalHeader>
                    <FormGrid>
                      <Input placeholder="From" value={editForm.from}
                        onChange={e => setEditForm(f => ({ ...f, from: e.target.value }))} />
                      <Input placeholder="To" value={editForm.to}
                        onChange={e => setEditForm(f => ({ ...f, to: e.target.value }))} />
                      <Input type="datetime-local" value={editForm.date}
                        onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                      <Input placeholder="Total seats (capacity)" inputMode="numeric"
                        value={editForm.seatsAvailable}
                        onChange={e => setEditForm(f => ({ ...f, seatsAvailable: e.target.value.replace(/\D/g, "") }))} />
                      <Input placeholder="Price per seat" inputMode="decimal"
                        value={editForm.pricePerSeat}
                        onChange={e => setEditForm(f => ({ ...f, pricePerSeat: e.target.value }))} />
                      <TextArea placeholder="Notes"
                        value={editForm.notes}
                        onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                    </FormGrid>
                    <ActionsRow>
                      <Btn onClick={() => setEditFor(null)}>
                        <FaTimes /> Close
                      </Btn>
                      <Primary onClick={saveEdit}>
                        <FaCheckCircle /> Save
                      </Primary>
                    </ActionsRow>
                  </ModalCard>
                </Modal>
              )}
            </Card>
          );
        })}
      </List>

      {/* Chat drawer renders once */}
      <Backdrop open={chat.open} onClick={() => setChat({ open: false, ride: null })} />
      <Drawer open={chat.open} aria-hidden={!chat.open} aria-label="Ride chat">
        <DrawerHead>
          <DrawerTitle>
            <span>Ride Chat</span>
            {chat.ride?.from && chat.ride?.to && (
              <RouteBadge>{chat.ride.from} → {chat.ride.to}</RouteBadge>
            )}
          </DrawerTitle>
          <CloseX aria-label="Close chat" onClick={() => setChat({ open: false, ride: null })}>
            <FaTimes />
          </CloseX>
        </DrawerHead>
        <DrawerBody>
          {chat.open && chat.ride?.id && (
            <ChatPanel rideId={chat.ride.id} onClose={() => setChat({ open: false, ride: null })} />
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

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Title = styled.h1`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900; 
  font-size: 2.4rem; 
  margin: 0 0 10px; 
  line-height: 1.2;
  
  @media (max-width: 768px) { 
    font-size: 2rem; 
  }
  
  @media (max-width: 480px) { 
    font-size: 1.8rem; 
  }
`;

const Subtitle = styled.p`
  color: #666; 
  font-weight: 500; 
  font-size: 1.05rem; 
  margin: 0;
  
  @media (max-width: 768px) { 
    font-size: 1rem; 
  }
  
  @media (max-width: 480px) { 
    font-size: 0.95rem; 
  }
`;

const Info = styled.p`
  text-align: center; 
  color: #1e90ff; 
  font-weight: 700; 
  padding: 20px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%); 
  border-radius: 12px; 
  border: 1px solid rgba(30, 144, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  svg {
    font-size: 1.2rem;
    animation: ${spin} 1s linear infinite;
  }
  
  @media (max-width: 480px) { 
    padding: 16px; 
    font-size: 0.95rem; 
  }
`;

const Error = styled.p`
  text-align: center; 
  color: #d9534f; 
  font-weight: 700; 
  margin-bottom: 20px; 
  padding: 16px 20px;
  background: linear-gradient(135deg, #ffe5e5 0%, #ffd6d6 100%); 
  border-radius: 12px; 
  border: 1px solid rgba(217, 83, 79, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  svg {
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  @media (max-width: 480px) { 
    padding: 14px 18px; 
    font-size: 0.95rem; 
  }
`;

const Empty = styled.p`
  text-align: center; 
  color: #666; 
  font-weight: 600; 
  padding: 60px 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
  border-radius: 16px; 
  border: 2px dashed rgba(30, 144, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  font-size: 1.1rem;
  
  svg {
    font-size: 3rem;
    color: #1e90ff;
    opacity: 0.6;
  }
  
  @media (max-width: 480px) { 
    padding: 50px 20px; 
    font-size: 1rem; 
  }
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
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  gap: 12px;
  
  @media (max-width: 480px) { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 10px; 
  }
`;

const RouteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

const RouteIcon = styled.div`
  color: #1e90ff;
  font-size: 1.3rem;
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const ArrowIcon = styled.span`
  color: #1e90ff;
  margin: 0 6px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
`;

const RouteText = styled.div`
  color: #222; 
  font-weight: 800; 
  font-size: 1.1rem; 
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  
  b {
    color: #1e90ff;
  }
  
  @media (max-width: 768px) { 
    font-size: 1rem; 
  }
  
  @media (max-width: 480px) { 
    font-size: 0.95rem; 
  }
`;

const Chip = styled.span`
  text-transform: capitalize; 
  font-weight: 800; 
  font-size: 0.85rem; 
  padding: 8px 14px; 
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ status }) => status === "posted" ? "#0b74ff" : status === "ongoing" ? "#b76e00" : "#18794e"};
  background: ${({ status }) => status === "posted" ? "#e7f0ff" : status === "ongoing" ? "#fff3cd" : "#e6f4ea"};
  border: 1px solid ${({ status }) => status === "posted" ? "#cfe1ff" : status === "ongoing" ? "#ffe69c" : "#bfe3cf"};
  
  svg {
    font-size: 0.75rem;
  }
  
  @media (max-width: 480px) { 
    font-size: 0.8rem; 
    padding: 6px 12px; 
  }
`;

const Meta = styled.div`
  display: flex; 
  gap: 12px; 
  flex-wrap: wrap; 
  color: #555; 
  font-size: 0.95rem;
  
  @media (max-width: 768px) { 
    gap: 10px; 
    font-size: 0.9rem; 
  }
  
  @media (max-width: 480px) { 
    flex-direction: column; 
    gap: 8px; 
    font-size: 0.85rem; 
  }
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(30, 144, 255, 0.1);
  
  svg {
    color: #1e90ff;
    font-size: 0.85rem;
    flex-shrink: 0;
  }
`;

const MetaIcon = styled.span`
  display: flex;
  align-items: center;
  color: #1e90ff;
  font-size: 0.85rem;
`;

const Actions = styled.div`
  display: flex; gap: 10px; flex-wrap: wrap;
  @media (max-width: 480px) { gap: 8px; }
`;

const Btn = styled.button`
  flex: 1; 
  padding: 10px 16px; 
  border: none; 
  border-radius: 12px; 
  font-weight: 800; 
  font-size: 0.95rem; 
  cursor: pointer;
  transition: all 0.3s ease; 
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  svg {
    font-size: 0.85rem;
  }
  
  &:disabled { 
    opacity: 0.55; 
    cursor: not-allowed; 
    transform: none;
  }
  
  &:hover:not(:disabled) { 
    transform: translateY(-2px); 
  }
  
  @media (max-width: 768px) { 
    padding: 8px 14px; 
    font-size: 0.9rem; 
    min-height: 40px; 
  }
  
  @media (max-width: 480px) { 
    padding: 8px 12px; 
    font-size: 0.85rem; 
    min-height: 38px; 
  }
  
  @media (max-width: 360px) { 
    min-height: 36px; 
  }
`;

const Primary = styled(Btn)`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%); 
  color: #fff;
  box-shadow: 0 4px 15px rgba(30,144,255,.3);
  
  &:hover:not(:disabled) { 
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%); 
    box-shadow: 0 6px 20px rgba(30,144,255,.4); 
  }
`;

const Secondary = styled(Btn)`
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%); 
  color: #005bbb; 
  border: 1px solid #cfe1ff;
  box-shadow: 0 2px 8px rgba(30, 144, 255, 0.15);
  
  &:hover:not(:disabled) { 
    background: linear-gradient(135deg, #e6f0ff 0%, #d6ebff 100%); 
    box-shadow: 0 4px 15px rgba(0,91,187,.25); 
  }
`;

const Modal = styled.div`
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,.6); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 1200; 
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (max-width: 480px) { 
    padding: 15px; 
  }
`;

const ModalCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); 
  border-radius: 20px; 
  padding: 28px; 
  min-width: 320px; 
  max-width: 520px; 
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,.3); 
  border: 1px solid rgba(30,144,255,.1);
  animation: ${fadeIn} 0.3s ease-out 0.1s both;
  
  @media (max-width: 480px) { 
    padding: 24px; 
    min-width: 280px; 
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  margin: 0; 
  color: #1e90ff; 
  font-weight: 900; 
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    font-size: 1.2rem;
  }
  
  @media (max-width: 480px) { 
    font-size: 1.2rem; 
  }
`;

const CloseModalBtn = styled.button`
  border: none;
  background: transparent;
  color: #666;
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
    transform: rotate(90deg);
  }
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
