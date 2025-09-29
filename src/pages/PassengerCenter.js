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
  const [savedSearches, setSavedSearches] = useState([]);
  const [newSearch, setNewSearch] = useState({ origin: "", destination: "" });

  const [settings, setSettings] = useState({ shareLocation: true, requireOTP: true, defaultPaymentMethod: "razorpay" });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Edit seats modal
  const [editFor, setEditFor] = useState(null);   // booking object
  const [newSeats, setNewSeats] = useState("");

  const token = localStorage.getItem("authToken");
  const authUser = JSON.parse(localStorage.getItem("authUser"));

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

  // Load saved searches & settings from backend
  useEffect(() => {
    (async () => {
      try {
        const [ssRes, stRes] = await Promise.all([
          fetch('/api/users/me/saved-searches', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/users/me/settings', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const ssData = await ssRes.json().catch(() => ({}));
        const stData = await stRes.json().catch(() => ({}));
        if (ssRes.ok) setSavedSearches(ssData.savedSearches || []);
        if (stRes.ok && stData.settings) setSettings(stData.settings);
      } catch {}
    })();
  }, [token]);

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

  // 🔹 Razorpay integration
  const startRazorpay = async (booking) => {
    try {
      const res = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId: booking._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "EzyRide",
        description: `Payment for booking ${booking._id}`,
        order_id: data.orderId,
        prefill: {
          name: authUser?.fullName || "",
          email: authUser?.email || "",
        },
        theme: { color: "#1e90ff" },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                bookingId: booking._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message || "Verification failed");

            // optimistic UI update
            setBookings(prev =>
              prev.map(b => b._id === booking._id ? { ...b, paymentStatus: "succeeded" } : b)
            );
          } catch (e) {
            setErr(e.message);
          }
        },
        modal: { ondismiss: () => {} },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
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
                      <span>
                        {b.paymentStatus === "succeeded" ? "✅ Paid" : "❌ Unpaid"}
                      </span>
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
                      {b.paymentStatus !== "succeeded" && (
                        <Primary onClick={() => startRazorpay(b)}>Pay</Primary>
                      )}
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

      {tab === "Saved Searches" && (
        <Section>
          <Card>
            <H3>Saved Searches</H3>
            <Muted>Store frequent routes for quick access.</Muted>

            <FormRow>
              <SmallInput
                placeholder="From (e.g., Mumbai)"
                value={newSearch.origin}
                onChange={(e) => setNewSearch(s => ({ ...s, origin: e.target.value }))}
              />
              <SmallInput
                placeholder="To (e.g., Pune)"
                value={newSearch.destination}
                onChange={(e) => setNewSearch(s => ({ ...s, destination: e.target.value }))}
              />
              <Primary
                disabled={!newSearch.origin.trim() || !newSearch.destination.trim()}
                onClick={async () => {
                  try {
                    const body = { origin: newSearch.origin.trim(), destination: newSearch.destination.trim() };
                    const res = await fetch('/api/users/me/saved-searches', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify(body),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Failed to save search');
                    setSavedSearches(data.savedSearches || []);
                    setNewSearch({ origin: '', destination: '' });
                  } catch (e) {
                    setErr(e.message);
                  }
                }}
              >
                Save
              </Primary>
            </FormRow>

            {savedSearches.length === 0 ? (
              <Muted>No saved searches yet.</Muted>
            ) : (
              <List>
                {savedSearches.map(s => (
                  <Card key={s.id}>
                    <Top>
                      <RouteTxt>
                        <b>{s.origin}</b> → <b>{s.destination}</b>
                      </RouteTxt>
                    </Top>
                    <Actions>
                      <Primary onClick={() => {
                        try {
                          localStorage.setItem("lastSearch", JSON.stringify({ origin: s.origin, destination: s.destination }));
                        } catch {}
                        window.location.href = "/home/search-rides";
                      }}>Use</Primary>
                      <Button onClick={async () => {
                        try {
                          const res = await fetch('/api/users/me/saved-searches', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ origin: s.origin, destination: s.destination }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.message || 'Failed to delete search');
                          setSavedSearches(data.savedSearches || []);
                        } catch (e) {
                          setErr(e.message);
                        }
                      }}>Delete</Button>
                    </Actions>
                  </Card>
                ))}
              </List>
            )}
          </Card>
        </Section>
      )}

      {tab === "Safety & Payments" && (
        <Section>
          <Card>
            <H3>Safety & Payment Settings</H3>
            <Muted>Configure your preferences. These are stored on this device.</Muted>

            <SettingsGrid>
              <ToggleRow>
                <label>
                  <input
                    type="checkbox"
                    checked={!!settings.shareLocation}
                    onChange={(e) => setSettings(s => ({ ...s, shareLocation: e.target.checked }))}
                  />
                  <span> Share location during rides</span>
                </label>
              </ToggleRow>
              <ToggleRow>
                <label>
                  <input
                    type="checkbox"
                    checked={!!settings.requireOTP}
                    onChange={(e) => setSettings(s => ({ ...s, requireOTP: e.target.checked }))}
                  />
                  <span> Require OTP to start ride</span>
                </label>
              </ToggleRow>
              <ToggleRow>
                <label>
                  Default payment method
                  <Select
                    value={settings.defaultPaymentMethod}
                    onChange={(e) => setSettings(s => ({ ...s, defaultPaymentMethod: e.target.value }))}
                  >
                    <option value="razorpay">Razorpay</option>
                  </Select>
                </label>
              </ToggleRow>
            </SettingsGrid>

            <Actions>
              <Primary onClick={async () => {
                try {
                  const res = await fetch('/api/users/me/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(settings),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || 'Failed to save settings');
                  setSettings(data.settings || settings);
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 1500);
                } catch (e) {
                  setErr(e.message);
                }
              }}>Save Settings</Primary>
            </Actions>
            {settingsSaved && <SuccessBanner>Settings saved.</SuccessBanner>}
          </Card>
        </Section>
      )}
    </Wrap>
  );
};

