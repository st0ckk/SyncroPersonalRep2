import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { recoverRequest, recoverSetPassword } from "../api/recover.api";
import "./Login.css";
import "./RecoverPassword.css";

export default function RecoverPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  // "request" | "sent" | "reset" | "success"
  const [view, setView] = useState(tokenFromUrl ? "reset" : "request");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user arrives at /recuperar-contrasena?token=... we go straight to reset form
  useEffect(() => {
    if (tokenFromUrl) setView("reset");
  }, [tokenFromUrl]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await recoverRequest(email);
      setView("sent");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (totpCode.length !== 6) {
      setError("El código 2FA debe tener 6 dígitos");
      return;
    }
    setLoading(true);
    try {
      await recoverSetPassword(tokenFromUrl, newPassword, totpCode);
      setView("success");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card recover-card">
        <div className="login-logo-wrapper">
          <span className="login-logo-flake">❄</span>
          <h1 className="login-logo">SyncroCR</h1>
          <span className="login-logo-flake" style={{ animationDirection: "reverse" }}>❄</span>
        </div>
        <p className="login-subtitle">Recuperar contraseña</p>

        {/* ── STEP: request email ── */}
        {view === "request" && (
          <form onSubmit={handleRequest}>
            <p className="recover-hint">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div className="login-form-group">
              <label>Correo electrónico</label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@syncro.local"
                required
                autoFocus
              />
            </div>
            {error && <div className="login-error">{error}</div>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}

        {/* ── STEP: email sent confirmation ── */}
        {view === "sent" && (
          <div className="recover-sent">
            <div className="recover-sent-icon">✉</div>
            <p>Revisa tu bandeja de entrada.</p>
            <p className="recover-hint" style={{ textAlign: "center" }}>
              Si el correo está registrado y tiene 2FA activo, recibirás un enlace válido por 30 minutos.
            </p>
          </div>
        )}

        {/* ── STEP: set new password + TOTP (arrived from email link) ── */}
        {view === "reset" && (
          <form onSubmit={handleReset}>
            <p className="recover-hint">
              Crea tu nueva contraseña y confirma con tu código de autenticación.
            </p>

            <div className="login-form-group">
              <label>Nueva contraseña</label>
              <div className="login-input-wrapper">
                <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="login-form-group">
              <label>Confirmar contraseña</label>
              <div className="login-input-wrapper">
                <input
                  className="login-input"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="login-form-group">
              <label>Código de autenticación (2FA)</label>
              <input
                className="login-input recover-code-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}
            <button
              className="login-btn"
              type="submit"
              disabled={loading || totpCode.length !== 6}
            >
              {loading ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}

        {/* ── STEP: success ── */}
        {view === "success" && (
          <div className="recover-success">
            <div className="recover-success-icon">✓</div>
            <p>¡Contraseña actualizada correctamente!</p>
            <button className="login-btn" onClick={() => navigate("/login")}>
              Ir al inicio de sesión
            </button>
          </div>
        )}

        {(view === "request" || view === "sent") && (
          <div className="recover-login-link">
            <Link to="/login">← Volver al login</Link>
          </div>
        )}
      </div>
    </div>
  );
}
