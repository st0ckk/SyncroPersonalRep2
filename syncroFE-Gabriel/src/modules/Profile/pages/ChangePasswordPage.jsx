import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword } from "../../../api/users.api";
import "./changePassword.css";

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      setLoading(true);

      await updatePassword({
        currentPassword,
        newPassword,
      });

      // 🔓 desbloqueo definitivo
      localStorage.setItem("mustChangePassword", "false");

      // seguridad: cerrar sesión
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      alert("Contraseña actualizada correctamente. Inicia sesión nuevamente.");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data || "Error al cambiar la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <h1>🔐 Cambiar contraseña</h1>
        <p className="subtitle">
          Por seguridad debes cambiar tu contraseña antes de continuar
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
