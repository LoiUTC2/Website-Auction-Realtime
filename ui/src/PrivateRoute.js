import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = () => {
  const checkTokenValidity = () => {
    const token = localStorage.getItem('token');
    
    if (!token) return false;
    // openNotify('error', 'Login session expired, please log in again.');
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp > Math.floor(Date.now() / 1000);
    } catch {
      localStorage.removeItem('token');
      return false;
    }
  };

  return checkTokenValidity() ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;