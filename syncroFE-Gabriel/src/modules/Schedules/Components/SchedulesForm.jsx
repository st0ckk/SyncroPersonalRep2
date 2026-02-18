import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

const pad = (n) => String(n).padStart(2, "0");

const toTimeInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toDateOnly = (iso) => {
  if (!iso) return undefined;
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// arma "YYYY-MM-DDTHH:mm:00" (sin timezone)
const combineLocal = (dateObj, timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    h,
    m,
    0,
    0
  );
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`;
};

const addDays = (dateObj, days) => {
  const d = new Date(dateObj);
  d.setDate(d.getDate() + days);
  return d;
};

export default function SchedulesForm({
  initialValues,
  users,
  defaultUserId,
  lockEmployee = true,
  submitting,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    userId: "",
    startTime: "",
    endTime: "",
    notes: "",
    isActive: true,
  });

  const [range, setRange] = useState({ from: undefined, to: undefined });

  useEffect(() => {
    if (initialValues?.scheduleId) {
      setForm({
        scheduleId: initialValues.scheduleId,
        userId: String(initialValues.userId ?? ""),
        startTime: toTimeInput(initialValues.startAt),
        endTime: toTimeInput(initialValues.endAt),
        notes: initialValues.notes || "",
        isActive: initialValues.isActive ?? true,
      });

      setRange({
        from: toDateOnly(initialValues.startAt),
        to: toDateOnly(initialValues.endAt),
      });
    } else {
      setForm({
        userId: defaultUserId ? String(defaultUserId) : "",
        startTime: "",
        endTime: "",
        notes: "",
        isActive: true,
      });
      setRange({ from: undefined, to: undefined });
    }
  }, [initialValues?.scheduleId, defaultUserId]);

  const disableEmployeeSelect = lockEmployee && !!defaultUserId;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.userId) return alert("Seleccione empleado");
    if (!range?.from) return alert("Seleccione fecha de inicio (y final si aplica)");
    if (!form.startTime || !form.endTime) return alert("Complete horas inicio y fin");

    const startDate = range.from;
    let endDate = range.to ?? range.from;

    // Si NO eligió rango y la hora fin es menor/igual -> termina al día siguiente (ej: nocturno)
    if (!range.to && form.endTime <= form.startTime) {
      endDate = addDays(endDate, 1);
    }

    const startAt = combineLocal(startDate, form.startTime);
    const endAt = combineLocal(endDate, form.endTime);

    onSubmit({
      userId: parseInt(form.userId, 10),
      startAt,
      endAt,
      notes: form.notes?.trim() ? form.notes.trim() : null,
      isActive: form.isActive ?? true,
      scheduleId: form.scheduleId,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Empleado *</label>
        <select
          name="userId"
          value={form.userId}
          onChange={handleChange}
          required
          disabled={disableEmployeeSelect}
        >
          <option value="">Seleccione...</option>
          {users.map((u) => (
            <option key={u.userId} value={u.userId}>
              {u.userName} {u.userLastname}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Fechas (Inicio / Final) *</label>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10 }}>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(r) => setRange(r ?? { from: undefined, to: undefined })}
            locale={es}
            showWeekNumber
            weekStartsOn={1}
          />
        </div>
        <small style={{ display: "block", marginTop: 6, opacity: 0.8 }}>
          Tip: seleccioná una fecha para inicio; seleccioná otra para final (rango).
        </small>
      </div>

      <div
        className="form-group"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        <div>
          <label>Hora inicio *</label>
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            step="60"
            required
          />
        </div>
        <div>
          <label>Hora fin *</label>
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            step="60"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Notas</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Escriba una nota (opcional)"
        />
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
