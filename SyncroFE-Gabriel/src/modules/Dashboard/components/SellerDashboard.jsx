import { formatCurrency, getBarHeight } from "./dashboardUtils";

export default function SellerDashboard({ data, userName }) {
    const maxSales = Math.max(...(data.mySalesLast7Days?.map(d => d.total) || [1]), 1);

    return (
        <div className="dashboard-page">
            <h1 className="page-title">Mi Dashboard</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
                Hola, {userName}. Acá está tu resumen de ventas.
            </p>

            {/* ── KPI Cards ── */}
            <div className="kpi-grid">
                <div className="kpi-card kpi-success">
                    <span className="kpi-label">Mis ventas hoy</span>
                    <span className="kpi-value">{data.mySalesToday}</span>
                    <span className="kpi-sub">{formatCurrency(data.myRevenueToday)}</span>
                </div>

                <div className="kpi-card kpi-success">
                    <span className="kpi-label">Esta semana</span>
                    <span className="kpi-value">{data.mySalesThisWeek}</span>
                    <span className="kpi-sub">{formatCurrency(data.myRevenueThisWeek)}</span>
                </div>

                <div className="kpi-card kpi-info">
                    <span className="kpi-label">Este mes</span>
                    <span className="kpi-value">{data.mySalesThisMonth}</span>
                    <span className="kpi-sub">{formatCurrency(data.myRevenueThisMonth)}</span>
                </div>
            </div>

            {/* ── Chart + Top Clientes ── */}
            <div className="dashboard-grid">
                <div className="dash-panel">
                    <h3 className="panel-title">Mis ventas — Últimos 7 días</h3>
                    {data.mySalesLast7Days?.length > 0 ? (
                        <div className="chart-bars">
                            {data.mySalesLast7Days.map((d) => (
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
                        <div className="dashboard-empty">Sin ventas esta semana</div>
                    )}
                </div>

                <div className="dash-panel">
                    <h3 className="panel-title">Mis Top Clientes — Este mes</h3>
                    {data.myTopClients?.length > 0 ? (
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Compras</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.myTopClients.map((c) => (
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

            {/* ── Productos más vendidos ── */}
            <div className="dashboard-grid full-width">
                <div className="dash-panel">
                    <h3 className="panel-title">Mis Productos más vendidos — Este mes</h3>
                    {data.myTopProducts?.length > 0 ? (
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Unidades</th>
                                    <th>Ingresos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.myTopProducts.map((p) => (
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
            </div>
        </div>
    );
}
