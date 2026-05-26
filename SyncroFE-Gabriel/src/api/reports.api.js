import api from "./axios";

// ── Ventas ──
export const getSalesReport = (params = {}) =>
    api.get("/reports/sales", { params });

export const exportSalesReport = async (params = {}) => {
    const res = await api.get("/reports/sales/export", { params, responseType: "blob" });
    triggerDownload(res.data, `reporte_ventas_${today()}.csv`);
};

// ── Inventario ──
export const getInventoryReport = (params = {}) =>
    api.get("/reports/inventory", { params });

export const exportInventoryReport = async (params = {}) => {
    const res = await api.get("/reports/inventory/export", { params, responseType: "blob" });
    triggerDownload(res.data, `reporte_inventario_${today()}.csv`);
};

// ── Facturación ──
export const getInvoiceReport = (params = {}) =>
    api.get("/reports/invoices", { params });

export const exportInvoiceReport = async (params = {}) => {
    const res = await api.get("/reports/invoices/export", { params, responseType: "blob" });
    triggerDownload(res.data, `reporte_facturacion_${today()}.csv`);
};

// ── Helpers ──
function triggerDownload(blob, fileName) {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

function today() {
    return new Date().toISOString().slice(0, 10);
}
