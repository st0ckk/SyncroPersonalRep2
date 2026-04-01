import "./RouteTemplatesPage.css";
import { useEffect, useMemo, useState } from "react";
import {
    activateRouteTemplate,
    createRouteTemplate,
    deactivateRouteTemplate,
    getRouteTemplates,
    instantiateRouteTemplate,
    updateRouteTemplate,
} from "../../../api/routeTemplates.api";

import RouteTemplateToolbar from "../components/RouteTemplateToolbar";
import RouteTemplateFilters from "../components/RouteTemplateFilters";
import RouteTemplateTable from "../components/RouteTemplateTable";
import RouteTemplateForm from "../components/RouteTemplateForm";
import InstantiateTemplateModal from "../components/InstantiateTemplateModal";

export default function RouteTemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [includeInactive, setIncludeInactive] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [instantiateTarget, setInstantiateTarget] = useState(null);
    const [instantiating, setInstantiating] = useState(false);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const response = await getRouteTemplates({ includeInactive });
            setTemplates(response.data ?? []);
        } catch (err) {
            console.error("Error cargando plantillas", err);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, [includeInactive]);

    const filteredTemplates = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return templates;

        return templates.filter((t) =>
            (t.templateName ?? "").toLowerCase().includes(q) ||
            (t.description ?? "").toLowerCase().includes(q) ||
            String(t.templateId ?? "").includes(q) ||
            (t.defaultDriverName ?? "").toLowerCase().includes(q)
        );
    }, [templates, search]);

    const handleNew = () => {
        setEditingTemplate(null);
        setShowForm(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setShowForm(true);
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);

            if (editingTemplate) {
                await updateRouteTemplate(editingTemplate.templateId, {
                    ...values,
                    templateId: editingTemplate.templateId,
                });
            } else {
                await createRouteTemplate(values);
            }

            setShowForm(false);
            setEditingTemplate(null);
            await loadTemplates();
        } catch (err) {
            console.error("Error guardando plantilla", err);
            alert(
                err?.response?.data?.message ||
                err?.response?.data ||
                "No se pudo guardar la plantilla."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivate = async (templateId) => {
        try {
            await deactivateRouteTemplate(templateId);
            await loadTemplates();
        } catch (err) {
            console.error("Error desactivando plantilla", err);
            alert("No se pudo desactivar la plantilla.");
        }
    };

    const handleActivate = async (templateId) => {
        try {
            await activateRouteTemplate(templateId);
            await loadTemplates();
        } catch (err) {
            console.error("Error activando plantilla", err);
            alert("No se pudo activar la plantilla.");
        }
    };

    const handleInstantiate = async (values) => {
        if (!instantiateTarget) return;

        try {
            setInstantiating(true);
            await instantiateRouteTemplate(instantiateTarget.templateId, values);
            setInstantiateTarget(null);
            alert("Ruta creada desde plantilla correctamente.");
        } catch (err) {
            console.error("Error instanciando plantilla", err);
            alert(
                err?.response?.data?.message ||
                err?.response?.data ||
                "No se pudo crear la ruta desde la plantilla."
            );
        } finally {
            setInstantiating(false);
        }
    };

    return (
        <div className="route-templates-page">
            <div className="route-templates-card">
                <RouteTemplateToolbar onNew={handleNew} />

                <RouteTemplateFilters
                    search={search}
                    includeInactive={includeInactive}
                    onSearchChange={setSearch}
                    onIncludeInactiveChange={setIncludeInactive}
                />

                {loading ? (
                    <div className="loading">Cargando plantillas...</div>
                ) : (
                    <RouteTemplateTable
                        templates={filteredTemplates}
                        onEdit={handleEdit}
                        onDeactivate={handleDeactivate}
                        onActivate={handleActivate}
                        onInstantiate={setInstantiateTarget}
                    />
                )}

                {showForm && (
                    <RouteTemplateForm
                        initialValues={editingTemplate}
                        submitting={submitting}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingTemplate(null);
                        }}
                    />
                )}

                {instantiateTarget && (
                    <InstantiateTemplateModal
                        template={instantiateTarget}
                        submitting={instantiating}
                        onSubmit={handleInstantiate}
                        onCancel={() => setInstantiateTarget(null)}
                    />
                )}
            </div>
        </div>
    );
}