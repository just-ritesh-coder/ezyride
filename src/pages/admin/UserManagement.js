import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaSearch, FaEllipsisV } from "react-icons/fa";
import { format } from "date-fns";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search, role, and KYC
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesKyc = kycFilter === 'all' || (user.kyc?.status || 'none') === kycFilter;
    return matchesSearch && matchesRole && matchesKyc;
  });

  return (
    <Container>
      <PageHeader>
        <Title>Platform Users Directory</Title>
        <FilterControls>
          <SearchBox>
            <FaSearch color="#94a3b8" />
            <input 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">Role: All</option>
            <option value="admin">Role: Admin</option>
            <option value="user">Role: User</option>
          </FilterSelect>
          <FilterSelect value={kycFilter} onChange={(e) => setKycFilter(e.target.value)}>
            <option value="all">KYC: All</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="none">None</option>
          </FilterSelect>
        </FilterControls>
      </PageHeader>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>User Information</th>
              <th>Contact Details</th>
              <th>Role</th>
              <th>KYC Status</th>
              <th>Joined Date</th>
              <th>Vehicle</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  {users.length === 0 ? 'Loading users...' : 'No users match the current filters.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <td>
                    <UserInfo>
                      <Avatar><img src={user.profilePicture || `https://ui-avatars.com/api/?name=${(user.fullName || 'U').replace(' ', '+')}&background=random`} alt="Avatar"/></Avatar>
                      <div>
                        <strong>{user.fullName}</strong>
                        <div className="subtext">{user.email}</div>
                      </div>
                    </UserInfo>
                  </td>
                  <td>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>{user.phone || 'N/A'}</span>
                  </td>
                  <td>
                    <RoleBadge $role={user.role}>{(user.role || 'user').toUpperCase()}</RoleBadge>
                  </td>
                  <td>
                    <KycBadge $status={user.kyc?.status || 'none'}>
                      {(user.kyc?.status || 'NONE').toUpperCase()}
                    </KycBadge>
                  </td>
                  <td>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>
                      {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>{user.vehicleType || 'None'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <ActionMenu>
                      <FaEllipsisV color="#94a3b8" />
                    </ActionMenu>
                  </td>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

// --- Styled Components ---

const Container = styled.div``;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const FilterControls = styled.div`
  display: flex;
  gap: 12px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px; /* ROUND_EIGHT */
  padding: 8px 12px;
  width: 250px;
  
  input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    color: #1e293b;
    font-family: inherit;
    font-size: 0.85rem;
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  font-size: 0.85rem;
  font-family: inherit;
  font-weight: 500;
  outline: none;
  cursor: pointer;
`;



const TableContainer = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 16px 24px;
    background: #f8fafc;
    color: #64748b;
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  td {
    padding: 16px 24px;
    vertical-align: middle;
    color: #334155;
    font-size: 0.9rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  strong {
    color: #0f172a;
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  .subtext {
    color: #64748b;
    font-size: 0.8rem;
    margin-top: 2px;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RoleBadge = styled.span`
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  background: ${({ $role }) => ($role === 'admin' ? '#eff6ff' : '#f1f5f9')};
  color: ${({ $role }) => ($role === 'admin' ? '#1349ec' : '#475569')};
`;

const KycBadge = styled.span`
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  background: ${({ $status }) => 
    $status === 'verified' ? '#ecfdf5' : 
    $status === 'pending' ? '#fffbeb' : 
    $status === 'rejected' ? '#fef2f2' : 
    '#f1f5f9'
  };
  color: ${({ $status }) => 
    $status === 'verified' ? '#10b981' : 
    $status === 'pending' ? '#f59e0b' : 
    $status === 'rejected' ? '#ef4444' : 
    '#475569'
  };
`;



const ActionMenu = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #e2e8f0;
  }
`;

export default UserManagement;
