import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const statsData = [
  { id: 1, title: "Rides Posted", count: 12 },
  { id: 2, title: "Upcoming Bookings", count: 5 },
  { id: 3, title: "Reviews Received", count: 8 },
];

const recentActivities = [
  {
    id: 1,
    type: "ride_posted",
    description: "You posted a ride from Mumbai to Pune",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "booking_confirmed",
    description: "Booking confirmed for ride Mumbai to Thane",
    time: "1 day ago",
  },
  {
    id: 3,
    type: "review_received",
    description: "You received a new review from Priya",
    time: "3 days ago",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <WelcomeMessage>Welcome back to EzyRide!</WelcomeMessage>
      <Intro>
        Ready to start your journey? Post a ride, search available rides, and manage your bookings—all in one place.
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

        <ActionCard onClick={() => navigate("/home/my-bookings")}>
          <ActionTitle>My Bookings</ActionTitle>
          <ActionDesc>View and manage your ride bookings.</ActionDesc>
        </ActionCard>

        <ActionCard onClick={() => navigate("/home/profile")}>
          <ActionTitle>Profile & Reviews</ActionTitle>
          <ActionDesc>Update your profile and read reviews.</ActionDesc>
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

      <FooterNote>© 2025 Share Your Ride. Connect and travel smarter.</FooterNote>
    </Container>
  );
};

const Container = styled.div`
  max-width: 900px;
  margin: 50px auto 80px;
  padding: 0 20px;
  font-family: "Poppins", sans-serif;
  text-align: center;
`;

const WelcomeMessage = styled.h1`
  font-size: 3rem;
  color: #1e90ff;
  font-weight: 900;
  margin-bottom: 15px;
`;

const Intro = styled.p`
  font-size: 1.3rem;
  color: #555;
  max-width: 600px;
  margin: 0 auto 40px;
`;

const StatsSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 55px;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`;

const StatCard = styled.div`
  background: #f0f7ff;
  padding: 25px 30px;
  border-radius: 18px;
  box-shadow: 0 9px 30px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  flex: 1;
  max-width: 180px;
  cursor: default;
  user-select: none;
`;

const StatCount = styled.div`
  font-size: 3.2rem;
  font-weight: 900;
  color: #1e90ff;
  margin-bottom: 5px;
`;

const StatTitle = styled.div`
  color: #005bbb;
  font-weight: 700;
  font-size: 1.15rem;
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
  margin-bottom: 60px;
`;

const ActionCard = styled.div`
  background-color: #f5faff;
  border-radius: 18px;
  padding: 30px 25px;
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    background-color: #e2f0ff;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
    transform: translateY(-5px);
  }
`;

const ActionTitle = styled.h3`
  color: #005bbb;
  font-weight: 800;
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const ActionDesc = styled.p`
  color: #333;
  font-weight: 500;
  font-size: 1.05rem;
`;

const RecentActivitiesSection = styled.section`
  max-width: 700px;
  margin: 0 auto;
  text-align: left;
`;

const SectionTitle = styled.h2`
  color: #1e90ff;
  font-weight: 900;
  font-size: 2.2rem;
  margin-bottom: 28px;
`;

const NoActivity = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #777;
  font-weight: 600;
`;

const ActivityList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

const ActivityItem = styled.li`
  background-color: #f3f9ff;
  border-radius: 12px;
  padding: 16px 22px;
  margin-bottom: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  font-size: 1.05rem;
`;

const ActivityDesc = styled.div`
  color: #333;
  font-weight: 600;
  margin-bottom: 6px;
`;

const ActivityTime = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

const FooterNote = styled.footer`
  color: #888;
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 60px;
  text-align: center;
`;

export default Home;
