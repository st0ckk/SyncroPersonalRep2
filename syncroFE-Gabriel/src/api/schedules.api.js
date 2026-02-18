import api from "./axios";

export const getSchedules = (params) => api.get("/schedules", { params });
export const createSchedule = (data) => api.post("/schedules", data);
export const updateSchedule = (id, data) => api.put(`/schedules/${id}`, data);
export const deactivateSchedule = (id) => api.delete(`/schedules/${id}`);
export const activateSchedule = (id) => api.put(`/schedules/${id}/activate`);
export const getMySchedules = (params) =>api.get("/me/schedules", { params });
