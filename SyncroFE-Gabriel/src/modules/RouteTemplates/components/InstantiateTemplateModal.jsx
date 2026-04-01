import { useEffect, useState } from "react";

import { getUsers } from "../../../api/users.api";

function toDateInput(value) {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString().slice(0, 10);
}

function toDateTimeLocalInput(value) {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
}

export default function InstantiateTemplateModal({
    template,
    submitting,
    onSubmit,
    onCancel,
}) {
    const [drivers, setDrivers] = useState([]);
    const [form, setForm] = useState({
        routeDate: toDateInput(new Date()),
        driverUserId: template?.defaultDriverUserId ?? "",
        startAtPlanned: "",
        routeName: template ? `${template.templateName}` : "",
        notes: template?.description ?? "",
        status: "Scheduled",
    });

    useEffect(() => {
        const loadDrivers = async () => {
            try {
                const response = await getUsers();
                const onlyDrivers = (response.data ?? []).filter(
                    (u) => u.userRole === "Chofer"
                );
                setDrivers(onlyDrivers);
            } catch (err) {
                console.error("Error cargando choferes", err);
            }
        };

        loadDrivers();
    }, []);

    useEffect(() => {
        if (template) {
            setForm({
                routeDate: toDateInput(new Date()),
                driverUserId: template.defaultDriverUserId ?? "",
                startAtPlanned: "",
                routeName: template.templateName ?? "",
                notes: template.description ?? "",
                status: "Scheduled",
            });
        }
    }, [template]);

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.routeDate) {
            alert("Debes seleccionar la fecha.");
            return;
        }

        onSubmit({
            routeDate: form.routeDate,
            driverUserId: form.driverUserId ? Number(form.driverUserId) : null,
            startAtPlanned: form.startAtPlanned || null,
            routeName: form.routeName?.trim() || null,
            notes: form.notes?.trim() || null,
            status: form.status,
        });
    };

    return (
        <div className="modal-backdrop">
            <div className="modal instantiate-template-modal">
                <h3>Usar plantilla</h3>
                <p style={{ marginBottom: 16 }}>
                    <strong>{template?.templateName}</strong>
                </p>

                <form className="template-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Fecha</label>
                        <input
                            type="date"
                            value={form.routeDate}
                            onChange={(e) => updateField("routeDate", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Chofer</label>
                        <select
                            value={form.driverUserId}
                            onChange={(e) => updateField("driverUserId", e.target.value)}
                        >
                            <option value="">Selecciona un chofer</option>
                            {drivers.map((d) => (
                                <option key={d.userId} value={d.userId}>
                                    {d.userName} {d.userLastname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Inicio planificado</label>
                        <input
                            type="datetime-local"
                            value={form.startAtPlanned}
                            onChange={(e) => updateField("startAtPlanned", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Estado</label>
                        <select
                            value={form.status}
                            onChange={(e) => updateField("status", e.target.value)}
                        >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Draft">Draft</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Nombre de la ruta</label>
                        <input
                            value={form.routeName}
                            onChange={(e) => updateField("routeName", e.target.value)}
                            placeholder="Nombre final de la ruta"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Notas</label>
                        <textarea
                            rows="3"
                            value={form.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                        />
                    </div>

                    <div className="form-group full-width template-form-actions">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? "Creando ruta..." : "Crear ruta desde plantilla"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}