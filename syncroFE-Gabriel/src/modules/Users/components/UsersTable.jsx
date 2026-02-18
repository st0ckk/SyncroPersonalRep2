export default function UsersTable({ data, onEdit, onToggleStatus }) {
  return (
    <table className="users-table">
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
        {data.map((u) => (
          <tr key={u.userId}>
            <td>{u.userName} {u.userLastname}</td>
            <td>{u.userEmail}</td>
            <td>{u.userRole}</td>

           
            <td>
  <button
    className={`status-btn ${u.isActive ? "active" : "inactive"}`}
    onClick={() => onToggleStatus(u)}
  >
    {u.isActive ? "Activo" : "Inactivo"}
  </button>
</td>


            
            <td className="actions">
              <button className="btn btn-outline" onClick={() => onEdit(u)}>
  Editar
</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
