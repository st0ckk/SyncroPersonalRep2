import { useState } from "react";
import { changeEmployeeRole } from "../services/employees.service";

export default function EditRoleModal({ employee, onClose, onSaved }) {
  const [role, setRole] = useState(employee.roles[0]);

  const save = async () => {
    await changeEmployeeRole(employee.id, role);
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Cambiar rol</h3>

        <p>{employee.fullName}</p>

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Administrador">Administrador</option>
          <option value="Vendedor">Vendedor</option>
          <option value="Chofer">Chofer</option>
        </select>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={save}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
