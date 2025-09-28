import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [statsData, setStatsData] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Failed to fetch dashboard data");
        }
        const data = await response.json();
        setStatsData(data.stats || []);
        setRecentActivities(data.activities || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Container>Loading your dashboard...</Container>;
  if (error) return <Container>Error: {error}</Container>;

  return (
    <Container>
      <WelcomeMessage>Welcome back to EzyRide!</WelcomeMessage>
      <Intro>
        Ready to start your journey? Post a ride, search available rides, and manage bookings — all in one place.
      </Intro>

      <StatsSection>
        {statsData.map((stat) => (
          <StatCard key={stat.id}>
            <StatCount>{stat.count}</StatCount>
            <StatTitle>{stat.title}</StatTitle>
          </StatCard>
        ))}
      </StatsSection>

      <Actions>
        <ActionCard onClick={() => navigate("/home/post-ride")}>
          <ActionTitle>Post a Ride</ActionTitle>
          <ActionDesc>Offer a ride and share your journey.</ActionDesc>
        </ActionCard>

        <ActionCard onClick={() => navigate("/home/search-rides")}>
          <ActionTitle>Search Rides</ActionTitle>
          <ActionDesc>Find rides going your way.</ActionDesc>
        </ActionCard>

        {/* Passenger Center */}
        <ActionCard
          onClick={() => {
            console.log("Go Passenger Center");
            navigate("/home/passenger-center"); // matches App.js
          }}
        >
          <ActionTitle>Passenger Center</ActionTitle>
          <ActionDesc>View and manage your ride bookings.</ActionDesc>
        </ActionCard>

        <ActionCard onClick={() => navigate("/home/profile")}>
          <ActionTitle>Profile &amp; Reviews</ActionTitle>
          <ActionDesc>Update your profile and read reviews.</ActionDesc>
        </ActionCard>

        <ActionCard onClick={() => navigate("/home/my-posted-rides")}>
          <ActionTitle>My Posted Rides</ActionTitle>
          <ActionDesc>View and manage the rides you shared.</ActionDesc>
        </ActionCard>
      </Actions>

      <RecentActivitiesSection>
        <SectionTitle>Recent Activity</SectionTitle>
        {recentActivities.length === 0 ? (
          <NoActivity>No recent activity.</NoActivity>
        ) : (
          <ActivityList>
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id}>
                <ActivityDesc>{activity.description}</ActivityDesc>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityList>
        )}
      </RecentActivitiesSection>

      <FooterNote>
        © {new Date().getFullYear()} Share Your Ride. Connect and travel smarter.
      </FooterNote>
    </Container>
  );
};

export default Home;

/* Styled components */
const Container = styled.div`
  max-width: 900px;
  margin: 50px auto 80px;
  padding: 0 20px;
  font-family: "Poppins", sans-serif;
  text-align: center;
  
  @media (max-width: 768px) {
    margin: 30px auto 60px;
    padding: 0 15px;
  }
  
  @media (max-width: 480px) {
    margin: 20px auto 40px;
    padding: 0 12px;
  }
`;

const WelcomeMessage = styled.h1`
  font-size: 3rem;
  color: #1e90ff;
  font-weight: 900;
  margin-bottom: 15px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.4rem;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 10px;
  }
`;

const Intro = styled.p`
  font-size: 1.3rem;
  color: #555;
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin: 0 auto 30px;
    padding: 0 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin: 0 auto 25px;
    padding: 0 5px;
  }
`;

const StatsSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 55px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 20px;
    margin-bottom: 40px;
  }
  
  @media (max-width: 480px) {
    gap: 15px;
    margin-bottom: 30px;
    flex-direction: column;
    align-items: center;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  padding: 25px 30px;
  border-radius: 18px;
  box-shadow: 0 9px 30px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  flex: 1;
  max-width: 180px;
  cursor: default;
  user-select: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(30, 144, 255, 0.1);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 20px 25px;
    min-width: 120px;
    max-width: 160px;
  }
  
  @media (max-width: 480px) {
    padding: 18px 20px;
    min-width: 200px;
    max-width: 250px;
    width: 100%;
  }
`;

const StatCount = styled.div`
  font-size: 3.2rem;
  font-weight: 900;
  color: #1e90ff;
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.4rem;
  }
`;

const StatTitle = styled.div`
  color: #005bbb;
  font-weight: 700;
  font-size: 1.15rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    margin-bottom: 45px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 35px;
  }
`;

const ActionCard = styled.div`
  background: linear-gradient(135deg, #f5faff 0%, #eef7ff 100%);
  border-radius: 18px;
  padding: 30px 25px;
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  border: 1px solid rgba(30, 144, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(135deg, #e2f0ff 0%, #d6ebff 100%);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
    transform: translateY(-5px);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:active {
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 25px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 22px 18px;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

const ActionTitle = styled.h3`
  color: #005bbb;
  font-weight: 800;
  font-size: 1.5rem;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 6px;
  }
`;

const ActionDesc = styled.p`
  color: #333;
  font-weight: 500;
  font-size: 1.05rem;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const RecentActivitiesSection = styled.section`
  max-width: 700px;
  margin: 0 auto;
  text-align: left;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 10px;
  }
  
  @media (max-width: 480px) {
    padding: 0 5px;
  }
`;

const SectionTitle = styled.h2`
  color: #1e90ff;
  font-weight: 900;
  font-size: 2.2rem;
  margin-bottom: 28px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 22px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 18px;
  }
`;

const NoActivity = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #777;
  font-weight: 600;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 18px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 15px;
  }
`;

const ActivityList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

const ActivityItem = styled.li`
  background: linear-gradient(135deg, #f3f9ff 0%, #e8f4ff 100%);
  border-radius: 12px;
  padding: 16px 22px;
  margin-bottom: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  font-size: 1.05rem;
  border: 1px solid rgba(30, 144, 255, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateX(5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 768px) {
    padding: 14px 18px;
    margin-bottom: 12px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 12px 15px;
    margin-bottom: 10px;
    font-size: 0.9rem;
  }
`;

const ActivityDesc = styled.div`
  color: #333;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.4;
  
  @media (max-width: 480px) {
    margin-bottom: 4px;
  }
`;

const ActivityTime = styled.div`
  font-size: 0.9rem;
  color: #888;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const FooterNote = styled.footer`
  color: #888;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 60px;
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    margin-top: 45px;
    padding: 18px;
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 35px;
    padding: 15px;
    font-size: 0.8rem;
  }
`;
