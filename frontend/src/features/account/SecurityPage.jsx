import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import QRCode from 'react-qr-code'; // Need to install this or use an image tag if URL is image

// Simplification: Assume backend returns otpauth URL, using react-qr-code to render.
// If backend returns image URL, use <img src={url} />

const SecurityPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('password');

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-8">
                Security Settings
            </h1>

            <div className="flex space-x-4 mb-6 border-b border-slate-700 pb-2">
                <button 
                    onClick={() => setActiveTab('password')}
                    className={`pb-2 px-1 ${activeTab === 'password' ? 'text-violet-400 border-b-2 border-violet-400 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Change Password
                </button>
                <button 
                    onClick={() => setActiveTab('2fa')}
                    className={`pb-2 px-1 ${activeTab === '2fa' ? 'text-violet-400 border-b-2 border-violet-400 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Two-Factor Authentication
                </button>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6">
                {activeTab === 'password' && <ChangePasswordForm />}
                {activeTab === '2fa' && <TwoFactorSetup user={user} />}
            </div>
        </div>
    );
};

const ChangePasswordForm = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', msg: '' });

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', msg: 'New passwords do not match' });
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.changePassword(currentPassword, newPassword);
            setStatus({ type: 'success', msg: 'Password changed successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setStatus({ type: 'error', msg: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            {status.msg && (
                <div className={`p-3 rounded-md text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {status.msg}
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
                <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
                <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
            </div>
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
};

const TwoFactorSetup = ({ user }) => {
    const [step, setStep] = useState('initial'); // initial, setup, success
    const [setupData, setSetupData] = useState(null);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const startSetup = async () => {
        try {
            const data = await authService.setup2fa();
            setSetupData(data);
            setStep('setup');
        } catch (err) {
            setError('Failed to start 2FA setup');
        }
    };

    const confirmSetup = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await authService.confirm2fa(setupData.secretKey, code);
            setStep('success');
        } catch (err) {
            setError('Invalid code');
        }
    };

    if (user?.is2faEnabled && step === 'initial') { // Note: field name depends on user object
        return (
            <div>
                <div className="flex items-center text-green-400 mb-4">
                    <span className="text-lg">✓ Two-Factor Authentication is Enabled</span>
                </div>
                <p className="text-slate-400 text-sm">Your account is secured locally.</p>
                {/* Could add disable button later */}
            </div>
        );
    }

    return (
        <div className="max-w-md">
            {step === 'initial' && (
                <div>
                    <p className="text-slate-300 mb-4">
                        Two-factor authentication adds an extra layer of security to your account.
                        You will need an authenticator app like Google Authenticator.
                    </p>
                    {error && <p className="text-red-400 mb-4">{error}</p>}
                    <button 
                        onClick={startSetup}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Enable 2FA
                    </button>
                </div>
            )}

            {step === 'setup' && setupData && (
                <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Scan QR Code</h3>
                    <div className="bg-white p-4 rounded-lg inline-block mb-4">
                        <QRCode value={setupData.qrCodeUrl} size={150} />
                    </div>
                    <p className="text-slate-400 text-sm mb-4 break-all">
                        Secret: {setupData.secretKey}
                    </p>
                    
                    <form onSubmit={confirmSetup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Enter Verification Code</label>
                            <input 
                                type="text" 
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="000000"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <div className="flex space-x-3">
                            <button 
                                type="submit" 
                                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Verify & Enable
                            </button>
                            <button 
                                type="button"
                                onClick={() => setStep('initial')}
                                className="text-slate-400 hover:text-white px-4 py-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {step === 'success' && (
                <div className="text-center">
                    <div className="text-green-400 text-xl mb-2">✓ 2FA Enabled Successfully</div>
                    <p className="text-slate-400">Your account is now more secure.</p>
                </div>
            )}
        </div>
    );
};

export default SecurityPage;
