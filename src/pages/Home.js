import React from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { 
  FaCar, 
  FaCalendarAlt, 
  FaStar, 
  FaSearch, 
  FaUser, 
  FaCog, 
  FaListAlt,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaRocket,
  FaArrowRight,
  FaSpinner
} from "react-icons/fa";
import { 
  HiOutlineSparkles,
  HiOutlineClock
} from "react-icons/hi";

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const Home = () => {
  const navigate = useNavigate();

  const [statsData, setStatsData] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [animatedStats, setAnimatedStats] = React.useState({});

  // Get personalized greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Animate stats counter
  React.useEffect(() => {
    if (statsData.length > 0) {
      statsData.forEach((stat) => {
        let current = 0;
        const target = stat.count;
        const increment = target / 30;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setAnimatedStats((prev) => ({
            ...prev,
            [stat.id]: Math.floor(current),
          }));
        }, 50);
        return () => clearInterval(timer);
      });
    }
  }, [statsData]);

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

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner><FaSpinner /></LoadingSpinner>
          <LoadingText>Loading your dashboard...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorCard>
          <ErrorIcon><FaExclamationTriangle /></ErrorIcon>
          <ErrorText>{error}</ErrorText>
        </ErrorCard>
      </Container>
    );
  }

  return (
    <Container>
      <HeroSection>
        <Greeting>
          {getGreeting()}! 👋
        </Greeting>
        <WelcomeMessage>Welcome back to EzyRide</WelcomeMessage>
        <Intro>
          Ready to start your journey? Post a ride, search available rides, and manage bookings — all in one place.
        </Intro>
      </HeroSection>

      <StatsSection>
        {statsData.map((stat, index) => {
          const icons = {
            1: <FaCar />,
            2: <FaCalendarAlt />,
            3: <FaStar />
          };
          return (
            <StatCard key={stat.id} delay={index * 0.1}>
              <StatIcon>{icons[stat.id] || <HiOutlineSparkles />}</StatIcon>
              <StatCount>
                {animatedStats[stat.id] !== undefined ? animatedStats[stat.id] : stat.count}
              </StatCount>
              <StatTitle>{stat.title}</StatTitle>
              <StatSubtitle>Total {stat.title.toLowerCase()}</StatSubtitle>
            </StatCard>
          );
        })}
      </StatsSection>

      <QuickActionsSection>
        <SectionHeader>
          <SectionTitle>Quick Actions</SectionTitle>
          <SectionSubtitle>Get started with these options</SectionSubtitle>
        </SectionHeader>
        <Actions>
          <ActionCard onClick={() => navigate("/home/post-ride")} delay={0}>
            <ActionIcon><FaCar /></ActionIcon>
            <ActionContent>
              <ActionTitle>Post a Ride</ActionTitle>
              <ActionDesc>Offer a ride and share your journey with others.</ActionDesc>
            </ActionContent>
            <ActionArrow><FaArrowRight /></ActionArrow>
          </ActionCard>

          <ActionCard onClick={() => navigate("/home/search-rides")} delay={0.1}>
            <ActionIcon><FaSearch /></ActionIcon>
            <ActionContent>
              <ActionTitle>Search Rides</ActionTitle>
              <ActionDesc>Find rides going your way and book instantly.</ActionDesc>
            </ActionContent>
            <ActionArrow><FaArrowRight /></ActionArrow>
          </ActionCard>

          <ActionCard
            onClick={() => navigate("/home/passenger-center")}
            delay={0.2}
          >
            <ActionIcon><FaUser /></ActionIcon>
            <ActionContent>
              <ActionTitle>Passenger Center</ActionTitle>
              <ActionDesc>View and manage all your ride bookings.</ActionDesc>
            </ActionContent>
            <ActionArrow><FaArrowRight /></ActionArrow>
          </ActionCard>

          <ActionCard onClick={() => navigate("/home/profile")} delay={0.3}>
            <ActionIcon><FaCog /></ActionIcon>
            <ActionContent>
              <ActionTitle>Profile &amp; Reviews</ActionTitle>
              <ActionDesc>Update your profile and read reviews.</ActionDesc>
            </ActionContent>
            <ActionArrow><FaArrowRight /></ActionArrow>
          </ActionCard>

          <ActionCard onClick={() => navigate("/home/my-posted-rides")} delay={0.4}>
            <ActionIcon><FaListAlt /></ActionIcon>
            <ActionContent>
              <ActionTitle>My Posted Rides</ActionTitle>
              <ActionDesc>View and manage the rides you shared.</ActionDesc>
            </ActionContent>
            <ActionArrow><FaArrowRight /></ActionArrow>
          </ActionCard>
        </Actions>
      </QuickActionsSection>

      <RecentActivitiesSection>
        <SectionHeader>
          <SectionTitle>Recent Activity</SectionTitle>
          <SectionSubtitle>Your latest ride postings</SectionSubtitle>
        </SectionHeader>
        {recentActivities.length === 0 ? (
          <EmptyState>
            <EmptyIcon><HiOutlineSparkles /></EmptyIcon>
            <EmptyTitle>No recent activity</EmptyTitle>
            <EmptyDesc>Start by posting your first ride!</EmptyDesc>
            <EmptyButton onClick={() => navigate("/home/post-ride")}>
              <FaRocket style={{ marginRight: '8px', display: 'inline-block' }} />
              Post Your First Ride
            </EmptyButton>
          </EmptyState>
        ) : (
          <ActivityList>
            {recentActivities.map((activity, index) => (
              <ActivityItem key={activity.id} delay={index * 0.1}>
                <ActivityIcon><FaMapMarkerAlt /></ActivityIcon>
                <ActivityContent>
                  <ActivityDesc>{activity.description}</ActivityDesc>
                  <ActivityTime>
                    <HiOutlineClock style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                    {activity.time}
                  </ActivityTime>
                </ActivityContent>
                <ActivityBadge>New</ActivityBadge>
              </ActivityItem>
            ))}
          </ActivityList>
        )}
      </RecentActivitiesSection>

      <FooterNote>
        <FooterContent>
          <FooterText>© {new Date().getFullYear()} EzyRide</FooterText>
          <FooterTagline>Connect and travel smarter</FooterTagline>
        </FooterContent>
      </FooterNote>
    </Container>
  );
};

