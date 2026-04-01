import api from "./axios";

// Traer todas las cuenta de creditos
export const getCreditAccounts = () =>
    api.get("/clientaccounts");

// Traer todas las cuenta de creditos que no estan cerradas
export const getActiveCreditAccounts = () =>
    api.get("/clientaccounts/active");

// Traer cuenta de credito por cliente
export const getCreditAccountByClient = (client) =>
    api.get("/clientaccounts/client", {
        params: {
            client
        }
    });

// Filtrar la cuenta de credito
export const filterCreditAccounts = (startDate, endDate, searchTerm, status) =>
    api.get("/clientaccounts/filter", {
        params: {
            startDate,
            endDate,
            searchTerm,
            status
        }
    });

// Agregar cuenta de credito
export const createCreditAccount = (data) =>
    api.post("/clientaccounts", data);

// Descarga una copia pdf
export const generateAccountStatement = async (id, startDate, endDate, searchTerm, type) => {
    const response = await api.post(`/clientaccounts/report`, null, {
        responseType: 'blob',
        params: {
            id,
            startDate,
            endDate,
            searchTerm,
            type
        }
    });
    return response.data;
}

//Actualiza cuenta de credito
export const updateCreditAccount = (id, data) =>
    api.put(`/clientaccounts/${id}`, data);

// Cancelar cuenta
export const closeCreditAccount = (id) => api.put("/clientaccounts/closeaccount", null, {
    params: {
        id
    }
});

/*------------------------------------Movimientos-------------------------------------*/

// Filtrar los movimientos de una cuenta de credito
export const filterAccountMovements = (account,startDate, endDate, searchTerm, type) =>
    api.get("/clientaccounts/filtermovements", {
        params: {
            account,
            startDate,
            endDate,
            searchTerm,
            type
        }
    });