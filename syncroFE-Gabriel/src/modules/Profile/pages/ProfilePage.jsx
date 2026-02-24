import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { updatePassword } from "../../../api/users.api";
import { getAssetsByUser } from "../../../api/assets.api";
import { getMySchedules } from "../../../api/schedules.api";
import { getUserVacations } from "../../../api/vacations.api";

import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";

import "./Profile.css";

const pad = (n) => String(n).padStart(2, "0");

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

const coversRangeDay = (startIso, endIso, day) => {
  const s = toMidnight(startIso);
  const e = toMidnight(endIso);
  const d = toMidnight(day);
  return d >= s && d <= e;
};

// schedule cubre ese día
const coversScheduleDay = (schedule, day) =>
  coversRangeDay(schedule.startAt, schedule.endAt, day);

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const userId = user?.userId ?? user?.id ?? user?.UserId ?? user?.Id;

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

  // Vacaciones
  const [vacations, setVacations] = useState([]);
  const [loadingVacations, setLoadingVacations] = useState(true);

  // ✅ Activos
  useEffect(() => {
    const fetchAssets = async () => {
      try {
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
  }, [userId]);

  // ✅ Vacaciones del usuario (1 vez)
  useEffect(() => {
    const fetchVacations = async () => {
      try {
        if (!userId) return;

        setLoadingVacations(true);
        const res = await getUserVacations(userId);
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.$values)
            ? res.data.$values
            : [];

        setVacations(list);
      } catch (err) {
        console.error("Error cargando vacaciones:", err);
        setVacations([]);
      } finally {
        setLoadingVacations(false);
      }
    };

    fetchVacations();
  }, [userId]);

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

  // ✅ Días con horarios (azul)
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

  // ✅ Días con vacaciones (verde)
  const daysWithVacations = useMemo(() => {
    const set = new Set();

    for (const v of vacations) {
      if ((v.status ?? v.Status) !== "APPROVED") continue;

      const start = toMidnight(v.startDate ?? v.StartDate);
      const end = toMidnight(v.endDate ?? v.EndDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        set.add(keyDay(d));
      }
    }

    return Array.from(set).map((k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m - 1, d);
    });
  }, [vacations]);

  // ✅ Horarios filtrados (día seleccionado)
  const filteredSchedules = useMemo(() => {
    if (!selectedDay) return schedules;
    return schedules.filter((s) => coversScheduleDay(s, selectedDay));
  }, [schedules, selectedDay]);

  // ✅ Vacaciones filtradas (día seleccionado)
  const filteredVacations = useMemo(() => {
    const approved = vacations.filter((v) => (v.status ?? v.Status) === "APPROVED");

    if (!selectedDay) return approved;

    return approved.filter((v) =>
      coversRangeDay(
        v.startDate ?? v.StartDate,
        v.endDate ?? v.EndDate,
        selectedDay
      )
    );
  }, [vacations, selectedDay]);

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

        {/* HORARIOS + VACACIONES */}
        <div className="schedules-panel">
          <div className="profile-card">
            <h1 className="page-title" style={{ marginTop: 0 }}>
              Mis horarios
            </h1>

            <div className="schedule-layout">
              {/* Columna izquierda: Calendario */}
              <div className="sched-calendar">
                <DayPicker
                  mode="single"
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  month={month}
                  onMonthChange={setMonth}
                  locale={es}
                  weekStartsOn={1}
                  modifiers={{
                    hasSchedule: daysWithSchedules,
                    hasVacation: daysWithVacations,
                  }}
                  modifiersClassNames={{
                    hasSchedule: "day-has-schedule",
                    hasVacation: "day-has-vacation",
                  }}
                />
              </div>

              {/* Columna derecha: Listas */}
              <div className="schedule-content">
                {/* ===== HORARIOS ===== */}
                <h3 className="section-title">Horarios</h3>

                {loadingSchedules ? (
                  <p className="muted">Cargando horarios...</p>
                ) : filteredSchedules.length === 0 ? (
                  <p className="muted">
                    {selectedDay
                      ? "No hay horarios para este día."
                      : "No hay horarios en este mes."}
                  </p>
                ) : (
                  <div className="schedule-list">
                    {filteredSchedules.map((s) => (
                      <div key={s.scheduleId} className="schedule-item compact">
                        <div className="row">
                          <span className="label">Horario:</span>
                          <span>
                            {fmtTime(s.startAt)} a {fmtTime(s.endAt)}
                          </span>
                        </div>
                        <div className="row">
                          <span className="label">Fechas:</span>
                          <span>
                            {fmtDate(s.startAt)} - {fmtDate(s.endAt)}
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

                {/* ===== VACACIONES ===== */}
                <h3 className="section-title">Vacaciones</h3>

                {loadingVacations ? (
                  <p className="muted">Cargando vacaciones...</p>
                ) : filteredVacations.length === 0 ? (
                  <p className="muted">
                    {selectedDay
                      ? "No hay vacaciones para este día."
                      : "No hay vacaciones registradas."}
                  </p>
                ) : (
                  <div className="schedule-list">
                    {filteredVacations.map((v) => (
                      <div
                        key={v.vacationId ?? v.VacationId}
                        className="schedule-item compact vacation"
                      >
                        <div className="row">
                          <span className="label">Fechas:</span>
                          <span>
                            {fmtDate(v.startDate ?? v.StartDate)} -{" "}
                            {fmtDate(v.endDate ?? v.EndDate)}
                          </span>
                        </div>
                        <div className="row">
                          <span className="label">Días:</span>
                          <span>{v.daysRequested ?? v.DaysRequested}</span>
                        </div>
                        <div className="row">
                          <span className="label">Motivo:</span>
                          <span>{v.reason ?? v.Reason ?? "-"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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