import Button from "../../../components/Button";

export default function SchedulesToolbar({
  users,
  selectedUserId,
  onSelectUser,
  showInactive,
  onToggleInactive,
  onNew,
  onOpenVacations,
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

        <Button variant="outline" onClick={onToggleInactive} disabled={!selectedUserId}>
          {showInactive ? "Ocultar inactivos" : "Ver inactivos"}
        </Button>

        <Button
          variant="outline"
          onClick={onOpenVacations}
          disabled={!selectedUserId}
          type="button"
        >
          Vacaciones
        </Button>

        <Button variant="primary" onClick={onNew} disabled={!selectedUserId}>
          + Nuevo
        </Button>
      </div>
    </div>
  );

}
