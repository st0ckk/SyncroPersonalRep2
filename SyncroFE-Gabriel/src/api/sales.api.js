import api from "./axios";

export const getSales = () => api.get("/sales");

export const getSaleById = (id) => api.get(`/sales/${id}`);

export const createSale = (data) => api.post("/sales", data);

export const getTaxes = () => api.get("/taxes");