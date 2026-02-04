import { useState } from "react";
import { changeUserRole } from "../services/users.service";

export default function EditUserRoleModal({ user, onClose, onSaved }) {
  const [role, setRole] = useState(user.userRole);

  const save = async () => {
    await changeUserRole(user.userId, role);
    onSaved();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Cambiar rol</h3>
        <p>{user.userName} {user.userLastname}</p>

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="SuperUsuario">SuperUsuario</option>
          <option value="Administrador">Administrador</option>
          <option value="Vendedor">Vendedor</option>
          <option value="Chofer">Chofer</option>
        </select>

        <div className="modal-actions">
          <button onClick={onClose}>Cancelar</button>
          <button className="primary" onClick={save}>Guardar</button>
        </div>
      </div>
    </div>
  );
}
