import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AuthContext } from "./context/AuthContext";
import { theme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";

import AuthPage from "./pages/AuthPage";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import PostRide from "./pages/PostRide";
import SearchRides from "./pages/SearchRides";
import PassengerCenter from "./pages/PassengerCenter";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MyPostedRides from "./pages/MyPostedRides";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
