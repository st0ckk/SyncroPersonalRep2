import { useState } from "react";

export default function VentasTable({ sales }) {
    const [expandedId, setExpandedId] = useState(null);

    const formatCurrency = (amount) => `₡${parseFloat(amount || 0).toFixed(2)}`;
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("es-CR");
    };

    if (!sales.length) {
        return <div className="empty-state">No hay ventas registradas</div>;
    }

    return (
        <table className="ventas-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Vendedor</th>
                    <th>Subtotal</th>
                    <th>Impuesto</th>
                    <th>Total</th>
                    <th>Pagado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {sales.map((s) => (
                    <>
                        <tr key={s.purchaseId}>
                            <td>{s.purchaseId}</td>
                            <td>{formatDate(s.purchaseDate)}</td>
                            <td>{s.clientName}</td>
                            <td>{s.userName}</td>
                            <td>{formatCurrency(s.subtotal)}</td>
                            <td>{s.taxName ? `${s.taxName} (${s.taxPercentage}%)` : "Sin impuesto"}</td>
                            <td className="total">{formatCurrency(s.total)}</td>
                            <td>{s.purchasePaid ? "✅" : "❌"}</td>
                            <td>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setExpandedId(expandedId === s.purchaseId ? null : s.purchaseId)}
                                >
                                    {expandedId === s.purchaseId ? "Ocultar" : "Detalle"}
                                </button>
                            </td>
                        </tr>

                        {expandedId === s.purchaseId && (
                            <tr className="sale-detail-row">
                                <td colSpan={9}>
                                    <table className="detail-table">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Precio unitario</th>
                                                <th>Cantidad</th>
                                                <th>Total línea</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {s.details.map((d) => (
                                                <tr key={d.saleDetailId}>
                                                    <td>{d.productName}</td>
                                                    <td>{formatCurrency(d.unitPrice)}</td>
                                                    <td>{d.quantity}</td>
                                                    <td>{formatCurrency(d.lineTotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )}
                    </>
                ))}
            </tbody>
        </table>
    );
}