import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
    activateRouteTemplate,
    createRouteTemplate,
    deactivateRouteTemplate,
    getRouteTemplates,
    instantiateRouteTemplate,
    updateRouteTemplate,
} from "../../../api/routeTemplates.api";

import { PageCard, Toolbar, FilterBar, Button } from "../../../components";
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

    useEffect(() => { loadTemplates(); }, [includeInactive]);

    const filteredTemplates = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return templates;
        return templates.filter(t =>
            (t.templateName ?? "").toLowerCase().includes(q) ||
            (t.description ?? "").toLowerCase().includes(q) ||
            String(t.templateId ?? "").includes(q) ||
            (t.defaultDriverName ?? "").toLowerCase().includes(q)
        );
    }, [templates, search]);

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            if (editingTemplate) {
                await updateRouteTemplate(editingTemplate.templateId, { ...values, templateId: editingTemplate.templateId });
            } else {
                await createRouteTemplate(values);
            }
            setShowForm(false);
            setEditingTemplate(null);
            await loadTemplates();
        } catch (err) {
            console.error("Error guardando plantilla", err);
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || err?.response?.data || "No se pudo guardar la plantilla." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleInstantiate = async (values) => {
        if (!instantiateTarget) return;
        try {
            setInstantiating(true);
            await instantiateRouteTemplate(instantiateTarget.templateId, values);
            setInstantiateTarget(null);
            Swal.fire({ icon: "success", title: "Éxito", text: "Ruta creada desde plantilla correctamente.", timer: 2000, showConfirmButton: false });
        } catch (err) {
            console.error("Error instanciando plantilla", err);
            Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || err?.response?.data || "No se pudo crear la ruta desde la plantilla." });
        } finally {
            setInstantiating(false);
        }
    };

    return (
        <PageCard>
            <Toolbar title="Plantillas de Rutas">
                <Button variant="primary" onClick={() => { setEditingTemplate(null); setShowForm(true); }}>
                    + Nueva plantilla
                </Button>
            </Toolbar>

            <FilterBar>
                <input type="text" placeholder="Buscar plantilla..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <label>
                    <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
                    Incluir inactivas
                </label>
            </FilterBar>

            {loading ? (
                <div className="loading">Cargando plantillas...</div>
            ) : (
                <RouteTemplateTable
                    templates={filteredTemplates}
                    onEdit={(t) => { setEditingTemplate(t); setShowForm(true); }}
                    onDeactivate={async (id) => { await deactivateRouteTemplate(id); loadTemplates(); }}
                    onActivate={async (id) => { await activateRouteTemplate(id); loadTemplates(); }}
                    onInstantiate={setInstantiateTarget}
                />
            )}

            {showForm && (
                <RouteTemplateForm
                    initialValues={editingTemplate}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingTemplate(null); }}
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
        </PageCard>
    );
}
