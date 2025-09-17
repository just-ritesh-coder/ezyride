import React from "react";
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
           <StyledNavLink to="/home/passenger">Passenger Center</StyledNavLink>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </NavLinks>
      </NavBar>

      <MainContent>
        <Outlet />
      </MainContent>

      <Footer>© 2025 Share Your Ride. All rights reserved.</Footer>
    </>
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

  &:hover {
    transform: scale(1.05);
  }
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

  &.active {
    background-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
  }

  &:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.15);
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
  transition: background-color 0.3s;

  &:hover {
    background-color: #e84118;
  }
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
