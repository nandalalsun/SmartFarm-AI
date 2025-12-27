import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const Verify2FA = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authService.verify2fa(email, parseInt(code));
            login(data.accessToken, data.refreshToken);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
       navigate('/login');
       return null;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="text-indigo-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 mb-2">Two-Factor Authentication</h1>
                    <p className="text-slate-400">Enter the 6-digit code from your authenticator app</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500">
                        <AlertCircle size={20} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            maxLength="6"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-4 text-center text-2xl tracking-[0.5em] text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                            placeholder="000000"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-full text-slate-500 hover:text-slate-400 text-sm"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Verify2FA;
