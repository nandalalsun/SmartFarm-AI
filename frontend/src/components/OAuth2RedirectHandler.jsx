import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            navigate('/login?error=' + encodeURIComponent(error));
            return;
        }

        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (accessToken && refreshToken) {
            login(accessToken, refreshToken);
            navigate('/');
        } else {
             navigate('/login?error=Invalid%20token');
        }
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
            Logging in...
        </div>
    );
};

export default OAuth2RedirectHandler;
