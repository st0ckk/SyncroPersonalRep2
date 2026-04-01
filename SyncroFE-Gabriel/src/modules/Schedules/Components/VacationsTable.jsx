import { usePagination } from "../../../hooks/usePagination";
import PaginationControls from "../../../components/PaginationControls";

export default function VacationsTable({ data }) {
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-CR") : "-");
  const pagination = usePagination(data);

  return (
    <>
    <table className="schedules-table" style={{ marginTop: 16 }}>
      <thead>
        <tr>
          <th>Inicio</th>
          <th>Final</th>
          <th>Días</th>
          <th>Motivo</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan="5" style={{ textAlign: "center" }}>
              No hay vacaciones registradas
            </td>
          </tr>
        ) : (
          pagination.paginatedData.map((v) => {
            const estadoTraducido =
              v.status === "APPROVED"
                ? "Aprobado"
                : v.status === "PENDING"
                ? "Pendiente"
                : v.status === "REJECTED"
                ? "Rechazado"
                : v.status;

            return (
              <tr key={v.vacationId}>
                <td>{fmtDate(v.startDate)}</td>
                <td>{fmtDate(v.endDate)}</td>
                <td>{v.daysRequested}</td>
                <td>{v.reason || "-"}</td>
                <td>
                  <span
                    className={
                      v.status === "APPROVED" ? "status-active" : "status-inactive"
                    }
                  >
                    {estadoTraducido}
                  </span>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
    <PaginationControls {...pagination} />
    </>
  );
}
