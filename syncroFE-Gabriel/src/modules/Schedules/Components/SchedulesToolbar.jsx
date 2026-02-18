export default function SchedulesToolbar({
  users,
  selectedUserId,
  onSelectUser,
  showInactive,
  onToggleInactive,
  onNew,
}) {
  return (
    <div className="schedules-toolbar">
      <div>
        <h2>Horarios</h2>
        <small>Elegí un empleado para ver y editar sus horarios</small>
      </div>

      <div className="filters">
        <div className="form-group">
          <label>Empleado</label>
          <select value={selectedUserId} onChange={(e) => onSelectUser(e.target.value)}>
            <option value="">Seleccione...</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.userName} {u.userLastname}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-outline" onClick={onToggleInactive} disabled={!selectedUserId}>
          {showInactive ? "Ocultar inactivos" : "Ver inactivos"}
        </button>

        <button className="btn btn-primary" onClick={onNew} disabled={!selectedUserId}>
          + Nuevo
        </button>
      </div>
    </div>
  );
}
