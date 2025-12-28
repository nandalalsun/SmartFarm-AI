import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';
const INVITATION_URL = 'http://localhost:8080/api/invitations';

const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};

const verify2fa = async (email, code) => {
    const response = await axios.post(`${API_URL}/verify-2fa`, { email, code });
    return response.data;
};

const signup = async (token, password, firstName, lastName) => {
    return axios.post(`${API_URL}/signup`, { token, password, firstName, lastName });
};

const validateInvitation = async (token) => {
    const response = await axios.get(`${INVITATION_URL}/validate/${token}`);
    return response.data;
};

const getCurrentUser = async () => {
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
};

const updateProfile = async (firstName, lastName) => {
    const response = await axios.put(`${API_URL}/me`, { firstName, lastName });
    return response.data;
};

const changePassword = async (currentPassword, newPassword) => {
    await axios.post(`${API_URL}/change-password`, { currentPassword, newPassword });
};

const setup2fa = async () => {
    const response = await axios.post(`${API_URL}/2fa/setup`);
    return response.data;
};

const confirm2fa = async (secretKey, code) => {
    await axios.post(`${API_URL}/2fa/confirm`, { secretKey, code });
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
