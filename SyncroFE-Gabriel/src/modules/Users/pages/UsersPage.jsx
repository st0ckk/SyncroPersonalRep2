import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getUsers,
  updateUserStatus,
  updateUser,
  createUser,
  updateUserRole,
  resetUserPassword,
} from "../../../api/users.api";

import { PageCard, Toolbar, FilterBar, DataTable, Modal, StatusBadge, Button } from "../../../components";
import UsersForm from "../components/UsersForm";

export default function UsersPage() {
  const [allData, setAllData] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [filters, setFilters] = useState({ name: "", role: "" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const res = await getUsers();
    setAllData(res.data ?? []);
  };

  useEffect(() => { loadData(); }, []);

  const handleToggleStatus = async (user) => {
    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: `¿Deseas ${user.isActive ? "desactivar" : "activar"} este usuario?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    await updateUserStatus(user.userId, !user.isActive);
    loadData();
  };

  const handleResetPassword = async (user) => {
    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: `¿Deseas restablecer la contraseña de ${user.userName} ${user.userLastname || ""} a "Syncro123*"? El usuario quedará obligado a cambiarla al iniciar sesión.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await resetUserPassword(user.userId);
      Swal.fire({ icon: "success", title: "Éxito", text: "Contraseña restablecida a Syncro123* correctamente.", timer: 2000, showConfirmButton: false });
      loadData();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err?.response?.data?.message || err?.response?.data || "No se pudo restablecer la contraseña." });
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      if (editing) {
        await updateUser(editing.userId, values);
        if (values.userRole !== editing.userRole) {
          await updateUserRole(editing.userId, values.userRole);
        }
      } else {
        await createUser({ ...values, password: "Syncro123*" });
      }
      setShowForm(false);
      setEditing(null);
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const filteredData = allData.filter((u) => {
    if (!showInactive && !u.isActive) return false;
    if (showInactive && u.isActive) return false;
    const fullName = `${u.userName} ${u.userLastname || ""}`.toLowerCase();
    return (
      fullName.includes(filters.name.toLowerCase()) &&
      (!filters.role || u.userRole === filters.role)
    );
  });

  const columns = [
    { key: "name", header: "Nombre", render: (u) => `${u.userName} ${u.userLastname || ""}` },
    { key: "userEmail", header: "Email" },
    { key: "telefono", header: "Teléfono", render: (u) => u.telefono || "-" },
    { key: "telefonoPersonal", header: "Teléfono personal", render: (u) => u.telefonoPersonal || "-" },
    { key: "userRole", header: "Rol" },
    {
      key: "status", header: "Estado",
      render: (u) => (
        <button className={`status-btn ${u.isActive ? "active" : "inactive"}`} onClick={() => handleToggleStatus(u)}>
          {u.isActive ? "Activo" : "Inactivo"}
        </button>
      ),
    },
    {
      key: "security", header: "Seguridad",
      render: (u) => (
        <div style={{ display: "grid", gap: "6px" }}>
          {u.mustChangePassword && <span className="badge badge-blue">Debe cambiar contraseña</span>}
          {u.isLocked && <span className="badge badge-red">Bloqueado</span>}
          {!u.mustChangePassword && !u.isLocked && <span className="badge badge-green">Normal</span>}
        </div>
      ),
    },
    {
      key: "actions", header: "Acciones", className: "actions",
      render: (u) => (
        <>
          <Button variant="warning" onClick={() => { setEditing(u); setShowForm(true); }}>Editar</Button>
          <Button variant="danger" onClick={() => handleResetPassword(u)}>Restablecer contraseña</Button>
        </>
      ),
    },
  ];

  return (
    <PageCard>
      <Toolbar title="Usuarios">
        <Button variant="outline" size="sm" onClick={() => setShowInactive(!showInactive)}>
          {showInactive ? "Ver Activos" : "Ver Inactivos"}
        </Button>
        <Button variant="primary" size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          + Nuevo empleado
        </Button>
      </Toolbar>

      <FilterBar>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">Todos los roles</option>
          <option value="SuperUsuario">SuperUsuario</option>
          <option value="Administrador">Administrador</option>
          <option value="Vendedor">Vendedor</option>
          <option value="Chofer">Chofer</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={filteredData}
        rowKey="userId"
        emptyMessage="No hay usuarios"
      />

      <Modal
        open={showForm}
        title={editing ? "Editar usuario" : "Nuevo usuario"}
        onClose={() => { setShowForm(false); setEditing(null); }}
      >
        <UsersForm
          initialValues={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </PageCard>
  );
}
