import api from "./axios";

const baseUrl = "/users";

export const getUsers = () =>
  api.get(baseUrl);

export const getUserById = (id) =>
  api.get(`${baseUrl}/${id}`);

export const createUser = (data) =>
  api.post(baseUrl, data);

export const updateUser = (id, data) =>
  api.put(`${baseUrl}/${id}`, data);

export const deleteUser = (id) =>
  api.delete(`${baseUrl}/${id}`);

export const updateUserRole = (id, role) =>
  api.put(`${baseUrl}/${id}/role`, { role });

export const updateUserStatus = (id, isActive) =>
  api.put(`${baseUrl}/${id}/status`, { isActive });

export const updatePassword = (data) =>
  api.put("/account/password", data);


