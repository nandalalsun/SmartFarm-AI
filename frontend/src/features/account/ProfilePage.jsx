import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });
        setIsSubmitting(true);
        
        try {
            const updatedUser = await authService.updateProfile(firstName, lastName);
            setUser(updatedUser); // Update context
            setStatus({ type: 'success', msg: 'Profile updated successfully!' });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', msg: 'Failed to update profile.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-20 px-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-8">
                Your Profile
            </h1>
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6">
                 <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                    {status.msg && (
                        <div className={`p-4 rounded-md ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {status.msg}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                        <input 
                            type="text" 
                            disabled 
                            value={user?.email || ''} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-slate-500">Email cannot be changed.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                            <input 
                                type="text" 
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                            <input 
                                type="text" 
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Roles</label>
                        <div className="flex flex-wrap gap-2">
                            {user?.roles?.map(role => (
                                <span key={role} className="px-2 py-1 rounded-md bg-slate-800 text-xs text-violet-400 border border-slate-700">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                 </form>
            </div>
        </div>
    );
};

export default ProfilePage;
