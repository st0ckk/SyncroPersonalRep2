import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../../../api/users.api";
import { getClients } from "../../../api/clients.api";
import RouteMapPreview from "../../Routes/components/RouteMapPreview";

const emptyForm = {
    templateName: "",
    description: "",
    defaultDriverUserId: "",
    stops: [],
};

export default function RouteTemplateForm({
    initialValues,
    submitting,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState(emptyForm);
    const [drivers, setDrivers] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState("");

    useEffect(() => {
        const loadLookups = async () => {
            try {
                const [usersRes, clientsRes] = await Promise.all([
                    getUsers(),
                    getClients(),
                ]);

                const onlyDrivers = (usersRes.data ?? []).filter(
                    (u) => u.userRole === "Chofer"
                );

                const clientsWithLocation = (clientsRes.data ?? []).filter(
                    (c) =>
                        c.location &&
                        c.location.latitude != null &&
                        c.location.longitude != null
                );

                setDrivers(onlyDrivers);
                setClients(clientsWithLocation);
            } catch (err) {
                console.error("Error cargando datos del formulario de plantillas", err);
            }
        };

        loadLookups();
    }, []);

    useEffect(() => {
        if (initialValues) {
            setForm({
                templateName: initialValues.templateName ?? "",
                description: initialValues.description ?? "",
                defaultDriverUserId: initialValues.defaultDriverUserId ?? "",
                stops: (initialValues.stops ?? [])
                    .sort((a, b) => a.stopOrder - b.stopOrder)
                    .map((s) => ({
                        clientId: s.clientId,
                        clientName: s.clientNameSnapshot,
                        address: s.addressSnapshot,
                        latitude: s.latitude,
                        longitude: s.longitude,
                        stopOrder: s.stopOrder,
                        notes: s.notes ?? "",
                    })),
            });
        } else {
            setForm(emptyForm);
        }
    }, [initialValues]);

    const selectedClientsIds = useMemo(
        () => form.stops.map((s) => s.clientId),
        [form.stops]
    );

    const availableClients = useMemo(
        () => clients.filter((c) => !selectedClientsIds.includes(c.clientId)),
        [clients, selectedClientsIds]
    );

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const addStop = () => {
        if (!selectedClientId) return;

        const client = availableClients.find((c) => c.clientId === selectedClientId);
        if (!client) return;

        setForm((prev) => ({
            ...prev,
            stops: [
                ...prev.stops,
                {
                    clientId: client.clientId,
                    clientName: client.clientName,
                    address: client.location?.address ?? client.exactAddress ?? "",
                    latitude: client.location?.latitude,
                    longitude: client.location?.longitude,
                    stopOrder: prev.stops.length + 1,
                    notes: "",
                },
            ],
        }));

        setSelectedClientId("");
    };

    const removeStop = (index) => {
        setForm((prev) => {
            const updated = prev.stops.filter((_, i) => i !== index);
            return {
                ...prev,
                stops: updated.map((s, i) => ({
                    ...s,
                    stopOrder: i + 1,
                })),
            };
        });
    };

    const moveStop = (index, direction) => {
        setForm((prev) => {
            const updated = [...prev.stops];
            const target = direction === "up" ? index - 1 : index + 1;

            if (target < 0 || target >= updated.length) return prev;

            [updated[index], updated[target]] = [updated[target], updated[index]];

            return {
                ...prev,
                stops: updated.map((s, i) => ({
                    ...s,
                    stopOrder: i + 1,
                })),
            };
        });
    };

    const updateStopField = (index, field, value) => {
        setForm((prev) => ({
            ...prev,
            stops: prev.stops.map((s, i) =>
                i === index ? { ...s, [field]: value } : s
            ),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.templateName.trim()) {
            alert("Debes ingresar el nombre de la plantilla.");
            return;
        }

        if (!form.stops.length) {
            alert("Debes agregar al menos una parada.");
            return;
        }

        onSubmit({
            templateName: form.templateName.trim(),
            description: form.description?.trim() || null,
            defaultDriverUserId: form.defaultDriverUserId
                ? Number(form.defaultDriverUserId)
                : null,
            isActive: true,
            stops: form.stops.map((s, index) => ({
                clientId: s.clientId,
                stopOrder: index + 1,
                notes: s.notes?.trim() || null,
            })),
        });
    };

    return (
        <div className="modal-backdrop">
            <div className="modal template-modal">
                <h3>{initialValues ? "Editar plantilla" : "Nueva plantilla"}</h3>

                <form className="template-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre de la plantilla</label>
                        <input
                            value={form.templateName}
                            onChange={(e) => updateField("templateName", e.target.value)}
                            placeholder="Ej. Ruta Heredia Norte"
                        />
                    </div>

                    <div className="form-group">
                        <label>Chofer por defecto</label>
                        <select
                            value={form.defaultDriverUserId}
                            onChange={(e) => updateField("defaultDriverUserId", e.target.value)}
                        >
                            <option value="">Sin chofer por defecto</option>
                            {drivers.map((d) => (
                                <option key={d.userId} value={d.userId}>
                                    {d.userName} {d.userLastname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Descripción</label>
                        <textarea
                            rows="3"
                            value={form.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Descripción u observaciones de la plantilla"
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Agregar parada</label>
                        <div className="template-stop-adder">
                            <select
                                value={selectedClientId}
                                onChange={(e) => setSelectedClientId(e.target.value)}
                            >
                                <option value="">Selecciona un cliente con ubicación</option>
                                {availableClients.map((c) => (
                                    <option key={c.clientId} value={c.clientId}>
                                        {c.clientName} - {c.location?.address || c.exactAddress || c.clientId}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={addStop}
                            >
                                Agregar parada
                            </button>
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Paradas seleccionadas</label>

                        {!form.stops.length ? (
                            <div className="empty-state">No hay paradas agregadas</div>
                        ) : (
                            <div className="template-stops-editor">
                                {form.stops.map((stop, index) => (
                                    <div key={`${stop.clientId}-${index}`} className="template-stop-card">
                                        <div className="template-stop-card-header">
                                            <strong>Parada #{index + 1}</strong>

                                            <div className="template-stop-actions">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    onClick={() => moveStop(index, "up")}
                                                    disabled={index === 0}
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    onClick={() => moveStop(index, "down")}
                                                    disabled={index === form.stops.length - 1}
                                                >
                                                    ↓
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={() => removeStop(index)}
                                                >
                                                    Quitar
                                                </button>
                                            </div>
                                        </div>

                                        <div className="template-stop-card-body">
                                            <p><strong>Cliente:</strong> {stop.clientName}</p>
                                            <p><strong>Dirección:</strong> {stop.address || "Sin dirección"}</p>

                                            <div className="form-group">
                                                <label>Notas de parada</label>
                                                <input
                                                    value={stop.notes}
                                                    onChange={(e) =>
                                                        updateStopField(index, "notes", e.target.value)
                                                    }
                                                    placeholder="Ej. llamar antes de llegar"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label>Vista previa del mapa</label>
                        <RouteMapPreview
                            stops={form.stops.map((s) => ({
                                ...s,
                                clientNameSnapshot: s.clientName,
                                addressSnapshot: s.address,
                            }))}
                            height="320px"
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
                            {submitting ? "Guardando..." : "Guardar plantilla"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}