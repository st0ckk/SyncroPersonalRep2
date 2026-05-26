import { formatCurrency, formatDate, getBarHeight, getActivityBadge } from "./dashboardUtils";

export default function AdminDashboard({ data }) {
    const maxSales = Math.max(...(data.salesLast7Days?.map(d => d.total) || [1]), 1);

    return (
        <div className="dashboard-page">
            <h1 className="page-title">Dashboard</h1>

            {/* ── KPI Cards ── */}
            <div className="kpi-grid">
                <div className="kpi-card kpi-info">
                    <span className="kpi-label">Usuarios activos</span>
                    <span className="kpi-value">{data.activeUsers}</span>
                    <span className="kpi-sub">Últimos 30 días</span>
                </div>

                <div className="kpi-card kpi-success">
                    <span className="kpi-label">Ventas hoy</span>
                    <span className="kpi-value">{data.salesToday}</span>
                    <span className="kpi-sub">{formatCurrency(data.revenueToday)}</span>
                </div>

                <div className="kpi-card kpi-success">
                    <span className="kpi-label">Ventas semana</span>
                    <span className="kpi-value">{data.salesThisWeek}</span>
                    <span className="kpi-sub">{formatCurrency(data.revenueThisWeek)}</span>
                </div>

                <div className="kpi-card kpi-success">
                    <span className="kpi-label">Ventas mes</span>
                    <span className="kpi-value">{data.salesThisMonth}</span>
                    <span className="kpi-sub">{formatCurrency(data.revenueThisMonth)}</span>
                </div>

                <div className="kpi-card kpi-warning">
                    <span className="kpi-label">Stock bajo</span>
                    <span className="kpi-value">{data.lowStockProducts}</span>
                    <span className="kpi-sub">Productos ≤ 10 unidades</span>
                </div>
            </div>

            {/* ── Charts + Top Clientes ── */}
            <div className="dashboard-grid">
                {/* Ventas últimos 7 días */}
                <div className="dash-panel">
                    <h3 className="panel-title">Ventas — Últimos 7 días</h3>
                    {data.salesLast7Days?.length > 0 ? (
                        <div className="chart-bars">
                            {data.salesLast7Days.map((d) => (
                                <div key={d.date} className="chart-bar-col">
                                    <span className="chart-bar-value">{d.count}</span>
                                    <div
                                        className="chart-bar"
                                        style={{ height: getBarHeight(d.total, maxSales) }}
                                    />
                                    <span className="chart-bar-label">
                                        {new Date(d.date + "T00:00:00").toLocaleDateString("es-CR", {
                                            weekday: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="dashboard-empty">Sin datos esta semana</div>
                    )}
                </div>

                {/* Top 5 Clientes */}
                <div className="dash-panel">
                    <h3 className="panel-title">Top Clientes — Este mes</h3>
                    {data.topClients?.length > 0 ? (
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Compras</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topClients.map((c) => (
                                    <tr key={c.clientId}>
                                        <td>{c.clientName}</td>
                                        <td className="num">{c.totalPurchases}</td>
                                        <td className="num">{formatCurrency(c.totalSpent)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="dashboard-empty">Sin ventas este mes</div>
                    )}
                </div>
            </div>

            {/* ── Productos más vendidos + Stock bajo ── */}
            <div className="dashboard-grid">
                <div className="dash-panel">
                    <h3 className="panel-title">Productos más vendidos — Este mes</h3>
                    {data.topProducts?.length > 0 ? (
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Unidades</th>
                                    <th>Ingresos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topProducts.map((p) => (
                                    <tr key={p.productId}>
                                        <td>{p.productName}</td>
                                        <td className="num">{p.unitsSold}</td>
                                        <td className="num">{formatCurrency(p.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="dashboard-empty">Sin datos</div>
                    )}
                </div>

                <div className="dash-panel">
                    <h3 className="panel-title">Productos con stock bajo</h3>
                    {data.lowStockList?.length > 0 ? (
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Stock</th>
                                    <th>Proveedor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lowStockList.map((p) => (
                                    <tr key={p.productId}>
                                        <td>{p.productName}</td>
                                        <td className={p.quantity <= 5 ? "stock-low" : "stock-ok"}>
                                            {p.quantity}
                                        </td>
                                        <td>{p.distributorName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="dashboard-empty">Todo el stock está bien</div>
                    )}
                </div>
            </div>

            {/* ── Actividad reciente ── */}
            <div className="dashboard-grid full-width">
                <div className="dash-panel">
                    <h3 className="panel-title">Actividad reciente</h3>
                    {data.recentActivity?.length > 0 ? (
                        <div className="activity-list">
                            {data.recentActivity.map((a) => {
                                const badge = getActivityBadge(a.action);
                                return (
                                    <div key={a.logId} className="activity-item">
                                        <span className={`activity-badge ${badge.cls}`}>
                                            {badge.label}
                                        </span>
                                        <div>
                                            <div>
                                                <strong>{a.userName}</strong> — {a.entityType} #{a.entityId}
                                            </div>
                                            {a.details && (
                                                <div className="activity-meta">{a.details}</div>
                                            )}
                                            <div className="activity-meta">
                                                {formatDate(a.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="dashboard-empty">Sin actividad registrada</div>
                    )}
                </div>
            </div>
        </div>
    );
}
