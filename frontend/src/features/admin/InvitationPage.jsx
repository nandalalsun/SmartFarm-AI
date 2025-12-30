import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const InvitationPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('ROLE_VIEW_ONLY');
    const [creating, setCreating] = useState(false);
    
    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const data = await adminService.getAllInvitations();
            setInvitations(data);
        } catch (err) {
            console.error('Failed to fetch invitations');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await adminService.createInvitation(newEmail, newRole);
            setNewEmail('');
            fetchInvitations();
        } catch (err) {
            alert('Failed to create invitation: ' + (err.response?.data?.message || err.message));
        } finally {
            setCreating(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
        try {
            await adminService.revokeInvitation(id);
            fetchInvitations();
        } catch (err) {
            alert('Failed to revoke invitation');
        }
    };

    const roles = ['ROLE_OWNER', 'ROLE_MANAGER', 'ROLE_ACCOUNTANT', 'ROLE_SALES', 'ROLE_VIEW_ONLY'];

    return (
        <div className="max-w-7xl py-20 mx-auto px-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-8">
                Manage Invitations
            </h1>
            
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Invite New User</h2>
                <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                    <div className="w-48">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                        <select 
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            {roles.map(r => (
                                <option key={r} value={r}>{r.replace('ROLE_', '')}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        disabled={creating}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {creating ? 'Sending...' : 'Send Invite'}
                    </button>
                </form>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-800 text-slate-100 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Expires</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {invitations.map(i => (
                            <tr key={i.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{i.email}</td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{i.code}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-800 text-violet-400 px-2 py-1 rounded text-xs border border-slate-700">
                                        {i.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        i.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' : 
                                        i.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-400' : 
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                        {i.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                    {new Date(i.expiresAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    {i.status === 'PENDING' && (
                                        <button 
                                            onClick={() => handleRevoke(i.id)}
                                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                                        >
                                            Revoke
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {invitations.length === 0 && !loading && (
                    <div className="p-8 text-center text-slate-500">
                        No invitations found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitationPage;
