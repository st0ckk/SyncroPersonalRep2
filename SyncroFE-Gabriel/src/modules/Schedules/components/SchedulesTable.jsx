import { usePagination } from "../../../hooks/usePagination";
import Button from "../../../components/Button";
import PaginationControls from "../../../components/PaginationControls";

export default function SchedulesTable({ data, onEdit, onToggleStatus }) {
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-CR") : "-");
  const pagination = usePagination(data);

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
    <>
    <div className="table-scroll">
    <table className="data-table">
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
          pagination.paginatedData.map((s) => (
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

              <td className="actions">
                <Button variant="warning" size="sm" onClick={() => onEdit(s)}>
                  Editar
                </Button>
                <Button
                  variant={s.isActive ? "danger" : "success"}
                  size="sm"
                  onClick={() => onToggleStatus(s)}
                >
                  {s.isActive ? "Desactivar" : "Activar"}
                </Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
    </div>
    <PaginationControls {...pagination} />
    </>
  );
}
