import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, roles }) => {
    const { user, loading, hasRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="text-white">Loading...</div>;
    }

    if (!user) {
         return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!hasRole(roles)) {
        // Redirect to dashboard if unauthorized
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleRoute;
