import "./schedules.css";
import { useEffect, useRef, useState } from "react";
import { getUsers } from "../../../api/users.api";
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deactivateSchedule,
  activateSchedule,
} from "../../../api/schedules.api";

import SchedulesToolbar from "../Components/SchedulesToolbar";
import SchedulesTable from "../Components/SchedulesTable";
import SchedulesForm from "../Components/SchedulesForm";

export default function SchedulesPage() {
  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);


  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const clearToastTimer = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  };

  const closeToast = () => {
    clearToastTimer();
    setToast(null);
  };

  const showToast = (type, message) => {
    clearToastTimer();
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3500);
  };


  const loadUsers = async () => {
    try {
      const res = await getUsers();

      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.$values)
          ? res.data.$values
          : [];

      const normalized = raw
        .map((u) => ({
          userId: u.userId ?? u.UserId ?? u.user_id ?? u.id ?? u.Id,
          userName: u.userName ?? u.UserName ?? u.user_name ?? "",
          userLastname: u.userLastname ?? u.UserLastname ?? u.user_lastname ?? "",
          isActive: u.isActive ?? u.IsActive ?? u.is_active ?? true,
        }))
        .filter((u) => u.userId != null)
        .filter((u) => u.isActive === true);

      setUsers(normalized);

      if (!selectedUserId && normalized.length > 0) {
        setSelectedUserId(String(normalized[0].userId));
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err.response?.status, err.response?.data);
      setUsers([]);
      showToast("error", "No se pudieron cargar los empleados.");
    }
  };

  const loadData = async () => {
    if (!selectedUserId) {
      setData([]);
      return;
    }

    try {
      const params = {
        includeInactive: showInactive,
        userId: Number(selectedUserId),
      };

      const res = await getSchedules(params);
      setData(res.data ?? []);
    } catch (err) {
      console.error("Error cargando horarios:", err.response?.status, err.response?.data);
      setData([]);
      showToast("error", "No se pudieron cargar los horarios.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedUserId, showInactive]);

  useEffect(() => {
    return () => clearToastTimer();
  }, []);

  const handleNew = () => {
    if (!selectedUserId) return;
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    if (item?.userId) setSelectedUserId(String(item.userId));
    setEditing(item);
    setShowForm(true);
  };

  const normalizePayload = (values, extra = {}) => ({
    ...values,
    ...extra,
    notes: values?.notes?.trim() ? values.notes : null,
  });

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      if (editing) {
        const payload = normalizePayload(values, {
          scheduleId: editing.scheduleId,
          isActive: values.isActive ?? editing.isActive,
        });

        await updateSchedule(editing.scheduleId, payload);
        showToast("success", "Horario actualizado correctamente.");
      } else {
        const payload = normalizePayload(values, {
          userId: Number(selectedUserId),
        });

        await createSchedule(payload);
        showToast("success", "Horario creado correctamente.");
      }

      setShowForm(false);
      setEditing(null);
      await loadData();
    } catch (err) {
      console.error("Error guardando horario", err);

      const status = err.response?.status;
      const msg =
        err.response?.data ||
        (status === 409
          ? "Ese horario se traslapa con otro existente."
          : "Error guardando horario.");

      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const action = item.isActive ? "desactivar" : "activar";
    if (!window.confirm(`¿Deseas ${action} este horario?`)) return;

    try {
      if (item.isActive) await deactivateSchedule(item.scheduleId);
      else await activateSchedule(item.scheduleId);

      showToast("success", `Horario ${item.isActive ? "desactivado" : "activado"} correctamente.`);
      loadData();
    } catch (err) {
      console.error("Error cambiando estado", err.response?.status, err.response?.data);
      showToast("error", "No se pudo cambiar el estado del horario.");
    }
  };

  return (
    <div className="schedules-page">
      <div className="schedules-container">

        {toast && (
          <div className={`toast toast-${toast.type}`} role="alert">
            <div className="toast-body">{toast.message}</div>

            <button
              className="toast-close"
              onClick={closeToast}
              aria-label="Cerrar"
              type="button"
            >
              ×
            </button>
          </div>
        )}


        <SchedulesToolbar
          users={users}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
          showInactive={showInactive}
          onToggleInactive={() => setShowInactive((s) => !s)}
          onNew={handleNew}
        />

        {!selectedUserId ? (
          <div style={{ marginTop: 16, opacity: 0.8 }}>
            Seleccioná un empleado para ver sus horarios.
          </div>
        ) : (
          <SchedulesTable data={data} onEdit={handleEdit} onToggleStatus={handleToggleStatus} />
        )}

        {showForm && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3 style={{ marginTop: 0 }}>{editing ? "Editar horario" : "Nuevo horario"}</h3>

              <SchedulesForm
                initialValues={editing}
                users={users}
                defaultUserId={selectedUserId}
                lockEmployee={true}
                submitting={submitting}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
