import api from "./axios";

// Dashboard admin (SPU / Administrador)
export const getAdminDashboard = () =>
    api.get("/dashboard/admin");

// Dashboard vendedor
export const getSellerDashboard = () =>
    api.get("/dashboard/seller");

// Audit logs paginados
export const getAuditLogs = (params = {}) =>
    api.get("/dashboard/audit-logs", { params });

// Filtros disponibles para audit logs
export const getAuditLogFilters = () =>
    api.get("/dashboard/audit-logs/filters");

// Exportar audit logs a CSV (descarga)
export const exportAuditLogsCsv = async (params = {}) => {
    const res = await api.get("/dashboard/audit-logs/export", {
        params,
        responseType: "blob",
    });
    // Trigger descarga
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
