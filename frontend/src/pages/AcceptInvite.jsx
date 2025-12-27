import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [valid, setValid] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [invitation, setInvitation] = useState(null);

    useEffect(() => {
        if (!token) {
            setError('Missing invitation token');
            setLoading(false);
            return;
        }

        const checkToken = async () => {
             try {
                 const data = await authService.validateInvitation(token);
                 setInvitation(data);
                 setValid(true);
             } catch (err) {
                 setError('Invalid or expired invitation link');
             } finally {
                 setLoading(false);
             }
        };
        checkToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            await authService.signup(token, password, firstName, lastName);
            // Redirect to login with success message
            navigate('/login', { state: { message: 'Account created! Please sign in.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
            setLoading(false);
        }
    };

    if (loading && !valid) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Validating invitation...</div>;
    }
    
    if (error && !valid) {
         return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center text-red-500 bg-red-500/10 p-8 rounded-xl border border-red-500/20">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Invitation Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/login')} className="mt-6 px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:bg-slate-700">Go to Login</button>
                </div>
            </div>
         );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-8">
                <div className="text-center mb-8">
                     <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="text-green-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 mb-2">Create Account</h1>
                    <p className="text-slate-400">Accepting invitation for <span className="text-indigo-400">{invitation?.email}</span></p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500">
                        <AlertCircle size={20} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-4 text-slate-100 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-4 text-slate-100 focus:outline-none focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-4 text-slate-100 focus:outline-none focus:border-indigo-500"
                            required
                        />
                    </div>
                    
                    <div>
                         <label className="block text-sm font-medium text-slate-400 mb-1">Confirm Password</label>
                         <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-4 text-slate-100 focus:outline-none focus:border-indigo-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AcceptInvite;
