import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyTotp } from "../api/account.api";
import "./Login.css";

export default function VerifyTotp() {
    const navigate = useNavigate();
    const location = useLocation();
    const tempToken = location.state?.tempToken;

    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const inputs = useRef([]);

    useEffect(() => {
        if (!tempToken) navigate("/login", { replace: true });
    }, [tempToken, navigate]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...code];
        next[index] = value.slice(-1);
        setCode(next);
        if (value && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setCode(pasted.split(""));
            inputs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join("");
        if (fullCode.length < 6) {
            setError("Ingrese el código de 6 dígitos");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await verifyTotp(tempToken, fullCode);
            const data = res.data;

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("role", data.user.userRole);
            localStorage.setItem("mustChangePassword", data.mustChangePassword);
            localStorage.setItem("twoFactorEnabled", "true");

            if (data.mustChangePassword) {
                navigate("/change-password", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Código incorrecto");
            setCode(["", "", "", "", "", ""]);
            inputs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo-wrapper">
                    <span className="login-logo-flake">❄</span>
                    <h1 className="login-logo">SyncroCR</h1>
                    <span className="login-logo-flake" style={{ animationDirection: "reverse" }}>❄</span>
                </div>
                <p className="login-subtitle">Verificación en dos pasos</p>

                <p style={{ color: "#64748b", fontSize: "0.83rem", marginBottom: "1.4rem", lineHeight: 1.5 }}>
                    Ingrese el código de 6 dígitos de su aplicación de autenticación
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "1.4rem" }}>
                        {code.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => (inputs.current[i] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={handlePaste}
                                style={{
                                    width: "44px",
                                    height: "52px",
                                    textAlign: "center",
                                    fontSize: "1.4rem",
                                    fontWeight: "700",
                                    border: "1px solid #e2e5ea",
                                    borderRadius: "10px",
                                    background: "#ffffff",
                                    color: "#1e293b",
                                    outline: "none",
                                    caretColor: "transparent",
                                    transition: "border-color 0.2s, box-shadow 0.2s",
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#2563eb";
                                    e.target.style.boxShadow = "0 0 0 2px rgba(37,99,235,0.15)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e2e5ea";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        ))}
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? "Verificando..." : "Verificar"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/login", { replace: true })}
                        className="login-btn-back"
                    >
                        ← Volver al inicio de sesión
                    </button>
                </form>
            </div>
        </div>
    );
}