export default PassengerCenter;

/* styles */
const Wrap = styled.div`
  max-width: 950px;
  margin: 0 auto;
  padding: 10px 20px 60px;
  font-family: "Poppins", sans-serif;
  
  @media (max-width: 768px) {
    padding: 10px 15px 50px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px 40px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin: 6px 0 18px;
  
  @media (max-width: 768px) {
    margin: 6px 0 16px;
  }
  
  @media (max-width: 480px) {
    margin: 6px 0 14px;
  }
`;

const Section = styled.section`
  margin-bottom: 18px;
`;

const H3 = styled.h3`
  color: #1e90ff;
  font-weight: 900;
  margin: 0 0 12px;
  font-size: 1.4rem;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const Title = styled.h1`
  color: #1e90ff;
  font-weight: 900;
  font-size: 2.2rem;
  margin: 0;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const Sub = styled.p`
  color: #666;
  font-weight: 500;
  margin: 6px 0 0;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #e9eef5;
  padding-bottom: 6px;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    padding-bottom: 8px;
  }
`;

const Tab = styled.button.withConfig({ shouldForwardProp: (p) => p !== '$active' })`
  padding: 10px 14px;
  border: none;
  border-radius: 999px;
  font-weight: 800;
  color: ${({$active}) => $active ? "#fff" : "#1e90ff"};
  background: ${({$active}) => $active ? "#1e90ff" : "#e7f0ff"};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({$active}) => $active ? "#0b74ff" : "#dbe9ff"};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 0.85rem;
  }
`;

const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 14px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const Card = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.12);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const RouteTxt = styled.div`
  color: #222;
  font-weight: 800;
  font-size: 1.05rem;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const Chip = styled.span.withConfig({ shouldForwardProp: (p) => p !== '$done' })`
  text-transform: capitalize;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: 999px;
  color: ${({$done}) => $done ? "#18794e" : "#0b74ff"};
  background: ${({$done}) => $done ? "#e6f4ea" : "#e7f0ff"};
  border: 1px solid ${props => props.$done ? "#bfe3cf" : "#cfe1ff"};
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 5px 8px;
  }
