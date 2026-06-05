import { usePagination } from "../../../hooks/usePagination";
import Button from "../../../components/Button";
import PaginationControls from "../../../components/PaginationControls";

export default function UsersTable({
  data,
  onEdit,
  onToggleStatus,
  onResetPassword,
}) {
  const pagination = usePagination(data);

  return (
    <>
    <div className="table-scroll">
    <table className="users-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Teléfono personal</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Seguridad</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {pagination.paginatedData.map((u) => (
          <tr key={u.userId}>
            <td>
              {u.userName} {u.userLastname}
            </td>
            <td>{u.userEmail}</td>
            <td>{u.telefono || "-"}</td>
            <td>{u.telefonoPersonal || "-"}</td>
            <td>{u.userRole}</td>

            <td>
              <button
                className={`status-btn ${u.isActive ? "active" : "inactive"}`}
                onClick={() => onToggleStatus(u)}
              >
                {u.isActive ? "Activo" : "Inactivo"}
              </button>
            </td>

            <td>
              <div style={{ display: "grid", gap: "6px" }}>
                {u.mustChangePassword && (
                  <span className="badge badge-blue">Debe cambiar contraseña</span>
                )}

                {u.isLocked && (
                  <span className="badge badge-red">Bloqueado</span>
                )}

                {!u.mustChangePassword && !u.isLocked && (
                  <span className="badge badge-green">Normal</span>
                )}
              </div>
            </td>

            <td className="actions">
              <Button variant="outline" onClick={() => onEdit(u)}>
                Editar
              </Button>

              <Button
                variant="danger"
                onClick={() => onResetPassword(u)}
              >
                Restablecer contraseña
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    <PaginationControls {...pagination} />
    </>
  );
}