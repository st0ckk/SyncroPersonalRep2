import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { updatePassword } from "../../../api/users.api";
import { getAssetsByUser } from "../../../api/assets.api";
import { getMySchedules } from "../../../api/schedules.api";

import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

import "./Profile.css";

const pad = (n) => String(n).padStart(2, "0");

// Evita desfases UTC: manda "YYYY-MM-DDTHH:mm:00" sin Z
const toLocalIsoNoZ = (d) => {
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:00`;
};

const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString("es-CR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "-";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-CR") : "-");

const keyDay = (dateOrIso) => {
  const d = new Date(dateOrIso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toMidnight = (dateOrIso) => {
  const d = new Date(dateOrIso);
  d.setHours(0, 0, 0, 0);
  return d;
};

// true si el schedule cubre ese día (por rango startAt-endAt)
const coversDay = (schedule, day) => {
  const s = toMidnight(schedule.startAt);
  const e = toMidnight(schedule.endAt);
  const d = toMidnight(day);
  return d >= s && d <= e;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Modal contraseña
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Activos
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Horarios (por mes)
  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(undefined);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // ✅ Activos
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const userId = user?.userId ?? user?.id ?? user?.UserId ?? user?.Id;
        if (!userId) return;

        const res = await getAssetsByUser(userId);
        setAssets(res.data ?? []);
      } catch (err) {
        console.error("Error cargando activos:", err);
        setAssets([]);
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchAssets();
  }, [user]);

  // ✅ Horarios del mes usando /api/me/schedules
  const loadSchedulesForMonth = async (monthDate) => {
    try {
      setLoadingSchedules(true);

      const from = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0);
      const to = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 0);

      const params = {
        includeInactive: false,
        from: toLocalIsoNoZ(from),
        to: toLocalIsoNoZ(to),
      };

      const res = await getMySchedules(params);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.$values)
        ? res.data.$values
        : [];

      setSchedules(list);
    } catch (err) {
      console.error("Error cargando horarios:", err.response?.status, err.response?.data);
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    loadSchedulesForMonth(month);
    setSelectedDay(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  // ✅ Marcar días con horarios (marca TODOS los días del rango)
  const daysWithSchedules = useMemo(() => {
    const set = new Set();

    for (const s of schedules) {
      const start = toMidnight(s.startAt);
      const end = toMidnight(s.endAt);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        set.add(keyDay(d));
      }
    }

    return Array.from(set).map((k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m - 1, d);
    });
  }, [schedules]);

  // ✅ Lista por día (si selecciona) o por mes
  const filtered = useMemo(() => {
    if (!selectedDay) return schedules;
    return schedules.filter((s) => coversDay(s, selectedDay));
  }, [schedules, selectedDay]);

  const handleChangePassword = async () => {
    setError("");
    setLoading(true);

    try {
      await updatePassword({ currentPassword, newPassword });

      alert("Contraseña actualizada. Inicia sesión nuevamente.");
      localStorage.clear();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="page-title">Mi perfil</h1>

      <div className="profile-header-grid">
        {/* PERFIL */}
        <div className="profile-card">
          <p>
            <strong>Nombre:</strong> {user?.userName} {user?.userLastname}
          </p>
          <p>
            <strong>Email:</strong> {user?.userEmail}
          </p>
          <p>
            <strong>Rol:</strong> {user?.userRole}
          </p>

          <button className="btn-change-password" onClick={() => setShowModal(true)}>
            🔐 Cambiar contraseña
          </button>
        </div>

        {/* HORARIOS (título fuera del card) */}
        <div className="schedules-panel">
          <div className="profile-card">
            <h1 className="page-title" style={{ marginTop: 0 }}>
            Mis horarios
          </h1>
            <div className="sched-calendar">
              <DayPicker
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                month={month}
                onMonthChange={setMonth}
                locale={es}
                weekStartsOn={1}
                modifiers={{ hasSchedule: daysWithSchedules }}
                modifiersClassNames={{ hasSchedule: "day-has-schedule" }}
              />
            </div>

            {loadingSchedules ? (
              <p className="muted" style={{ marginTop: 10 }}>
                Cargando horarios...
              </p>
            ) : filtered.length === 0 ? (
              <p className="muted" style={{ marginTop: 10 }}>
                {selectedDay ? "No hay horarios para este día." : "No hay horarios en este mes."}
              </p>
            ) : (
              <div className="schedule-list" style={{ marginTop: 10 }}>
                {filtered.map((s) => (
                  <div key={s.scheduleId} className="schedule-item compact">
                    <div className="row">
                      <span className="label">Inicio/Final:</span>
                      <span>
                        {fmtDate(s.startAt)} - {fmtDate(s.endAt)}
                      </span>
                    </div>
                    <div className="row">
                      <span className="label">Horario:</span>
                      <span>
                        {fmtTime(s.startAt)} a {fmtTime(s.endAt)}
                      </span>
                    </div>
                    <div className="row">
                      <span className="label">Notas:</span>
                      <span>{s.notes ?? "-"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVOS */}
      <div className="profile-card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Mis activos asignados</h3>

        {loadingAssets ? (
          <p>Cargando activos...</p>
        ) : assets.length === 0 ? (
          <p>No tenés activos asignados.</p>
        ) : (
          <table className="assets-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Serie</th>
                <th>Descripción</th>
                <th>Fecha asignación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.assetId}>
                  <td>{a.assetName}</td>
                  <td>{a.serialNumber || "-"}</td>
                  <td>{a.description || "-"}</td>
                  <td>{new Date(a.assignmentDate).toLocaleDateString("es-CR")}</td>
                  <td>{a.isActive ? "Activo" : "Inactivo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CONTRASEÑA */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Cambiar contraseña</h3>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="form-group">
              <label>Contraseña actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Nueva contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setError("");
                }}
                disabled={loading}
              >
                Cancelar
              </button>

              <button className="btn btn-primary" onClick={handleChangePassword} disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
