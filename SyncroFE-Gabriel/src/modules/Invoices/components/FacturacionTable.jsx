import { useState } from "react";
import {
    downloadInvoiceXml,
    downloadResponseXml,
    sendInvoiceEmail,
    resendInvoice,
} from "../../../api/electronicInvoice.api";

export default function FacturacionTable({ invoices, onCheckStatus, onRefresh }) {
    const [expandedId, setExpandedId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const formatCurrency = (amount) =>
        `\u20A1 ${parseFloat(amount || 0).toLocaleString("es-CR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("es-CR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatStatus = (status) => {
        const map = {
            pending: "Pendiente",
            sent: "Enviado",
            accepted: "Aceptado",
            rejected: "Rechazado",
            error: "Error",
        };
        return map[status] || status || "Desconocido";
    };

    const formatDocType = (type) => {
        const map = {
            "01": "FE",
            "02": "ND",
            "03": "NC",
            "04": "TE",
            "08": "FEC",
            "09": "FEE",
        };
        return map[type] || type;
    };

    const formatDocTypeFull = (type) => {
        const map = {
            "01": "Factura Electronica",
            "02": "Nota de Debito",
            "03": "Nota de Credito",
            "04": "Tiquete Electronico",
            "08": "Factura Electronica Compra",
            "09": "Factura Electronica Exportacion",
        };
        return map[type] || type;
    };

    const getDocTypeClass = (type) => {
        const map = {
            "01": "doctype-fe",
            "02": "doctype-nd",
            "03": "doctype-nc",
            "04": "doctype-te",
        };
        return map[type] || "doctype-fe";
    };

    // Actions
    const handleDownloadXml = async (invoice) => {
        try {
            setActionLoading(`xml-${invoice.invoiceId}`);
            await downloadInvoiceXml(invoice.invoiceId, invoice.clave);
        } catch (err) {
            alert("Error al descargar XML: " + (err.response?.data?.error || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownloadResponse = async (invoice) => {
        try {
            setActionLoading(`resp-${invoice.invoiceId}`);
            await downloadResponseXml(invoice.invoiceId, invoice.clave);
        } catch (err) {
            alert("No hay respuesta XML disponible");
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendEmail = async (invoice) => {
        try {
            setActionLoading(`email-${invoice.invoiceId}`);
            const response = await sendInvoiceEmail(invoice.invoiceId);
            alert(response.data?.message || "Correo enviado");
        } catch (err) {
            alert(
                "Error al enviar correo: " +
                    (err.response?.data?.error || err.message)
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleResend = async (invoice) => {
        try {
            setActionLoading(`resend-${invoice.invoiceId}`);
            await resendInvoice(invoice.invoiceId);
            alert("Factura reenviada a Hacienda");
            onRefresh();
        } catch (err) {
            alert(
                "Error al reenviar: " +
                    (err.response?.data?.error || err.message)
            );
        } finally {
            setActionLoading(null);
        }
    };

    if (!invoices.length) {
        return (
            <div className="empty-state">
                No hay facturas electronicas registradas
            </div>
        );
    }

    return (
        <table className="facturacion-table">
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Consecutivo</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {invoices.map((inv) => (
                    <>
                        <tr key={inv.invoiceId}>
                            <td>
                                <span
                                    className={`doctype-badge ${getDocTypeClass(inv.documentType)}`}
                                >
                                    {formatDocType(inv.documentType)}
                                </span>
                            </td>
                            <td className="clave-cell">
                                {inv.consecutiveNumber || "-"}
                            </td>
                            <td>
                                <span className={`status-${inv.haciendaStatus}`}>
                                    {formatStatus(inv.haciendaStatus)}
                                </span>
                            </td>
                            <td className="total-cell">
                                {formatCurrency(inv.invoiceTotal)}
                            </td>
                            <td>{formatDate(inv.emissionDate)}</td>
                            <td className="actions">
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() =>
                                        setExpandedId(
                                            expandedId === inv.invoiceId
                                                ? null
                                                : inv.invoiceId
                                        )
                                    }
                                >
                                    {expandedId === inv.invoiceId
                                        ? "Ocultar"
                                        : "Detalle"}
                                </button>

                                {(inv.haciendaStatus === "sent" ||
                                    inv.haciendaStatus === "pending") && (
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() =>
                                            onCheckStatus(inv.invoiceId)
                                        }
                                    >
                                        Consultar
                                    </button>
                                )}

                                {inv.haciendaStatus === "error" && (
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleResend(inv)}
                                        disabled={
                                            actionLoading ===
                                            `resend-${inv.invoiceId}`
                                        }
                                    >
                                        Reenviar
                                    </button>
                                )}
                            </td>
                        </tr>

                        {expandedId === inv.invoiceId && (
                            <tr className="facturacion-extra">
                                <td colSpan={6}>
                                    <div className="facturacion-details-grid">
                                        <div className="detail-group">
                                            <strong>Clave Numerica</strong>
                                            <span className="clave-full">
                                                {inv.clave || "-"}
                                            </span>
                                        </div>
                                        <div className="detail-group">
                                            <strong>Tipo Documento</strong>
                                            <span>
                                                {formatDocTypeFull(
                                                    inv.documentType
                                                )}
                                            </span>
                                        </div>
                                        <div className="detail-group">
                                            <strong>Compra ID</strong>
                                            <span>{inv.purchaseId}</span>
                                        </div>
                                        <div className="detail-group">
                                            <strong>Condicion Venta</strong>
                                            <span>
                                                {inv.saleCondition === "01"
                                                    ? "Contado"
                                                    : inv.saleCondition === "02"
                                                      ? "Credito"
                                                      : inv.saleCondition || "-"}
                                            </span>
                                        </div>
                                        <div className="detail-group">
                                            <strong>Medio de Pago</strong>
                                            <span>
                                                {formatPaymentMethod(
                                                    inv.paymentMethodCode
                                                )}
                                            </span>
                                        </div>
                                        <div className="detail-group">
                                            <strong>Moneda</strong>
                                            <span>
                                                {inv.currencyCode || "CRC"}
                                            </span>
                                        </div>
                                        <div className="detail-group">
                                            <strong>Enviado</strong>
                                            <span>
                                                {formatDate(inv.sentAt)}
                                            </span>
                                        </div>
                                        <div className="detail-group">
                                            <strong>Respuesta</strong>
                                            <span>
                                                {formatDate(inv.responseAt)}
                                            </span>
                                        </div>
                                        <div className="detail-group">
                                            <strong>Mensaje</strong>
                                            <span>
                                                {inv.haciendaMessage || "-"}
                                            </span>
                                        </div>

                                        {inv.referenceDocumentClave && (
                                            <>
                                                <div className="detail-group">
                                                    <strong>
                                                        Doc. Referencia
                                                    </strong>
                                                    <span className="clave-full">
                                                        {
                                                            inv.referenceDocumentClave
                                                        }
                                                    </span>
                                                </div>
                                                <div className="detail-group">
                                                    <strong>
                                                        Razon Referencia
                                                    </strong>
                                                    <span>
                                                        {inv.referenceReason ||
                                                            "-"}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Action buttons row */}
                                    <div
                                        style={{
                                            marginTop: "12px",
                                            display: "flex",
                                            gap: "8px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <button
                                            className="btn-icon"
                                            onClick={() =>
                                                handleDownloadXml(inv)
                                            }
                                            disabled={
                                                actionLoading ===
                                                `xml-${inv.invoiceId}`
                                            }
                                        >
                                            Descargar XML
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() =>
                                                handleDownloadResponse(inv)
                                            }
                                            disabled={
                                                actionLoading ===
                                                `resp-${inv.invoiceId}`
                                            }
                                        >
                                            XML Respuesta
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() =>
                                                handleSendEmail(inv)
                                            }
                                            disabled={
                                                actionLoading ===
                                                `email-${inv.invoiceId}`
                                            }
                                        >
                                            Enviar Correo
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </>
                ))}
            </tbody>
        </table>
    );
}

function formatPaymentMethod(code) {
    const map = {
        "01": "Efectivo",
        "02": "Tarjeta",
        "03": "Cheque",
        "04": "Transferencia",
        "99": "Otros",
    };
    return map[code] || code || "-";
}