export default Home;

/* Styled components */
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 24px 80px;
  font-family: "Poppins", sans-serif;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  
  @media (max-width: 768px) {
    padding: 20px 16px 60px;
  }
  
  @media (max-width: 480px) {
    padding: 16px 12px 50px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e90ff;
  
  svg {
    width: 100%;
    height: 100%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: #666;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ErrorCard = styled.div`
  background: linear-gradient(135deg, #ffe5e5 0%, #ffd6d6 100%);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  border: 1px solid rgba(217, 83, 79, 0.2);
  box-shadow: 0 8px 24px rgba(217, 83, 79, 0.15);
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  color: #d9534f;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const ErrorText = styled.div`
  color: #d9534f;
  font-size: 1.1rem;
  font-weight: 700;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 50px;
  animation: ${fadeInUp} 0.6s ease-out;
  
  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 30px;
  }
`;

const Greeting = styled.div`
  font-size: 1.3rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const WelcomeMessage = styled.h1`
  font-size: 3.5rem;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
  margin-bottom: 16px;
  line-height: 1.2;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
  
  @media (max-width: 768px) {
    font-size: 2.8rem;
    margin-bottom: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 2.2rem;
    margin-bottom: 12px;
  }
`;

const Intro = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.6;
  font-weight: 500;
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;
  
  @media (max-width: 768px) {
    font-size: 1.05rem;
    padding: 0 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    padding: 0 5px;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    gap: 20px;
    margin-bottom: 50px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 40px;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 32px 28px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: default;
  user-select: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(30, 144, 255, 0.1);
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out ${({ delay }) => delay || 0}s both;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1e90ff, #0066cc, #1e90ff);
    background-size: 200% 100%;
    animation: ${shimmer} 3s infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(30, 144, 255, 0.05) 0%, transparent 70%);
    transition: transform 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 60px rgba(30, 144, 255, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1);
    border-color: rgba(30, 144, 255, 0.3);
  }
  
  &:hover::after {
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    padding: 28px 24px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 20px;
  }
`;

const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 12px;
  animation: ${float} 3s ease-in-out infinite;
  color: #1e90ff;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 10px;
  }
`;

const StatCount = styled.div`
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

const StatTitle = styled.div`
  color: #1e90ff;
  font-weight: 800;
  font-size: 1.1rem;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const StatSubtitle = styled.div`
  color: #888;
  font-weight: 500;
  font-size: 0.85rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const QuickActionsSection = styled.section`
  margin-bottom: 60px;
  animation: ${fadeInUp} 0.6s ease-out 0.4s both;
  
  @media (max-width: 768px) {
    margin-bottom: 50px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 40px;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  @media (max-width: 480px) {
    margin-bottom: 24px;
  }
`;

const SectionSubtitle = styled.div`
  color: #888;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 8px;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ActionCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  border: 1px solid rgba(30, 144, 255, 0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 20px;
  animation: ${fadeInUp} 0.6s ease-out ${({ delay }) => delay || 0}s both;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.6s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1e90ff, #0066cc);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
    box-shadow: 0 16px 48px rgba(30, 144, 255, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-6px) scale(1.02);
    border-color: rgba(30, 144, 255, 0.3);
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover::after {
    transform: scaleX(1);
  }
  
  &:active {
    transform: translateY(-3px) scale(1.01);
  }
  
  @media (max-width: 768px) {
    padding: 24px 20px;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 18px;
    gap: 14px;
  }
`;

const ActionIcon = styled.div`
  font-size: 2.8rem;
  flex-shrink: 0;
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${({ delay }) => delay || 0}s;
  color: #1e90ff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 4px rgba(30, 144, 255, 0.2));
  }
  
  ${ActionCard}:hover & {
    color: #0066cc;
    transform: scale(1.1);
  }
  
  @media (max-width: 480px) {
    font-size: 2.4rem;
  }
`;

const ActionContent = styled.div`
  flex: 1;
  text-align: left;
`;

const ActionArrow = styled.div`
  font-size: 1.8rem;
  color: #1e90ff;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  ${ActionCard}:hover & {
    transform: translateX(8px);
    color: #0066cc;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const ActionTitle = styled.h3`
  color: #1e90ff;
  font-weight: 800;
  font-size: 1.4rem;
  margin-bottom: 8px;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
`;

const ActionDesc = styled.p`
  color: #666;
  font-weight: 500;
  font-size: 0.95rem;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const RecentActivitiesSection = styled.section`
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeInUp} 0.6s ease-out 0.5s both;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SectionTitle = styled.h2`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
  font-size: 2.4rem;
  margin-bottom: 8px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.7rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 40px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  border: 2px dashed rgba(30, 144, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  
  @media (max-width: 768px) {
    padding: 50px 30px;
  }
  
  @media (max-width: 480px) {
    padding: 40px 20px;
  }
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  animation: ${float} 3s ease-in-out infinite;
  color: #1e90ff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  
  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4px 8px rgba(30, 144, 255, 0.3));
  }
  
  @media (max-width: 480px) {
    font-size: 3rem;
    margin-bottom: 16px;
  }
