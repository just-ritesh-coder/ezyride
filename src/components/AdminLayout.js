import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaUsers, FaCar, FaIdCard, FaChartBar, FaSignOutAlt, FaBars, FaTimes, FaSearch } from 'react-icons/fa';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <LayoutContainer>
      <MobileHeader>
        <Logo>EzyRide Admin</Logo>
        <MenuButton onClick={toggleSidebar}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </MenuButton>
      </MobileHeader>

      <Sidebar $isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo>EzyRide Admin</Logo>
        </SidebarHeader>

        <NavContainer>
          <SectionTitle>OVERVIEW</SectionTitle>
          <StyledNavLink to="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
            <FaChartBar /> Dashboard
          </StyledNavLink>

          <SectionTitle>MANAGEMENT</SectionTitle>
          <StyledNavLink to="/admin/kyc" onClick={() => setSidebarOpen(false)}>
             <FaIdCard /> KYC Approvals
          </StyledNavLink>
          <StyledNavLink to="/admin/users" onClick={() => setSidebarOpen(false)}>
             <FaUsers /> Users Directory
          </StyledNavLink>
          <StyledNavLink to="/admin/rides" onClick={() => setSidebarOpen(false)}>
             <FaCar /> Ride Matches
          </StyledNavLink>
        </NavContainer>

        <SidebarFooter>
          <BackButton onClick={() => navigate('/home')}>
             <FaHome /> Back to App
          </BackButton>
          <LogoutButton onClick={handleLogout}>
             <FaSignOutAlt /> Logout
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      <MainContent>
        <Topbar>
          <SearchContainer>
            <FaSearch color="#94a3b8" />
            <SearchInput placeholder="Search records, users, or rides..." />
          </SearchContainer>
          <AdminProfile>
            <Avatar>
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=1349ec&color=fff" alt="Admin" />
            </Avatar>
            <ProfileInfo>
              <ProfileName>Admin User</ProfileName>
              <ProfileRole>System Administrator</ProfileRole>
            </ProfileInfo>
          </AdminProfile>
        </Topbar>
        <ContentWrapper>
          <Outlet />
        </ContentWrapper>
      </MainContent>

      <Overlay $isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
    </LayoutContainer>
  );
};

// Styled Components
const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc; /* Lighter, cleaner background */
  font-family: 'Inter', sans-serif;
`;

const MobileHeader = styled.div`
  display: none;
  @media (max-width: 1024px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: 0;
    width: 100%;
    background: #1e293b;
    padding: 15px 20px;
    z-index: 50;
    color: white;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Sidebar = styled.aside`
  width: 280px;
  background-color: #0f172a; /* Deeper slate dark theme */
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  transition: transform 0.3s ease;

  @media (max-width: 1024px) {
    transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  }
`;

const SidebarHeader = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid #334155;
  @media (max-width: 1024px) { display: none; }
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 24px;
    background: #1349ec; /* primary blue */
    border-radius: 6px;
  }
`;

const NavContainer = styled.nav`
  padding: 24px 16px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 1px;
  margin-top: 16px;
  margin-bottom: 8px;
  padding-left: 12px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px; /* ROUND_EIGHT */
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: #1e293b;
    color: white;
  }

  &.active {
    background-color: #1349ec; /* Stitch Primary Color */
    color: white;
    box-shadow: 0 4px 12px rgba(19, 73, 236, 0.4); /* Glow effect */
  }
`;



const SidebarFooter = styled.div`
  padding: 20px 16px;
  border-top: 1px solid #334155;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid #475569;
  color: #e2e8f0;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #334155; }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: #ef4444;
  border: none;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #dc2626; }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px; 
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    margin-left: 0;
    margin-top: 60px; /* Space for mobile header */
  }
`;

const Topbar = styled.header`
  background: white;
  padding: 16px 32px;
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  @media (max-width: 1024px) { display: none; }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px; /* ROUND_EIGHT */
  padding: 8px 16px;
  width: 400px;
  gap: 10px;
  transition: all 0.2s;
  
  &:focus-within {
    border-color: #1349ec;
    background: white;
    box-shadow: 0 0 0 3px rgba(19, 73, 236, 0.1);
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-family: inherit;
  color: #1e293b;
  font-size: 0.95rem;
  
  &::placeholder {
    color: #94a3b8;
  }
`;



const AdminProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProfileName = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
`;

const ProfileRole = styled.span`
  font-size: 0.75rem;
  color: #64748b;
`;

const ContentWrapper = styled.div`
  padding: 32px;
  flex: 1;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: 1024px) {
    display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 90;
  }
`;

export default AdminLayout;
