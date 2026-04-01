export const routeStatusToEs = (status) => {
  const s = String(status ?? "").trim().toUpperCase();

  switch (s) {
    case "DRAFT":
      return "Borrador";
    case "SCHEDULED":
      return "Programada";
    case "INPROGRESS":
      return "En progreso";
    case "COMPLETED":
      return "Completada";
    case "CANCELLED":
      return "Cancelada";
    default:
      return status || "-";
  }
};

export const stopStatusToEs = (status) => {
  const s = String(status ?? "").trim().toUpperCase();

  switch (s) {
    case "PENDING":
      return "Pendiente";
    case "ENROUTE":
      return "En ruta";
    case "DELIVERED":
      return "Entregado";
    case "CANCELLED":
      return "Cancelado";
    default:
      return status || "-";
  }
};