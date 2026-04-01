import api from "./axios";

export const getRouteTemplates = (params = {}) =>
    api.get("/route-templates", { params });

export const createRouteTemplate = (data) =>
    api.post("/route-templates", data);

export const updateRouteTemplate = (id, data) =>
    api.put(`/route-templates/${id}`, data);

export const deactivateRouteTemplate = (id) =>
    api.delete(`/route-templates/${id}`);

export const activateRouteTemplate = (id) =>
    api.put(`/route-templates/${id}/activate`);

export const instantiateRouteTemplate = (id, data) =>
    api.post(`/route-templates/${id}/instantiate`, data);