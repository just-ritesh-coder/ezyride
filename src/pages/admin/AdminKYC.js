import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import styled from "styled-components";
import { API_BASE_URL } from "../../utils/config";
import { FaEye, FaCheck, FaTimes, FaSearch, FaFilter } from "react-icons/fa";

const AdminKYC = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async () => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending applications");
    } finally {
      setLoading(false);
    }
  };

  const handleDecide = async (userId, decision) => {
    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/admin/kyc/${userId}`, { status: decision }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
      setExpandedUser(null);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to mark as ${decision}`);
    }
  };

  if (loading) return <Loader>Loading pending applications...</Loader>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <Container>
      <PageHeader>
        <Title>Pending KYC Applications</Title>
        <FilterControls>
          <SearchBox>
            <FaSearch color="#94a3b8" />
            <input placeholder="Search applicants..." />
          </SearchBox>
          <FilterButton>
            <FaFilter /> Filter
          </FilterButton>
        </FilterControls>
      </PageHeader>

      <TableContainer>
        {pendingUsers.length === 0 ? (
          <EmptyState>
            <span style={{ fontSize: '2rem', marginBottom: '10px' }}>📁</span>
            <h3>All caught up!</h3>
            <p>There are no pending KYC applications right now.</p>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Email / Phone</th>
                <th>Vehicle Type</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(user => (
                <React.Fragment key={user._id}>
                  <TableRow $isOpen={expandedUser === user._id}>
                    <td>
                      <strong>{user.fullName}</strong>
                    </td>
                    <td>
                      <div>{user.email}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{user.phone}</div>
                    </td>
                    <td>
                      <Badge $type="neutral">{user.vehicleType || 'Not Specified'}</Badge>
                    </td>
                    <td>
                      {user.kyc?.submittedAt ? format(new Date(user.kyc.submittedAt), "MMM d, yyyy") : 'N/A'}
                    </td>
                    <td>
                      <Badge $type="pending">Pending</Badge>
                    </td>
                    <td>
                      <ActionGroup>
                        <ActionButton 
                          $variant="primary" 
                          onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                        >
                          <FaEye /> {expandedUser === user._id ? 'Close' : 'Review'}
                        </ActionButton>
                      </ActionGroup>
                    </td>
                  </TableRow>
                  
                  {expandedUser === user._id && (
                    <ExpandedRow>
                      <td colSpan="6">
                        <ReviewPanel>
                          <DocsGrid>
                            <DocItem>
                              <p>Aadhaar Front</p>
                              <img src={`${API_BASE_URL}/${user.kyc?.documents?.aadhaarFront}`} alt="Front" />
                            </DocItem>
                            <DocItem>
                              <p>Aadhaar Back</p>
                              <img src={`${API_BASE_URL}/${user.kyc?.documents?.aadhaarBack}`} alt="Back" />
                            </DocItem>
                            <DocItem>
                              <p>Selfie Portrait</p>
                              <img src={`${API_BASE_URL}/${user.kyc?.documents?.selfie}`} alt="Selfie" />
                            </DocItem>
                          </DocsGrid>
                          
                          <DecisionFooter>
                            <ScoreText $risk={user.kyc?.matchScore < 80}>
                              <strong>System Confidence Score:</strong> {user.kyc?.matchScore || 'N/A'}%
                            </ScoreText>
                            <DecisionButtons>
                              <RejectButton onClick={() => handleDecide(user._id, 'rejected')}>
                                <FaTimes /> Reject
                              </RejectButton>
                              <ApproveButton onClick={() => handleDecide(user._id, 'verified')}>
                                <FaCheck /> Approve
                              </ApproveButton>
                            </DecisionButtons>
                          </DecisionFooter>
                        </ReviewPanel>
                      </td>
                    </ExpandedRow>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        )}
      </TableContainer>
    </Container>
  );
};

// --- Styled Components ---

const Container = styled.div``;

const Loader = styled.div`
  text-align: center;
  padding: 40px;
  color: #64748b;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #ef4444;
  background: #fef2f2;
  border-radius: 8px;
`;

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
  border-radius: 6px;
  padding: 8px 12px;
  width: 250px;
  
  input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    color: #1e293b;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 16px;
  color: #475569;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #f8fafc;
  }
`;

const TableContainer = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  
  h3 { color: #1e293b; margin: 0 0 8px 0; }
  p { margin: 0; }
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
  background: ${({ $isOpen }) => ($isOpen ? '#f8fafc' : 'white')};
  transition: background 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
  
  td {
    padding: 16px 24px;
    vertical-align: middle;
    color: #334155;
    font-size: 0.9rem;
  }
`;

const ExpandedRow = styled.tr`
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  
  td {
    padding: 0;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  background: ${({ $type }) => 
    $type === 'pending' ? '#fffbeb' : 
    $type === 'neutral' ? '#f1f5f9' : 
    '#f8fafc'
  };
  
  color: ${({ $type }) => 
    $type === 'pending' ? '#f59e0b' : 
    $type === 'neutral' ? '#475569' : 
    '#000'
  };
  
  border: 1px solid ${({ $type }) => 
    $type === 'pending' ? '#fde68a' : 
    $type === 'neutral' ? '#e2e8f0' : 
    'transparent'
  };
`;

const ActionGroup = styled.div`
  display: flex;
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

const ReviewPanel = styled.div`
  padding: 24px;
  background: white;
  margin: 16px 24px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
`;

const DocsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
`;

const DocItem = styled.div`
  text-align: center;
  
  p {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    margin: 0 0 8px 0;
  }
  
  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
  }
`;

const DecisionFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
`;

const ScoreText = styled.div`
  font-size: 0.95rem;
  color: ${({ $risk }) => ($risk ? '#ef4444' : '#10b981')};
  background: ${({ $risk }) => ($risk ? '#fef2f2' : '#ecfdf5')};
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid ${({ $risk }) => ($risk ? '#fecaca' : '#a7f3d0')};
`;

const DecisionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ApproveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover { background: #059669; }
`;

const RejectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover { background: #fef2f2; }
`;

export default AdminKYC;
