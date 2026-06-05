import api from "./axios";

// Traer todas las cotizaciones
export const getQuotes = () =>
    api.get("/quotes");

// Traer un cotizacion
export const getQuoteById = (id) =>
    api.get(`/quotes/${id}`);

// Traer ultima cotizacion de client
export const getLatestQuoteByClient = (clientId) =>
    api.get("/quotes/client", {
        params: {
            clientId
        }
    });

// Filtrar la cotizacion
export const filterQuote = (startDate, endDate, searchTerm, status) =>
    api.get("/quotes/filter", {
        params: {
            startDate,
            endDate,
            searchTerm,
            status
        }
    });

// Agregar cotizacion
export const createQuote = (data) =>
    api.post("/quotes", data);

// Descarga una copia pdf
export const generateQuoteCopy = async (id) => {
    const response = await api.post(`/quotes/copy/${id}`, null , {
        responseType : 'blob'
    });
    return response.data;
}

//Actualiza cotizacion
export const updateQuote = (id, data) =>
    api.put(`/quotes/${id}`, data);
