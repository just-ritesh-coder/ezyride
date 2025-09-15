import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  if (!token) {
    // Not logged in? Redirect to login
    return <Navigate to="/" />;
  }

  // Logged in? Show the page
  return children;
};

export default PrivateRoute;
