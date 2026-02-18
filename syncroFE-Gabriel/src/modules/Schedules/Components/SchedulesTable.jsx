export default function SchedulesTable({ data, onEdit, onToggleStatus }) {
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-CR") : "-");

  const fmtTime = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleTimeString("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <table className="schedules-table">
      <thead>
        <tr>
          <th>Empleado</th>
          <th>Inicio/Final</th>
          <th>Horario</th>
          <th>Notas</th>
          <th>Estado</th>
          <th style={{ width: 160 }}>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan="6" style={{ textAlign: "center" }}>
              No hay horarios registrados
            </td>
          </tr>
        ) : (
          data.map((s) => (
            <tr key={s.scheduleId}>
              <td>{s.userName}</td>

              <td>
                <div>
                  <strong>Inicio:</strong> {fmtDate(s.startAt)}
                </div>
                <div>
                  <strong>Final:</strong> {fmtDate(s.endAt)}
                </div>
              </td>

              <td>
                {fmtTime(s.startAt)} a {fmtTime(s.endAt)}
              </td>

              <td>{s.notes || "-"}</td>

              <td>
                <span className={s.isActive ? "status-active" : "status-inactive"}>
                  {s.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td>
                <button className="btn btn-sm btn-outline" onClick={() => onEdit(s)}>
                  Editar
                </button>{" "}
                <button
                  className={`btn btn-sm ${s.isActive ? "btn-danger" : "btn-success"}`}
                  onClick={() => onToggleStatus(s)}
                >
                  {s.isActive ? "Desactivar" : "Activar"}
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
