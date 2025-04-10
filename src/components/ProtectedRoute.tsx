
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
    } else if (!isLoading && allowedRoles && user && !allowedRoles.includes(user.role)) {
      console.log(`User role ${user.role} not authorized for this route`);
    }
  }, [isLoading, isAuthenticated, user, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emergency"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'patient') {
      return <Navigate to="/patient" replace />;
    } else if (user.role === 'driver') {
      return <Navigate to="/driver" replace />;
    } else if (user.role === 'doctor') {
      return <Navigate to="/doctor" replace />;
    }
    
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
