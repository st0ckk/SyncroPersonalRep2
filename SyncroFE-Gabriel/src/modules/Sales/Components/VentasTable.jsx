import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateInvoice, validateInvoice } from "../../../api/electronicInvoice.api";
import { usePagination } from "../../../hooks/usePagination";
import PaginationControls from "../../../components/PaginationControls";

export default function VentasTable(
    {
        sales,
        onDelete,
        onEdit,
    }) {
    const navigate = useNavigate();
    const [facturando, setFacturando] = useState(null);
    const [confirmFacturarId, setConfirmFacturarId] = useState(null);

    //Informacion extendida
    const [expandedSaleId, setExpandedSaleId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const formatCurrency = (amount) => `₡ ${parseFloat(amount || 0).toFixed(2)}`;
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("es-CR");
    };


    // Handler para facturar venta
    const handleFacturar = async (purchaseId) => {
        try {
            setFacturando(purchaseId);
            // Validate first
            const valResponse = await validateInvoice({ purchaseId, documentType: "01" });
            if (!valResponse.data.isValid) {
                const errorMsgs = valResponse.data.errors.map(e => `- ${e.message}`).join("\n");
                alert(`Errores de validacion:\n${errorMsgs}`);
                return;
            }
            // Generate
            const response = await generateInvoice({ purchaseId, documentType: "01" });
            if (response.data) {
                alert(`Factura generada exitosamente.\nClave: ${response.data.clave}\nEstado: ${response.data.haciendaStatus}`);
                navigate("/facturacion");
            }
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.validationErrors) {
                const msgs = errorData.validationErrors.map(e => `- ${e.message}`).join("\n");
                alert(`Errores de validacion:\n${msgs}`);
            } else {
                alert(`Error al facturar: ${errorData?.error || errorData?.detail || err.message}`);
            }
        } finally {
            setFacturando(null);
        }
    };

    // Handler para borrar ventas
    const handleDelete = async (purchaseId) => {
        try {
            setDeleting(true);
            await onDelete(purchaseId);
            setConfirmDeleteId(null);
        } catch (err) {
            console.error("Error eliminando venta", err);
        } finally {
            setDeleting(false);
        }
    };


    //Formateo de tipos de estados
    const formatStatusType = (statusString) => {
        var status = "";

        switch (statusString) {
            case true:
                status = "Activa";
                break;
            case false:
                status = "Inactiva";
                break;
            default:
                status = "Sin estado"
                break;
        }
        return status;
    }

    const pagination = usePagination(sales);

    if (!sales.length) {
        return <div className="empty-state">No hay ventas registradas</div>;
    }

    return (
        <>
            <table className="ventas-table">
                <thead>
                    <tr>
                        <th>Numero de orden</th>
                        <th>Estado</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Vendedor</th>
                        <th>Pagado</th>
                        <th>Emision</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {pagination.paginatedData.map((s) => (
                        <>
                            <tr key={s.purchaseId}>
                                <td className="number">{s.purchaseOrderNumber}</td>
                                <td>
                                    <span className={`${formatStatusType(s.isActive)}-status`}>{formatStatusType(s.isActive)}</span>
                                </td>
                                <td>{s.clientName}</td>
                                <td className="total">{formatCurrency(s.total)}</td>
                                <td>{s.userName}</td>
                                <td className="paidStatus">{s.purchasePaid ? "✅" : "❌"}</td>
                                <td>{formatDate(s.purchaseDate)}</td>
                                <td className="actions">
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => setExpandedSaleId(expandedSaleId === s.purchaseId ? null : s.purchaseId)}
                                    >
                                        {expandedSaleId === s.purchaseId ? "Ocultar" : "Detalle"}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => onEdit(s)}
                                        disabled={s.isActive && !s.purchasePaid ? false : true}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => setConfirmDeleteId(s.purchaseId)}
                                        disabled={s.isActive && !s.purchasePaid ? false : true}
                                    >
                                        {!s.isActive && !s.purchasePaid ? "Cancelada" : "Cancelar"}
                                    </button>
                                    <button
                                        className="btn btn-sm"
                                        style={{ backgroundColor: "#6366f1", color: "#fff", border: "none", borderRadius: "6px" }}
                                        onClick={() => setConfirmFacturarId(s.purchaseId)}
                                        disabled={!s.isActive || facturando === s.purchaseId}
                                    >
                                        {facturando === s.purchaseId ? "Facturando..." : "Facturar"}
                                    </button>
                                </td>
                            </tr>

                            {expandedSaleId === s.purchaseId && (
                                <tr className="ventas-extra">
                                    <td colSpan={9}>
                                        <section className="ventas-details-flex">
                                            <span>
                                                <strong>Articulos ordenados: </strong>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Producto</th>
                                                    <th>Precio unitario</th>
                                                    <th>Cantidad</th>
                                                    <th>Total línea</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {s.saleDetails.map((d) => (
                                                    <>
                                                    <tr key={d.saleDetailId}>
                                                        <td>{d.productName}</td>
                                                        <td>{formatCurrency(d.unitPrice)}</td>
                                                        <td>{d.quantity}</td>
                                                        <td>{formatCurrency(d.lineTotal)}</td>
                                                        </tr>
                                                    </>
                                                ))}
                                            </tbody>
                                                </table>
                                            </span>
                                            <span class="ventas-details-remarks">
                                                <strong>Subtotal: </strong>
                                                <br />
                                                {formatCurrency(s.subtotal)}
                                                <br />
                                                <strong>Metodo de pago: </strong>
                                                <br />
                                                {s.purchasePaymentMethod.includes("credit") ? `Cuenta de credito - ${s.accountNumber}` : s.purchasePaymentMethod}
                                                <br />
                                                <strong>Impuestos: </strong>
                                                <br />
                                                {s.taxName ? `${s.taxName}` : "Sin impuesto"}
                                                <br />
                                                <strong>Porcentaje de impuesto: </strong>
                                                <br />
                                                {s.taxName ? `${s.taxPercentage}%` : "N/A"}
                                                <br />
                                            </span>
                                            <span class="ventas-details-discount">
                                                <strong>Descuento aplicable: </strong>
                                                <br />
                                                {s.purchaseDiscountApplied ? "Si" : "No"}
                                                <br />
                                                <strong>Razon de descuento: </strong>
                                                <br />
                                                {s.purchaseDiscountApplied ? `${s.purchaseDiscountReason}` : "N/A"}
                                                <br />
                                                <strong>Porcentaje de descuento: </strong>
                                                <br />
                                                {s.purchaseDiscountApplied ? `${s.purchaseDiscountPercentage}%` : "N/A"}
                                                <br />
                                            </span>
                                        </section>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
            </table>
            <PaginationControls {...pagination} />

            {/* Modal de confirmación de facturación */}
            {confirmFacturarId && (
                <div className="modal-backdrop">
                    <div className="modal modal-confirm">
                        <h3>Confirmar facturación</h3>
                        <p>
                            ¿Está seguro que desea generar la factura electrónica para la venta <strong>#{confirmFacturarId}</strong>?
                        </p>
                        <p className="hint">
                            Esta acción enviará el comprobante a Hacienda y no se puede deshacer.
                        </p>
                        <div className="form-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => setConfirmFacturarId(null)}
                                disabled={facturando === confirmFacturarId}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={async () => {
                                    await handleFacturar(confirmFacturarId);
                                    setConfirmFacturarId(null);
                                }}
                                disabled={facturando === confirmFacturarId}
                            >
                                {facturando === confirmFacturarId ? "Facturando..." : "Sí, facturar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {confirmDeleteId && (
                <div className="modal-backdrop">
                    <div className="modal modal-confirm">
                        <h3>Confirmar eliminación</h3>
                        <p>
                            ¿Está seguro que desea eliminar la venta <strong>#{confirmDeleteId}</strong>?
                        </p>
                        <p className="hint">
                            Esta acción restaurará el inventario de los productos asociados.
                        </p>
                        <div className="form-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={deleting}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDelete(confirmDeleteId)}
                                disabled={deleting}
                            >
                                {deleting ? "Eliminando..." : "Sí, eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
