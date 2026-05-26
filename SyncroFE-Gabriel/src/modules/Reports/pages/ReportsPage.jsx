import "./ReportsPage.css";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    getSalesReport, exportSalesReport,
    getInventoryReport, exportInventoryReport,
    getInvoiceReport, exportInvoiceReport,
} from "../../../api/reports.api";

const TABS = [
    { key: "sales", label: "Ventas" },
    { key: "inventory", label: "Inventario" },
    { key: "invoices", label: "Facturación" },
];

const fmt = (n) => `₡${parseFloat(n || 0).toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-CR") : "—";

export default function ReportsPage() {
    const [tab, setTab] = useState("sales");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("");
    const [paidStatus, setPaidStatus] = useState("");
    const [haciendaStatus, setHaciendaStatus] = useState("");

    const buildParams = () => {
        const p = {};
        if (startDate) p.startDate = startDate;
        if (endDate) p.endDate = endDate;
        if (status) p.status = status;
        if (paidStatus) p.paidStatus = paidStatus;
        if (haciendaStatus) p.haciendaStatus = haciendaStatus;
        return p;
    };

    const loadReport = async () => {
        try {
            setLoading(true);
            setData(null);
            const params = buildParams();
            let res;
            if (tab === "sales") res = await getSalesReport(params);
            else if (tab === "inventory") res = await getInventoryReport(params);
            else res = await getInvoiceReport(params);
            setData(res.data);
        } catch (err) {
            console.error("Error cargando reporte", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setData(null);
        loadReport();
    }, [tab]);

    const handleExport = async () => {
        try {
            setExporting(true);
            const params = buildParams();
            if (tab === "sales") await exportSalesReport(params);
            else if (tab === "inventory") await exportInventoryReport(params);
            else await exportInvoiceReport(params);
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: "Error al exportar" });
        } finally {
            setExporting(false);
        }
    };

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        setStatus("");
        setPaidStatus("");
        setHaciendaStatus("");
    };

    return (
        <div className="reports-page">
            <h1 className="page-title">Reportes</h1>

            {/* Tabs */}
            <div className="report-tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        className={`report-tab ${tab === t.key ? "active" : ""}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="report-filters">
                {(tab === "sales" || tab === "invoices") && (
                    <>
                        <div className="filter-group">
                            <label>Desde</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Hasta</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </>
                )}

                {tab === "sales" && (
                    <>
                        <div className="filter-group">
                            <label>Estado</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="active">Activas</option>
                                <option value="inactive">Inactivas</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Pago</label>
                            <select value={paidStatus} onChange={(e) => setPaidStatus(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="paid">Pagado</option>
                                <option value="unpaid">Pendiente</option>
                            </select>
                        </div>
                    </>
                )}

                {tab === "inventory" && (
                    <div className="filter-group">
                        <label>Estado</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                        </select>
                    </div>
                )}

                {tab === "invoices" && (
                    <div className="filter-group">
                        <label>Estado Hacienda</label>
                        <select value={haciendaStatus} onChange={(e) => setHaciendaStatus(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="accepted">Aceptada</option>
                            <option value="rejected">Rechazada</option>
                            <option value="pending">Pendiente</option>
                        </select>
                    </div>
                )}

                <div className="filter-actions">
                    <button className="btn-filter" onClick={loadReport}>Generar</button>
                    <button className="btn-filter" onClick={handleClear}>Limpiar</button>
                    <button className="btn-export" onClick={handleExport} disabled={exporting || !data}>
                        {exporting ? "Exportando..." : "Exportar CSV"}
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading && <div className="report-loading">Generando reporte...</div>}

            {!loading && data && tab === "sales" && data.summary?.totalSales !== undefined && <SalesView data={data} />}
            {!loading && data && tab === "inventory" && data.summary?.totalProducts !== undefined && <InventoryView data={data} />}
            {!loading && data && tab === "invoices" && data.summary?.totalInvoices !== undefined && <InvoiceView data={data} />}
        </div>
    );
}

// ══════════════════════════════════════════
// Sub-views
// ══════════════════════════════════════════

function SalesView({ data }) {
    const rows = data.rows || [];
    const summary = data.summary || {};
    return (
        <>
            <div className="report-summary">
                <div className="summary-card"><div className="s-label">Total ventas</div><div className="s-value">{summary.totalSales ?? 0}</div></div>
                <div className="summary-card"><div className="s-label">Ingresos</div><div className="s-value">{fmt(summary.totalRevenue)}</div></div>
                <div className="summary-card"><div className="s-label">Subtotal</div><div className="s-value">{fmt(summary.totalSubtotal)}</div></div>
                <div className="summary-card"><div className="s-label">Impuestos</div><div className="s-value">{fmt(summary.totalTax)}</div></div>
                <div className="summary-card"><div className="s-label">Pagadas</div><div className="s-value">{summary.paidCount ?? 0}</div></div>
                <div className="summary-card"><div className="s-label">Pendientes</div><div className="s-value">{summary.unpaidCount ?? 0}</div></div>
            </div>

            {rows.length === 0 ? (
                <div className="report-empty">Sin datos para mostrar</div>
            ) : (
                <div className="report-table-wrapper">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Orden</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Vendedor</th>
                                <th>Subtotal</th>
                                <th>IVA</th>
                                <th>Total</th>
                                <th>Método</th>
                                <th>Pagado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={`sale-${i}-${r.purchaseId}`}>
                                    <td>{r.purchaseOrderNumber}</td>
                                    <td>{fmtDate(r.purchaseDate)}</td>
                                    <td>{r.clientName}</td>
                                    <td>{r.userName}</td>
                                    <td className="num">{fmt(r.subtotal)}</td>
                                    <td className="num">{fmt(r.taxAmount)}</td>
                                    <td className="num">{fmt(r.total)}</td>
                                    <td>{r.paymentMethod}</td>
                                    <td>{r.isPaid ? "✅" : "❌"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

function InventoryView({ data }) {
    const rows = data.rows || [];
    const summary = data.summary || {};
    return (
        <>
            <div className="report-summary">
                <div className="summary-card"><div className="s-label">Productos</div><div className="s-value">{summary.totalProducts ?? 0}</div></div>
                <div className="summary-card"><div className="s-label">Unidades totales</div><div className="s-value">{(summary.totalUnits ?? 0).toLocaleString()}</div></div>
                <div className="summary-card"><div className="s-label">Valor inventario</div><div className="s-value">{fmt(summary.totalInventoryValue)}</div></div>
                <div className="summary-card"><div className="s-label">Stock bajo</div><div className="s-value">{summary.lowStockCount ?? 0}</div></div>
                <div className="summary-card"><div className="s-label">Sin stock</div><div className="s-value">{summary.outOfStockCount ?? 0}</div></div>
            </div>

            {rows.length === 0 ? (
                <div className="report-empty">Sin datos para mostrar</div>
            ) : (
                <div className="report-table-wrapper">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Tipo</th>
                                <th>Stock</th>
                                <th>Precio</th>
                                <th>Valor inv.</th>
                                <th>Proveedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={`inv-${i}-${r.productId}`}>
                                    <td>{r.productName}</td>
                                    <td>{r.productType}</td>
                                    <td className={r.quantity === 0 ? "stock-zero" : r.quantity <= 10 ? "stock-low" : "num"}>
                                        {r.quantity}
                                    </td>
                                    <td className="num">{fmt(r.price)}</td>
                                    <td className="num">{fmt(r.inventoryValue)}</td>
                                    <td>{r.distributorName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

function InvoiceView({ data }) {
    const rows = data.rows || [];
    const summary = data.summary || {};
    const docTypeLabel = (dt) => {
        const map = { "01": "FE", "02": "ND", "03": "NC", "04": "TE", "08": "FEC", "09": "FEE" };
        return map[dt] || dt || "—";
    };
    const statusClass = (s) => {
        if (s === "accepted") return "status-accepted";
        if (s === "rejected") return "status-rejected";
        return "status-pending";
    };

    return (
        <>
            <div className="report-summary">
                <div className="summary-card"><div className="s-label">Total facturas</div><div className="s-value">{summary.totalInvoices ?? 0}</div></div>
                <div className="summary-card"><div className="s-label">Monto total</div><div className="s-value">{fmt(summary.totalAmount)}</div></div>
                <div className="summary-card"><div className="s-label">Aceptadas</div><div className="s-value">{summary.acceptedCount ?? 0}</div></div>
                <div className="summary-card"><div className="s-label">Rechazadas</div><div className="s-value">{summary.rejectedCount ?? 0}</div></div>
                <div className="summary-card"><div className="s-label">Pendientes</div><div className="s-value">{summary.pendingCount ?? 0}</div></div>
            </div>

            {rows.length === 0 ? (
                <div className="report-empty">Sin datos para mostrar</div>
            ) : (
                <div className="report-table-wrapper">
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Consecutivo</th>
                                <th>Tipo</th>
                                <th>Total</th>
                                <th>Emisión</th>
                                <th>Estado</th>
                                <th>Cliente</th>
                                <th>Orden</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={`inv-${i}-${r.invoiceId}`}>
                                    <td>{r.consecutiveNumber || "—"}</td>
                                    <td>{docTypeLabel(r.documentType)}</td>
                                    <td className="num">{fmt(r.invoiceTotal)}</td>
                                    <td>{fmtDate(r.emissionDate)}</td>
                                    <td className={statusClass(r.haciendaStatus)}>
                                        {r.haciendaStatus || "—"}
                                    </td>
                                    <td>{r.clientName}</td>
                                    <td>{r.purchaseOrderNumber}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
