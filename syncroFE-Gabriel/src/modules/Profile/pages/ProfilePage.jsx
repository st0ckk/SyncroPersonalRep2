import { useEffect, useMemo, useState } from "react";

import { updatePassword } from "../../../api/users.api";
import { getMyProfile } from "../../../api/account.api";
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

const coversScheduleDay = (schedule, day) =>
  coversRangeDay(schedule.startAt, schedule.endAt, day);

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const userId =
    profile?.userId ?? profile?.id ?? profile?.UserId ?? profile?.Id;

  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(undefined);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const [vacations, setVacations] = useState([]);
  const [loadingVacations, setLoadingVacations] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await getMyProfile();
        setProfile(res.data ?? null);
      } catch (err) {
        console.error("Error cargando perfil:", err);
        console.error("STATUS:", err.response?.status);
        console.error("DATA:", err.response?.data);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        if (!userId) return;

        setLoadingAssets(true);
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

  const loadSchedulesForMonth = async (monthDate) => {
    try {
      setLoadingSchedules(true);

      const from = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1,
        0,
        0,
        0
      );
      const to = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
        23,
        59,
        0
      );

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
      console.error(
        "Error cargando horarios:",
        err.response?.status,
        err.response?.data
      );
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    loadSchedulesForMonth(month);
    setSelectedDay(undefined);
  }, [month]);

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

  const filteredSchedules = useMemo(() => {
    if (!selectedDay) return schedules;
    return schedules.filter((s) => coversScheduleDay(s, selectedDay));
  }, [schedules, selectedDay]);

  const filteredVacations = useMemo(() => {
    const approved = vacations.filter(
      (v) => (v.status ?? v.Status) === "APPROVED"
    );

    if (!selectedDay) return approved;

    return approved.filter((v) =>
      coversRangeDay(
        v.startDate ?? v.StartDate,
        v.endDate ?? v.EndDate,
        selectedDay
      )
    );
  }, [vacations, selectedDay]);

  const resetPasswordModal = () => {
    setShowModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
  };

  const handleChangePassword = async () => {
    setError("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (newPassword === currentPassword) {
      setError("La nueva contraseña no puede ser igual a la actual");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("La confirmación de la contraseña no coincide");
      return;
    }

    try {
      setLoading(true);

      await updatePassword({
        currentPassword,
        newPassword,
      });

      resetPasswordModal();
      alert("Contraseña actualizada correctamente");
    } catch (err) {
      setError(err?.response?.data || "No se pudo cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="page-title">Mi perfil</h1>

      <div className="profile-header-grid">
        <div className="profile-card">
          {loadingProfile ? (
            <p>Cargando perfil...</p>
          ) : !profile ? (
            <p>No se pudo cargar el perfil.</p>
          ) : (
            <>
              <p>
                <strong>Nombre:</strong> {profile.userName}{" "}
                {profile.userLastname}
              </p>
              <p>
                <strong>Email:</strong> {profile.userEmail}
              </p>
              <p>
                <strong>Teléfono:</strong> {profile.telefono || "-"}
              </p>
              <p>
                <strong>Teléfono personal:</strong>{" "}
                {profile.telefonoPersonal || "-"}
              </p>
              <p>
                <strong>Rol:</strong> {profile.userRole}
              </p>

              <button
                className="btn-change-password"
                onClick={() => setShowModal(true)}
              >
                🔐 Cambiar contraseña
              </button>
            </>
          )}
        </div>

        <div className="schedules-panel">
          <div className="profile-card">
            <h1 className="page-title" style={{ marginTop: 0 }}>
              Mis horarios
            </h1>

            <div className="schedule-layout">
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

              <div className="schedule-content">
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

      <div className="profile-card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Mis activos asignados</h3>

        {loadingAssets ? (
          <p>Cargando activos...</p>
        ) : assets.length === 0 ? (
          <p>No tenés activos asignados.</p>
        ) : (
          <div className="table-scroll">
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
                  <td>
                    {new Date(a.assignmentDate).toLocaleDateString("es-CR")}
                  </td>
                  <td>{a.isActive ? "Activo" : "Inactivo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

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

            <div className="form-group">
              <label>Confirmar nueva contraseña</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={resetPasswordModal}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                className="btn btn-primary"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}