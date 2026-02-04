import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://localhost:7053/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Credenciales inválidas");
      }

      const data = await res.json();

      // 🔐 Guardar sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.userRole);
      localStorage.setItem(
        "mustChangePassword",
        data.mustChangePassword
      );

      // 🔥 FORZAR CAMBIO DE CONTRASEÑA
      if (data.mustChangePassword) {
        navigate("/profile", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-logo">SyncroCR</h1>
        <p className="login-subtitle">Gestión inteligente</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@syncro.local"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* SOLO DEV */}
        <div className="login-dev-box">
          <strong>Usuario de prueba</strong>
          <p>📧 super@syncro.local</p>
          <p>🔑 Admin123*</p>
        </div>
      </div>
    </div>
  );
}
