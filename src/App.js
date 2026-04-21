import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AuthContext } from "./context/AuthContext";
import { theme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";

// Lazy Load Pages for Performance
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Layout = lazy(() => import("./components/Layout"));
const Home = lazy(() => import("./pages/Home"));
const PostRide = lazy(() => import("./pages/PostRide"));
const SearchRides = lazy(() => import("./pages/SearchRides"));
const PassengerCenter = lazy(() => import("./pages/PassengerCenter"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const MyPostedRides = lazy(() => import("./pages/MyPostedRides"));
const KYCPage = lazy(() => import("./pages/KYCPage"));

// Admin Pages
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const DashboardOverview = lazy(() => import("./pages/admin/DashboardOverview"));
const AdminKYC = lazy(() => import("./pages/admin/AdminKYC"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const RideManagement = lazy(() => import("./pages/admin/RideManagement"));

// Loading Spinner Component
const LoadingFallback = () => (
  <div style={{
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#ffffff',
    color: '#2b492c',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  }}>
    Loading...
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  const storedToken = localStorage.getItem("authToken");

  if (!token && !storedToken) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="post-ride" element={<PostRide />} />
              <Route path="search-rides" element={<SearchRides />} />
              <Route path="passenger-center" element={<PassengerCenter />} />
              <Route path="my-posted-rides" element={<MyPostedRides />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route
              path="/kyc"
              element={
                <ProtectedRoute>
                  <KYCPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Back-Office Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="kyc" element={<AdminKYC />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="rides" element={<RideManagement />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
