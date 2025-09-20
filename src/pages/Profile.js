import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";

const TABS = ["Account Details", "Ride History", "SOS", "Features"];

const Profile = () => {
  const [active, setActive] = useState("Account Details");
  const [user, setUser] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [sos, setSOS] = useState({ contacts: [{ name: "", phone: "", relation: "" }], message: "I need help. This is my live location." });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ fullName: "", phone: "", vehicle: "", preferences: "" });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const token = localStorage.getItem("authToken");

  // ======= Fetch User =======
  const fetchUser = useCallback(async () => {
    try {
      setErr("");
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-store" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load profile");
      setUser(data.user || data);
      setEditData({
        fullName: data.fullName || data.name || "",
        phone: data.phone || "",
        vehicle: data.vehicle || "",
        preferences: data.preferences || "",
      });
    } catch (e) {
      setErr(e.message);
      setUser(null);
    }
  }, [token]);

  // ======= Fetch Completed Rides =======
  const fetchCompleted = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
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
  }, [token]);

  // ======= Fetch SOS =======
  const fetchSOS = useCallback(async () => {
    try {
      const res = await fetch("/api/sos/me", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.sos) {
        setSOS({
          contacts: data.sos.contacts?.length ? data.sos.contacts : [{ name: "", phone: "", relation: "" }],
          message: data.sos.message || "I need help. This is my live location.",
        });
      }
    } catch (e) {
      console.error("Failed to load SOS:", e.message);
    }
  }, [token]);

  // ======= Save SOS =======
  const saveSOS = async () => {
    setSaving(true);
    try {
      const body = { contacts: sos.contacts.filter(c => c.name && c.phone).slice(0, 3), message: sos.message };
      const res = await fetch("/api/sos/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.message || "Failed to save SOS settings");
      } else {
        alert("SOS settings saved");
      }
    } catch (e) {
      alert("Error saving SOS: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // ======= Effects =======
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (active === "Ride History") fetchCompleted();
    if (active === "SOS") fetchSOS();
  }, [active, fetchCompleted, fetchSOS]);

  // ======= Handlers =======
  const handleChange = e => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErr("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      setUser(data);
      setSuccessMsg("Profile updated successfully!");
      setEditMode(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Wrap>
      <Header>
        <Title>Profile</Title>
        <Sub>Manage account, view history, SOS, and essential features.</Sub>
      </Header>

      <Tabs>
        {TABS.map(t => (
          <Tab key={t} active={active === t} onClick={() => setActive(t)}>{t}</Tab>
        ))}
      </Tabs>

      {err && <Err>{err}</Err>}
      {successMsg && <Success>{successMsg}</Success>}

      <Body>
        {/* ===== Account Details ===== */}
        {active === "Account Details" && (
          <Section>
            <Card>
              <H3>Account Details</H3>
              {!user ? <Muted>Loading...</Muted> :
                editMode ? (
                  <Grid>
                    <Item><Label>Full Name</Label><Input name="fullName" value={editData.fullName} onChange={handleChange} /></Item>
                    <Item><Label>Phone</Label><Input name="phone" value={editData.phone} onChange={handleChange} /></Item>
                    <Item><Label>Vehicle</Label><Input name="vehicle" value={editData.vehicle} onChange={handleChange} /></Item>
                    <Item><Label>Preferences</Label><Input name="preferences" value={editData.preferences} onChange={handleChange} /></Item>
                    <Item><SaveButton onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</SaveButton></Item>
                    <Item><CancelButton onClick={() => setEditMode(false)}>Cancel</CancelButton></Item>
                  </Grid>
                ) : (
                  <Grid>
                    <Item><Label>Full Name</Label><Value>{user.fullName || user.name || "—"}</Value></Item>
                    <Item><Label>Email</Label><Value>{user.email || "—"}</Value></Item>
                    <Item><Label>Phone</Label><Value>{user.phone || "—"}</Value></Item>
                    <Item><Label>Vehicle</Label><Value>{user.vehicle || "—"}</Value></Item>
                    <Item><Label>Preferences</Label><Value>{user.preferences || "—"}</Value></Item>
                    <Item><Label>Member Since</Label><Value>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</Value></Item>
                    <Item><EditButton onClick={() => setEditMode(true)}>Edit Profile</EditButton></Item>
                  </Grid>
                )
              }
            </Card>
          </Section>
        )}

        {/* ===== Ride History ===== */}
        {active === "Ride History" && (
          <Section>
            <Card>
              <H3>Ride History</H3>
              {loading ? <Muted>Loading completed rides...</Muted> :
                completed.length === 0 ? <Muted>No completed rides yet.</Muted> :
                  <HistoryGrid>
                    {completed.map(ride => {
                      const dt = new Date(ride.date);
                      return (
                        <HistoryCard key={ride._id}>
                          <RouteTxt><b>{ride.from}</b> → <b>{ride.to}</b></RouteTxt>
                          <Meta>
                            <span>{dt.toLocaleDateString()}</span>
                            <span>{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            <span>₹{ride.pricePerSeat}</span>
                          </Meta>
                          <Done>completed</Done>
                        </HistoryCard>
                      );
                    })}
                  </HistoryGrid>
              }
            </Card>
          </Section>
        )}

       {/* ===== SOS ===== */}
{active === "SOS" && (
  <Section>
    <Card>
      <H3>SOS</H3>
      <Muted>Configure emergency contacts and custom SOS message. Up to 3 contacts allowed.</Muted>

      <SOSGrid>
        {sos.contacts.map((c, i) => (
          <SOSItem key={i}>
            <SOSInput
              placeholder="Name"
              value={c.name}
              onChange={e => {
                const next = [...sos.contacts];
                next[i].name = e.target.value;
                setSOS(prev => ({ ...prev, contacts: next }));
              }}
            />
            <SOSInput
              placeholder="Phone"
              value={c.phone}
              onChange={e => {
                const next = [...sos.contacts];
                next[i].phone = e.target.value;
                setSOS(prev => ({ ...prev, contacts: next }));
              }}
            />
            <SOSInput
              placeholder="Relation"
              value={c.relation || ""}
              onChange={e => {
                const next = [...sos.contacts];
                next[i].relation = e.target.value;
                setSOS(prev => ({ ...prev, contacts: next }));
              }}
            />
          </SOSItem>
        ))}
      </SOSGrid>

      <SOSActions>
        <AddButton
          onClick={() =>
            setSOS(prev => ({
              ...prev,
              contacts: [...prev.contacts, { name: "", phone: "", relation: "" }]
            }))
          }
          disabled={sos.contacts.length >= 3}
        >
          Add Contact
        </AddButton>

        <RemoveButton
          onClick={() =>
            setSOS(prev => ({
              ...prev,
              contacts: prev.contacts.slice(0, Math.max(1, prev.contacts.length - 1))
            }))
          }
        >
          Remove Last
        </RemoveButton>
      </SOSActions>

      <SOSMessage
        rows={3}
        value={sos.message}
        onChange={e => setSOS(prev => ({ ...prev, message: e.target.value }))}
      />

      <SaveButton onClick={saveSOS} disabled={saving}>
        {saving ? "Saving..." : "Save SOS Settings"}
      </SaveButton>
    </Card>
  </Section>
)}


        {/* ===== Features ===== */}
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

/* ===== Styles (same as your previous code) ===== */
const Wrap = styled.div`max-width:1000px;margin:0 auto;padding:12px 20px 60px;font-family:"Poppins",sans-serif;`;
const Header = styled.div`text-align:center;margin:6px 0 18px;`;
const Title = styled.h1`color:#1e90ff;font-weight:900;font-size:2.2rem;margin:0;`;
const Sub = styled.p`color:#666;font-weight:500;margin:6px 0 0;`;
const Tabs = styled.div`display:flex;gap:10px;border-bottom:1px solid #e9eef5;padding-bottom:6px;overflow-x:auto;`;
const Tab = styled.button`
  padding:10px 14px;border:none;border-radius:999px;font-weight:800;
  color:${({ active }) => (active ? "#fff" : "#1e90ff")};
  background:${({ active }) => (active ? "#1e90ff" : "#e7f0ff")};
  cursor:pointer;white-space:nowrap;
  &:hover{background:${({ active }) => (active ? "#0b74ff" : "#dbe9ff")};}
`;
const Body = styled.div`margin-top:16px;`;
const Section = styled.section`margin-bottom:18px;`;
const Card = styled.div`background:#fff;border-radius:14px;box-shadow:0 12px 28px rgba(0,0,0,0.08);padding:18px;`;
const H3 = styled.h3`color:#005bbb;font-weight:900;margin:0 0 12px;`;
const Err = styled.p`text-align:center;color:#d9534f;font-weight:700;margin-top:8px;`;
const Success = styled.p`text-align:center;color:#18794e;font-weight:700;margin-top:8px;`;
const Muted = styled.p`color:#666;font-weight:600;margin:6px 0 0;`;
const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;`;
const Item = styled.div`background:#f7f9fc;border-radius:10px;padding:12px 14px;`;
const Label = styled.div`color:#6b7a90;font-weight:700;font-size:0.8rem;margin-bottom:4px;`;
const Value = styled.div`color:#2a2a2a;font-weight:800;`;
const Input = styled.input`padding:10px 12px;font-size:1rem;border-radius:8px;border:1px solid #ccc;outline:none;&:focus{border-color:#1e90ff;box-shadow:0 0 8px #a3c6ff88;}`;
const EditButton = styled.button`padding:10px 12px;font-weight:700;color:#1e90ff;border-radius:8px;border:1px solid #1e90ff;cursor:pointer;background:#fff;&:hover{background:#e7f0ff;}`;
const SaveButton = styled.button`padding:10px 12px;font-weight:700;color:#fff;border-radius:8px;border:none;background:#1e90ff;cursor:pointer;&:hover{background:#0b74ff;}&:disabled{background:#a0c4ff;cursor:not-allowed;}`;
const CancelButton = styled.button`padding:10px 12px;font-weight:700;color:#d9534f;border-radius:8px;border:1px solid #d9534f;cursor:pointer;background:#fff;&:hover{background:#f8d7da;}`;
const HistoryGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;`;
const HistoryCard = styled.div`background:#fff;border-radius:12px;box-shadow:0 10px 24px rgba(0,0,0,0.08);padding:16px;display:flex;flex-direction:column;gap:8px;`;
const RouteTxt = styled.div`color:#222;font-weight:800;`;
const Meta = styled.div`display:flex;gap:12px;flex-wrap:wrap;color:#555;font-weight:600;font-size:0.95rem;`;
const Done = styled.span`align-self:flex-start;background:#e6f4ea;color:#18794e;border:1px solid #bfe3cf;border-radius:999px;padding:4px 8px;font-weight:800;font-size:0.8rem;`;
const FeatureList = styled.ul`margin:6px 0 0 18px;color:#333;font-weight:600;`;
const SOSGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 12px 0;
`;

const SOSItem = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const SOSInput = styled.input`
  padding: 10px 12px;
  font-size: 0.95rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  &:focus {
    border-color: #1e90ff;
    box-shadow: 0 0 6px #a3c6ff88;
  }
`;

const SOSActions = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const AddButton = styled.button`
  flex: 1;
  padding: 10px 14px;
  font-weight: 700;
  color: #1e90ff;
  background: #e7f0ff;
  border: 1px solid #1e90ff;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: #dbe9ff;
  }
  &:disabled {
    background: #f0f4ff;
    cursor: not-allowed;
    color: #9bb7dd;
  }
`;

const RemoveButton = styled(AddButton)`
  background: #ffe7e7;
  border: 1px solid #d9534f;
  color: #d9534f;
  &:hover {
    background: #ffd7d7;
  }
`;

const SOSMessage = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  font-size: 0.95rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  resize: none;
  &:focus {
    border-color: #1e90ff;
    box-shadow: 0 0 6px #a3c6ff88;
  }
  margin-bottom: 12px;
`;