`;

const EmptyTitle = styled.h3`
  color: #1e90ff;
  font-weight: 800;
  font-size: 1.5rem;
  margin-bottom: 12px;
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const EmptyDesc = styled.p`
  color: #666;
  font-size: 1.05rem;
  margin-bottom: 24px;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-bottom: 20px;
  }
`;

const EmptyButton = styled.button`
  padding: 14px 28px;
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(30, 144, 255, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    padding: 12px 24px;
    font-size: 0.95rem;
  }
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const ActivityItem = styled.li`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(30, 144, 255, 0.1);
  border-left: 4px solid #1e90ff;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  animation: ${slideInRight} 0.5s ease-out ${({ delay }) => delay || 0}s both;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: translateX(8px) translateY(-2px);
    box-shadow: 0 12px 32px rgba(30, 144, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
    border-left-color: #0066cc;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  @media (max-width: 768px) {
    padding: 18px 20px;
    gap: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 16px 18px;
    gap: 12px;
    flex-wrap: wrap;
  }
`;

const ActivityIcon = styled.div`
  font-size: 1.8rem;
  flex-shrink: 0;
  color: #1e90ff;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(30, 144, 255, 0.1) 0%, rgba(0, 102, 204, 0.1) 100%);
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  ${ActivityItem}:hover & {
    background: linear-gradient(135deg, rgba(30, 144, 255, 0.2) 0%, rgba(0, 102, 204, 0.2) 100%);
    transform: scale(1.1);
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    padding: 10px;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ActivityBadge = styled.span`
  background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(30, 144, 255, 0.3);
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 3px 8px;
  }
`;

const ActivityDesc = styled.div`
  color: #222;
  font-weight: 700;
  margin-bottom: 6px;
  line-height: 1.5;
  font-size: 1.05rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    margin-bottom: 4px;
  }
`;

const ActivityTime = styled.div`
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const FooterNote = styled.footer`
  margin-top: 80px;
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  border: 1px solid rgba(30, 144, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  
  @media (max-width: 768px) {
    margin-top: 60px;
    padding: 24px 18px;
  }
  
  @media (max-width: 480px) {
    margin-top: 50px;
    padding: 20px 16px;
  }
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FooterText = styled.div`
  color: #1e90ff;
  font-weight: 800;
  font-size: 1rem;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const FooterTagline = styled.div`
  color: #888;
  font-weight: 500;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;


