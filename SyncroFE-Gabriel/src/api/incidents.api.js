import api from "./axios";

export const createIncident = (data) =>
  api.post("/route-incidents", data);

export const getIncidents = (params = {}) =>
  api.get("/route-incidents", { params });
