import Swal from "sweetalert2";

/**
 * Extrae el mensaje de error de una respuesta de la API y lo muestra con SweetAlert.
 * @param {any} error - El error capturado en el catch
 * @param {string} title - Título del modal (opcional)
 */
export function showApiError(error, title = "Error") {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Ocurrió un error inesperado.";

  Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "Aceptar",
  });
}
