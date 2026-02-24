export default function VacationsTable({ data }) {
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-CR") : "-");

  return (
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
          data.map((v) => (
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
                  {v.status}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}