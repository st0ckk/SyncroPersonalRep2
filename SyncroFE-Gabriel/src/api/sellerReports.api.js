import api from "./axios";

// Mis ventas
export const getMySalesReport = (params = {}) =>
    api.get("/seller-reports/my-sales", { params });

export const exportMySalesReport = async (params = {}) => {
    const res = await api.get("/seller-reports/my-sales/export", { params, responseType: "blob" });
    triggerDownload(res.data, `mis_ventas_${today()}.csv`);
};

// Mis top productos
export const getMyTopProducts = (params = {}) =>
    api.get("/seller-reports/my-top-products", { params });

// Mis top clientes
export const getMyTopClients = (params = {}) =>
    api.get("/seller-reports/my-top-clients", { params });

// Helpers
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