`;

const Meta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #555;
  font-weight: 600;
  font-size: 0.95rem;
  
  @media (max-width: 768px) {
    gap: 10px;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 6px;
    font-size: 0.85rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const Button = styled.button`
  padding: 10px 14px;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  color: #005bbb;
  border: 1px solid #cfe1ff;
  transition: all 0.3s ease;
  min-height: 44px;
  
  &:hover {
    background: linear-gradient(135deg, #e6f0ff 0%, #d6ebff 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 91, 187, 0.2);
  }
  
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.9rem;
    min-height: 40px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 0.85rem;
    min-height: 38px;
  }
`;

const Primary = styled(Button)`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: #fff;
  border: none;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
  }
`;

const Err = styled.div`
  color: #b01212;
  background: linear-gradient(135deg, #ffe5e5 0%, #ffd6d6 100%);
  padding: 10px 14px;
  border-radius: 12px;
  margin: 10px 0;
  font-weight: 600;
  border: 1px solid rgba(176, 18, 18, 0.2);
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
`;

const Muted = styled.div`
  color: #666;
  font-style: italic;
  font-weight: 500;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  text-align: center;
  
  @media (max-width: 480px) {
    padding: 15px;
    font-size: 0.95rem;
  }
`;

// Saved Searches + Settings styles
const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  margin: 10px 0 6px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SmallInput = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: 2px solid #e1e5e9;
  width: 100%;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  
  &:focus { border-color: #1e90ff; background-color: #fff; box-shadow: 0 0 0 3px rgba(30,144,255,.1); outline: none; }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 10px;
`;

const ToggleRow = styled.div`
  background: linear-gradient(135deg, #f7f9fc 0%, #e9ecef 100%);
  border: 1px solid rgba(0,0,0,.05);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  input { margin-right: 8px; }
`;

const Select = styled.select`
  padding: 10px 12px;
  border-radius: 10px;
  border: 2px solid #e1e5e9;
  background: #fff;
`;

const SuccessBanner = styled.div`
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  color: #18794e;
  background: linear-gradient(135deg, #e6f4ea 0%, #d4edda 100%);
  border: 1px solid #bfe3cf;
  font-weight: 700;
  text-align: center;
`;

const OTPRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const Code = styled.span`
  font-family: monospace;
  font-weight: 900;
  background: #f7f9fc;
  border: 1px dashed #cfe1ff;
  border-radius: 8px;
  padding: 4px 8px;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const CopyBtn = styled.button`
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  color: #005bbb;
  border: 1px solid #cfe1ff;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #e6f0ff 0%, #d6ebff 100%);
    transform: translateY(-1px);
  }
  
  @media (max-width: 480px) {
    padding: 5px 8px;
    font-size: 0.85rem;
  }
`;

const Used = styled.span`
  color: #18794e;
  background: linear-gradient(135deg, #e6f4ea 0%, #d4edda 100%);
  border: 1px solid #bfe3cf;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 999px;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const ModalCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  padding: 16px;
  min-width: 300px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(30, 144, 255, 0.1);
  
  h3 {
    margin: 0 0 16px 0;
    color: #1e90ff;
    font-weight: 800;
    font-size: 1.3rem;
    
    @media (max-width: 480px) {
      font-size: 1.2rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 14px;
    min-width: 280px;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 12px;
  
  @media (max-width: 480px) {
    gap: 8px;
    flex-direction: column;
  }
`;

const Btn = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: linear-gradient(135deg, #f7f9fc 0%, #e9ecef 100%);
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    transform: translateY(-1px);
  }
  
  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border-radius: 10px;
  border: 2px solid #e1e5e9;
  width: 100%;
  font-weight: 600;
  letter-spacing: 1px;
  margin-top: 8px;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
    outline: none;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
`;
