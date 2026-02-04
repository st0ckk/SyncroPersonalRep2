import api from "./axios";

// activos
export const getClients = () =>
    api.get("/clients");

// inactivos
export const getInactiveClients = () =>
    api.get("/clients/inactive");

// obtener uno
export const getClientById = (id) =>
    api.get(`/clients/${id}`);

// crear
export const createClient = (data) =>
    api.post("/clients", data);

// actualizar
export const updateClient = (id, data) =>
    api.put(`/clients/${id}`, data);

// desactivar
export const deactivateClient = (id) =>
    api.delete(`/clients/${id}`);

// activar
export const activateClient = (id) =>
    api.put(`/clients/${id}/activate`);
