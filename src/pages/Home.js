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
import { API_BASE_URL } from "../utils/config";

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Home = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [animatedStats, setAnimatedStats] = React.useState({});

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  React.useEffect(() => {
    if (statsData.length > 0) {
      statsData.forEach((stat) => {
        let current = 0;
        const target = stat.count;
        const increment = Math.max(1, target / 30);
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
        const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to load dashboard");

        const data = await response.json();
        setStatsData(data.stats || []);
        setRecentActivities(data.activities || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <Container>
      {/* 1. Hero Card - Large Rounded Block */}
      <HeroCard>
        <HeroContent>
          <Greeting badge>{getGreeting()}</Greeting>
          <HeroTitle>
            Smart Travel, <br />
            <GradientSpan>Made Easy.</GradientSpan>
          </HeroTitle>
          <HeroText>
            Share rides, split costs, and travel comfortably with verified professionals.
            The smartest way to commute.
          </HeroText>
        </HeroContent>
        <HeroVisual>
          {/* Abstract Visual / Illustration placeholder */}
          <VisualCircle size="300px" color="rgba(210, 233, 213, 0.1)" />
          <VisualCircle size="180px" color="rgba(146, 187, 171, 0.2)" offset />
        </HeroVisual>
      </HeroCard>

      {/* 2. Stats Section - Horizontal Bento Grid */}
      <StatsSection>
        {statsData.map((stat, index) => (
          <BentoCard key={stat.id} delay={index} variant={index}>
            <StatHeader>
              <StatIconBox variant={index}>
                {stat.id === 1 && <FaCar />}
                {stat.id === 2 && <FaCalendarAlt />}
                {stat.id === 3 && <FaStar />}
              </StatIconBox>
              <StatValue>
                {animatedStats[stat.id] !== undefined ? animatedStats[stat.id] : stat.count}
              </StatValue>
            </StatHeader>
            <StatLabel>{stat.title}</StatLabel>
          </BentoCard>
        ))}
      </StatsSection>

      {/* 2.5 New Features Grid - "Why Choose Us" Context */}
      <SectionTitle>Why Choose EzyRide</SectionTitle>
      <FeaturesGrid>
        <FeatureCard variant={0}>
          <FeatureIconBox variant={0}><FaExclamationTriangle /></FeatureIconBox>
          <FeatureTitle variant={0}>Verified Professionals</FeatureTitle>
          <FeatureDesc variant={0}>Travel with peace of mind. All users are verified with corporate IDs.</FeatureDesc>
        </FeatureCard>

        <FeatureCard variant={1}>
          <FeatureIconBox variant={1}><HiOutlineSparkles /></FeatureIconBox>
          <FeatureTitle variant={1}>Smart Matching</FeatureTitle>
          <FeatureDesc variant={1}>Our AI connects you with the best route matches instantly.</FeatureDesc>
        </FeatureCard>

        <FeatureCard variant={2}>
          <FeatureIconBox variant={2}><FaRocket /></FeatureIconBox>
          <FeatureTitle variant={2}>Swift Commute</FeatureTitle>
          <FeatureDesc variant={2}>Use carpool lanes and reduce travel time by up to 30%.</FeatureDesc>
        </FeatureCard>

        <FeatureCard variant={3}>
          <FeatureIconBox variant={3}><FaCar /></FeatureIconBox>
          <FeatureTitle variant={3}>Cost Effective</FeatureTitle>
          <FeatureDesc variant={3}>Split fuel costs and save significantly on your monthly travel.</FeatureDesc>
        </FeatureCard>
      </FeaturesGrid>

      {/* 3. Main Actions - Color Blocked Cards */}
      <SectionTitle>Quick Actions</SectionTitle>
      <ActionsGrid>
        <LargeActionCard onClick={() => navigate("/home/post-ride")} color="primary">
          <CardContent>
            <ActionIconLarge><FaCar /></ActionIconLarge>
            <div>
              <h3>Post a Ride</h3>
              <p>Driving somewhere? Offer a seat.</p>
            </div>
          </CardContent>
          <ActionArrowCircle><FaArrowRight /></ActionArrowCircle>
        </LargeActionCard>

        <LargeActionCard onClick={() => navigate("/home/search-rides")} color="secondary">
          <CardContent>
            <ActionIconLarge><FaSearch /></ActionIconLarge>
            <div>
              <h3>Search Rides</h3>
              <p>Need a lift? Find one nearby.</p>
            </div>
          </CardContent>
          <ActionArrowCircle><FaArrowRight /></ActionArrowCircle>
        </LargeActionCard>

        <SmallActionCard onClick={() => navigate("/home/passenger-center")}>
          <FaUser /> <span>Bookings</span>
        </SmallActionCard>

        <SmallActionCard onClick={() => navigate("/home/my-posted-rides")}>
          <FaListAlt /> <span>My Rides</span>
        </SmallActionCard>

        <SmallActionCard onClick={() => navigate("/home/profile")}>
          <FaCog /> <span>Settings</span>
        </SmallActionCard>
      </ActionsGrid>

      {/* 4. Activity Section - Glass List */}
      <SectionTitle>Recent Activity</SectionTitle>
      <ActivityCard>
        {recentActivities.length === 0 ? (
          <EmptyState>
            <HiOutlineSparkles />
            <h3>No recent activity</h3>
            <p>Your latest rides and bookings will appear here.</p>
            <PrimaryButton onClick={() => navigate("/home/post-ride")}>
              <FaRocket /> Start Now
            </PrimaryButton>
          </EmptyState>
        ) : (
          <ActivityList>
            {recentActivities.map((activity, index) => (
              <ActivityRow key={index}>
                <RowIcon><FaMapMarkerAlt /></RowIcon>
                <RowContent>
                  <RowTitle>{activity.description}</RowTitle>
                  <RowTime><HiOutlineClock /> {activity.time}</RowTime>
                </RowContent>
              </ActivityRow>
            ))}
          </ActivityList>
        )}
      </ActivityCard>
    </Container>
  );
};

// --- Sub-components ---

const LoadingScreen = () => (
  <CenteredContainer>
    <SpinnerIcon><FaSpinner /></SpinnerIcon>
    <p>Loading your dashboard...</p>
  </CenteredContainer>
);

const ErrorScreen = ({ error }) => (
  <CenteredContainer>
    <ErrorIcon><FaExclamationTriangle /></ErrorIcon>
    <p>{error}</p>
  </CenteredContainer>
);

// --- Styled Components (Rido Premium Theme) ---

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
  animation: ${fadeInUp} 0.6s ease-out;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SpinnerIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
  animation: spin 1s linear infinite;
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

const ErrorIcon = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 2rem;
`;

/* 1. Hero Card - Distinct Dark Block */
const HeroCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.section.dark} 0%, #1a2e1b 100%);
  border-radius: 32px; /* Rido Style Large Radius */
  padding: 60px;
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);

  @media (max-width: 768px) {
    padding: 30px;
    flex-direction: column;
    text-align: center;
    gap: 30px;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 600px;
`;

const Greeting = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.colors.palette.surfCrest};
  padding: 8px 16px;
  border-radius: 50px;
  color: ${({ theme }) => theme.colors.palette.tomThumb};
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
  border: 1px solid ${({ theme }) => theme.colors.palette.summerGreen};
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  line-height: 1.1;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.inverse};
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const GradientSpan = styled.span`
  color: ${({ theme }) => theme.colors.accentBright};
`;

const HeroText = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.inverseSecondary};
  line-height: 1.6;
  max-width: 90%;
  
  @media (max-width: 768px) {
    margin: 0 auto;
  }
`;

const HeroVisual = styled.div`
  position: absolute;
  right: -50px;
  top: -50px;
  width: 50%;
  height: 100%;
  pointer-events: none;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const VisualCircle = styled.div`
  position: absolute;
  width: ${props => props.size};
  height: ${props => props.size};
  background: ${props => props.color};
  border-radius: 50%;
  opacity: 0.6; /* Reduced opacity instead of blur for performance/clarity */
  right: ${props => props.offset ? '20%' : '10%'};
  top: ${props => props.offset ? '60%' : '20%'};
  animation: float 6s ease-in-out infinite;
`;

/* 2. Bento Stats - Colored Blocks */
const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BentoCard = styled.div`
  /* Strict Palette Grid Application */
  background: ${props =>
    props.variant === 0 ? props.theme.colors.palette.tomThumb :
      props.variant === 1 ? props.theme.colors.palette.summerGreen :
        props.variant === 2 ? props.theme.colors.palette.envy :
          props.theme.colors.palette.surfCrest
  };
  
  color: ${props => props.variant === 0 ? '#ffffff' : props.theme.colors.palette.tomThumb};
  
  padding: 24px;
  border-radius: 24px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const StatIconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  /* Inverse logic for icon box */
  background: ${props => props.variant === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(43, 73, 44, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.variant === 0 ? '#ffffff' : props.theme.colors.palette.tomThumb};
  font-size: 1.2rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  /* Text color inherits from parent logic usually, but we force it here */
  color: inherit; 
`;

const StatLabel = styled.div`
  color: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  opacity: 0.9;
`;

/* 2.5 Features Grid */
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: ${props =>
    props.variant === 0 ? props.theme.colors.palette.tomThumb :
      props.variant === 1 ? props.theme.colors.palette.surfCrest :
        props.variant === 2 ? props.theme.colors.palette.summerGreen :
          props.theme.colors.palette.envy
  };
  color: ${props => props.variant === 0 ? '#ffffff' : props.theme.colors.palette.tomThumb};
  padding: 24px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${props => props.variant === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(43, 73, 44, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 1.2rem;
  color: inherit;
`;

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: inherit;
`;

const FeatureDesc = styled.p`
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
  color: inherit;
`;

/* 3. Actions Grid - Mixed Sizes */
const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-left: 10px;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 columns */
  grid-template-rows: auto auto;
  gap: 20px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const LargeActionCard = styled.div`
  grid-column: span 2; 
  background: ${props => props.color === 'primary' ? props.theme.colors.palette.surfCrest : props.theme.colors.palette.tomThumb};
  padding: 30px;
  border-radius: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 160px;
  
  @media (max-width: 600px) {
    grid-column: span 1;
    padding: 24px;
  }
  
  /* Text color logic inside */
  h3 { color: ${props => props.color === 'primary' ? props.theme.colors.palette.tomThumb : '#ffffff'}; margin-bottom: 8px; font-size: 1.5rem; }
  p { color: ${props => props.color === 'primary' ? props.theme.colors.palette.tomThumb : props.theme.colors.palette.surfCrest}; opacity: 0.9; }

  &:hover {
    transform: scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
`;

const ActionIconLarge = styled.div`
  font-size: 2rem;
  /* Icon inherits contrasting color logic */
  color: inherit; 
`;

const ActionArrowCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: transform 0.3s ease;
  
  ${LargeActionCard}:hover & {
    transform: rotate(-45deg);
    background: #fff;
    color: ${({ theme }) => theme.colors.palette.tomThumb};
  }
`;

const SmallActionCard = styled.div`
  background: ${({ theme }) => theme.colors.palette.summerGreen};
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 140px;
  color: ${({ theme }) => theme.colors.palette.tomThumb};
  
  &:hover {
    background: ${({ theme }) => theme.colors.palette.envy};
    transform: translateY(-5px);
  }

  svg { font-size: 1.8rem; margin-bottom: 5px; }
  span { font-weight: 700; }
`;

/* 4. Activity - Glass List Block */
/* 4. Activity - Solid List Block */
const ActivityCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 32px;
  padding: 30px;
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.glass.border};
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const RowIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(210, 233, 213, 0.1);
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RowContent = styled.div`
  flex: 1;
`;

const RowTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const RowTime = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  svg { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }
  h3 { color: ${({ theme }) => theme.colors.text.primary}; margin-bottom: 8px; }
`;

const PrimaryButton = styled.button`
  margin-top: 20px;
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.dark};
  border: none;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s;
  
  &:hover { transform: scale(1.05); }
`;

export default Home;
