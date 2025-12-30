import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [loading, setLoading] = useState(true);

    // Axios interceptor to add token
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(
            config => {
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            error => Promise.reject(error)
        );

        return () => axios.interceptors.request.eject(interceptor);
    }, [token]);
    
    // Check if user is logged in (decode token or fetch /me)
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    logout(); 
                } finally {
                    setLoading(false);
                }
            } else {
                 setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    const login = (accessToken, newRefreshToken) => {
        setToken(accessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
    };

    const logout = () => {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    };

    const hasRole = (allowedRoles) => {
        if (!user || !user.roles) return false;
        if (Array.isArray(allowedRoles)) {
             return user.roles.some(role => allowedRoles.includes(role));
        }
        return user.roles.includes(allowedRoles);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, hasRole, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
