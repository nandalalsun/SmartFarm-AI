import axios from 'axios';

const USER_API_URL = 'http://localhost:8080/api/users';
const INVITATION_API_URL = 'http://localhost:8080/api/auth/invitations';

// User Management
const getAllUsers = async () => {
    const response = await axios.get(USER_API_URL);
    return response.data;
};

const updateUserRole = async (userId, roles) => {
    const response = await axios.put(`${USER_API_URL}/${userId}/roles`, { roles });
    return response.data;
};

const toggleUserStatus = async (userId) => {
    const response = await axios.put(`${USER_API_URL}/${userId}/status`);
    return response.data;
};

// Invitation Management
const getAllInvitations = async () => {
    const response = await axios.get(INVITATION_API_URL);
    return response.data;
};

const createInvitation = async (email, role) => {
    const response = await axios.post(INVITATION_API_URL, { email, role });
    return response.data;
};

const revokeInvitation = async (id) => {
    await axios.delete(`${INVITATION_API_URL}/${id}`);
};

export default {
    getAllUsers,
    updateUserRole,
    toggleUserStatus,
    getAllInvitations,
    createInvitation,
    revokeInvitation
};
