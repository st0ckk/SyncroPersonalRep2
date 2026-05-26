import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getTwoFactorSetup, enableTwoFactor, disableTwoFactor } from "../../../api/account.api";
import "./TwoFactorCard.css";
import Swal from "sweetalert2";

export default function TwoFactorCard({ twoFactorEnabled, onStatusChange }) {
    const [step, setStep] = useState("idle");
    const [qrUri, setQrUri] = useState("");
    const [secret, setSecret] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const startSetup = async () => {
        setError("");
        setLoading(true);
        try {
            const res = await getTwoFactorSetup();
            setQrUri(res.data.otpauthUri);
            setSecret(res.data.secret);
            setStep("setup");
        } catch {
            setError("No se pudo generar la configuración. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleEnable = async (e) => {
        e.preventDefault();
        if (code.length !== 6) { setError("El código debe tener 6 dígitos"); return; }
        setError("");
        setLoading(true);
        try {
            await enableTwoFactor(code);
            setStep("idle");
            setCode(""); setSecret(""); setQrUri("");
            localStorage.setItem("twoFactorEnabled", "true");
            onStatusChange(true);
        } catch (err) {
            setError(err?.response?.data?.message || "Código incorrecto");
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        const result = await Swal.fire({
            title: "¿Está seguro?",
            text: "¿Está seguro de que desea desactivar la autenticación en dos pasos?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "Cancelar",
        });
        if (!result.isConfirmed) return;
        setLoading(true);
        try {
            await disableTwoFactor();
            localStorage.setItem("twoFactorEnabled", "false");
            onStatusChange(false);
        } catch {
            setError("No se pudo desactivar el 2FA. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setStep("idle");
        setCode(""); setError(""); setSecret(""); setQrUri("");
    };

    return (
        <div className="profile-card" style={{ marginTop: 16 }}>
            <div className="tf-header">
                <div>
                    <h3 className="tf-title">Autenticación en dos pasos (2FA)</h3>
                    <p className="tf-subtitle">
                        Estado:{" "}
                        <span className={twoFactorEnabled ? "tf-status-on" : "tf-status-off"}>
                            {twoFactorEnabled ? "Activado" : "Desactivado"}
                        </span>
                    </p>
                </div>

                {step === "idle" && (
                    twoFactorEnabled ? (
                        <button className="tf-btn tf-btn-danger" onClick={handleDisable} disabled={loading}>
                            {loading ? "Desactivando..." : "Desactivar 2FA"}
                        </button>
                    ) : (
                        <button className="tf-btn tf-btn-primary" onClick={startSetup} disabled={loading}>
                            {loading ? "Cargando..." : "Activar 2FA"}
                        </button>
                    )
                )}
            </div>

            {error && <p className="tf-error">{error}</p>}

            {step === "setup" && (
                <div>
                    <p className="tf-setup-desc">
                        Escanee el código QR con <strong>Google Authenticator</strong>, <strong>Authy</strong> u otra app TOTP:
                    </p>

                    <div className="tf-qr-wrapper">
                        <div className="tf-qr-box">
                            <QRCodeSVG value={qrUri} size={180} bgColor="transparent" fgColor="#e2e8f0" />
                        </div>

                        <div className="tf-setup-side">
                            <p className="tf-secret-label">
                                Si no puede escanear el QR, ingrese esta clave manualmente:
                            </p>
                            <code className="tf-secret-code">{secret}</code>

                            <p className="tf-confirm-label">
                                Luego ingrese el código de 6 dígitos que muestra la app para confirmar:
                            </p>

                            <form className="tf-confirm-form" onSubmit={handleEnable}>
                                <input
                                    className="tf-code-input"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                    placeholder="000000"
                                />
                                <button type="submit" className="tf-btn tf-btn-success" disabled={loading}>
                                    {loading ? "..." : "Confirmar"}
                                </button>
                                <button type="button" className="tf-btn tf-btn-neutral" onClick={handleCancel}>
                                    Cancelar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
