import "./EmployeeTable.css";

export default function EmployeeTable({ employees, onRefresh }) {
  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((e) => (
          <tr key={e.id}>
            <td>{e.fullName}</td>
            <td>{e.email}</td>
            <td>
              <span className={`role-badge role-${e.role.toLowerCase()}`}>
                {e.role}
              </span>
            </td>
            <td>
              <span className={e.isActive ? "active" : "inactive"}>
                {e.isActive ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td>
              <button className="btn-secondary">Editar</button>
              <button className="btn-warning">
                {e.isActive ? "Desactivar" : "Activar"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
