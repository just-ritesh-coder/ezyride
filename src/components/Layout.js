import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  FaHome,
  FaCar,
  FaSearch,
  FaUser,
  FaListAlt,
  FaTicketAlt,
  FaSignOutAlt,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner
} from "react-icons/fa";
import { API_BASE_URL } from "../utils/config";

const Layout = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <NavBar>
        <Logo to="/home">EzyRide</Logo>

        {/* Desktop Navigation */}
        <NavLinks>
          <StyledNavLink to="" end onClick={closeMobileMenu}>
            Home
          </StyledNavLink>
          <StyledNavLink to="post-ride" onClick={closeMobileMenu}>Post Ride</StyledNavLink>
          <StyledNavLink to="search-rides" onClick={closeMobileMenu}>Search Ride</StyledNavLink>
          <StyledNavLink to="profile" onClick={closeMobileMenu}>Profile</StyledNavLink>
          <StyledNavLink to="my-posted-rides" onClick={closeMobileMenu}>My Posted Rides</StyledNavLink>
          <StyledNavLink to="/home/passenger-center" onClick={closeMobileMenu}>Passenger Center</StyledNavLink>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </NavLinks>

        {/* Mobile Menu Button */}
        <MobileMenuButton
          onClick={toggleMobileMenu}
          isOpen={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </MobileMenuButton>
      </NavBar>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay isOpen={isMobileMenuOpen} onClick={closeMobileMenu}>
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClick={(e) => e.stopPropagation()}
          role="navigation"
          aria-label="Mobile navigation menu"
        >
          <MobileMenuHeader>
            <MobileLogo>EzyRide</MobileLogo>
            <CloseButton onClick={closeMobileMenu}><FaTimes /></CloseButton>
          </MobileMenuHeader>

          <MobileNavLinks>
            <MobileNavLink to="" end onClick={closeMobileMenu}>
              <MobileNavIcon><FaHome /></MobileNavIcon> Home
            </MobileNavLink>
            <MobileNavLink to="post-ride" onClick={closeMobileMenu}>
              <MobileNavIcon><FaCar /></MobileNavIcon> Post Ride
            </MobileNavLink>
            <MobileNavLink to="search-rides" onClick={closeMobileMenu}>
              <MobileNavIcon><FaSearch /></MobileNavIcon> Search Ride
            </MobileNavLink>
            <MobileNavLink to="profile" onClick={closeMobileMenu}>
              <MobileNavIcon><FaUser /></MobileNavIcon> Profile
            </MobileNavLink>
            <MobileNavLink to="my-posted-rides" onClick={closeMobileMenu}>
              <MobileNavIcon><FaListAlt /></MobileNavIcon> My Posted Rides
            </MobileNavLink>
            <MobileNavLink to="/home/passenger-center" onClick={closeMobileMenu}>
              <MobileNavIcon><FaTicketAlt /></MobileNavIcon> Passenger Center
            </MobileNavLink>
            <MobileLogoutButton onClick={handleLogout}>
              <MobileNavIcon><FaSignOutAlt /></MobileNavIcon> Logout
            </MobileLogoutButton>
          </MobileNavLinks>
        </MobileMenu>
      </MobileMenuOverlay>

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
      const res = await fetch(`${API_BASE_URL}/api/sos/trigger`, {
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
    <SOSButton
      onClick={trigger}
      disabled={sending}
      title="Send SOS to emergency contacts"
    >
      <SOSIcon>
        {sending ? <FaSpinner /> : <FaExclamationTriangle />}
      </SOSIcon>
      <SOSText>{sending ? "Sending..." : "SOS"}</SOSText>
    </SOSButton>
  );
};

const SOSButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background: linear-gradient(135deg, #ff3b30 0%, #e84118 100%);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  box-shadow: 0 8px 24px rgba(255, 59, 48, 0.4);
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  min-width: 80px;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(255, 59, 48, 0.5);
    background: linear-gradient(135deg, #e84118 0%, #c23616 100%);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    bottom: 15px;
    right: 15px;
    padding: 10px 16px;
    min-width: 70px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    bottom: 12px;
    right: 12px;
    padding: 8px 14px;
    min-width: 60px;
    font-size: 13px;
    gap: 6px;
  }
`;

const SOSIcon = styled.span`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
    ${props => props.sending ? 'animation: spin 1s linear infinite;' : ''}
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const SOSText = styled.span`
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const gradientAnim = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const NavBar = styled.nav`
  background: linear-gradient(270deg, #1e90ff, #005bbb, #3a8dff, #1e90ff);
  background-size: 600% 600%;
  animation: ${gradientAnim} 15s ease infinite;
  padding: 12px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
  
  @media (max-width: 768px) {
    padding: 10px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 15px;
  }
`;

const Logo = styled(Link)`
  color: white;
  font-weight: 900;
  font-size: 1.8rem;
  letter-spacing: 2px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover { 
    transform: scale(1.05); 
  }
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    letter-spacing: 1px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledNavLink = styled(NavLink)`
  color: white;
  font-weight: 600;
  font-size: 1rem;
  padding: 8px 14px;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  
  &.active { 
    background-color: rgba(255, 255, 255, 0.3); 
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.6); 
  }
  
  &:hover:not(.active) { 
    background-color: rgba(255, 255, 255, 0.15); 
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 6px 12px;
  }
`;

const LogoutButton = styled.button`
  padding: 8px 18px;
  background-color: #ff4757;
  color: white;
  border: none;
  font-weight: 700;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover { 
    background-color: #e84118; 
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 6px 14px;
    font-size: 0.9rem;
  }
`;

// Mobile Menu Components
const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  
  span {
    width: 100%;
    height: 3px;
    background: white;
    border-radius: 2px;
    transition: all 0.3s ease;
    transform-origin: center;
  }
  
  ${props => props.isOpen && `
    span:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }
    span:nth-child(2) {
      opacity: 0;
    }
    span:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }
  `}
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenuOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: ${props => props.isOpen ? fadeIn : 'none'} 0.3s ease;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100%;
  background: linear-gradient(135deg, #1e90ff 0%, #005bbb 100%);
  box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const MobileLogo = styled.div`
  color: white;
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: 1px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
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
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const MobileNavLinks = styled.div`
  padding: 20px 0;
`;

const MobileNavIcon = styled.span`
  font-size: 1.2rem;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const MobileNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 15px 20px;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
    border-left-color: white;
  }
  
  &:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.1);
    padding-left: 25px;
    
    ${MobileNavIcon} {
      transform: scale(1.1);
    }
  }
`;

const MobileLogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  background: #ff4757;
  color: white;
  border: none;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  
  ${MobileNavIcon} {
    font-size: 1.2rem;
    width: 24px;
  }
  
  &:hover {
    background-color: #e84118;
    padding-left: 25px;
    
    ${MobileNavIcon} {
      transform: scale(1.1);
    }
  }
`;

const MainContent = styled.main`
  padding: 30px 20px;
  min-height: calc(100vh - 110px);
  background-color: #f7f9fc;
  
  @media (max-width: 768px) {
    padding: 20px 15px;
    min-height: calc(100vh - 100px);
  }
  
  @media (max-width: 480px) {
    padding: 15px 12px;
    min-height: calc(100vh - 90px);
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 15px 10px;
  background: linear-gradient(135deg, #e3eaf3 0%, #d1d9e6 100%);
  color: #555;
  font-size: 14px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 6px;
    font-size: 12px;
  }
`;

export default Layout;
