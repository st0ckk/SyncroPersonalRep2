import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import {
  createVacation,
  getVacationBalance,
  assignVacationDays,
  calculateVacationDays,
} from "../../../api/vacations.api";

export default function VacationModal({ users, selectedUserId, onClose, onToast, onSaved }) {
  const [form, setForm] = useState({
    userId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [availableDays, setAvailableDays] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 👉 Días solicitados vienen del BACKEND
  const [requestedDays, setRequestedDays] = useState(0);
  const [calculatingDays, setCalculatingDays] = useState(false);

  // Panel admin
  const [adminDays, setAdminDays] = useState("");
  const [adminMode, setAdminMode] = useState("add"); // "add" | "set"
  const [savingAdmin, setSavingAdmin] = useState(false);

  useEffect(() => {
    setForm({
      userId: selectedUserId ? String(selectedUserId) : "",
      startDate: "",
      endDate: "",
      reason: "",
    });
    setRequestedDays(0);
  }, [selectedUserId]);

  const loadBalance = async (uid) => {
    if (!uid) return;
    try {
      setLoadingBalance(true);
      const res = await getVacationBalance(uid);
      const val = Number(res.data?.availableDays ?? 0);
      setAvailableDays(val);
    } catch (err) {
      console.error(err);
      onToast?.("error", "No se pudo cargar el saldo de vacaciones.");
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (!form.userId) return;
    loadBalance(form.userId);
  }, [form.userId]);

  // 👉 Cada vez que cambian las fechas, consultamos al BACKEND
  useEffect(() => {
    const fetchDays = async () => {
      if (!form.startDate || !form.endDate) {
        setRequestedDays(0);
        return;
      }

      try {
        setCalculatingDays(true);
        const res = await calculateVacationDays(form.startDate, form.endDate);
        setRequestedDays(Number(res.data?.days ?? 0));
      } catch (err) {
        console.error(err);
        onToast?.("error", "No se pudo calcular los días de vacaciones.");
        setRequestedDays(0);
      } finally {
        setCalculatingDays(false);
      }
    };

    fetchDays();
  }, [form.startDate, form.endDate, onToast]);

  const remainingDays = availableDays - requestedDays;
  const insufficientBalance = requestedDays > 0 && remainingDays < 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // ====== GUARDAR VACACIONES ======
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.userId) return onToast("error", "Seleccione un empleado");
    if (!form.startDate || !form.endDate) return onToast("error", "Seleccione las fechas");
    if (requestedDays <= 0) return onToast("error", "El rango no contiene días hábiles");
    if (insufficientBalance) return onToast("error", "No tiene días suficientes");

    try {
      setSubmitting(true);

      await createVacation({
        userId: Number(form.userId),
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason?.trim() || null,
      });

      onToast("success", "Vacaciones asignadas correctamente");
      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      onToast("error", "No se pudieron asignar las vacaciones");
    } finally {
      setSubmitting(false);
    }
  };

  // ====== PANEL ADMIN: AJUSTAR SALDO ======
  const handleAdminSave = async () => {
    if (!form.userId) return onToast("error", "Seleccione un empleado");
    const daysNum = Number(adminDays);
    if (isNaN(daysNum)) return onToast("error", "Ingrese un número válido");

    try {
      setSavingAdmin(true);

      await assignVacationDays(Number(form.userId), {
        days: daysNum,
        isSetOperation: adminMode === "set",
        reason: adminMode === "set" ? "Ajuste de saldo por admin" : "Suma de días por admin",
      });

      onToast("success", "Saldo de vacaciones actualizado");
      setAdminDays("");
      await loadBalance(form.userId);
    } catch (err) {
      console.error(err);
      onToast("error", "No se pudo actualizar el saldo");
    } finally {
      setSavingAdmin(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Vacaciones del empleado</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Empleado</label>
            <select name="userId" value={form.userId} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              {users.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.userName} {u.userLastname}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <strong>Saldo disponible:</strong>{" "}
            {loadingBalance ? "Cargando..." : `${availableDays} día(s)`}
          </div>

          {/* ===== PANEL ADMIN ===== */}
          <div className="vacation-admin-panel">
            <strong>Administrador: Ajustar saldo</strong>

            <div className="vacation-admin-row">
              <label>
                <input
                  type="radio"
                  checked={adminMode === "add"}
                  onChange={() => setAdminMode("add")}
                />
                Sumar días
              </label>
              <label>
                <input
                  type="radio"
                  checked={adminMode === "set"}
                  onChange={() => setAdminMode("set")}
                />
                Fijar saldo
              </label>
            </div>

            <div className="vacation-admin-input-row">
              <input
                type="number"
                step="0.5"
                placeholder="Cantidad de días"
                value={adminDays}
                onChange={(e) => setAdminDays(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAdminSave}
                disabled={savingAdmin || !form.userId}
              >
                {savingAdmin ? "Guardando..." : "Aplicar"}
              </Button>
            </div>
          </div>

          {/* ===== ASIGNAR VACACIONES ===== */}
          <div
            className="form-group"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label>Fecha inicio</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Fecha final</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <strong>Días solicitados:</strong>{" "}
            {calculatingDays ? "Calculando..." : requestedDays}
          </div>

          {insufficientBalance && (
            <div className="vacation-balance-warning">Saldo insuficiente.</div>
          )}

          <div className="form-group">
            <label>Motivo</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} rows={3} />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button type="button" variant="danger" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="success"
              disabled={submitting || insufficientBalance || calculatingDays}
            >
              {submitting ? "Guardando..." : "Guardar vacaciones"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}