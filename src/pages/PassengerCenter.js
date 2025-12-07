// src/pages/PassengerCenter.jsx
import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import ChatPanel from "../components/ChatPanel";
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaRupeeSign, 
  FaUsers, 
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaComments,
  FaDirections,
  FaEdit,
  FaTrash,
  FaCreditCard,
  FaShieldAlt,
  FaSearch,
  FaSave,
  FaExclamationTriangle,
  FaArrowRight,
  FaTimes,
  FaStar,
  FaPaperPlane,
  FaSpinner
} from "react-icons/fa";

// Chat drawer components
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

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
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
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #666;
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

const TABS = ["Active Bookings", "Past Rides", "Saved Searches", "Safety & Payments"];

const PassengerCenter = () => {
  const [tab, setTab] = useState("Active Bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Chat drawer state
  const [chat, setChat] = useState({ open:false, ride:null });

  const [savedSearches, setSavedSearches] = useState([]);
  const [newSearch, setNewSearch] = useState({ origin: "", destination: "" });

  const [settings, setSettings] = useState({ 
    shareLocation: true, 
    requireOTP: true, 
    defaultPaymentMethod: "razorpay" 
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Edit seats modal
  const [editFor, setEditFor] = useState(null);
  const [newSeats, setNewSeats] = useState("");

  // Review modal state
  const [reviewFor, setReviewFor] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState({});

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

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // Filter bookings - must be defined before useEffects that use them
  const active = bookings.filter((b) => 
    b.ride?.status !== "completed" && b.ride?.status !== "cancelled"
  );
  const past = bookings.filter((b) => 
    b.ride?.status === "completed" || b.ride?.status === "cancelled"
  );

  // Check for existing reviews
  useEffect(() => {
    const checkReviews = async () => {
      const token = localStorage.getItem("authToken");
      if (!token || past.length === 0) return;
      
      const checks = past.map(async (b) => {
        try {
          const res = await fetch(`/api/reviews/booking/${b._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.hasReview) {
            setHasReviewed(prev => ({ ...prev, [b._id]: true }));
          }
        } catch (e) {
          console.error('Check review error:', e);
        }
      });
      await Promise.all(checks);
    };
    
    if (tab === "Past Rides" && past.length > 0) {
      checkReviews();
    }
  }, [tab, past]);

  // Load saved searches & settings
  useEffect(() => {
    (async () => {
      try {
        const [ssRes, stRes] = await Promise.all([
          fetch('/api/users/me/saved-searches', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          fetch('/api/users/me/settings', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
        ]);
        const ssData = await ssRes.json().catch(() => ({}));
        const stData = await stRes.json().catch(() => ({}));
        if (ssRes.ok) setSavedSearches(ssData.savedSearches || []);
        if (stRes.ok && stData.settings) setSettings(stData.settings);
      } catch {}
    })();
  }, [token]);

  // Open seats edit
  const openSeats = (booking) => {
    setEditFor(booking);
    setNewSeats(String(booking.seatsBooked ?? 1));
  };

  // Save seats
  const saveSeats = async () => {
    try {
      const seatsNum = Number(newSeats);
      if (!Number.isInteger(seatsNum) || seatsNum < 1) {
        throw new Error("Seats must be a positive integer");
      }
      const res = await fetch(`/api/bookings/${editFor._id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ seats: seatsNum }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update seats");
      setBookings((prev) => 
        prev.map(b => b._id === editFor._id ? data.booking : b)
      );
      setEditFor(null);
      setNewSeats("");
    } catch (e) { 
      setErr(e.message); 
    }
  };

  // Cancel booking
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

  // Open review modal
  const openReview = (booking) => {
    setReviewFor(booking);
    setReviewRating(0);
    setReviewComment("");
  };

  // Submit review
  const submitReview = async () => {
    if (!reviewFor || reviewRating < 1 || reviewRating > 5) {
      setErr("Please select a rating (1-5 stars)");
      return;
    }

    setReviewLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: reviewFor._id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      setHasReviewed(prev => ({ ...prev, [reviewFor._id]: true }));
      setReviewFor(null);
      setReviewRating(0);
      setReviewComment("");
      alert("Review submitted successfully! Thank you for your feedback.");
    } catch (e) {
      setErr(e.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  // Razorpay payment handler
  const startRazorpay = async (booking) => {
    try {
      if (!window.Razorpay) {
        setErr("Razorpay payment gateway is not loaded. Please refresh the page.");
        return;
      }

      setErr("");
      console.log("🔄 Creating Razorpay order for booking:", booking._id);
      
      const res = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ bookingId: booking._id }),
      });
      
      const data = await res.json();
      console.log("📦 Order creation response:", { status: res.status, data });
      
      if (!res.ok) {
        const errorMsg = data.message || data.error || "Failed to create payment order";
        console.error("❌ Order creation failed:", errorMsg, data);
        throw new Error(errorMsg);
      }

      if (!data.orderId || !data.keyId || !data.amount) {
        throw new Error("Invalid response from payment server");
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "EzyRide",
        description: `Payment for booking ${booking._id}`,
        order_id: data.orderId,
        prefill: { 
          name: authUser?.fullName || "", 
          email: authUser?.email || "" 
        },
        theme: { color: "#1e90ff" },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({
                bookingId: booking._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.message || "Payment verification failed");
            }
            setBookings(prev => 
              prev.map(b => 
                b._id === booking._id ? { ...b, paymentStatus: "succeeded" } : b
              )
            );
            setErr("");
          } catch (e) { 
            setErr(e.message || "Payment verification failed");
          }
        },
        modal: { 
          ondismiss: () => {}
        },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setErr(`Payment failed: ${response.error?.description || "Unknown error"}`);
      });
      rzp.open();
    } catch (e) { 
      setErr(e.message || "Failed to initiate payment");
    }
  };

  return (
    <Wrap>
      <Header>
        <Title>Passenger Center</Title>
        <Sub>Manage bookings, saved searches, and safety settings.</Sub>
      </Header>

      <Tabs>
        {TABS.map((t) => {
          const icons = {
            "Active Bookings": <FaCalendarAlt />,
            "Past Rides": <FaCheckCircle />,
            "Saved Searches": <FaSearch />,
            "Safety & Payments": <FaShieldAlt />
          };
          return (
            <Tab key={t} $active={tab === t} onClick={() => setTab(t)}>
              {icons[t]} {t}
            </Tab>
          );
        })}
      </Tabs>

      {err && (
        <Err>
          <FaExclamationTriangle /> {err}
        </Err>
      )}

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
                      <RouteInfo>
                        <RouteIcon><FaMapMarkerAlt /></RouteIcon>
                        <RouteTxt>
                          <b>{ride.from}</b> 
                          <ArrowIcon><FaArrowRight /></ArrowIcon> 
                          <b>{ride.to}</b>
                        </RouteTxt>
                      </RouteInfo>
                      <Chip>{ride.status || "posted"}</Chip>
                    </Top>

                    <Meta>
                      <MetaItem>
                        <MetaIcon><FaCalendarAlt /></MetaIcon>
                        <span>{dt ? dt.toLocaleDateString() : ""}</span>
                      </MetaItem>
                      <MetaItem>
                        <MetaIcon><FaClock /></MetaIcon>
                        <span>
                          {dt ? dt.toLocaleTimeString([], { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          }) : ""}
                        </span>
                      </MetaItem>
                      <MetaItem>
                        <MetaIcon><FaRupeeSign /></MetaIcon>
                        <span>{ride.pricePerSeat}</span>
                      </MetaItem>
                      <MetaItem>
                        <MetaIcon><FaUsers /></MetaIcon>
                        <span>
                          {b.seatsBooked} {b.seatsBooked === 1 ? 'seat' : 'seats'}
                        </span>
                      </MetaItem>
                      <MetaItem>
                        {b.paymentStatus === "succeeded" ? (
                          <>
                            <MetaIcon><FaCheckCircle /></MetaIcon>
                            <span style={{ color: '#28a745', fontWeight: 700 }}>
                              Paid
                            </span>
                          </>
                        ) : (
                          <>
                            <MetaIcon><FaTimesCircle /></MetaIcon>
                            <span style={{ color: '#d9534f', fontWeight: 700 }}>
                              Unpaid
                            </span>
                          </>
                        )}
                      </MetaItem>
                    </Meta>

                    <OTPRow>
                      <OTPLabel>Start Code:</OTPLabel>
                      <Code>{b.ride_start_code || "—"}</Code>
                      {b.ride_start_code && (
                        <CopyBtn 
                          onClick={() => 
                            navigator.clipboard.writeText(b.ride_start_code)
                          }
                        >
                          <FaCopy /> Copy
                        </CopyBtn>
                      )}
                      {b.ride_start_code_used && (
                        <Used><FaCheckCircle /> Used</Used>
                      )}
                    </OTPRow>

                    <Actions>
                      <Button 
                        onClick={() => setChat({ 
                          open:true, 
                          ride:{ 
                            id: ride._id, 
                            from: ride.from, 
                            to: ride.to 
                          } 
                        })}
                      >
                        <FaComments /> Chat
                      </Button>
                      <Button
                        as="a"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ride.to || "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FaDirections /> Directions
                      </Button>
                    </Actions>

                    <Actions>
                      <Button 
                        disabled={!canEdit} 
                        onClick={() => openSeats(b)}
                      >
                        <FaEdit /> Modify Seats
                      </Button>
                      <Button 
                        disabled={!canEdit} 
                        onClick={() => cancelBooking(b._id)}
                      >
                        <FaTrash /> Cancel Booking
                      </Button>
                    </Actions>

                    {editFor && editFor._id === b._id && (
                      <Modal>
                        <ModalCard>
                          <ModalHeader>
                            <ModalTitle><FaEdit /> Modify Seats</ModalTitle>
                            <CloseModalBtn 
                              onClick={() => { 
                                setEditFor(null); 
                                setNewSeats(""); 
                              }}
                            >
                              <FaTimes />
                            </CloseModalBtn>
                          </ModalHeader>
                          <Input
                            inputMode="numeric"
                            pattern="\d*"
                            value={newSeats}
                            onChange={(e) => 
                              setNewSeats(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="Number of seats"
                          />
                          <ActionsRow>
                            <Btn 
                              onClick={() => { 
                                setEditFor(null); 
                                setNewSeats(""); 
                              }}
                            >
                              <FaTimes /> Close
                            </Btn>
                            <Primary onClick={saveSeats}>
                              <FaSave /> Save
                            </Primary>
                          </ActionsRow>
                        </ModalCard>
                      </Modal>
                    )}

                    {/* Review Modal */}
                    {reviewFor && reviewFor._id === b._id && (
                      <Modal>
                        <ModalCard>
                          <ModalHeader>
                            <ModalTitle><FaStar /> Rate Your Ride</ModalTitle>
                            <CloseModalBtn onClick={() => {
                              setReviewFor(null);
                              setReviewRating(0);
                              setReviewComment("");
                            }}>
                              <FaTimes />
                            </CloseModalBtn>
                          </ModalHeader>
                          
                          <ReviewContent>
                            <ReviewRoute>
                              <RouteIcon><FaMapMarkerAlt /></RouteIcon>
                              <span><b>{ride.from}</b> <FaArrowRight /> <b>{ride.to}</b></span>
                            </ReviewRoute>
                            
                            <RatingSection>
                              <RatingLabel>Your Rating</RatingLabel>
                              <StarRating>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarButton
                                    key={star}
                                    onClick={() => setReviewRating(star)}
                                    active={reviewRating >= star}
                                  >
                                    <FaStar />
                                  </StarButton>
                                ))}
                              </StarRating>
                              {reviewRating > 0 && (
                                <RatingText>
                  {reviewRating === 1 && "Poor"}
                  {reviewRating === 2 && "Fair"}
                  {reviewRating === 3 && "Good"}
                  {reviewRating === 4 && "Very Good"}
                  {reviewRating === 5 && "Excellent"}
                                </RatingText>
                              )}
                            </RatingSection>

                            <CommentSection>
                              <CommentLabel>Your Review (Optional)</CommentLabel>
                              <CommentTextArea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Share your experience..."
                                rows={4}
                              />
                            </CommentSection>

                            <ActionsRow>
                              <Btn onClick={() => {
                                setReviewFor(null);
                                setReviewRating(0);
                                setReviewComment("");
                              }}>
                                <FaTimes /> Cancel
                              </Btn>
                              <Primary onClick={submitReview} disabled={reviewLoading || reviewRating < 1}>
                                {reviewLoading ? (
                                  <>
                                    <FaSpinner /> Submitting...
                                  </>
                                ) : (
                                  <>
                                    <FaPaperPlane /> Submit Review
                                  </>
                                )}
                              </Primary>
                            </ActionsRow>
                          </ReviewContent>
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
                      <RouteInfo>
                        <RouteIcon><FaMapMarkerAlt /></RouteIcon>
                        <RouteTxt>
                          <b>{ride.from}</b> 
                          <ArrowIcon><FaArrowRight /></ArrowIcon> 
                          <b>{ride.to}</b>
                        </RouteTxt>
                      </RouteInfo>
                      <Chip $done><FaCheckCircle /> completed</Chip>
                    </Top>
                    <Meta>
                      <MetaItem>
                        <MetaIcon><FaCalendarAlt /></MetaIcon>
                        <span>{dt ? dt.toLocaleString() : ""}</span>
                      </MetaItem>
                      <MetaItem>
                        <MetaIcon><FaRupeeSign /></MetaIcon>
                        <span>{ride.pricePerSeat}</span>
                      </MetaItem>
                      <MetaItem>
                        <MetaIcon><FaUsers /></MetaIcon>
                        <span>
                          {b.seatsBooked} {b.seatsBooked === 1 ? 'seat' : 'seats'}
                        </span>
                      </MetaItem>
                    </Meta>
                    <Actions>
                      {b.paymentStatus !== "succeeded" && (
                        <Primary onClick={() => startRazorpay(b)}>
                          <FaCreditCard /> Pay Now
                        </Primary>
                      )}
                      <Button 
                        onClick={() => openReview(b)}
                        disabled={hasReviewed[b._id]}
                      >
                        {hasReviewed[b._id] ? (
                          <>
                            <FaCheckCircle /> Reviewed
                          </>
                        ) : (
                          <>
                            <FaStar /> Rate & Review
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          try {
                            localStorage.setItem(
                              "lastSearch", 
                              JSON.stringify({ 
                                origin: ride.from, 
                                destination: ride.to 
                              })
                            );
                          } catch {}
                          window.location.href = "/home/search-rides";
                        }}
                      >
                        <FaSearch /> Rebook
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
              <InputWrapper>
                <InputIcon><FaMapMarkerAlt /></InputIcon>
                <SmallInput
                  placeholder="From (e.g., Mumbai)"
                  value={newSearch.origin}
                  onChange={(e) => 
                    setNewSearch(s => ({ ...s, origin: e.target.value }))
                  }
                />
              </InputWrapper>
              <InputWrapper>
                <InputIcon><FaMapMarkerAlt /></InputIcon>
                <SmallInput
                  placeholder="To (e.g., Pune)"
                  value={newSearch.destination}
                  onChange={(e) => 
                    setNewSearch(s => ({ ...s, destination: e.target.value }))
                  }
                />
              </InputWrapper>
              <Primary
                disabled={!newSearch.origin.trim() || !newSearch.destination.trim()}
                onClick={async () => {
                  try {
                    const body = { 
                      origin: newSearch.origin.trim(), 
                      destination: newSearch.destination.trim() 
                    };
                    const res = await fetch('/api/users/me/saved-searches', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json', 
                        Authorization: `Bearer ${token}` 
                      },
                      body: JSON.stringify(body),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.message || 'Failed to save search');
                    }
                    setSavedSearches(data.savedSearches || []);
                    setNewSearch({ origin: '', destination: '' });
                  } catch (e) { 
                    setErr(e.message); 
                  }
                }}
              >
                <FaSave /> Save
              </Primary>
            </FormRow>

            {savedSearches.length === 0 ? (
              <Muted>No saved searches yet.</Muted>
            ) : (
              <List>
                {savedSearches.map(s => (
                  <Card key={s.id}>
                    <Top>
                      <RouteInfo>
                        <RouteIcon><FaMapMarkerAlt /></RouteIcon>
                        <RouteTxt>
                          <b>{s.origin}</b> 
                          <ArrowIcon><FaArrowRight /></ArrowIcon> 
                          <b>{s.destination}</b>
                        </RouteTxt>
                      </RouteInfo>
                    </Top>
                    <Actions>
                      <Primary onClick={() => {
                        try {
                          localStorage.setItem(
                            "lastSearch", 
                            JSON.stringify({ 
                              origin: s.origin, 
                              destination: s.destination 
                            })
                          );
                        } catch {}
                        window.location.href = "/home/search-rides";
                      }}>
                        <FaSearch /> Use
                      </Primary>
                      <Button onClick={async () => {
                        try {
                          const res = await fetch('/api/users/me/saved-searches', {
                            method: 'DELETE',
                            headers: { 
                              'Content-Type': 'application/json', 
                              Authorization: `Bearer ${token}` 
                            },
                            body: JSON.stringify({ 
                              origin: s.origin, 
                              destination: s.destination 
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            throw new Error(data.message || 'Failed to delete search');
                          }
                          setSavedSearches(data.savedSearches || []);
                        } catch (e) { 
                          setErr(e.message); 
                        }
                      }}>
                        <FaTrash /> Delete
                      </Button>
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
                    onChange={(e) => 
                      setSettings(s => ({ ...s, shareLocation: e.target.checked }))
                    }
                  />
                  <span> Share location during rides</span>
                </label>
              </ToggleRow>
              <ToggleRow>
                <label>
                  <input
                    type="checkbox"
                    checked={!!settings.requireOTP}
                    onChange={(e) => 
                      setSettings(s => ({ ...s, requireOTP: e.target.checked }))
                    }
                  />
                  <span> Require OTP to start ride</span>
                </label>
              </ToggleRow>
              <ToggleRow>
                <label>
                  Default payment method
                  <Select
                    value={settings.defaultPaymentMethod}
                    onChange={(e) => 
                      setSettings(s => ({ ...s, defaultPaymentMethod: e.target.value }))
                    }
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
                    headers: { 
                      'Content-Type': 'application/json', 
                      Authorization: `Bearer ${token}` 
                    },
                    body: JSON.stringify(settings),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    throw new Error(data.message || 'Failed to save settings');
                  }
                  setSettings(data.settings || settings);
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 1500);
                } catch (e) { 
                  setErr(e.message); 
                }
              }}>
                <FaSave /> Save Settings
              </Primary>
            </Actions>
            {settingsSaved && <SuccessBanner>Settings saved.</SuccessBanner>}
          </Card>
        </Section>
      )}

      {/* Chat drawer */}
      <Backdrop 
        open={chat.open} 
        onClick={() => setChat({ open:false, ride:null })} 
      />
      <Drawer open={chat.open} aria-hidden={!chat.open} aria-label="Ride chat">
        <DrawerHead>
          <DrawerTitle>
            <span>Ride Chat</span>
            {chat.ride?.from && chat.ride?.to && (
              <RouteBadge>{chat.ride.from} → {chat.ride.to}</RouteBadge>
            )}
          </DrawerTitle>
          <CloseX 
            aria-label="Close chat" 
            onClick={() => setChat({ open:false, ride:null })}
          >
            <FaTimes />
          </CloseX>
        </DrawerHead>
        <DrawerBody>
          {chat.open && chat.ride?.id && (
            <ChatPanel 
              rideId={chat.ride.id} 
              onClose={() => setChat({ open:false, ride:null })} 
            />
          )}
        </DrawerBody>
      </Drawer>
    </Wrap>
  );
};

export default PassengerCenter;

/* ========== STYLED COMPONENTS ========== */

const Wrap = styled.div`
  max-width: 950px;
  margin: 0 auto;
  padding: 10px 20px 60px;
  font-family: "Poppins", sans-serif;

  @media (max-width: 768px) { padding: 10px 15px 50px; }
  @media (max-width: 480px) { padding: 10px 12px 40px; }
`;

const Header = styled.div`
  text-align: center;
  margin: 6px 0 18px;

  @media (max-width: 768px) { margin: 6px 0 16px; }
  @media (max-width: 480px) { margin: 6px 0 14px; }
`;

const Section = styled.section` 
  margin-bottom: 18px; 
`;

const H3 = styled.h3`
  color: #1e90ff; 
  font-weight: 900; 
  margin: 0 0 12px; 
  font-size: 1.4rem;
  
  @media (max-width: 768px) { font-size: 1.3rem; }
  @media (max-width: 480px) { font-size: 1.2rem; }
`;

const Title = styled.h1`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900; 
  font-size: 2.4rem; 
  margin: 0; 
  line-height: 1.2;
  
  @media (max-width: 768px) { font-size: 2rem; }
  @media (max-width: 480px) { font-size: 1.8rem; }
`;

const Sub = styled.p`
  color: #666; 
  font-weight: 500; 
  margin: 10px 0 0;
  font-size: 1.05rem;
  
  @media (max-width: 768px) { font-size: 0.95rem; }
  @media (max-width: 480px) { font-size: 0.9rem; }
`;

const Tabs = styled.div`
  display: flex; 
  gap: 10px; 
  border-bottom: 1px solid #e9eef5; 
  padding-bottom: 6px; 
  overflow-x: auto;
  
  @media (max-width: 768px) { gap: 8px; }
  @media (max-width: 480px) { gap: 6px; padding-bottom: 8px; }
`;

const Tab = styled.button`
  padding: 12px 18px; 
  border: none; 
  border-radius: 999px; 
  font-weight: 800;
  color: ${({$active}) => $active ? "#fff" : "#1e90ff"};
  background: ${({$active}) => 
    $active ? "linear-gradient(135deg, #1e90ff 0%, #0066cc 100%)" : "#e7f0ff"
  };
  cursor: pointer; 
  white-space: nowrap; 
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${({$active}) => 
    $active ? "0 4px 15px rgba(30, 144, 255, 0.3)" : "none"
  };

  svg {
    font-size: 0.9rem;
  }

  &:hover { 
    background: ${({$active}) => 
      $active ? "linear-gradient(135deg, #0066cc 0%, #004499 100%)" : "#dbe9ff"
    }; 
    transform: translateY(-2px); 
    box-shadow: ${({$active}) => 
      $active ? "0 6px 20px rgba(30, 144, 255, 0.4)" : "0 2px 8px rgba(30, 144, 255, 0.2)"
    };
  }
  
  @media (max-width: 768px) { 
    padding: 10px 14px; 
    font-size: 0.9rem; 
  }
  
  @media (max-width: 480px) { 
    padding: 8px 12px; 
    font-size: 0.85rem; 
    gap: 6px;
  }
`;

const List = styled.div`
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px; 
  margin-top: 10px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  @media (max-width: 360px) {
    grid-template-columns: 1fr;
    gap: 10px;
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
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  &:hover { 
    transform: translateY(-3px); 
    box-shadow: 0 16px 35px rgba(0, 0, 0, 0.12); 
  }
  &:hover::before { left: 100%; }

  @media (max-width: 768px) { padding: 14px; border-radius: 10px; }
  @media (max-width: 480px) { padding: 12px; border-radius: 8px; }
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

const RouteTxt = styled.div`
  color: #222; 
  font-weight: 800; 
  font-size: 1.1rem; 
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  
  b {
    color: #1e90ff;
  }
  
  @media (max-width: 768px) { font-size: 1rem; }
  @media (max-width: 480px) { font-size: 0.95rem; }
`;

const Chip = styled.span`
  text-transform: capitalize; 
  font-weight: 800; 
  font-size: 0.85rem; 
  padding: 6px 10px; 
  border-radius: 999px;
  color: ${({$done}) => $done ? "#18794e" : "#0b74ff"}; 
  background: ${({$done}) => $done ? "#e6f4ea" : "#e7f0ff"};
  border: 1px solid ${({$done}) => $done ? "#bfe3cf" : "#cfe1ff"};
  
  @media (max-width: 480px) { font-size: 0.8rem; padding: 5px 8px; }
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
  display: flex; 
  gap: 10px; 
  flex-wrap: wrap;
  
  @media (max-width: 480px) { gap: 8px; }
`;

const Button = styled.button`
  padding: 10px 16px; 
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(30, 144, 255, 0.15);

  svg {
    font-size: 0.85rem;
  }

  &:hover:not(:disabled) { 
    background: linear-gradient(135deg, #e6f0ff 0%, #d6ebff 100%); 
    transform: translateY(-2px); 
    box-shadow: 0 4px 15px rgba(0, 91, 187, 0.25); 
  }
  
  &:disabled { 
    opacity: 0.55; 
    cursor: not-allowed; 
    transform: none; 
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

const Primary = styled(Button)`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%); 
  color: #fff; 
  border: none;
  box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
  
  &:hover:not(:disabled) { 
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%); 
    box-shadow: 0 6px 20px rgba(30, 144, 255, 0.4); 
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
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) { padding: 8px 12px; font-size: 0.95rem; }
  @media (max-width: 480px) { padding: 8px 10px; font-size: 0.9rem; }
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
  
  @media (max-width: 480px) { padding: 15px; font-size: 0.95rem; }
`;

const FormRow = styled.div`
  display: grid; 
  grid-template-columns: 1fr 1fr auto; 
  gap: 12px; 
  margin: 16px 0 10px;
  align-items: flex-end;
  
  @media (max-width: 600px) { 
    grid-template-columns: 1fr; 
    gap: 12px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  color: #1e90ff;
  font-size: 1rem;
  z-index: 1;
  pointer-events: none;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const SmallInput = styled.input`
  padding: 12px 14px 12px 42px; 
  border-radius: 10px; 
  border: 2px solid #e1e5e9; 
  width: 100%; 
  background-color: #fafbfc; 
  transition: all 0.3s ease;
  font-size: 15px;
  
  &:focus { 
    border-color: #1e90ff; 
    background-color: #fff; 
    box-shadow: 0 0 0 3px rgba(30,144,255,.1); 
    outline: none;
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
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
  
  input { 
    margin-right: 8px; 
  }
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
  margin-top: 8px;
  padding: 12px 16px; 
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%); 
  border-radius: 10px;
  border: 1px solid rgba(30, 144, 255, 0.15);
  
  @media (max-width: 480px) { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 10px; 
  }
`;

const OTPLabel = styled.span`
  font-weight: 700;
  color: #333;
  font-size: 0.9rem;
`;

const Code = styled.span`
  font-family: 'Courier New', monospace; 
  font-weight: 900; 
  background: #fff; 
  border: 1px solid rgba(30, 144, 255, 0.2); 
  border-radius: 8px; 
  padding: 6px 12px;
  color: #1e90ff;
  font-size: 1.1rem;
  letter-spacing: 2px;
  
  @media (max-width: 480px) { 
    font-size: 1rem; 
  }
`;

const CopyBtn = styled.button`
  padding: 6px 14px; 
  border: none; 
  border-radius: 8px; 
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white; 
  border: 1px solid transparent; 
  font-weight: 800; 
  cursor: pointer; 
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(30, 144, 255, 0.3);
  
  svg {
    font-size: 0.8rem;
  }
  
  &:hover { 
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%); 
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 144, 255, 0.4);
  }
  
  @media (max-width: 480px) { 
    padding: 5px 12px; 
    font-size: 0.8rem; 
  }
`;

const Used = styled.span`
  color: #18794e; 
  background: linear-gradient(135deg, #e6f4ea 0%, #d4edda 100%);
  border: 1px solid #bfe3cf; 
  font-weight: 800; 
  padding: 6px 12px; 
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  
  svg {
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) { 
    font-size: 0.8rem; 
    padding: 5px 10px;
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
  
  @media (max-width: 480px) { padding: 15px; }
`;

const ModalCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); 
  border-radius: 20px; 
  padding: 28px; 
  min-width: 300px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,.3); 
  border: 1px solid rgba(30, 144, 255, 0.1);
  animation: ${fadeIn} 0.3s ease-out 0.1s both;
  
  @media (max-width: 480px) { 
    padding: 24px; 
    min-width: 280px; 
    border-radius: 16px;
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
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  
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
    font-size: 16px; 
  }
`;

const ReviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ReviewRoute = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  border-radius: 12px;
  border: 1px solid rgba(30, 144, 255, 0.15);
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  
  svg {
    color: #1e90ff;
    font-size: 1rem;
  }
  
  b {
    color: #1e90ff;
  }
`;

const RatingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RatingLabel = styled.label`
  font-weight: 700;
  color: #222;
  font-size: 0.95rem;
`;

const StarRating = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StarButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: all 0.3s ease;
  font-size: 2rem;
  color: ${props => props.active ? '#ffc107' : '#e0e0e0'};
  
  svg {
    width: 100%;
    height: 100%;
    filter: ${props => props.active ? 'drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3))' : 'none'};
  }
  
  &:hover {
    transform: scale(1.2);
    color: #ffc107;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const RatingText = styled.p`
  margin: 0;
  color: #1e90ff;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: center;
  padding: 8px;
  background: linear-gradient(135deg, #e8f4ff 0%, #d6ebff 100%);
  border-radius: 8px;
`;

const CommentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CommentLabel = styled.label`
  font-weight: 700;
  color: #222;
  font-size: 0.95rem;
`;

const CommentTextArea = styled.textarea`
  padding: 12px 14px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 15px;
  font-family: 'Poppins', sans-serif;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(30, 144, 255, 0.1);
    outline: none;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;