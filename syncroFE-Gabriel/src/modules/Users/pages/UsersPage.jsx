import "../users.css";
import { useEffect, useState } from "react";
import {
  getUsers,
  updateUserStatus,
  updateUser,
  createUser,
  updateUserRole,
  resetUserPassword,
} from "../../../api/users.api";

import UsersTable from "../components/UsersTable";
import UsersToolbar from "../components/UsersToolbar";
import UsersForm from "../components/UsersForm";

export default function UsersPage() {
  const [allData, setAllData] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    role: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const res = await getUsers();
    setAllData(res.data ?? []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user) => {
    if (
      !window.confirm(
        `¿Deseas ${user.isActive ? "desactivar" : "activar"} este usuario?`
      )
    ) {
      return;
    }

    await updateUserStatus(user.userId, !user.isActive);
    loadData();
  };

  const handleResetPassword = async (user) => {
    const ok = window.confirm(
      `¿Deseas restablecer la contraseña de ${user.userName} ${user.userLastname || ""} a "Syncro123*"?\n\nEl usuario quedará obligado a cambiarla al iniciar sesión.`
    );

    if (!ok) return;

    try {
      await resetUserPassword(user.userId);
      alert("Contraseña restablecida a Syncro123* correctamente.");
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data || "No se pudo restablecer la contraseña.");
    }
  };

  const handleEdit = (user) => {
    setEditing(user);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditing(null);
    setShowForm(true);
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
        await createUser({
          ...values,
          password: "Syncro123*",
        });
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

  return (
    <div className="users-page">
      <div className="users-container">
        <UsersToolbar
          showInactive={showInactive}
          onToggle={() => setShowInactive(!showInactive)}
          onNew={handleNew}
          filters={filters}
          onFilterChange={setFilters}
        />

        <UsersTable
          data={filteredData}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
        />
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editing ? "Editar usuario" : "Nuevo usuario"}</h3>

            <UsersForm
              initialValues={editing}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}