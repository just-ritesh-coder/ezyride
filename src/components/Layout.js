import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <>
      <NavBar>
        <Logo href="/home">EzyRide</Logo>
        <NavLinks>
          <StyledNavLink to="" end>
            Home
          </StyledNavLink>
          <StyledNavLink to="post-ride">Post Ride</StyledNavLink>
          <StyledNavLink to="search-rides">Search Ride</StyledNavLink>
          <StyledNavLink to="profile">Profile</StyledNavLink>
          <StyledNavLink to="my-posted-rides">My Posted Rides</StyledNavLink>
          <StyledNavLink to="/home/passenger-center">Passenger Center</StyledNavLink>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </NavLinks>
      </NavBar>

      <MainContent>
        <Outlet />
      </MainContent>

      <Footer>© 2025 Share Your Ride. All rights reserved.</Footer>

      {/* Floating SOS button */}
      <SOSFloating />
    </>
  );
};

const SOSFloating = () => {
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem("authToken");

  const trigger = async () => {
    try {
      setSending(true);
      let coords = null;
      if (navigator.geolocation) {
        coords = await new Promise((resolve) =>
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 5000 }
          )
        );
      }
      const res = await fetch("/api/sos/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(coords || {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "SOS failed");
      alert(`SOS sent to ${data.notified} contact(s)`);
    } catch (e) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={trigger}
      disabled={sending}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1000,
        background: "#ff3b30",
        color: "#fff",
        border: "none",
        borderRadius: 999,
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        fontWeight: 800,
        cursor: "pointer",
      }}
      title="Send SOS to emergency contacts"
    >
      {sending ? "Sending..." : "SOS"}
    </button>
  );
};

const gradientAnim = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const NavBar = styled.nav`
  background: linear-gradient(270deg, #1e90ff, #005bbb, #3a8dff, #1e90ff);
  background-size: 600% 600%;
  animation: ${gradientAnim} 15s ease infinite;
  padding: 10px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Logo = styled.a`
  color: white;
  font-weight: 900;
  font-size: 1.8rem;
  letter-spacing: 2px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.3s ease;
  &:hover { transform: scale(1.05); }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
`;

const StyledNavLink = styled(NavLink)`
  color: white;
  font-weight: 600;
  font-size: 1rem;
  padding: 8px 14px;
  border-radius: 20px;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
  &.active { background-color: rgba(255, 255, 255, 0.3); box-shadow: 0 0 8px rgba(255, 255, 255, 0.6); }
  &:hover:not(.active) { background-color: rgba(255, 255, 255, 0.15); }
`;

const LogoutButton = styled.button`
  padding: 8px 18px;
  background-color: #ff4757;
  color: white;
  border: none;
  font-weight: 700;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover { background-color: #e84118; }
`;

const MainContent = styled.main`
  padding: 30px 20px;
  min-height: calc(100vh - 110px);
  background-color: #f7f9fc;
`;

const Footer = styled.footer`
  text-align: center;
  padding: 15px 10px;
  background-color: #e3eaf3;
  color: #555;
  font-size: 14px;
`;

export default Layout;
