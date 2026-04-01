import { useEffect, useState } from "react";

export default function UsersForm({
  initialValues,
  submitting,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    userName: "",
    userLastname: "",
    userEmail: "",
    userRole: "",
    telefono: "",
    telefonoPersonal: "",
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        userName: initialValues.userName ?? "",
        userLastname: initialValues.userLastname ?? "",
        userEmail: initialValues.userEmail ?? "",
        userRole: initialValues.userRole ?? "",
        telefono: initialValues.telefono ?? "",
        telefonoPersonal: initialValues.telefonoPersonal ?? "",
      });
    } else {
      setForm({
        userName: "",
        userLastname: "",
        userEmail: "",
        userRole: "",
        telefono: "",
        telefonoPersonal: "",
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="users-form">
      <div className="form-group">
        <label>Nombre</label>
        <input
          name="userName"
          value={form.userName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Apellido</label>
        <input
          name="userLastname"
          value={form.userLastname}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="userEmail"
          value={form.userEmail}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Teléfono</label>
        <input
          type="text"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
          placeholder="Ej: 88887777"
        />
      </div>

      <div className="form-group">
        <label>Teléfono personal</label>
        <input
          type="text"
          name="telefonoPersonal"
          value={form.telefonoPersonal}
          onChange={handleChange}
          placeholder="Ej: 70001111"
        />
      </div>

      <div className="form-group">
        <label>Rol</label>
        <select
          name="userRole"
          value={form.userRole}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un rol</option>
          <option value="SuperUsuario">SuperUsuario</option>
          <option value="Administrador">Administrador</option>
          <option value="Vendedor">Vendedor</option>
          <option value="Chofer">Chofer</option>
        </select>
      </div>

      <div className="modal-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
