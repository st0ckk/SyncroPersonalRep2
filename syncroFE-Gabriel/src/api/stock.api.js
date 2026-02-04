import api from "./axios";

export const getProducts = () =>
    api.get("/stock");

export const getInactiveProducts = () =>
    api.get("/stock/inactive");

export const createProduct = (data) =>
    api.post("/stock", data);

export const updateProduct = (id, data) =>
    api.put(`/stock/${id}`, data);

export const activateProduct = (id) =>
    api.put(`/stock/${id}/activate`);

export const deactivateProduct = (id) =>
    api.delete(`/stock/${id}`);

export const filterStock = (params) =>
    api.get("/stock/filter", { params });

export const searchProducts = (query) =>
    api.get("/stock/search", {
        params: { q: query },
    });
export const addStock = (data) =>
    api.post("/stock/entry", data);
