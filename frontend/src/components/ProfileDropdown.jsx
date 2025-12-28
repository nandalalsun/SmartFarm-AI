import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, Users, Mail, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = () => {
    const { user, logout, hasRole } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isAdmin = hasRole(['ROLE_OWNER', 'ROLE_MANAGER']);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getInitials = () => {
        if (!user) return 'U';
        return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 focus:outline-none"
            >
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-medium border-2 border-slate-700 hover:border-violet-400 transition-colors">
                    {getInitials()}
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-800">
                        <p className="text-sm text-white font-medium truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                        <Link 
                            to="/account/profile" 
                            className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <User size={16} className="mr-3 text-violet-400" />
                            My Profile
                        </Link>
                        <Link 
                            to="/account/security" 
                            className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Shield size={16} className="mr-3 text-violet-400" />
                            Security
                        </Link>
                    </div>

                    {isAdmin && (
                        <>
                            <div className="border-t border-slate-800 my-1"></div>
                            <div className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase">Admin</div>
                            <Link 
                                to="/admin/users" 
                                className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Users size={16} className="mr-3 text-pink-400" />
                                Manage Users
                            </Link>
                            <Link 
                                to="/admin/invitations" 
                                className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Mail size={16} className="mr-3 text-pink-400" />
                                Invitations
                            </Link>
                        </>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
                    >
                        <LogOut size={16} className="mr-3" />
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
