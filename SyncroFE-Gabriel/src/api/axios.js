import axios from "axios";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config?.skipGlobalError) {
      return Promise.reject(error);
    }

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Ocurrió un error inesperado.";

    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonText: "Aceptar",
    });

    return Promise.reject(error);
  }
);

export default api;
