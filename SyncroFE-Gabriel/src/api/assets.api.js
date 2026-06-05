import api from "./axios";

export const getAssets = () => api.get("/assets");

export const getAssetById = (id) => api.get(`/assets/${id}`);

export const getAssetsByUser = (userId) => api.get(`/assets/user/${userId}`);

export const getInactiveAssets = () => api.get("/assets/inactive");

export const createAsset = (data) => api.post("/assets", data);

export const updateAsset = (id, data) => api.put(`/assets/${id}`, data);

export const deactivateAsset = (id) => api.delete(`/assets/${id}`);

export const activateAsset = (id) => api.put(`/assets/${id}/activate`);