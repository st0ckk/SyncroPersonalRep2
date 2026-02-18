import api from "./axios";

// Traer todas las cotizaciones
export const getQuotes = () =>
    api.get("/quotes");

// Traer un cotizacion
export const getQuoteById = (id) =>
    api.get(`/quotes/${id}`);

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

// Descarga una copia pdf
export const generateQuoteCopy = async (id) => {
    const response = await api.post(`/quotes/copy/${id}`, null , {
        responseType : 'blob'
    });
    return response.data;
}
