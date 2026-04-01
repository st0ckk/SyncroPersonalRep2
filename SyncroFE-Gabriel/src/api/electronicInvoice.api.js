import api from "./axios";

// Listar facturas con filtros opcionales
export const getInvoices = (params) =>
    api.get("/electronic-invoice", { params });

// Obtener factura por ID
export const getInvoiceById = (id) =>
    api.get(`/electronic-invoice/${id}`);

// Obtener factura por compra
export const getInvoiceByPurchase = (purchaseId) =>
    api.get(`/electronic-invoice/by-purchase/${purchaseId}`);

// Validar datos antes de generar
export const validateInvoice = (data) =>
    api.post("/electronic-invoice/validate", data);

// Validar datos para nota de credito
export const validateCreditNote = (data) =>
    api.post("/electronic-invoice/validate-credit-note", data);

// Generar y enviar factura a Hacienda
export const generateInvoice = (data) =>
    api.post("/electronic-invoice/generate", data);

// Generar nota de credito
export const generateCreditNote = (data) =>
    api.post("/electronic-invoice/credit-note", data);

// Consultar estado en Hacienda
export const checkInvoiceStatus = (invoiceId) =>
    api.get(`/electronic-invoice/${invoiceId}/status`);

// Reenviar factura fallida
export const resendInvoice = (invoiceId) =>
    api.post(`/electronic-invoice/${invoiceId}/resend`);

// Enviar factura por correo
export const sendInvoiceEmail = (invoiceId, overrideEmail) =>
    api.post(`/electronic-invoice/${invoiceId}/send-email`, null, {
        params: overrideEmail ? { overrideEmail } : undefined,
    });

// Generar y enviar + email en un paso
export const generateAndEmail = (data) =>
    api.post("/electronic-invoice/generate-and-email", data);

// Descargar XML firmado
export const downloadInvoiceXml = async (invoiceId, clave) => {
    const response = await api.get(`/electronic-invoice/${invoiceId}/xml`, {
        responseType: "blob",
    });
    const downloadUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `FE-${clave || invoiceId}.xml`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
};

// Descargar XML respuesta de Hacienda
export const downloadResponseXml = async (invoiceId, clave) => {
    const response = await api.get(
        `/electronic-invoice/${invoiceId}/xml-response`,
        { responseType: "blob" }
    );
    const downloadUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `Respuesta-${clave || invoiceId}.xml`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
};

// Obtener HTML del PDF de factura
export const getInvoicePdfHtml = async (invoiceId) => {
    const response = await api.get(`/electronic-invoice/${invoiceId}/pdf`, {
        responseType: "blob",
    });
    return response.data;
};
