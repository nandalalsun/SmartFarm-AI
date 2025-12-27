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

export default {
    login,
    verify2fa,
    signup,
    validateInvitation
};
