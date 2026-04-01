import { Fragment, useState } from "react";
import RouteMapPreview from "../../Routes/components/RouteMapPreview";
import { usePagination } from "../../../hooks/usePagination";
import PaginationControls from "../../../components/PaginationControls";

export default function RouteTemplateTable({
    templates,
    onEdit,
    onDeactivate,
    onActivate,
    onInstantiate,
}) {
    const [expandedTemplateId, setExpandedTemplateId] = useState(null);
    const pagination = usePagination(templates);

    const toggleMoreInfo = (id) => {
        setExpandedTemplateId((prev) => (prev === id ? null : id));
    };

    if (!templates.length) {
        return <div className="empty-state">No hay plantillas registradas</div>;
    }

    return (
        <>
        <table className="route-templates-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Chofer por defecto</th>
                    <th>Paradas</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                {pagination.paginatedData.map((t) => (
                    <Fragment key={t.templateId}>
                        <tr>
                            <td>{t.templateId}</td>
                            <td className="number">{t.templateName}</td>
                            <td>{t.defaultDriverName || "-"}</td>
                            <td>{t.stopCount}</td>
                            <td>
                                <span className={`template-status ${t.isActive ? "active" : "inactive"}`}>
                                    {t.isActive ? "Activa" : "Inactiva"}
                                </span>
                            </td>
                            <td className="actions">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => toggleMoreInfo(t.templateId)}
                                >
                                    Más información
                                </button>

                                <button
                                    className="btn btn-outline"
                                    onClick={() => onEdit(t)}
                                >
                                    Editar
                                </button>

                                <button
                                    className="btn btn-primary"
                                    onClick={() => onInstantiate(t)}
                                >
                                    Usar plantilla
                                </button>

                                {t.isActive ? (
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => onDeactivate(t.templateId)}
                                    >
                                        Desactivar
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-success"
                                        onClick={() => onActivate(t.templateId)}
                                    >
                                        Activar
                                    </button>
                                )}
                            </td>
                        </tr>

                        {expandedTemplateId === t.templateId && (
                            <tr className="template-extra">
                                <td colSpan={6}>
                                    <div className="template-extra-grid">
                                        <div>
                                            <h4>Información general</h4>
                                            <p><strong>Nombre:</strong> {t.templateName}</p>
                                            <p><strong>Chofer por defecto:</strong> {t.defaultDriverName || "N/A"}</p>
                                            <p><strong>Descripción:</strong> {t.description || "N/A"}</p>
                                        </div>

                                        <div>
                                            <h4>Paradas</h4>
                                            <div className="template-stops-list">
                                                {(t.stops ?? [])
                                                    .sort((a, b) => a.stopOrder - b.stopOrder)
                                                    .map((s) => (
                                                        <div
                                                            key={s.templateStopId || `${s.clientId}-${s.stopOrder}`}
                                                            className="template-stop-item"
                                                        >
                                                            <strong>#{s.stopOrder}</strong> {s.clientNameSnapshot}
                                                            <br />
                                                            <span>{s.addressSnapshot || "Sin dirección"}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 16 }}>
                                        <RouteMapPreview stops={t.stops ?? []} />
                                    </div>
                                </td>
                            </tr>
                        )}
                    </Fragment>
                ))}
            </tbody>
        </table>
        <PaginationControls {...pagination} />
        </>
    );
}
