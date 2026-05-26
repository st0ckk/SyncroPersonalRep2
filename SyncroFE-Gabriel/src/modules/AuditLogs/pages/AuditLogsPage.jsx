import "./AuditLogsPage.css";
import { useEffect, useState, useCallback } from "react";
import { getAuditLogs, getAuditLogFilters, exportAuditLogsCsv } from "../../../api/dashboard.api";
import Swal from "sweetalert2";

export default function AuditLogsPage() {
    // Data
    const [logs, setLogs] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Filters
    const [filterAction, setFilterAction] = useState("");
    const [filterUserId, setFilterUserId] = useState("");
    const [filterEntityType, setFilterEntityType] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 20;

    // Filter options (loaded from backend)
    const [actionOptions, setActionOptions] = useState([]);
    const [entityTypeOptions, setEntityTypeOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);

    // Load filter options on mount
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const res = await getAuditLogFilters();
                setActionOptions(res.data.actions || []);
                setEntityTypeOptions(res.data.entityTypes || []);
                setUserOptions(res.data.users || []);
            } catch (err) {
                console.error("Error cargando filtros", err);
            }
        };
        loadFilters();
    }, []);

    // Build params object
    const buildParams = useCallback(() => {
        const params = { page, pageSize };
        if (filterAction) params.action = filterAction;
        if (filterUserId) params.userId = parseInt(filterUserId);
        if (filterEntityType) params.entityType = filterEntityType;
        if (filterStartDate) params.startDate = filterStartDate;
        if (filterEndDate) params.endDate = filterEndDate;
        return params;
    }, [page, filterAction, filterUserId, filterEntityType, filterStartDate, filterEndDate]);

    // Load logs
    const loadLogs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAuditLogs(buildParams());
            setLogs(res.data.data || []);
            setTotalCount(res.data.totalCount || 0);
            setTotalPages(res.data.totalPages || 0);
        } catch (err) {
            console.error("Error cargando logs", err);
        } finally {
            setLoading(false);
        }
    }, [buildParams]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    // Handlers
    const handleFilter = () => {
        setPage(1);
        loadLogs();
    };

    const handleClearFilters = () => {
        setFilterAction("");
        setFilterUserId("");
        setFilterEntityType("");
        setFilterStartDate("");
        setFilterEndDate("");
        setPage(1);
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const params = { ...buildParams() };
            delete params.page;
            delete params.pageSize;
            await exportAuditLogsCsv(params);
        } catch (err) {
            console.error("Error exportando", err);
            Swal.fire({ icon: "error", title: "Error", text: "Error al exportar los logs" });
        } finally {
            setExporting(false);
        }
    };

    // Action badge helper
    const getActionBadge = (action) => {
        const a = (action || "").toUpperCase();
        if (a.includes("LOGIN")) return "login";
        if (a.includes("SALE") || a.includes("CREATED")) return "sale";
        if (a.includes("DELETE")) return "delete";
        if (a.includes("LOCK")) return "locked";
        return "other";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleString("es-CR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    return (
        <div className="audit-logs-page">
            <h1 className="page-title">Logs del Sistema</h1>
            <p className="page-subtitle">
                Registro de auditoría — {totalCount.toLocaleString()} registros encontrados
            </p>

            {/* ── Filtros ── */}
            <div className="audit-filters">
                <div className="filter-group">
                    <label>Acción</label>
                    <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                        <option value="">Todas</option>
                        {actionOptions.map((a) => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Usuario</label>
                    <select value={filterUserId} onChange={(e) => setFilterUserId(e.target.value)}>
                        <option value="">Todos</option>
                        {userOptions.map((u) => (
                            <option key={u.userId} value={u.userId}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Entidad</label>
                    <select value={filterEntityType} onChange={(e) => setFilterEntityType(e.target.value)}>
                        <option value="">Todas</option>
                        {entityTypeOptions.map((e) => (
                            <option key={e} value={e}>{e}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Desde</label>
                    <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>Hasta</label>
                    <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                    />
                </div>

                <div className="filter-actions">
                    <button className="btn-filter" onClick={handleFilter}>Filtrar</button>
                    <button className="btn-filter" onClick={handleClearFilters}>Limpiar</button>
                    <button
                        className="btn-export"
                        onClick={handleExport}
                        disabled={exporting || totalCount === 0}
                    >
                        {exporting ? "Exportando..." : "Exportar CSV"}
                    </button>
                </div>
            </div>

            {/* ── Tabla ── */}
            {loading ? (
                <div className="audit-loading">Cargando logs...</div>
            ) : logs.length === 0 ? (
                <div className="audit-empty">No se encontraron registros con los filtros aplicados.</div>
            ) : (
                <div className="audit-table-wrapper">
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha (UTC)</th>
                                <th>Acción</th>
                                <th>Entidad</th>
                                <th>Entidad ID</th>
                                <th>Usuario</th>
                                <th>Detalles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.logId}>
                                    <td className="id-cell">{log.logId}</td>
                                    <td className="date-cell">{formatDate(log.createdAt)}</td>
                                    <td className="action-cell">
                                        <span className={`action-badge ${getActionBadge(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>{log.entityType}</td>
                                    <td className="id-cell">{log.entityId}</td>
                                    <td>{log.userName}</td>
                                    <td className="details-cell" title={log.details || ""}>
                                        {log.details || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* ── Paginación ── */}
                    <div className="audit-pagination">
                        <span className="page-info">
                            Página {page} de {totalPages} ({totalCount.toLocaleString()} registros)
                        </span>
                        <div className="page-buttons">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(1)}
                            >
                                « Primera
                            </button>
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                ‹ Anterior
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Siguiente ›
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(totalPages)}
                            >
                                Última »
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
