import api from "./axios";

// Traer todos los descuentos
export const getDiscounts = () =>
    api.get("/discounts");

// Traer un descuento
export const getDiscountById = (id) =>
    api.get(`/discounts/${id}`);

// Filtrar dinamicamente los descuentos
export const getDiscountLookup = () =>
    api.get("/discounts/lookup");