import { createPortal } from "react-dom";

export default function ValidationResultModal({ result, onClose }) {
    const hasErrors = result.errors?.length > 0;
    const hasWarnings = result.warnings?.length > 0;

    const modal = (
        <div className="modal-backdrop">
            <div className="modal validation-modal">
                <h3 style={{ color: hasErrors ? "#dc2626" : "#a16207" }}>
                    {hasErrors
                        ? "Errores de Validacion"
                        : "Advertencias"}
                </h3>

                {hasErrors && (
                    <>
                        <p style={{ fontSize: "13px", marginBottom: "12px" }}>
                            Corrija los siguientes errores antes de generar la
                            factura:
                        </p>
                        <ul className="validation-list">
                            {result.errors.map((err, i) => (
                                <li key={`err-${i}`} className="val-error">
                                    <span className="val-icon">&#10060;</span>
                                    <div className="val-text">
                                        <span className="val-field">
                                            {err.field}
                                        </span>
                                        {err.message}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {hasWarnings && (
                    <>
                        <p
                            style={{
                                fontSize: "13px",
                                marginBottom: "12px",
                                color: "#a16207",
                            }}
                        >
                            Advertencias (no bloquean la generacion):
                        </p>
                        <ul className="validation-list">
                            {result.warnings.map((warn, i) => (
                                <li key={`warn-${i}`} className="val-warning">
                                    <span className="val-icon">&#9888;</span>
                                    <div className="val-text">
                                        <span className="val-field">
                                            {warn.field}
                                        </span>
                                        {warn.message}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                <div className="form-actions">
                    <button className="btn btn-outline" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.getElementById("modal-root"));
}
