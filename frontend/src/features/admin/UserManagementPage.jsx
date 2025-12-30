import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

const UserManagementPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminService.updateUserRole(userId, [newRole]);
            fetchUsers();
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const handleToggleStatus = async (userId) => {
        if (userId === currentUser.id) {
            alert("You cannot disable your own account.");
            return;
        }
        try {
            await adminService.toggleUserStatus(userId);
            fetchUsers();
        } catch (err) {
            alert('Failed to toggle status');
        }
    };

    const roles = ['ROLE_OWNER', 'ROLE_MANAGER', 'ROLE_ACCOUNTANT', 'ROLE_SALES', 'ROLE_VIEW_ONLY'];

    if (loading) return <div className="p-8 text-white">Loading users...</div>;

    return (
        <div className="max-w-7xl mx-auto py-20 px-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-8">
                User Management
            </h1>
             <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden">
                 <div className="overflow-x-auto">
                     <table className="w-full text-left text-slate-300">
                         <thead className="bg-slate-800 text-slate-100 uppercase text-xs font-semibold">
                             <tr>
                                 <th className="px-6 py-4">Name</th>
                                 <th className="px-6 py-4">Email</th>
                                 <th className="px-6 py-4">Role</th>
                                 <th className="px-6 py-4">Status</th>
                                 <th className="px-6 py-4">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-800">
                             {users.map(u => (
                                 <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                     <td className="px-6 py-4 font-medium text-white">{u.firstName} {u.lastName}</td>
                                     <td className="px-6 py-4">{u.email}</td>
                                     <td className="px-6 py-4">
                                         <select 
                                            value={u.roles?.[0] || ''} 
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            className="bg-slate-800 border-slate-700 text-slate-300 rounded px-2 py-1 text-sm focus:ring-violet-500"
                                            disabled={u.id === currentUser.id}
                                         >
                                             {roles.map(r => (
                                                 <option key={r} value={r}>{r.replace('ROLE_', '')}</option>
                                             ))}
                                         </select>
                                     </td>
                                     <td className="px-6 py-4">
                                         {/* Need 'enabled' field in response. If not present, defaulting to Active */}
                                         <span className={`px-2 py-1 rounded text-xs font-medium ${u.enabled !== false ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                             {u.enabled !== false ? 'Active' : 'Disabled'}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4">
                                         <button 
                                            onClick={() => handleToggleStatus(u.id)}
                                            className="text-slate-400 hover:text-white text-sm"
                                            disabled={u.id === currentUser.id}
                                         >
                                             {u.enabled !== false ? 'Disable' : 'Enable'}
                                         </button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
};

export default UserManagementPage;
