import Button from "./Button";

export default function EmployeeTable({ employees, onRefresh }) {
  return (
    <div className="table-scroll">
    <table className="data-table">
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
              <Button variant="warning">Editar</Button>
              <Button variant={e.isActive ? "danger" : "success"}>
                {e.isActive ? "Desactivar" : "Activar"}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
