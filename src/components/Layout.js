import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
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

  /* Scroll Detection Logic */
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll Down -> Hide
        setVisible(false);
      } else {
        // Scroll Up -> Show
        setVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <NavBar $visible={visible}>
        <Logo to="/home">EzyRide</Logo>

        {/* Desktop Navigation */}
        <NavLinks>
          <StyledNavLink to="/home" end onClick={closeMobileMenu}>
            <FaHome /> Home
          </StyledNavLink>
          <StyledNavLink to="post-ride" onClick={closeMobileMenu}>
            <FaCar /> Post Ride
          </StyledNavLink>
          <StyledNavLink to="search-rides" onClick={closeMobileMenu}>
            <FaSearch /> Search
          </StyledNavLink>
          <StyledNavLink to="passenger-center" onClick={closeMobileMenu}>
            <FaTicketAlt /> Bookings
          </StyledNavLink>
          <StyledNavLink to="my-posted-rides" onClick={closeMobileMenu}>
            <FaListAlt /> My Rides
          </StyledNavLink>
          <ProfileLink to="profile" onClick={closeMobileMenu}>
            <FaUser />
          </ProfileLink>
          <LogoutButton onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </LogoutButton>
        </NavLinks>

        {/* Mobile Menu Button */}
        <MobileMenuButton
          onClick={toggleMobileMenu}
          isOpen={isMobileMenuOpen}
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
        >
          <MobileMenuHeader>
            <MobileLogo>EzyRide</MobileLogo>
            <CloseButton onClick={closeMobileMenu}><FaTimes /></CloseButton>
          </MobileMenuHeader>

          <MobileNavLinks>
            <MobileNavLink to="/home" end onClick={closeMobileMenu}>
              <MobileNavIcon><FaHome /></MobileNavIcon> Home
            </MobileNavLink>
            <MobileNavLink to="post-ride" onClick={closeMobileMenu}>
              <MobileNavIcon><FaCar /></MobileNavIcon> Post Ride
            </MobileNavLink>
            <MobileNavLink to="search-rides" onClick={closeMobileMenu}>
              <MobileNavIcon><FaSearch /></MobileNavIcon> Search Ride
            </MobileNavLink>
            <MobileNavLink to="passenger-center" onClick={closeMobileMenu}>
              <MobileNavIcon><FaTicketAlt /></MobileNavIcon> Passenger Center
            </MobileNavLink>
            <MobileNavLink to="my-posted-rides" onClick={closeMobileMenu}>
              <MobileNavIcon><FaListAlt /></MobileNavIcon> My Posted Rides
            </MobileNavLink>
            <MobileNavLink to="profile" onClick={closeMobileMenu}>
              <MobileNavIcon><FaUser /></MobileNavIcon> Profile
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

      <Footer>
        <p>© 2025 EzyRide. Connected Mobility.</p>
      </Footer>

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
    <SOSButton onClick={trigger} disabled={sending}>
      <SOSIcon>
        {sending ? <FaSpinner /> : <FaExclamationTriangle />}
      </SOSIcon>
      <SOSText>{sending ? "SENDING" : "SOS"}</SOSText>
    </SOSButton>
  );
};

/* Styled Components */

const NavBar = styled.nav`
  position: sticky;
  top: 10px;
  margin: 0 20px;
  padding: 15px 30px;
  background: ${({ theme }) => theme.colors.section.dark}; /* Dark pill for visibility */
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  border-radius: ${({ theme }) => theme.borders.radius.full};
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out;
  transform: ${({ $visible }) => $visible ? 'translateY(0)' : 'translateY(-150%)'};
  
  @media (max-width: 768px) {
    margin: 0;
    top: 0;
    border-radius: 0;
    border: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.glass.border};
    padding: 15px 20px;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.inverse};
  text-decoration: none;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.inverseSecondary};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.colors.text.inverseSecondary}; /* Light text on dark navbar */
  font-weight: 500;
  font-size: 0.95rem;
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.borders.radius.full};
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.dark};
    background: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(197, 237, 203, 0.4);
  }
  
  &.active {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text.dark};
    box-shadow: ${({ theme }) => theme.shadows.neon};
    font-weight: 700;
  }
`;

const ProfileLink = styled(StyledNavLink)`
  width: 40px;
  height: 40px;
  padding: 0;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
`;

const LogoutButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.error};
    color: white;
    transform: rotate(90deg);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  padding: 0;
  z-index: 1001;
  
  span {
    width: 100%;
    height: 2px;
    background: ${({ theme }) => theme.colors.text.inverse};
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  
  ${props => props.isOpen && `
    span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    span:nth-child(2) { opacity: 0; }
    span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
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
  background: rgba(0, 0, 0, 0.9); /* Strengthened solid overlay */
  z-index: 999;
  
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
  background: ${({ theme }) => theme.colors.background};
  border-left: 1px solid ${({ theme }) => theme.colors.glass.border};
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const MobileMenuHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MobileLogo = styled.div`
  font-weight: 800;
  font-size: 1.2rem;
  color: white;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
`;

const MobileNavLinks = styled.div`
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const MobileNavLink = styled(NavLink)`
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: ${({ theme }) => theme.colors.palette.tomThumb};
  text-decoration: none;
  font-weight: 600;
  border-left: 3px solid transparent;
  
  &.active {
    background: rgba(255, 255, 255, 0.05);
    color: ${({ theme }) => theme.colors.primary};
    border-left-color: ${({ theme }) => theme.colors.primary};
  }
`;

const MobileNavIcon = styled.span`
  width: 20px;
  display: flex;
  justify-content: center;
`;

const MobileLogoutButton = styled.button`
  margin-top: auto;
  padding: 15px 25px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 600;
  width: 100%;
  text-align: left;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const MainContent = styled.main`
  padding: 30px 20px;
  min-height: calc(100vh - 80px);
  max-width: 1200px;
  margin: 0 auto;
`;

const Footer = styled.footer`
  text-align: center;
  padding: 30px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.85rem;
  margin-top: auto;
`;

const SOSButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 100;
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
  font-weight: 700;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
  
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
  }
`;

const SOSIcon = styled.span`
  display: flex;
  align-items: center;
  
  svg {
    animation: ${props => props.sending ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SOSText = styled.span`
  letter-spacing: 1px;
`;

export default Layout;
