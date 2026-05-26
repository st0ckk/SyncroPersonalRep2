import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./changePassword.css";
import { updatePassword } from "../../../api/users.api";
import Swal from "sweetalert2";

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

    if (newPassword === currentPassword) {
      setError("La nueva contraseña no puede ser igual a la actual");
      return;
    }

    try {
      setLoading(true);

      await updatePassword({ currentPassword, newPassword });

      localStorage.removeItem("mustChangePassword");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("roles");
      localStorage.removeItem("twoFactorEnabled");

      await Swal.fire({ icon: "success", title: "Éxito", text: "Contraseña actualizada correctamente. Inicia sesión nuevamente.", timer: 2000, showConfirmButton: false });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err?.response?.data || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-page">
      <div className="cp-card">
        <span className="cp-icon">🔐</span>
        <h1 className="cp-title">Cambiar contraseña</h1>
        <p className="cp-subtitle">
          Por seguridad debes establecer una nueva contraseña antes de continuar
        </p>

        <form onSubmit={handleSubmit}>
          <div className="cp-group">
            <label>Contraseña actual</label>
            <input
              className="cp-input"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="cp-group">
            <label>Nueva contraseña</label>
            <input
              className="cp-input"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="cp-group">
            <label>Confirmar nueva contraseña</label>
            <input
              className="cp-input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="cp-error">{error}</div>}

          <button className="cp-btn" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
