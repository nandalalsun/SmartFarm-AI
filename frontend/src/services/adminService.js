import api from '../api/axios';

// User Management
const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

const updateUserRole = async (userId, roles) => {
    const response = await api.put(`/users/${userId}/roles`, { roles }); // Check logic: { roles } matches RequestBody?
    return response.data;
};

const toggleUserStatus = async (userId) => {
    const response = await api.put(`/users/${userId}/status`);
    return response.data;
};

// Invitation Management
const getAllInvitations = async () => {
    const response = await api.get('/auth/invitations');
    return response.data;
};

const createInvitation = async (email, role) => {
    const response = await api.post('/auth/invitations', { email, role });
    return response.data;
};

const revokeInvitation = async (id) => {
    await api.delete(`/auth/invitations/${id}`);
};

export default {
    getAllUsers,
    updateUserRole,
    toggleUserStatus,
    getAllInvitations,
    createInvitation,
    revokeInvitation
};
