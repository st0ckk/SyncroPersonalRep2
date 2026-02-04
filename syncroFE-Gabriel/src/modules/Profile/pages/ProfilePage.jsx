import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "../../../api/users.api";
import "./Profile.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    setError("");
    setLoading(true);

    try {
      await updatePassword({
        currentPassword,
        newPassword,
      });

      alert("Contraseña actualizada. Inicia sesión nuevamente.");

      localStorage.clear();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err.response?.data || "Error al cambiar la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h1>Mi perfil</h1>

      <p><strong>Nombre:</strong> {user.userName} {user.userLastname}</p>
      <p><strong>Email:</strong> {user.userEmail}</p>
      <p><strong>Rol:</strong> {user.userRole}</p>

     
      <button
        className="btn-change-password"
        onClick={() => setShowModal(true)}
      >
        🔐 Cambiar contraseña
      </button>

      {/* 🪟 MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Cambiar contraseña</h3>

            <input
              type="password"
              placeholder="Contraseña actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            {error && <div className="modal-error">{error}</div>}

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>

              <button
                className="btn-primary"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
