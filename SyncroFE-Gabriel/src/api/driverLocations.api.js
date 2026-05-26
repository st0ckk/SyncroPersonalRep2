import api from "./axios";

/**
 * El chofer envía su posición GPS al servidor.
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} driverName  Nombre para mostrar en el monitor
 */
export const postMyLocation = (latitude, longitude, driverName) =>
  api.post("/driver-locations", { latitude, longitude, driverName });

/**
 * El monitor obtiene la lista de choferes activos con su última ubicación.
 * @returns {Promise<AxiosResponse<DriverLocation[]>>}
 */
export const getActiveDriverLocations = () =>
  api.get("/driver-locations");
