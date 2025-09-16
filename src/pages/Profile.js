import React, { useEffect, useState } from "react";
import styled from "styled-components";

const TABS = ["Account Details", "Ride History", "SOS", "Features"];

const Profile = () => {
  // FIX: track a single tab string, not the entire array
  const [active, setActive] = useState("Account Details");
  const [user, setUser] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchUser = async () => {
    try {
      setErr("");
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load profile");
      setUser(data.user || null);
    } catch (e) {
      setErr(e.message);
      setUser(null);
    }
  };

  const fetchCompleted = async () => {
    try {
      setLoading(true);
      setErr("");
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/users/me/rides/completed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load ride history");
      setCompleted(data.rides || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (active === "Ride History") fetchCompleted();
  }, [active]);

  return (
    <Wrap>
      <Header>
        <Title>Profile</Title>
        <Sub>Manage account, view history, SOS, and essential features.</Sub>
      </Header>

      <Tabs>
        {TABS.map((t) => (
          <Tab key={t} active={active === t} onClick={() => setActive(t)}>
            {t}
          </Tab>
        ))}
      </Tabs>

      {err && <Err>{err}</Err>}

      <Body>
        {active === "Account Details" && (
          <Section>
            <Card>
              <H3>Account Details</H3>
              {!user ? (
                <Muted>Loading...</Muted>
              ) : (
                <Grid>
                  <Item>
                    <Label>Full Name</Label>
                    <Value>{user.fullName || "—"}</Value>
                  </Item>
                  <Item>
                    <Label>Email</Label>
                    <Value>{user.email || "—"}</Value>
                  </Item>
                  <Item>
                    <Label>Phone</Label>
                    <Value>{user.phone || "—"}</Value>
                  </Item>
                  <Item>
                    <Label>Vehicle</Label>
                    <Value>{user.vehicle || "—"}</Value>
                  </Item>
                  <Item>
                    <Label>Preferences</Label>
                    <Value>{user.preferences || "—"}</Value>
                  </Item>
                  <Item>
                    <Label>Member Since</Label>
                    <Value>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</Value>
                  </Item>
                </Grid>
              )}
            </Card>
          </Section>
        )}

        {active === "Ride History" && (
          <Section>
            <Card>
              <H3>Ride History</H3>
              {loading ? (
                <Muted>Loading completed rides...</Muted>
              ) : completed.length === 0 ? (
                <Muted>No completed rides yet.</Muted>
              ) : (
                <HistoryGrid>
                  {completed.map((ride) => {
                    const dt = new Date(ride.date);
                    return (
                      <HistoryCard key={ride._id}>
                        <RouteTxt>
                          <b>{ride.from}</b> → <b>{ride.to}</b>
                        </RouteTxt>
                        <Meta>
                          <span>{dt.toLocaleDateString()}</span>
                          <span>
                            {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span>₹{ride.pricePerSeat}</span>
                        </Meta>
                        <Done>completed</Done>
                      </HistoryCard>
                    );
                  })}
                </HistoryGrid>
              )}
            </Card>
          </Section>
        )}

        {active === "SOS" && (
          <Section>
            <Card>
              <H3>SOS</H3>
              <Muted>
                Configure emergency contacts and quick actions. Coming soon:
                one-tap SOS, live location sharing, and automatic alerts.
              </Muted>
              <Actions>
                <Primary disabled>Setup SOS (soon)</Primary>
                <Secondary disabled>Test Alert (soon)</Secondary>
              </Actions>
            </Card>
          </Section>
        )}

        {active === "Features" && (
          <Section>
            <Card>
              <H3>Essential Features</H3>
              <FeatureList>
                <li>Live ride status updates</li>
                <li>In-app chat (driver ↔ passenger)</li>
                <li>Price and seat filters</li>
                <li>Real-time location sharing</li>
                <li>Payment integration</li>
                <li>Ratings and reviews</li>
              </FeatureList>
            </Card>
          </Section>
        )}
      </Body>
    </Wrap>
  );
};

export default Profile;

/* ========== styles ========== */

const Wrap = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 12px 20px 60px;
  font-family: "Poppins", sans-serif;
`;
const Header = styled.div`text-align: center;margin: 6px 0 18px;`;
const Title = styled.h1`color: #1e90ff;font-weight: 900;font-size: 2.2rem;margin: 0;`;
const Sub = styled.p`color: #666;font-weight: 500;margin: 6px 0 0;`;
const Tabs = styled.div`display: flex;gap: 10px;border-bottom: 1px solid #e9eef5;padding-bottom: 6px;overflow-x: auto;`;
const Tab = styled.button`
  padding: 10px 14px;border: none;border-radius: 999px;font-weight: 800;
  color: ${({ active }) => (active ? "#fff" : "#1e90ff")};
  background: ${({ active }) => (active ? "#1e90ff" : "#e7f0ff")};
  cursor: pointer;white-space: nowrap;
  &:hover { background: ${({ active }) => (active ? "#0b74ff" : "#dbe9ff")}; }
`;
const Body = styled.div`margin-top: 16px;`;
const Section = styled.section`margin-bottom: 18px;`;
const Card = styled.div`background: #fff;border-radius: 14px;box-shadow: 0 12px 28px rgba(0,0,0,0.08);padding: 18px;`;
const H3 = styled.h3`color: #005bbb;font-weight: 900;margin: 0 0 12px;`;
const Err = styled.p`text-align: center;color: #d9534f;font-weight: 700;margin-top: 8px;`;
const Muted = styled.p`color: #666;font-weight: 600;margin: 6px 0 0;`;
const Grid = styled.div`display: grid;grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));gap: 12px;`;
const Item = styled.div`background: #f7f9fc;border-radius: 10px;padding: 12px 14px;`;
const Label = styled.div`color: #6b7a90;font-weight: 700;font-size: 0.8rem;margin-bottom: 4px;`;
const Value = styled.div`color: #2a2a2a;font-weight: 800;`;
const HistoryGrid = styled.div`display: grid;grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));gap: 14px;`;
const HistoryCard = styled.div`background: #fff;border-radius: 12px;box-shadow: 0 10px 24px rgba(0,0,0,0.08);padding: 16px;display: flex;flex-direction: column;gap: 8px;`;
const RouteTxt = styled.div`color: #222;font-weight: 800;`;
const Meta = styled.div`display: flex;gap: 12px;flex-wrap: wrap;color: #555;font-weight: 600;font-size: 0.95rem;`;
const Done = styled.span`align-self: flex-start;background: #e6f4ea;color: #18794e;border: 1px solid #bfe3cf;border-radius: 999px;padding: 4px 8px;font-weight: 800;font-size: 0.8rem;`;
const Actions = styled.div`display: flex;gap: 10px;margin-top: 10px;`;
const Primary = styled.button`flex: 1;padding: 10px 14px;background: #1e90ff;color: #fff;border: none;border-radius: 12px;font-weight: 800;cursor: pointer;&:hover { background: #0b74ff; }`;
const Secondary = styled(Primary)`background: #f0f7ff;color: #005bbb;border: 1px solid #cfe1ff;&:hover { background: #e6f0ff; }`;
const FeatureList = styled.ul`margin: 6px 0 0 18px;color: #333;font-weight: 600;`;
