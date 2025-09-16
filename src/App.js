import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthContext } from "./context/AuthContext";

import AuthPage from "./pages/AuthPage";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import PostRide from "./pages/PostRide";
import SearchRides from "./pages/SearchRides";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// NEW: import MyPostedRides to show driver status controls
import MyPostedRides from "./pages/MyPostedRides";

// Protect routes by auth token from context/localStorage
const ProtectedRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes wrapped in Layout, children rendered via <Outlet /> in Layout */}
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
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="my-posted-rides" element={<MyPostedRides />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
