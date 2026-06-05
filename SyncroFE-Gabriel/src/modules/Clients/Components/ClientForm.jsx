import { useEffect, useState, useCallback } from "react";
import Button from "../../../components/Button";
import { useNavigate, useParams } from "react-router-dom";

import {
    createClient,
    updateClient,
    getClientById,
    lookupHacienda,
    resolveMapsUrl,
} from "../../../api/clients.api";

import {
    getProvinces,
    getCantons,
    getDistricts
} from "../../../api/locations.api";

const emptyClient = {
    clientId: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientType: "",
    haciendaIdType: "",
    clientElectronicInvoice: "",
    activityCode: "",
    provinceCode: "",
    cantonCode: "",
    districtCode: "",
    exactAddress: "",
    exonerationDocType: "",
    exonerationDocNumber: "",
    exonerationInstitutionCode: "",
    exonerationInstitutionName: "",
    exonerationDate: "",
    exonerationPercentage: ""
};

// Extrae lat/lng de un enlace de Google Maps o texto de coordenadas
function parseGoogleMapsInput(input) {
    const text = input.trim();
    if (!text) return null;

    // Coordenadas directas: "9.9281, -84.0907" o "9.9281,-84.0907"
    const direct = text.match(/^(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)$/);
    if (direct) return { lat: parseFloat(direct[1]), lng: parseFloat(direct[2]) };

    // Patrón @lat,lng (el más común en links de compartir Google Maps)
    const atSign = text.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
    if (atSign) return { lat: parseFloat(atSign[1]), lng: parseFloat(atSign[2]) };

    // ?q=lat,lng
    const qParam = text.match(/[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
    if (qParam) return { lat: parseFloat(qParam[1]), lng: parseFloat(qParam[2]) };

    // ll=lat,lng (algunos formatos antiguos)
    const llParam = text.match(/[?&]ll=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
    if (llParam) return { lat: parseFloat(llParam[1]), lng: parseFloat(llParam[2]) };

    return null;
}

const ClientForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [client, setClient] = useState(emptyClient);
    const [provinces, setProvinces] = useState([]);
    const [cantons, setCantons] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [showExoneration, setShowExoneration] = useState(false);

    // Ubicación GPS
    const [locationInput, setLocationInput] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [locationError, setLocationError] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    const [showLocationHelp, setShowLocationHelp] = useState(false);

    // Hacienda lookup state
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupResult, setLookupResult] = useState(null);
    const [lookupError, setLookupError] = useState("");

    /* ======================
       CARGAR PROVINCIAS
    ====================== */
    useEffect(() => {
        getProvinces().then(res => setProvinces(res.data));
    }, []);

    /* ======================
       CARGAR CLIENTE (EDITAR)
    ====================== */
    useEffect(() => {
        if (!isEdit) return;

        getClientById(id).then(res => {
            const d = res.data;
            const hasExoneration = Boolean(d.exonerationDocType);
            setShowExoneration(hasExoneration);
            setClient({
                clientId: d.clientId,
                clientName: d.clientName,
                clientEmail: d.clientEmail ?? "",
                clientPhone: d.clientPhone ?? "",
                clientType: d.clientType ?? "",
                haciendaIdType: d.haciendaIdType ?? "",
                clientElectronicInvoice: d.clientElectronicInvoice ?? "",
                activityCode: d.activityCode ?? "",
                provinceCode: d.provinceCode ?? "",
                cantonCode: d.cantonCode ?? "",
                districtCode: d.districtCode ?? "",
                exactAddress: d.exactAddress ?? "",
                exonerationDocType: d.exonerationDocType ?? "",
                exonerationDocNumber: d.exonerationDocNumber ?? "",
                exonerationInstitutionCode: d.exonerationInstitutionCode ?? "",
                exonerationInstitutionName: d.exonerationInstitutionName ?? "",
                exonerationDate: d.exonerationDate ? d.exonerationDate.substring(0, 10) : "",
                exonerationPercentage: d.exonerationPercentage ?? ""
            });
            if (d.location) {
                setLatitude(String(d.location.latitude));
                setLongitude(String(d.location.longitude));
            }
        });
    }, [id, isEdit]);

    /* ======================
       PROVINCIA → CANTONES
    ====================== */
    useEffect(() => {
        if (!client.provinceCode) {
            setCantons([]);
            return;
        }

        getCantons(client.provinceCode).then(res => {
            setCantons(res.data);
        });
    }, [client.provinceCode]);

    /* ======================
       CANTÓN → DISTRITOS
    ====================== */
    useEffect(() => {
        if (!client.cantonCode) {
            setDistricts([]);
            return;
        }

        getDistricts(client.cantonCode).then(res => {
            setDistricts(res.data);
        });
    }, [client.cantonCode]);

    /* ======================
       UBICACIÓN GPS
    ====================== */
    const handleParseLocation = useCallback(async () => {
        setLocationError("");
        const text = locationInput.trim();
        if (!text) return;

        // Intentar extraer coordenadas directamente primero
        const direct = parseGoogleMapsInput(text);
        if (direct) {
            setLatitude(String(direct.lat));
            setLongitude(String(direct.lng));
            setLocationInput("");
            return;
        }

        // Si es un enlace corto de Google Maps, resolverlo en el backend
        if (text.includes("goo.gl") || text.includes("maps.app")) {
            setLocationLoading(true);
            try {
                const res = await resolveMapsUrl(text);
                const fullUrl = res.data.finalUrl;
                const resolved = parseGoogleMapsInput(fullUrl);
                if (resolved) {
                    setLatitude(String(resolved.lat));
                    setLongitude(String(resolved.lng));
                    setLocationInput("");
                } else {
                    setLocationError("Se resolvió el enlace pero no se encontraron coordenadas. Intentá copiar la URL desde la barra del navegador.");
                }
            } catch {
                setLocationError("No se pudo resolver el enlace. Intentá copiar la URL desde la barra de dirección del navegador.");
            } finally {
                setLocationLoading(false);
            }
            return;
        }

        setLocationError("No se pudieron extraer coordenadas. Pegá el enlace de Google Maps o las coordenadas directas (ej: 9.9281, -84.0907).");
    }, [locationInput]);

    /* ======================
       HACIENDA LOOKUP
    ====================== */
    const handleHaciendaLookup = useCallback(async () => {
        const cedula = client.clientId.trim();
        if (!cedula || cedula.length < 9) return;

        setLookupLoading(true);
        setLookupError("");
        setLookupResult(null);

        try {
            const res = await lookupHacienda(cedula);
            const data = res.data;
            setLookupResult(data);

            // Auto-fill fields from Hacienda response
            setClient(prev => ({
                ...prev,
                clientName: data.nombre || prev.clientName,
                haciendaIdType: data.tipoIdentificacion || prev.haciendaIdType,
                activityCode: data.actividades?.length > 0
                    ? data.actividades[0].codigo
                    : prev.activityCode
            }));
        } catch {
            setLookupError("No se encontró en Hacienda");
        } finally {
            setLookupLoading(false);
        }
    }, [client.clientId]);

    /* ======================
       HANDLERS
    ====================== */
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "provinceCode") {
            setClient(prev => ({
                ...prev,
                provinceCode: value,
                cantonCode: "",
                districtCode: ""
            }));
            return;
        }

        if (name === "cantonCode") {
            setClient(prev => ({
                ...prev,
                cantonCode: value,
                districtCode: ""
            }));
            return;
        }

        setClient(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            clientId: client.clientId,
            clientName: client.clientName,
            clientEmail: client.clientEmail || null,
            clientPhone: client.clientPhone || null,
            clientType: client.clientType,
            haciendaIdType: client.haciendaIdType || null,
            clientElectronicInvoice: client.clientElectronicInvoice || null,
            activityCode: client.activityCode || null,
            provinceCode: Number(client.provinceCode),
            cantonCode: Number(client.cantonCode),
            districtCode: Number(client.districtCode),
            exactAddress: client.exactAddress,
            location: latitude && longitude ? {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address: client.exactAddress || null
            } : null,
            exonerationDocType: showExoneration ? (client.exonerationDocType || null) : null,
            exonerationDocNumber: showExoneration ? (client.exonerationDocNumber || null) : null,
            exonerationInstitutionCode: showExoneration ? (client.exonerationInstitutionCode || null) : null,
            exonerationInstitutionName: showExoneration ? (client.exonerationInstitutionName || null) : null,
            exonerationDate: showExoneration && client.exonerationDate ? client.exonerationDate : null,
            exonerationPercentage: showExoneration && client.exonerationPercentage ? Number(client.exonerationPercentage) : null
        };

        if (isEdit) {
            await updateClient(id, payload);
        } else {
            await createClient(payload);
        }

        navigate("/clientes");
    };

    /* ======================
       RENDER
    ====================== */
    return (
        <div className="client-form-page">
            <div className="client-form-card">
                <h2>{isEdit ? "Editar cliente" : "Nuevo cliente"}</h2>

                <form onSubmit={handleSubmit} className="client-form-grid">

                    {/* ── Identificación ── */}
                    <div className="form-group">
                        <label>Tipo de identificación</label>
                        <select
                            name="haciendaIdType"
                            value={client.haciendaIdType}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione</option>
                            <option value="01">Cédula Física</option>
                            <option value="02">Cédula Jurídica</option>
                            <option value="03">DIMEX</option>
                            <option value="04">NITE</option>
                        </select>
                    </div>

                    {isEdit ? (
                        <div className="form-group">
                            <label>Número de identificación</label>
                            <input value={client.clientId} disabled />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Número de identificación</label>
                            <input
                                name="clientId"
                                value={client.clientId}
                                onChange={handleChange}
                                required
                            />

                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleHaciendaLookup}
                                disabled={lookupLoading || client.clientId.trim().length < 9}
                                style={{ marginTop: 6, padding: "8px 0", fontSize: 13, width: "100%" }}
                            >
                                {lookupLoading ? "Buscando..." : "Buscar en Hacienda"}
                            </Button>
                            {lookupError && (
                                <span style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
                                    {lookupError}
                                </span>
                            )}
                        </div>
                    )}

                    {/* ── Hacienda info banner ── */}
                    {lookupResult && (
                        <div className="form-group full" style={{
                            background: "rgba(34,197,94,0.08)",
                            border: "1px solid rgba(34,197,94,0.3)",
                            borderRadius: 8,
                            padding: "12px 16px",
                            fontSize: 13,
                            color: "#15803d"
                        }}>
                            <strong>Contribuyente encontrado en Hacienda</strong>
                            <div style={{ marginTop: 6, color: "#374151" }}>
                                <div><strong>Nombre:</strong> {lookupResult.nombre}</div>
                                <div><strong>Estado:</strong> {lookupResult.situacion?.estado}</div>
                                <div><strong>Administración:</strong> {lookupResult.situacion?.administracionTributaria}</div>
                                {lookupResult.situacion?.moroso === "SI" && (
                                    <span style={{ color: "#b91c1c", fontWeight: 600 }}>Moroso</span>
                                )}
                                {lookupResult.situacion?.omiso === "SI" && (
                                    <span style={{ color: "#b91c1c", fontWeight: 600, marginLeft: 12 }}>Omiso</span>
                                )}
                                {lookupResult.actividades?.length > 0 && (
                                    <div style={{ marginTop: 6 }}>
                                        <strong>Actividades:</strong>
                                        <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                                            {lookupResult.actividades.map((a, i) => (
                                                <li key={i}>
                                                    {a.codigo} — {a.descripcion}
                                                    {a.estado && <span style={{ color: "#6b7280" }}> ({a.estado})</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="form-group full">
                        <label>Nombre</label>
                        <input
                            name="clientName"
                            value={client.clientName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo</label>
                        <input
                            type="email"
                            name="clientEmail"
                            value={client.clientEmail}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo factura electrónica</label>
                        <input
                            type="email"
                            name="clientElectronicInvoice"
                            value={client.clientElectronicInvoice}
                            onChange={handleChange}
                            placeholder="Si difiere del correo principal"
                        />
                    </div>

                    <div className="form-group">
                        <label>Teléfono</label>
                        <input
                            name="clientPhone"
                            value={client.clientPhone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Tipo de cliente</label>
                        <select
                            name="clientType"
                            value={client.clientType}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione</option>
                            <option value="extranjero">Extranjero</option>
                            <option value="pulpero">Pulpero</option>
                            <option value="rutero">Rutero</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Código actividad económica</label>
                        {lookupResult?.actividades?.length > 1 ? (
                            <select
                                name="activityCode"
                                value={client.activityCode}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione</option>
                                {lookupResult.actividades.map((a, i) => (
                                    <option key={i} value={a.codigo}>
                                        {a.codigo} — {a.descripcion}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                name="activityCode"
                                value={client.activityCode}
                                onChange={handleChange}
                                placeholder="Ej: 6202.0"
                            />
                        )}
                    </div>

                    {/* ── Ubicación ── */}
                    <div className="form-group full" style={{ marginTop: 8 }}>
                        <strong style={{ fontSize: 14, color: "#374151" }}>Ubicación</strong>
                    </div>

                    <div className="form-group">
                        <label>Provincia</label>
                        <select
                            name="provinceCode"
                            value={client.provinceCode}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccione</option>
                            {provinces.map(p => (
                                <option key={p.provinceCode} value={p.provinceCode}>
                                    {p.provinceName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Cantón</label>
                        <select
                            name="cantonCode"
                            value={client.cantonCode}
                            onChange={handleChange}
                            disabled={!cantons.length}
                            required
                        >
                            <option value="">Seleccione</option>
                            {cantons.map(c => (
                                <option key={c.cantonCode} value={c.cantonCode}>
                                    {c.cantonName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Distrito</label>
                        <select
                            name="districtCode"
                            value={client.districtCode}
                            onChange={handleChange}
                            disabled={!districts.length}
                            required
                        >
                            <option value="">Seleccione</option>
                            {districts.map(d => (
                                <option key={d.districtCode} value={d.districtCode}>
                                    {d.districtName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group full">
                        <label>Dirección exacta</label>
                        <textarea
                            name="exactAddress"
                            value={client.exactAddress}
                            onChange={handleChange}
                        />
                    </div>

                    {/* ── Ubicación GPS ── */}
                    <div className="form-group full" style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: 14, color: "#374151" }}>Ubicación GPS</strong>
                        <button
                            type="button"
                            onClick={() => setShowLocationHelp(true)}
                            title="¿Cómo obtener las coordenadas?"
                            style={{
                                background: "#e0e7ff",
                                border: "none",
                                borderRadius: "50%",
                                width: 22,
                                height: 22,
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#4338ca",
                                lineHeight: "22px",
                                padding: 0,
                            }}
                        >
                            ?
                        </button>
                    </div>

                    <div className="form-group full">
                        <label>Pegar enlace de Google Maps</label>
                        <input
                            type="text"
                            value={locationInput}
                            onChange={(e) => { setLocationInput(e.target.value); setLocationError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleParseLocation())}
                            placeholder="Pegá aquí el enlace de Google Maps o las coordenadas..."
                            style={{ width: "100%", boxSizing: "border-box" }}
                        />
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleParseLocation}
                            disabled={!locationInput.trim() || locationLoading}
                            style={{ marginTop: 8, width: "100%" }}
                        >
                            {locationLoading ? "Resolviendo enlace..." : "Extraer coordenadas"}
                        </Button>
                        {locationError && (
                            <span style={{ color: "#b91c1c", fontSize: 12, marginTop: 4, display: "block" }}>
                                {locationError}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Latitud</label>
                        <input
                            type="number"
                            step="any"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            placeholder="Ej: 9.9281"
                        />
                    </div>

                    <div className="form-group">
                        <label>Longitud</label>
                        <input
                            type="number"
                            step="any"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            placeholder="Ej: -84.0907"
                        />
                    </div>

                    {latitude && longitude && (
                        <div className="form-group full">
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 14px",
                                background: "rgba(34,197,94,0.08)",
                                border: "1px solid rgba(34,197,94,0.3)",
                                borderRadius: 8,
                                fontSize: 13,
                            }}>
                                <span style={{ color: "#15803d" }}>
                                    📍 <strong>{parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}</strong>
                                </span>
                                <a
                                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#2563eb", fontSize: 12, marginLeft: "auto" }}
                                >
                                    Ver en Google Maps ↗
                                </a>
                                <button
                                    type="button"
                                    onClick={() => { setLatitude(""); setLongitude(""); }}
                                    style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontWeight: 600 }}
                                    title="Quitar ubicación"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Modal de ayuda de ubicación */}
                    {showLocationHelp && (
                        <div className="modal-backdrop" onClick={() => setShowLocationHelp(false)}>
                            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                    <h3 style={{ margin: 0 }}>¿Cómo obtener las coordenadas?</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowLocationHelp(false)}
                                        style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                                    <p style={{ marginTop: 0 }}><strong>Opción 1 — Desde Google Maps (enlace):</strong></p>
                                    <ol style={{ margin: "0 0 16px 16px", padding: 0 }}>
                                        <li>Abrí <strong>Google Maps</strong> en el computador.</li>
                                        <li>Buscá la dirección o movete al lugar exacto.</li>
                                        <li>Hacé clic derecho sobre el punto en el mapa.</li>
                                        <li>Seleccioná <strong>"Compartir o insertar mapa"</strong> → <strong>"Copiar enlace"</strong>.</li>
                                        <li>Pegá ese enlace en el campo de arriba y presioná <strong>Extraer</strong>.</li>
                                    </ol>

                                    <p><strong>Opción 2 — Coordenadas directas desde Google Maps:</strong></p>
                                    <ol style={{ margin: "0 0 16px 16px", padding: 0 }}>
                                        <li>Abrí <strong>Google Maps</strong> en el computador.</li>
                                        <li>Hacé clic derecho sobre el punto exacto.</li>
                                        <li>Aparecen las coordenadas en la parte superior del menú (ej: <strong>9.928140, -84.090732</strong>).</li>
                                        <li>Hacé clic en ese número y se copian automáticamente.</li>
                                        <li>Pegálas en el campo de enlace y presioná <strong>Extraer</strong>.</li>
                                    </ol>

                                    <p><strong>Opción 3 — Ingreso manual:</strong></p>
                                    <p style={{ margin: "0 0 8px" }}>Escribí directamente la latitud y longitud en los campos correspondientes.</p>

                                    <div style={{
                                        background: "#fef3c7",
                                        border: "1px solid #fcd34d",
                                        borderRadius: 8,
                                        padding: "10px 14px",
                                        fontSize: 13,
                                        color: "#92400e"
                                    }}>
                                        ⚠️ Los enlaces cortos de celular (<strong>maps.app.goo.gl/...</strong>) no funcionan. Usá el enlace largo desde el computador o las coordenadas directas.
                                    </div>
                                </div>

                                <div style={{ marginTop: 20, textAlign: "right" }}>
                                    <Button variant="primary" type="button" onClick={() => setShowLocationHelp(false)}>
                                        Entendido
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Exoneración ── */}
                    <div className="form-group full" style={{ marginTop: 8 }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", margin: 0 }}>
                            <strong style={{ fontSize: 14, color: "#374151" }}>
                                Cliente con exoneración
                            </strong>
                            <input
                                type="checkbox"
                                checked={showExoneration}
                                onChange={(e) => setShowExoneration(e.target.checked)}
                                style={{ margin: 0 }}
                            />
                        </label>
                    </div>

                    {showExoneration && (
                        <>
                            <div className="form-group">
                                <label>Tipo documento exoneración</label>
                                <select
                                    name="exonerationDocType"
                                    value={client.exonerationDocType}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione</option>
                                    <option value="01">Compras autorizadas</option>
                                    <option value="02">Ventas exentas a diplomáticos</option>
                                    <option value="03">Autorizado Ley de Zonas Francas</option>
                                    <option value="04">Exenciones Dirección Gral. de Hacienda</option>
                                    <option value="05">Transitorio V</option>
                                    <option value="06">Transitorio IX</option>
                                    <option value="07">Transitorio XVII</option>
                                    <option value="99">Otros</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Número documento</label>
                                <input
                                    name="exonerationDocNumber"
                                    value={client.exonerationDocNumber}
                                    onChange={handleChange}
                                    placeholder="Ej: AL-00023244-25"
                                    maxLength={40}
                                />
                            </div>

                            <div className="form-group">
                                <label>Código institución</label>
                                <select
                                    name="exonerationInstitutionCode"
                                    value={client.exonerationInstitutionCode}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione</option>
                                    <option value="01">Ministerio de Hacienda</option>
                                    <option value="02">PROCOMER</option>
                                    <option value="03">Ministerio de Relaciones Exteriores</option>
                                    <option value="99">Otra institución</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Nombre institución</label>
                                <input
                                    name="exonerationInstitutionName"
                                    value={client.exonerationInstitutionName}
                                    onChange={handleChange}
                                    placeholder="Ej: Ministerio de Hacienda"
                                    maxLength={160}
                                />
                            </div>

                            <div className="form-group">
                                <label>Fecha exoneración</label>
                                <input
                                    type="date"
                                    name="exonerationDate"
                                    value={client.exonerationDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Porcentaje exoneración (%)</label>
                                <input
                                    type="number"
                                    name="exonerationPercentage"
                                    value={client.exonerationPercentage}
                                    onChange={handleChange}
                                    min={0}
                                    max={100}
                                    placeholder="Ej: 13"
                                />
                            </div>
                        </>
                    )}

                    <div className="form-actions full">
                        <Button type="submit" variant="primary">
                            Guardar
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate("/clientes")}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;