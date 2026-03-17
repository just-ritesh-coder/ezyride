import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaCarSide, FaTicketAlt, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';

const DashboardOverview = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(res.data.metrics);
        setRecentActivity(res.data.recentActivity || []);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <Loader>Loading analytics...</Loader>;

  const cards = [
    { title: 'Total Registered Users', value: metrics?.totalUsers || 0, icon: <FaUsers />, color: 'blue' },
    { title: 'Total Rides Posted', value: metrics?.totalRides || 0, icon: <FaCarSide />, color: 'emerald' },
    { title: 'Total Bookings', value: metrics?.totalBookings || 0, icon: <FaTicketAlt />, color: 'purple' },
    { title: 'Pending KYC Reviews', value: metrics?.pendingKYC || 0, icon: <FaExclamationCircle />, color: 'amber' },
  ];

  return (
    <div>
      <Header>Dashboard Overview</Header>
      
      <CardsContainer>
        {cards.map((c, i) => (
          <MetricCard key={i} $color={c.color}>
            <IconWrapper $color={c.color}>
              {c.icon}
            </IconWrapper>
            <MetricInfo>
              <MetricTitle>{c.title}</MetricTitle>
              <MetricValue>{c.value.toLocaleString()}</MetricValue>
            </MetricInfo>
          </MetricCard>
        ))}
      </CardsContainer>
      
      <ChartsSection>
        <ChartCard>
          <CardHeader>
            <CardTitle>Ride Activity Over Time</CardTitle>
            <FilterSelect>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </FilterSelect>
          </CardHeader>
          <ChartPlaceholder>
            {/* Real Chart (e.g., Recharts) would go here */}
            <PlaceholderLine />
            <PlaceholderLine />
            <PlaceholderLine />
          </ChartPlaceholder>
        </ChartCard>

        <ActivityCard>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <ActivityList>
            {recentActivity.length === 0 ? (
              <ActivityItem>
                <ActivityDetails>
                  <ActivityText style={{ color: '#94a3b8' }}>No recent activity yet.</ActivityText>
                </ActivityDetails>
              </ActivityItem>
            ) : (
              recentActivity.map((item, index) => (
                <ActivityItem key={item.id || index}>
                  <ActivityIcon $type={item.type} />
                  <ActivityDetails>
                    <ActivityText dangerouslySetInnerHTML={{ __html: item.description }} />
                    <ActivityTime>{item.time}</ActivityTime>
                  </ActivityDetails>
                </ActivityItem>
              ))
            )}
          </ActivityList>
        </ActivityCard>
      </ChartsSection>
    </div>
  );
};

// Styled Components
const Loader = styled.div`
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-weight: 500;
`;

const Header = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 24px;
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const colorMap = {
  blue: { bg: 'rgba(19, 73, 236, 0.1)', icon: '#1349ec' },
  emerald: { bg: '#ecfdf5', icon: '#10b981' },
  purple: { bg: '#faf5ff', icon: '#a855f7' },
  amber: { bg: '#fffbeb', icon: '#f59e0b' },
};

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
  }
`;

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: ${({ $color }) => colorMap[$color]?.bg || '#f1f5f9'};
  color: ${({ $color }) => colorMap[$color]?.icon || '#64748b'};
`;

const MetricInfo = styled.div`
  flex: 1;
`;

const MetricTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 1.875rem;
  font-weight: 800;
  color: #0f172a;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CardTemplate = styled.div`
  background: white;
  border-radius: 12px; /* ROUND_EIGHT + internal standard */
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const ChartCard = styled(CardTemplate)``;
const ActivityCard = styled(CardTemplate)``;

const CardHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const FilterSelect = styled.select`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 0.875rem;
  outline: none;
`;

const ChartPlaceholder = styled.div`
  padding: 24px;
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.5) 100%);
`;

const PlaceholderLine = styled.div`
  height: 2px;
  width: 100%;
  background: #e2e8f0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 10%;
    width: 80%;
    height: 40px;
    background: linear-gradient(180deg, rgba(19,73,236,0.1) 0%, rgba(19,73,236,0) 100%);
    clip-path: polygon(0 100%, 20% 40%, 40% 60%, 60% 10%, 80% 80%, 100% 20%, 100% 100%);
    opacity: 0.5;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActivityItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $type }) => $type === 'ride' ? '#ecfdf5' : $type === 'booking' ? '#eff6ff' : '#f1f5f9'};
  flex-shrink: 0;
`;

const ActivityDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActivityText = styled.div`
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.4;
`;

const ActivityTime = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
`;

export default DashboardOverview;
