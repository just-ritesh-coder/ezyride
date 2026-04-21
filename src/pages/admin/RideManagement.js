import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaSearch, FaArrowRight, FaMapMarkerAlt, FaCarSide, FaEye, FaTimesCircle } from "react-icons/fa";
import { format } from "date-fns";
import axios from "axios";
import { API_BASE_URL } from "../../utils/config";

const RideManagement = () => {
  const [rides, setRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/admin/rides`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRides(res.data.rides || []);
      } catch (err) {
        console.error("Failed to fetch rides", err);
      }
    };
    fetchRides();
  }, []);

  // Filter rides based on search and status
  const filteredRides = rides.filter(ride => {
    const matchesSearch = !searchTerm ||
      ride.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.postedBy?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container>
      <PageHeader>
        <Title>Active & Historic Rides</Title>
        <FilterControls>
          <SearchBox>
            <FaSearch color="#94a3b8" />
            <input 
              placeholder="Search origin, destination, or driver..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Status: All</option>
            <option value="posted">Posted</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>
        </FilterControls>
      </PageHeader>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Ride ID / Driver</th>
              <th>Route Map</th>
              <th>Date & Time</th>
              <th>Seats Available</th>
              <th>Price/Seat</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRides.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  {rides.length === 0 ? 'Loading rides...' : 'No rides match the current filters.'}
                </td>
              </tr>
            ) : (
              filteredRides.map((ride) => (
                <TableRow key={ride._id}>
                  <td>
                    <DriverInfo>
                      <Avatar><FaCarSide color="#64748b" /></Avatar>
                      <div>
                        <strong>{ride.postedBy?.fullName || 'Unknown Driver'}</strong>
                        <div className="subtext">{ride._id?.substring(0, 10)}...</div>
                      </div>
                    </DriverInfo>
                  </td>
                  <td>
                    <RouteDisplay>
                      <LocationBadge>
                        <FaMapMarkerAlt color="#ef4444" size={10} />
                        <span className="truncate">{ride.from}</span>
                      </LocationBadge>
                      <FaArrowRight color="#cbd5e1" size={12} />
                      <LocationBadge>
                        <FaMapMarkerAlt color="#10b981" size={10} />
                        <span className="truncate">{ride.to}</span>
                      </LocationBadge>
                    </RouteDisplay>
                  </td>
                  <td>
                    <div style={{ color: '#0f172a', fontWeight: '500' }}>
                      {ride.date ? format(new Date(ride.date), "MMM dd, yyyy") : 'N/A'}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {ride.date ? format(new Date(ride.date), "h:mm a") : ''}
                    </div>
                  </td>
                  <td>
                    <SeatsDisplay>
                      {ride.seatsAvailable}
                    </SeatsDisplay>
                  </td>
                  <td>
                    <PriceDisplay>₹{ride.pricePerSeat}</PriceDisplay>
                  </td>
                  <td>
                    <StatusBadge $status={ride.status}>
                      {(ride.status || 'posted').toUpperCase()}
                    </StatusBadge>
                  </td>
                  <td>
                    <ActionGroup>
                      <ActionButton $variant="primary">
                        <FaEye /> View
                      </ActionButton>
                      {ride.status === 'posted' && (
                        <ActionIcon $variant="danger" title="Cancel Ride">
                          <FaTimesCircle />
                        </ActionIcon>
                      )}
                    </ActionGroup>
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
  border-radius: 8px;
  padding: 8px 12px;
  width: 280px;
  
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
  
  &:hover { background: #f8fafc; }
  &:last-child { border-bottom: none; }
  
  td {
    padding: 16px 24px;
    vertical-align: middle;
    color: #334155;
    font-size: 0.9rem;
  }
`;

const DriverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  strong {
    color: #0f172a;
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  .subtext {
    color: #94a3b8;
    font-size: 0.75rem;
    font-family: monospace;
    margin-top: 2px;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
`;

const RouteDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 300px;
`;

const LocationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #334155;
  font-weight: 500;
  max-width: 120px;
  
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SeatsDisplay = styled.div`
  font-weight: 600;
  color: #0f172a;
  
  .text-gray {
    color: #94a3b8;
    font-weight: 400;
  }
`;

const PriceDisplay = styled.div`
  font-weight: 700;
  color: #10b981;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  
  background: ${({ $status }) => 
    $status === 'completed' ? '#ecfdf5' : 
    $status === 'ongoing' ? '#eff6ff' : 
    $status === 'cancelled' ? '#fef2f2' : 
    '#f1f5f9'
  };
  
  color: ${({ $status }) => 
    $status === 'completed' ? '#10b981' : 
    $status === 'ongoing' ? '#3b82f6' : 
    $status === 'cancelled' ? '#ef4444' : 
    '#64748b'
  };
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1349ec;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
  }
`;

const ActionIcon = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: ${({ $variant }) => ($variant === 'danger' ? '#ef4444' : '#94a3b8')};
  cursor: pointer;
  padding: 6px;
  font-size: 1.1rem;
  border-radius: 4px;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ $variant }) => ($variant === 'danger' ? '#fef2f2' : '#f1f5f9')};
  }
`;

export default RideManagement;
