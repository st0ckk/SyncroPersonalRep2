import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // ── HU1: Estado de bloqueo ──
    const [lockoutEnd, setLockoutEnd] = useState(null);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!lockoutEnd) return;

        const tick = () => {
            const diff = Math.max(0, Math.ceil((new Date(lockoutEnd) - new Date()) / 1000));
            setCountdown(diff);
            if (diff <= 0) {
                setLockoutEnd(null);
                setError("");
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [lockoutEnd]);

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            // ── HU1: Manejar bloqueo (HTTP 423) ──
            if (res.status === 423) {
                const data = await res.json();
                const lockoutUntil = new Date(Date.now() + data.remainingMinutes * 60 * 1000).toISOString();
                setLockoutEnd(lockoutUntil);
                setError(data.message);
                return;
            }

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || "Credenciales inválidas");
            }

            const data = await res.json();

            // ── 2FA: redirigir a verificación TOTP ──
            if (data.requiresTwoFactor) {
                navigate("/verify-totp", { state: { tempToken: data.tempToken }, replace: true });
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", data.user.userRole);
            localStorage.setItem("mustChangePassword", data.mustChangePassword);
            localStorage.setItem("twoFactorEnabled", data.twoFactorEnabled ?? false);

            if (data.mustChangePassword) {
                navigate("/change-password", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isLocked = lockoutEnd && countdown > 0;

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo-wrapper">
                    <span className="login-logo-flake">❄</span>
                    <h1 className="login-logo">SyncroCR</h1>
                    <span className="login-logo-flake" style={{ animationDirection: "reverse" }}>❄</span>
                </div>
                <p className="login-subtitle">TEST</p>

                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label>Correo</label>
                        <input
                            className="login-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="usuario@syncro.local"
                            required
                            disabled={isLocked}
                        />
                    </div>

                    <div className="login-form-group">
                        <label>Contraseña</label>
                        <div className="login-input-wrapper">
                            <input
                                className="login-input"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={isLocked}
                            />
                            <button
                                type="button"
                                className="login-eye-btn"
                                onClick={() => setShowPassword((v) => !v)}
                                tabIndex={-1}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                            {isLocked && (
                                <div style={{ marginTop: "8px", fontWeight: "bold" }}>
                                    Tiempo restante: {formatTime(countdown)}
                                </div>
                            )}
                        </div>
                    )}

                    <button className="login-btn" type="submit" disabled={loading || isLocked}>
                        {isLocked
                            ? `Bloqueado (${formatTime(countdown)})`
                            : loading
                                ? "Ingresando..."
                                : "Ingresar"}
                    </button>

                    <div className="login-forgot">
                        <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
