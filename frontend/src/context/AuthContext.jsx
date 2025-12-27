import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

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
        if (token) {
             // Ideally fetch user profile
             // For now, simple decode or assuming valid if present
             // We can implement a /me endpoint to get user details
             setLoading(false); // Mock for now
        } else {
             setLoading(false);
        }
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

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
