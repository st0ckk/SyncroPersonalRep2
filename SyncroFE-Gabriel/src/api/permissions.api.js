import api from "./axios";

const base = "/permissions";

export const getMyPermissions = () => api.get(`${base}/me`);
export const getAllScreens = () => api.get(`${base}/screens`);

export const getUserPermissions = (userId) => api.get(`${base}/user/${userId}`);
export const setUserPermissions = (userId, screenKeys) =>
    api.put(`${base}/user/${userId}`, screenKeys);

export const getRolePermissions = (role) => api.get(`${base}/role/${role}`);
export const setRolePermissions = (role, screenKeys) =>
    api.put(`${base}/role/${role}`, screenKeys);
