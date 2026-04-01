import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../../../api/users.api";
import { getClients } from "../../../api/clients.api";
import RouteMapPreview from "./RouteMapPreview";

const emptyForm = {
  routeName: "",
  routeDate: "",
  driverUserId: "",
  status: "Draft",
  startAtPlanned: "", // ✅ ahora guardamos solo "HH:mm"
  notes: "",
  stops: [],
};

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

// ✅ nuevo: extrae HH:mm desde un DateTime
function toTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function RouteForm({ initialValues, submitting, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [usersRes, clientsRes] = await Promise.all([getUsers(), getClients()]);

        const onlyDrivers = (usersRes.data ?? []).filter((u) => u.userRole === "Chofer");

        const clientsWithLocation = (clientsRes.data ?? []).filter(
          (c) => c.location && c.location.latitude != null && c.location.longitude != null
        );

        setDrivers(onlyDrivers);
        setClients(clientsWithLocation);
      } catch (err) {
        console.error("Error cargando datos del formulario de rutas", err);
      }
    };

    loadLookups();
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({
        routeName: initialValues.routeName ?? "",
        routeDate: toDateInput(initialValues.routeDate),
        driverUserId: initialValues.driverUserId ?? "",
        status: initialValues.status ?? "Draft",
        startAtPlanned: toTimeInput(initialValues.startAtPlanned), // ✅ HH:mm
        notes: initialValues.notes ?? "",
        stops: (initialValues.stops ?? [])
          .slice()
          .sort((a, b) => a.stopOrder - b.stopOrder)
          .map((s) => ({
            clientId: s.clientId,
            clientName: s.clientNameSnapshot,
            address: s.addressSnapshot,
            latitude: s.latitude,
            longitude: s.longitude,
            stopOrder: s.stopOrder,
            plannedArrival: toDateTimeLocalInput(s.plannedArrival),
            notes: s.notes ?? "",
          })),
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValues]);

  const selectedClientsIds = useMemo(() => form.stops.map((s) => s.clientId), [form.stops]);

  const availableClients = useMemo(
    () => clients.filter((c) => !selectedClientsIds.includes(c.clientId)),
    [clients, selectedClientsIds]
  );

  // ✅ opcional: si cambian la fecha, puedes limpiar la hora
  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "routeDate" ? { startAtPlanned: prev.startAtPlanned } : {}), 
      // si prefieres limpiar: { startAtPlanned: "" }
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
          plannedArrival: "",
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
      stops: prev.stops.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.routeName.trim()) {
      alert("Debes ingresar el nombre de la ruta.");
      return;
    }

    if (!form.routeDate) {
      alert("Debes seleccionar la fecha.");
      return;
    }

    if (!form.driverUserId) {
      alert("Debes seleccionar un chofer.");
      return;
    }

    if (!form.stops.length) {
      alert("Debes agregar al menos una parada.");
      return;
    }

    // ✅ combinar fecha + hora
    const startAtPlannedISO =
      form.startAtPlanned && form.routeDate
        ? `${form.routeDate}T${form.startAtPlanned}:00`
        : null;

    onSubmit({
      routeName: form.routeName.trim(),
      routeDate: form.routeDate,
      driverUserId: Number(form.driverUserId),
      status: form.status,
      startAtPlanned: startAtPlannedISO, // ✅ yyyy-mm-ddTHH:mm:00
      notes: form.notes?.trim() || null,
      isActive: true,
      stops: form.stops.map((s, index) => ({
        clientId: s.clientId,
        stopOrder: index + 1,
        plannedArrival: s.plannedArrival || null,
        notes: s.notes?.trim() || null,
      })),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal route-modal">
        <h3>{initialValues ? "Editar ruta" : "Nueva ruta"}</h3>

        <form className="route-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de la ruta</label>
            <input
              value={form.routeName}
              onChange={(e) => updateField("routeName", e.target.value)}
              placeholder="Ej. Ruta Heredia mañana"
            />
          </div>

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
            <label>Estado</label>
            <select value={form.status} onChange={(e) => updateField("status", e.target.value)}>
              <option value="Draft">Borrador</option>
              <option value="Scheduled">Programada</option>
              <option value="InProgress">En progreso</option>
              <option value="Completed">Completada</option>
              <option value="Cancelled">Cancelada</option>
            </select>
          </div>

          <div className="form-group">
            <label>Inicio planificado (hora)</label>
            <input
              type="time"
              value={form.startAtPlanned}
              onChange={(e) => updateField("startAtPlanned", e.target.value)}
              disabled={!form.routeDate} // ✅ opcional: obliga a seleccionar fecha primero
            />
          </div>

          <div className="form-group full-width">
            <label>Notas</label>
            <textarea
              rows="3"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Observaciones generales de la ruta"
            />
          </div>

          <div className="form-group full-width">
            <label>Agregar parada</label>
            <div className="route-stop-adder">
              <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                <option value="">Selecciona un cliente con ubicación</option>
                {availableClients.map((c) => (
                  <option key={c.clientId} value={c.clientId}>
                    {c.clientName} - {c.location?.address || c.exactAddress || c.clientId}
                  </option>
                ))}
              </select>

              <button type="button" className="btn btn-primary" onClick={addStop}>
                Agregar parada
              </button>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Paradas seleccionadas</label>

            {!form.stops.length ? (
              <div className="empty-state">No hay paradas agregadas</div>
            ) : (
              <div className="route-stops-editor">
                {form.stops.map((stop, index) => (
                  <div key={`${stop.clientId}-${index}`} className="route-stop-card">
                    <div className="route-stop-card-header">
                      <strong>Parada #{index + 1}</strong>
                      <div className="route-stop-actions">
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

                    <div className="route-stop-card-body">
                      <p><strong>Cliente:</strong> {stop.clientName}</p>
                      <p><strong>Dirección:</strong> {stop.address || "Sin dirección"}</p>

                      <div className="route-stop-fields">
                        <div className="form-group">
                          <label>Llegada planificada</label>
                          <input
                            type="datetime-local"
                            value={stop.plannedArrival}
                            onChange={(e) => updateStopField(index, "plannedArrival", e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label>Notas de parada</label>
                          <input
                            value={stop.notes}
                            onChange={(e) => updateStopField(index, "notes", e.target.value)}
                            placeholder="Ej. llamar antes de llegar"
                          />
                        </div>
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

          <div className="form-group full-width route-form-actions">
            <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
              Cancelar
            </button>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar ruta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}