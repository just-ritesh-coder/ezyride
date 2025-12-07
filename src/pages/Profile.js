import React, { useEffect, useState, useCallback } from "react";
import styled, { keyframes } from "styled-components";

const TABS = ["Account Details", "Ride History", "SOS", "Features"];

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

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
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
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
      setUser(data.user || data);
      setSuccessMsg("Profile updated successfully!");
      setEditMode(false);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Compress image before upload
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle profile picture upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErr("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setErr("Image size should be less than 10MB");
      return;
    }

    try {
      setUploadingPicture(true);
      setErr("");
      
      // Compress and convert to base64
      const compressedBase64 = await compressImage(file);
      
      // Show preview
      setPreviewImage(compressedBase64);
      
      // Upload compressed image
      await uploadProfilePicture(compressedBase64);
    } catch (error) {
      setErr("Failed to process image: " + error.message);
      setUploadingPicture(false);
    }
  };

  const uploadProfilePicture = async (base64Image) => {
    setErr("");
    try {
      const res = await fetch("/api/users/me/profile-picture", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profilePicture: base64Image }),
      });
      
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        // If response is not JSON (e.g., 413 error)
        if (res.status === 413) {
          throw new Error("Image is too large. Please try a smaller image or compress it first.");
        }
        throw new Error("Server error occurred");
      }
      
      if (!res.ok) {
        if (res.status === 413) {
          throw new Error("Image is too large. Please try a smaller image.");
        }
        throw new Error(data.message || "Failed to upload profile picture");
      }
      
      setUser(data.user);
      setSuccessMsg("Profile picture updated successfully!");
      setPreviewImage(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      setErr(e.message);
      setPreviewImage(null);
    } finally {
      setUploadingPicture(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    
    setUploadingPicture(true);
    setErr("");
    try {
      const res = await fetch("/api/users/me/profile-picture", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profilePicture: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove profile picture");
      setUser(data.user);
      setPreviewImage(null);
      setSuccessMsg("Profile picture removed successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploadingPicture(false);
    }
  };

  return (
    <Wrap>
      <Header>
        <ProfileHeader>
          <AvatarContainer>
            <AvatarWrapper>
              <Avatar 
                src={previewImage || user?.profilePicture} 
                hasImage={!!(previewImage || user?.profilePicture)}
              >
                {!(previewImage || user?.profilePicture) && (
                  user?.fullName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </Avatar>
              <AvatarRing />
              {uploadingPicture && <AvatarOverlay>Uploading...</AvatarOverlay>}
            </AvatarWrapper>
            <AvatarActions>
              <AvatarInput
                type="file"
                accept="image/*"
                id="profile-picture-input"
                onChange={handleImageChange}
                disabled={uploadingPicture}
              />
              <AvatarLabel htmlFor="profile-picture-input" disabled={uploadingPicture}>
                📷 {user?.profilePicture ? "Change" : "Upload"} Photo
              </AvatarLabel>
              {user?.profilePicture && (
                <RemovePhotoButton onClick={removeProfilePicture} disabled={uploadingPicture}>
                  🗑️ Remove
                </RemovePhotoButton>
              )}
            </AvatarActions>
          </AvatarContainer>
          <Title>Profile</Title>
          <Sub>Manage account, view history, SOS, and essential features.</Sub>
          {user && (
            <MemberSince>
              Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "—"}
            </MemberSince>
          )}
        </ProfileHeader>
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
              <CardHeader>
                <H3>Account Details</H3>
                <HeaderIcon>👤</HeaderIcon>
              </CardHeader>
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
                    <Item>
                      <FieldIcon>👤</FieldIcon>
                      <Label>Full Name</Label>
                      <Value>{user.fullName || user.name || "—"}</Value>
                    </Item>
                    <Item>
                      <FieldIcon>📧</FieldIcon>
                      <Label>Email</Label>
                      <Value>{user.email || "—"}</Value>
                    </Item>
                    <Item>
                      <FieldIcon>📱</FieldIcon>
                      <Label>Phone</Label>
                      <Value>{user.phone || "—"}</Value>
                    </Item>
                    <Item>
                      <FieldIcon>🚗</FieldIcon>
                      <Label>Vehicle</Label>
                      <Value>{user.vehicle || "—"}</Value>
                    </Item>
                    <Item>
                      <FieldIcon>⚙️</FieldIcon>
                      <Label>Preferences</Label>
                      <Value>{user.preferences || "—"}</Value>
                    </Item>
                    <Item>
                      <FieldIcon>📅</FieldIcon>
                      <Label>Member Since</Label>
                      <Value>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</Value>
                    </Item>
                    <Item fullWidth>
                      <EditButton onClick={() => setEditMode(true)}>
                        <ButtonIcon>✏️</ButtonIcon>
                        Edit Profile
                      </EditButton>
                    </Item>
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
              <CardHeader>
                <H3>Ride History</H3>
                <HeaderIcon>📊</HeaderIcon>
              </CardHeader>
              {loading ? <Muted>Loading completed rides...</Muted> :
                completed.length === 0 ? <Muted>No completed rides yet.</Muted> :
                  <HistoryGrid>
                    {completed.map(ride => {
                      const dt = new Date(ride.date);
                      return (
                        <HistoryCard key={ride._id}>
                          <HistoryCardHeader>
                            <RouteIcon>📍</RouteIcon>
                            <RouteTxt><b>{ride.from}</b> → <b>{ride.to}</b></RouteTxt>
                          </HistoryCardHeader>
                          <Meta>
                            <MetaItem>
                              <MetaIcon>📅</MetaIcon>
                              <span>{dt.toLocaleDateString()}</span>
                            </MetaItem>
                            <MetaItem>
                              <MetaIcon>🕐</MetaIcon>
                              <span>{dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </MetaItem>
                            <MetaItem>
                              <MetaIcon>💰</MetaIcon>
                              <span>₹{ride.pricePerSeat}</span>
                            </MetaItem>
                          </Meta>
                          <Done>✓ completed</Done>
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
    <SOSCard>
              <SOSCardHeader>
                <H3>SOS Emergency Settings</H3>
                <SOSHeaderIcon>🚨</SOSHeaderIcon>
              </SOSCardHeader>
      <Muted>Configure emergency contacts and custom SOS message. Up to 3 contacts allowed.</Muted>

      <SOSGrid>
        {sos.contacts.map((c, i) => (
          <SOSItem key={i}>
            <SOSInput
                      placeholder="Contact Name"
              value={c.name}
              onChange={e => {
                const next = [...sos.contacts];
                next[i].name = e.target.value;
                setSOS(prev => ({ ...prev, contacts: next }));
              }}
            />
            <SOSInput
                      placeholder="Phone Number"
                      type="tel"
              value={c.phone}
              onChange={e => {
                const next = [...sos.contacts];
                next[i].phone = e.target.value;
                setSOS(prev => ({ ...prev, contacts: next }));
              }}
            />
            <SOSInput
                      placeholder="Relation (e.g., Family, Friend)"
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
                  + Add Contact
        </AddButton>

        <RemoveButton
          onClick={() =>
            setSOS(prev => ({
              ...prev,
              contacts: prev.contacts.slice(0, Math.max(1, prev.contacts.length - 1))
            }))
          }
                  disabled={sos.contacts.length <= 1}
        >
                  - Remove Last
        </RemoveButton>
      </SOSActions>

              <SOSMessageLabel>Emergency Message:</SOSMessageLabel>
      <SOSMessage
        rows={3}
                placeholder="Enter your emergency message here..."
        value={sos.message}
        onChange={e => setSOS(prev => ({ ...prev, message: e.target.value }))}
      />

      <SaveButton onClick={saveSOS} disabled={saving}>
        {saving ? "Saving..." : "Save SOS Settings"}
      </SaveButton>
    </SOSCard>
  </Section>
)}


        {/* ===== Features ===== */}
        {active === "Features" && (
          <Section>
            <Card>
              <CardHeader>
                <H3>Essential Features</H3>
                <HeaderIcon>✨</HeaderIcon>
              </CardHeader>
              <FeatureList>
                <FeatureItem>
                  <FeatureIcon>🔄</FeatureIcon>
                  <span>Live ride status updates</span>
                </FeatureItem>
                <FeatureItem>
                  <FeatureIcon>💬</FeatureIcon>
                  <span>In-app chat (driver ↔ passenger)</span>
                </FeatureItem>
                <FeatureItem>
                  <FeatureIcon>🔍</FeatureIcon>
                  <span>Price and seat filters</span>
                </FeatureItem>
                <FeatureItem>
                  <FeatureIcon>📍</FeatureIcon>
                  <span>Real-time location sharing</span>
                </FeatureItem>
                <FeatureItem>
                  <FeatureIcon>💳</FeatureIcon>
                  <span>Payment integration</span>
                </FeatureItem>
                <FeatureItem>
                  <FeatureIcon>⭐</FeatureIcon>
                  <span>Ratings and reviews</span>
                </FeatureItem>
              </FeatureList>
            </Card>
          </Section>
        )}
      </Body>
    </Wrap>
  );
};

export default Profile;

/* ===== Styles ===== */
const Wrap = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 12px 20px 60px;
  font-family: "Poppins", sans-serif;
  
  @media (max-width: 768px) {
    padding: 12px 15px 50px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 12px 40px;
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

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const AvatarContainer = styled.div`
  position: relative;
  margin-bottom: 8px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ hasImage, src }) => 
    hasImage && src 
      ? `url(${src}) center/cover no-repeat` 
      : 'linear-gradient(135deg, #1e90ff 0%, #0066cc 100%)'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 900;
  box-shadow: 0 8px 24px rgba(30, 144, 255, 0.3);
  position: relative;
  z-index: 2;
  animation: ${fadeIn} 0.6s ease-out;
  border: 4px solid white;
  object-fit: cover;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  z-index: 3;
  animation: ${fadeIn} 0.3s ease-out;
`;

const AvatarActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  align-items: center;
  
  @media (max-width: 480px) {
    gap: 6px;
    margin-top: 10px;
  }
`;

const AvatarInput = styled.input`
  display: none;
`;

const AvatarLabel = styled.label`
  padding: 8px 16px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  display: inline-block;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 144, 255, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
`;

const RemovePhotoButton = styled.button`
  padding: 6px 14px;
  background: linear-gradient(135deg, #ffe7e7 0%, #ffd7d7 100%);
  color: #d9534f;
  border: 1px solid #d9534f;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ffd7d7 0%, #ffc7c7 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(217, 83, 79, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    padding: 5px 12px;
    font-size: 0.8rem;
  }
`;

const AvatarRing = styled.div`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e90ff, #0066cc, #1e90ff);
  background-size: 200% 200%;
  animation: ${pulse} 3s infinite;
  opacity: 0.3;
  z-index: 1;
`;

const MemberSince = styled.div`
  color: #888;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 4px;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
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

const Tab = styled.button`
  padding: 10px 14px;
  border: none;
  border-radius: 999px;
  font-weight: 800;
  color: ${({ active }) => (active ? "#fff" : "#1e90ff")};
  background: ${({ active }) => (active ? "linear-gradient(135deg, #1e90ff 0%, #0066cc 100%)" : "#e7f0ff")};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: ${({ active }) => active ? "0 4px 15px rgba(30, 144, 255, 0.3)" : "none"};
  
  &:hover {
    background: ${({ active }) => (active ? "linear-gradient(135deg, #0b74ff 0%, #0052a3 100%)" : "#dbe9ff")};
    transform: translateY(-2px);
    box-shadow: ${({ active }) => active ? "0 6px 20px rgba(30, 144, 255, 0.4)" : "0 2px 8px rgba(30, 144, 255, 0.2)"};
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

const Body = styled.div`
  margin-top: 16px;
  
  @media (max-width: 480px) {
    margin-top: 14px;
  }
`;

const Section = styled.section`
  margin-bottom: 18px;
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const Card = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 24px;
  border: 1px solid rgba(30, 144, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1e90ff, #0066cc, #1e90ff);
    background-size: 200% 100%;
    animation: ${shimmer} 3s infinite;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(30, 144, 255, 0.1);
    border-color: rgba(30, 144, 255, 0.2);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(30, 144, 255, 0.1);
`;

const HeaderIcon = styled.span`
  font-size: 1.8rem;
  animation: ${pulse} 2s infinite;
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const SOSCard = styled(Card)`
  background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
  border-color: rgba(217, 83, 79, 0.2);
  
  &:hover {
    border-color: rgba(217, 83, 79, 0.3);
    box-shadow: 0 16px 48px rgba(217, 83, 79, 0.15);
  }
  
  &::after {
    background: linear-gradient(90deg, #d9534f, #c9302c, #d9534f);
  }
`;

const SOSCardHeader = styled(CardHeader)`
  border-bottom-color: rgba(217, 83, 79, 0.2);
`;

const SOSHeaderIcon = styled(HeaderIcon)`
  animation: ${pulse} 1.5s infinite;
`;

const H3 = styled.h3`
  color: #005bbb;
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

const Err = styled.p`
  text-align: center;
  color: #d9534f;
  font-weight: 700;
  margin-top: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #ffe5e5 0%, #ffd6d6 100%);
  border-radius: 12px;
  border: 1px solid rgba(217, 83, 79, 0.2);
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 0.95rem;
  }
`;

const Success = styled.p`
  text-align: center;
  color: #18794e;
  font-weight: 700;
  margin-top: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #e6f4ea 0%, #d4edda 100%);
  border-radius: 12px;
  border: 1px solid rgba(24, 121, 78, 0.2);
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 0.95rem;
  }
`;

const Muted = styled.p`
  color: #666;
  font-weight: 600;
  margin: 6px 0 0;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const Item = styled.div`
  background: linear-gradient(135deg, #f7f9fc 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px 18px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  grid-column: ${({ fullWidth }) => fullWidth ? "1 / -1" : "auto"};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
    border-color: rgba(30, 144, 255, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 14px 16px;
  }
`;

const FieldIcon = styled.span`
  font-size: 1.2rem;
  margin-bottom: 4px;
  display: inline-block;
`;

const Label = styled.div`
  color: #6b7a90;
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 4px;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const Value = styled.div`
  color: #2a2a2a;
  font-weight: 800;
  font-size: 1rem;
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  outline: none;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  width: 100%;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
`;

const EditButton = styled.button`
  padding: 12px 20px;
  font-weight: 700;
  color: #1e90ff;
  border-radius: 10px;
  border: 2px solid #1e90ff;
  cursor: pointer;
  background: #fff;
  transition: all 0.3s ease;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  
  &:hover {
    background: linear-gradient(135deg, #e7f0ff 0%, #d6ebff 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(30, 144, 255, 0.3);
    border-color: #0066cc;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 0.9rem;
    min-height: 44px;
  }
`;

const ButtonIcon = styled.span`
  font-size: 1rem;
`;

const SaveButton = styled.button`
  padding: 10px 12px;
  font-weight: 700;
  color: #fff;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 44px;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
  }
  
  &:disabled {
    background: #a0c4ff;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 0.9rem;
    min-height: 40px;
  }
`;

const CancelButton = styled.button`
  padding: 10px 12px;
  font-weight: 700;
  color: #d9534f;
  border-radius: 8px;
  border: 1px solid #d9534f;
  cursor: pointer;
  background: #fff;
  transition: all 0.3s ease;
  min-height: 44px;
  
  &:hover {
    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(217, 83, 79, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 0.9rem;
    min-height: 40px;
  }
`;

const HistoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const HistoryCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgba(30, 144, 255, 0.1);
  border-left: 4px solid #1e90ff;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: ${slideIn} 0.4s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
    border-left-color: #0066cc;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const HistoryCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RouteIcon = styled.span`
  font-size: 1.3rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(30, 144, 255, 0.05);
  border-radius: 8px;
`;

const MetaIcon = styled.span`
  font-size: 0.9rem;
`;

const RouteTxt = styled.div`
  color: #222;
  font-weight: 800;
  font-size: 1.05rem;
  line-height: 1.3;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const Meta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: #555;
  font-weight: 600;
  font-size: 0.95rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 6px;
    font-size: 0.9rem;
  }
`;

const Done = styled.span`
  align-self: flex-start;
  background: linear-gradient(135deg, #e6f4ea 0%, #d4edda 100%);
  color: #18794e;
  border: 1px solid #bfe3cf;
  border-radius: 999px;
  padding: 4px 8px;
  font-weight: 800;
  font-size: 0.8rem;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 3px 6px;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
  
  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #f7f9fc 0%, #e9ecef 100%);
  border-radius: 10px;
  color: #333;
  font-weight: 600;
  line-height: 1.6;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.5s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  &:nth-child(5) { animation-delay: 0.5s; }
  &:nth-child(6) { animation-delay: 0.6s; }
  
  &:hover {
    transform: translateX(8px);
    background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
    box-shadow: 0 4px 15px rgba(30, 144, 255, 0.1);
    border-color: rgba(30, 144, 255, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 0.95rem;
  }
`;

const FeatureIcon = styled.span`
  font-size: 1.4rem;
  flex-shrink: 0;
`;

const SOSGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
  
  @media (max-width: 768px) {
  gap: 10px;
    margin: 14px 0;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  margin: 12px 0;
  }
`;

const SOSItem = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
  gap: 10px;
    padding: 10px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 8px;
  }
`;

const SOSInput = styled.input`
  padding: 12px 14px;
  font-size: 0.95rem;
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  outline: none;
  background-color: #ffffff;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
`;

const SOSActions = styled.div`
  display: flex;
  gap: 12px;
  margin: 16px 0;
  
  @media (max-width: 768px) {
  gap: 10px;
    margin: 14px 0;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    flex-direction: column;
    margin: 12px 0;
  }
`;

const AddButton = styled.button`
  flex: 1;
  padding: 10px 14px;
  font-weight: 700;
  color: #1e90ff;
  background: linear-gradient(135deg, #e7f0ff 0%, #d6ebff 100%);
  border: 1px solid #1e90ff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 44px;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #dbe9ff 0%, #c6dfff 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(30, 144, 255, 0.2);
  }
  
  &:disabled {
    background: #f0f4ff;
    cursor: not-allowed;
    color: #9bb7dd;
    transform: none;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 0.9rem;
    min-height: 40px;
  }
`;

const RemoveButton = styled(AddButton)`
  background: linear-gradient(135deg, #ffe7e7 0%, #ffd7d7 100%);
  border: 1px solid #d9534f;
  color: #d9534f;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ffd7d7 0%, #ffc7c7 100%);
    box-shadow: 0 4px 15px rgba(217, 83, 79, 0.2);
  }
`;

const SOSMessageLabel = styled.div`
  color: #6b7a90;
  font-weight: 700;
  font-size: 0.9rem;
  margin: 16px 0 8px 0;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin: 14px 0 6px 0;
  }
`;

const SOSMessage = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  font-size: 0.95rem;
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  outline: none;
  resize: none;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  font-family: inherit;
  min-height: 80px;
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  margin-bottom: 12px;
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 70px;
  }
`;

