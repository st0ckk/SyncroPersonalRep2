import api from "./axios";

// Traer todas las ventas
export const getSales = () =>
    api.get("/sales");

// Traer una venta
export const getSaleById = (id) =>
    api.get(`/sales/${id}`);

// Filtrar la venta
export const filterSale = (startDate, endDate, searchTerm, status, paidStatus) =>
    api.get("/sales/filter", {
        params: {
            startDate,
            endDate,
            searchTerm,
            status,
            paidStatus
        }
    });

// Agregar venta
export const createSale = (data) =>
    api.post("/sales", data);

// Borrar venta
export const deleteSale = (id) => api.delete(`/sales/${id}`);

// Conseguir impuestos
export const getTaxes = () => api.get("/taxes");

//Actualiza venta
export const updateSale = (id, data) =>
    api.put(`/sales/${id}`, data);



