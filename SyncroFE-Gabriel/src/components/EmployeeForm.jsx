import { useState } from "react";
import { createEmployee } from "../services/employees.service";
import "./EmployeeForm.css";

export default function EmployeeForm({ onClose, onSaved }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Vendedor",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createEmployee(form);
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Nuevo empleado</h3>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Nombre completo"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />

          <input
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="Administrador">Administrador</option>
            <option value="Vendedor">Vendedor</option>
            <option value="Chofer">Chofer</option>
          </select>

          <div className="modal-actions">
            <button className="btn-secondary" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
