import api from '../api/axios';

const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

const verify2fa = async (email, code) => {
    const response = await api.post('/auth/verify-2fa', { email, code });
    return response.data;
};

const signup = async (token, password, firstName, lastName) => {
    return api.post('/auth/signup', { token, password, firstName, lastName });
};

const validateInvitation = async (token) => {
    const response = await api.get(`/auth/invitations/validate/${token}`);
    return response.data;
};

const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

const updateProfile = async (firstName, lastName) => {
    const response = await api.put('/auth/me', { firstName, lastName });
    return response.data;
};

const changePassword = async (currentPassword, newPassword) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
};

const setup2fa = async () => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
};

const confirm2fa = async (secretKey, code) => {
    await api.post('/auth/2fa/confirm', { secretKey, code });
};

export default {
    login,
    verify2fa,
    signup,
    validateInvitation,
    getCurrentUser,
    updateProfile,
    changePassword,
    setup2fa,
    confirm2fa
};
