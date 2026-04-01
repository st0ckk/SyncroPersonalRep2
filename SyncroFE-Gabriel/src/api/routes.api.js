import api from "./axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "";

export const getBackendOrigin = () => {
  try {
    return new URL(apiBaseUrl, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};

export const buildBackendFileUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendOrigin()}${normalizedPath}`;
};

export const getRoutes = (params = {}) =>
  api.get("/routes", { params });

export const getRouteById = (id) =>
  api.get(`/routes/${id}`);

export const createRoute = (data) =>
  api.post("/routes", data);

export const updateRoute = (id, data) =>
  api.put(`/routes/${id}`, data);

export const deactivateRoute = (id) =>
  api.delete(`/routes/${id}`);

export const activateRoute = (id) =>
  api.put(`/routes/${id}/activate`);

export const getMyRoutesToday = (date) =>
  api.get("/routes/my/today", {
    params: date ? { date } : {},
  });

export const getMyRouteDates = (from, to) =>
  api.get("/routes/my/dates", { params: { from, to } });

export const updateMyStopStatus = (routeId, stopId, status, note = null) =>
  api.put(`/routes/my/${routeId}/stops/${stopId}/status`, {
    status,
    note,
  });

export const uploadMyStopPhoto = (routeId, stopId, file) => {
  const formData = new FormData();
  formData.append("photo", file);

  return api.post(`/routes/my/${routeId}/stops/${stopId}/photo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};