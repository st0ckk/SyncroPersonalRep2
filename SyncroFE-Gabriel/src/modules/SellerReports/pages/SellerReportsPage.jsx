import "./SellerReportsPage.css";
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import {
    getMySalesReport,
    exportMySalesReport,
    getMyTopProducts,
    getMyTopClients,
} from "../../../api/sellerReports.api";

const TABS = [
    { key: "sales", label: "Mis Ventas" },
    { key: "products", label: "Productos más vendidos" },
    { key: "clients", label: "Top Clientes" },
];

const fmt = (n) =>
    `₡${parseFloat(n || 0).toLocaleString("es-CR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-CR") : "—");

export default function SellerReportsPage() {
    const [tab, setTab] = useState("sales");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [paidStatus, setPaidStatus] = useState("");
    const [status, setStatus] = useState("");

    const buildParams = useCallback(() => {
        const p = {};
        if (startDate) p.startDate = startDate;
        if (endDate) p.endDate = endDate;
        if (paidStatus) p.paidStatus = paidStatus;
        if (status) p.status = status;
        return p;
    }, [startDate, endDate, paidStatus, status]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const params = buildParams();
            let res;
            if (tab === "sales") res = await getMySalesReport(params);
            else if (tab === "products") res = await getMyTopProducts(params);
            else res = await getMyTopClients(params);
            setData(res.data);
        } catch (err) {
            console.error("Error cargando reporte", err);
        } finally {
            setLoading(false);
        }
    }, [tab, buildParams]);

    useEffect(() => {
        setData(null);
        loadData();
    }, [tab]);

    const handleGenerate = () => loadData();

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        setPaidStatus("");
        setStatus("");
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            await exportMySalesReport(buildParams());
        } catch {
            Swal.fire({ icon: "error", title: "Error", text: "Error al exportar" });
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="seller-reports-page">
            <h1 className="page-title">Mis Reportes</h1>
            <p className="page-subtitle">
                Consultá tu desempeño de ventas, productos y clientes.
            </p>

            {/* Tabs */}
            <div className="seller-tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        className={`seller-tab ${tab === t.key ? "active" : ""}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="seller-filters">
                <div className="filter-group">
                    <label>Desde</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>Hasta</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                {tab === "sales" && (
                    <>
                        <div className="filter-group">
                            <label>Pago</label>
                            <select
                                value={paidStatus}
                                onChange={(e) => setPaidStatus(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="paid">Pagado</option>
                                <option value="unpaid">Pendiente</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Estado</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="">Activas</option>
                                <option value="all">Todas (incluye anuladas)</option>
                                <option value="inactive">Solo anuladas</option>
                            </select>
                        </div>
                    </>
                )}

                <div className="filter-actions">
                    <button className="btn-filter" onClick={handleGenerate}>
                        Generar
                    </button>
                    <button className="btn-filter" onClick={handleClear}>
                        Limpiar
                    </button>
                    {tab === "sales" && (
                        <button
                            className="btn-export"
                            onClick={handleExport}
                            disabled={exporting || !data}
                        >
                            {exporting ? "Exportando..." : "Exportar CSV"}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading && <div className="seller-loading">Generando reporte...</div>}

            {!loading && data && tab === "sales" && data.summary && <MySalesView data={data} />}
            {!loading && data && tab === "products" && data.rows && <MyProductsView data={data} />}
            {!loading && data && tab === "clients" && data.rows && <MyClientsView data={data} />}
        </div>
    );
}

// ══════════════════════════════════════════
// Mis Ventas
// ══════════════════════════════════════════
function MySalesView({ data }) {
    const rows = data.rows || [];
    const summary = data.summary || {};

    return (
        <>
            <div className="seller-summary">
                <div className="summary-card">
                    <div className="s-label">Total ventas</div>
                    <div className="s-value">{summary.totalSales}</div>
                </div>
                <div className="summary-card">
                    <div className="s-label">Ingresos</div>
                    <div className="s-value">{fmt(summary.totalRevenue)}</div>
                </div>
                <div className="summary-card">
                    <div className="s-label">Subtotal</div>
                    <div className="s-value">{fmt(summary.totalSubtotal)}</div>
                </div>
                <div className="summary-card">
                    <div className="s-label">Impuestos</div>
                    <div className="s-value">{fmt(summary.totalTax)}</div>
                </div>
                <div className="summary-card">
                    <div className="s-label">Pagadas</div>
                    <div className="s-value">{summary.paidCount}</div>
                </div>
                <div className="summary-card">
                    <div className="s-label">Pendientes</div>
                    <div className="s-value">{summary.unpaidCount}</div>
                </div>
            </div>

            {rows.length === 0 ? (
                <div className="seller-empty">No hay ventas en este periodo</div>
            ) : (
                <div className="seller-table-wrapper">
                    <table className="seller-table">
                        <thead>
                            <tr>
                                <th>Orden</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Subtotal</th>
                                <th>IVA</th>
                                <th>Total</th>
                                <th>Método</th>
                                <th>Pagado</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={`sale-${r.purchaseId}`} className={r.isActive ? "" : "row-inactive"}>
                                    <td>{r.purchaseOrderNumber}</td>
                                    <td>{fmtDate(r.purchaseDate)}</td>
                                    <td>{r.clientName}</td>
                                    <td className="num">{fmt(r.subtotal)}</td>
                                    <td className="num">{fmt(r.taxAmount)}</td>
                                    <td className="num">{fmt(r.total)}</td>
                                    <td>{r.paymentMethod}</td>
                                    <td>{r.isPaid ? "✅" : "❌"}</td>
                                    <td>{r.isActive ? "Activa" : "Anulada"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

// ══════════════════════════════════════════
// Productos más vendidos
// ══════════════════════════════════════════
function MyProductsView({ data }) {
    const rows = data.rows || [];
    const totalUnitsSold = data.totalUnitsSold ?? 0;
    const totalRevenue = data.totalRevenue ?? 0;

    const getRankClass = (i) => {
        if (i === 0) return "rank-1";
        if (i === 1) return "rank-2";
        if (i === 2) return "rank-3";
        return "rank-other";
    };

    return (
        <>
            <div className="seller-summary">
                <div className="summary-card">
                    <div className="s-label">Productos vendidos</div>
                    <div className="s-value">{rows.length}</div>
                </div>
                <div className="summary-card">
                    <div className="s-label">Unidades totales</div>
                    <div className="s-value">{totalUnitsSold.toLocaleString()}</div>
                </div>
                <div className="summary-card">
                    <div className="s-label">Ingresos totales</div>
                    <div className="s-value">{fmt(totalRevenue)}</div>
                </div>
            </div>

            {rows.length === 0 ? (
                <div className="seller-empty">Sin ventas en este periodo</div>
            ) : (
                <div className="seller-table-wrapper">
                    <table className="seller-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Producto</th>
                                <th>Tipo</th>
                                <th>Unidades</th>
                                <th>Ingresos</th>
                                <th>Precio prom.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={`prod-${i}-${r.productId}`}>
                                    <td>
                                        <span className={`rank-badge ${getRankClass(i)}`}>
                                            {i + 1}
                                        </span>
                                    </td>
                                    <td>{r.productName}</td>
                                    <td>{r.productType}</td>
                                    <td className="num">{r.unitsSold}</td>
                                    <td className="num">{fmt(r.revenue)}</td>
                                    <td className="num">{fmt(r.avgUnitPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

// ══════════════════════════════════════════
// Top Clientes
// ══════════════════════════════════════════
function MyClientsView({ data }) {
    const rows = data.rows || [];
    const totalClients = data.totalClients ?? 0;
    const totalRevenue = data.totalRevenue ?? 0;

    const getRankClass = (i) => {
        if (i === 0) return "rank-1";
        if (i === 1) return "rank-2";
        if (i === 2) return "rank-3";
        return "rank-other";
    };

    return (
        <>
            <div className="seller-summary">
                <div className="summary-card">
                    <div className="s-label">Clientes</div>
                    <div className="s-value">{totalClients}</div>
                </div>
                <div className="summary-card">
                    <div className="s-label">Ingresos totales</div>
                    <div className="s-value">{fmt(totalRevenue)}</div>
                </div>
            </div>

            {rows.length === 0 ? (
                <div className="seller-empty">Sin clientes en este periodo</div>
            ) : (
                <div className="seller-table-wrapper">
                    <table className="seller-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Cliente</th>
                                <th>Tipo</th>
                                <th>Compras</th>
                                <th>Total gastado</th>
                                <th>Última compra</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => (
                                <tr key={`client-${i}-${r.clientId}`}>
                                    <td>
                                        <span className={`rank-badge ${getRankClass(i)}`}>
                                            {i + 1}
                                        </span>
                                    </td>
                                    <td>{r.clientName}</td>
                                    <td>{r.clientType}</td>
                                    <td className="num">{r.totalPurchases}</td>
                                    <td className="num">{fmt(r.totalSpent)}</td>
                                    <td>{fmtDate(r.lastPurchaseDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
