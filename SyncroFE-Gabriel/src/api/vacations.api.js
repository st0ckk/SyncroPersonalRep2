import api from "./axios";

const baseUrl = "/vacations";

export const getVacationBalance = (userId) => api.get(`${baseUrl}/balance/${userId}`);

export const createVacation = (data) => api.post(baseUrl, data);

export const getUserVacations = (userId) =>
  api.get(`/Vacations/user/${userId}`);

export const cancelVacation = (vacationId, createdBy) =>
  api.put(`${baseUrl}/${vacationId}/cancel`, null, {
    params: createdBy ? { createdBy } : {},
  });

export const assignVacationDays = (userId, data) =>
  api.put(`${baseUrl}/balance/${userId}/assign`, data);

export const calculateVacationDays = (startDate, endDate) =>
  api.get("/vacations/calculate-days", {
    params: { start: startDate, end: endDate },
  });

export const getMyVacations = (params) => 
  api.get('/vacations/user/${userId}');  
