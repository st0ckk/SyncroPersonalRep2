import api from "./axios";


// Agregar caja
export const createRegister = (data) =>
    api.post("/registers", data);

// Traer todas las cajas
export const getRegisters = () =>
    api.get("/registers");

// Traer ultima cotizacion de client
export const checkOpenRegisters = () =>
    api.get("/registers/openregisters");

// Filtrar las cajas
export const filterRegisters = (startDate, endDate, searchTerm, status) =>
    api.get("/registers/filter", {
        params: {
            startDate,
            endDate,
            searchTerm,
            status
        }
    });

// Consigue el monto calculado de una caja
export const getExpectedAmount = (id) =>
    api.get("/registers/expectedamount", {
        params: {
            id
        }
    });

// Cerrar caja
export const closeRegister = (id, data) => api.put("/registers/closeregister", data, {
    params: {
        id,
    }
});

// Descarga una copia pdf
export const generateRegisterSummary = async (id, startDate, endDate, searchTerm, type) => {
    const response = await api.post(`/registers/report`, null, {
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

/*------------------------------------Movimientos-------------------------------------*/

// Agregar movimiento manual de caja
export const createManualRegisterMovement = (data) =>
    api.post("/registers/manualmovement", data);

// Filtrar los movimientos de una caja
export const filterRegisterMovements = (register, startDate, endDate, searchTerm, type) =>
    api.get("/registers/filtermovements", {
        params: {
            register,
            startDate,
            endDate,
            searchTerm,
            type
        }
    });

// Consigue los movimientos de una caja
export const getRegisterMovements = (id) =>
    api.get("/registers/movements", {
        params: {
            id
        }
    });