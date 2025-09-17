import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";

const TABS = ["Active Bookings", "Past Rides", "Saved Searches", "Safety & Payments"];

const PassengerCenter = () => {
  const [tab, setTab] = useState("Active Bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(() => {
    const s = localStorage.getItem("savedSearches");
    return s ? JSON.parse(s) : [];
  });

  const token = localStorage.getItem("authToken");

  const fetchBookings = useCallback(async () => {
    setErr("");
    try {
      setLoading(true);
      const res = await fetch("/api/bookings/mybookings", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      let data = null;
      if (res.status === 304) {
        const res2 = await fetch(`/api/bookings/mybookings?_=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        data = await res2.json();
        if (!res2.ok) throw new Error(data.message || "Failed to load bookings");
      } else {
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load bookings");
      }
      setBookings(data.bookings || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const modifySeats = async (bookingId, newSeats) => {
    setErr("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seats: newSeats }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? data.booking : b)));
    } catch (e) {
      setErr(e.message);
    }
  };

  const cancelBooking = async (bookingId) => {
    setErr("");
    try {
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancel failed");
    } catch (e) {
      setErr(e.message);
      fetchBookings();
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Status-first categorization so items appear even with timezone differences
  const active = bookings.filter((b) => b.ride?.status !== "completed");
  const past = bookings.filter((b) => b.ride?.status === "completed");

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
                const maxSeats = (ride.seatsAvailable ?? 0) + (b.seatsBooked ?? 0);
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
                      <span>
                        {dt
                          ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </span>
                      <span>₹{ride.pricePerSeat}</span>
                      <span>Seats: {b.seatsBooked}</span>
                    </Meta>
                    <Actions>
                      <label>
                        Seats:
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, maxSeats)}
                          defaultValue={b.seatsBooked}
                          onBlur={(e) => {
                            const n = Number(e.target.value);
                            if (n !== b.seatsBooked && n >= 1) modifySeats(b._id, n);
                          }}
                          style={{ width: 70, marginLeft: 8 }}
                        />
                      </label>
                      <Button $danger onClick={() => cancelBooking(b._id)}>
                        Cancel
                      </Button>
                      <Button
                        as="a"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          ride.to || ""
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Directions
                      </Button>
                    </Actions>
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
                          localStorage.setItem(
                            "lastSearch",
                            JSON.stringify({ origin: ride.from, destination: ride.to })
                          );
                          window.location.href = "/home/search-rides";
                        }}
                      >
                        Rebook
                      </Button>
                      <Button disabled>Receipt</Button>
                    </Actions>
                  </Card>
                );
              })}
            </List>
          )}
        </>
      )}

      {tab === "Saved Searches" && (
        <>
          <Actions style={{ marginBottom: 10 }}>
            <Button
              onClick={() => {
                const last = localStorage.getItem("lastSearch");
                if (!last) return;
                const s = JSON.parse(last);
                const next = [{ id: Date.now(), ...s }, ...saved].slice(0, 10);
                setSaved(next);
                localStorage.setItem("savedSearches", JSON.stringify(next));
              }}
            >
              Save current search (from last run)
            </Button>
          </Actions>
          {saved.length === 0 ? (
            <Muted>No saved searches.</Muted>
          ) : (
            <List>
              {saved.map((s) => (
                <Card key={s.id}>
                  <Top>
                    <RouteTxt>
                      <b>{s.origin}</b> → <b>{s.destination}</b>
                    </RouteTxt>
                  </Top>
                  <Meta>
                    <span>{s.date || "Any date"}</span>
                  </Meta>
                  <Actions>
                    <Button
                      onClick={() => {
                        localStorage.setItem("lastSearch", JSON.stringify(s));
                        window.location.href = "/home/search-rides";
                      }}
                    >
                      Run
                    </Button>
                    <Button
                      $danger
                      onClick={() => {
                        const next = saved.filter((x) => x.id !== s.id);
                        setSaved(next);
                        localStorage.setItem("savedSearches", JSON.stringify(next));
                      }}
                    >
                      Delete
                    </Button>
                  </Actions>
                </Card>
              ))}
            </List>
          )}
        </>
      )}

      {tab === "Safety & Payments" && (
        <Card>
          <RouteTxt>
            <b>SOS & Payments</b>
          </RouteTxt>
          <Meta>
            <span>SOS quick action and emergency contacts will appear here.</span>
            <span>Payment methods and receipts soon.</span>
          </Meta>
          <Actions>
            <Button disabled>Setup SOS (soon)</Button>
            <Button disabled>Manage Payments (soon)</Button>
          </Actions>
        </Card>
      )}
    </Wrap>
  );
};

export default PassengerCenter;

/* --- Styled Components --- */
const Wrap = styled.div`
  max-width: 950px;
  margin: 0 auto;
  padding: 10px 20px 60px;
  font-family: "Poppins", sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin: 6px 0 18px;
`;
const Title = styled.h1`
  color: #1e90ff;
  font-weight: 900;
  font-size: 2.2rem;
  margin: 0;
`;
const Sub = styled.p`
  color: #666;
  font-weight: 500;
  margin: 6px 0 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: 10px;
  border-bottom: 1px solid #e9eef5;
  padding-bottom: 6px;
  overflow-x: auto;
`;

// Use transient prop $active to avoid DOM warnings
const Tab = styled.button.withConfig({ shouldForwardProp: (prop) => prop !== '$active' })`
  padding: 10px 14px;
  border: none;
  border-radius: 999px;
  font-weight: 800;
  color: ${({ $active }) => ($active ? "#fff" : "#1e90ff")};
  background: ${({ $active }) => ($active ? "#1e90ff" : "#e7f0ff")};
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: ${({ $active }) => ($active ? "#0b74ff" : "#dbe9ff")};
  }
`;

const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 10px;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RouteTxt = styled.div`
  color: #222;
  font-weight: 800;
`;

// Use transient prop $done to avoid DOM warnings
const Chip = styled.span.withConfig({ shouldForwardProp: (prop) => prop !== '$done' })`
  text-transform: capitalize;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: 999px;
  color: ${({ $done }) => ($done ? "#18794e" : "#0b74ff")};
  background: ${({ $done }) => ($done ? "#e6f4ea" : "#e7f0ff")};
  border: 1px solid ${({ $done }) => ($done ? "#bfe3cf" : "#cfe1ff")};
`;

const Meta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #555;
  font-weight: 600;
  font-size: 0.95rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

// Use transient prop $danger to avoid leaking to DOM
const Button = styled.button.withConfig({ shouldForwardProp: (prop) => prop !== '$danger' })`
  padding: 10px 14px;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  background: ${({ $danger }) => ($danger ? "#ffe5e5" : "#f0f7ff")};
  color: ${({ $danger }) => ($danger ? "#b01212" : "#005bbb")};
  border: 1px solid ${({ $danger }) => ($danger ? "#ffc7c7" : "#cfe1ff")};
  &:hover {
    background: ${({ $danger }) => ($danger ? "#ffdede" : "#e6f0ff")};
  }
`;

const Err = styled.div`
  color: #b01212;
  background: #ffe5e5;
  padding: 10px 14px;
  border-radius: 10px;
  margin: 10px 0;
  font-weight: 600;
`;

const Muted = styled.div`
  color: #666;
  font-style: italic;
  font-weight: 500;
`;
