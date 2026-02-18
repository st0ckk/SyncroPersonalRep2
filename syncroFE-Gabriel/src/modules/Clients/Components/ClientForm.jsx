import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    createClient,
    updateClient,
    getClientById
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
    provinceCode: "",
    cantonCode: "",
    districtCode: "",
    exactAddress: ""
};

const ClientForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [client, setClient] = useState(emptyClient);
    const [provinces, setProvinces] = useState([]);
    const [cantons, setCantons] = useState([]);
    const [districts, setDistricts] = useState([]);

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
            setClient({
                clientId: d.clientId,
                clientName: d.clientName,
                clientEmail: d.clientEmail ?? "",
                clientPhone: d.clientPhone ?? "",
                clientType: d.clientType ?? "",
                provinceCode: d.provinceCode ?? "",
                cantonCode: d.cantonCode ?? "",
                districtCode: d.districtCode ?? "",
                exactAddress: d.exactAddress ?? ""
            });
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
            clientEmail: client.clientEmail,
            clientPhone: client.clientPhone,
            clientType: client.clientType,
            provinceCode: Number(client.provinceCode),
            cantonCode: Number(client.cantonCode),
            districtCode: Number(client.districtCode),
            exactAddress: client.exactAddress
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

                    {isEdit ? (
                        <div className="form-group full">
                            <label>Cédula jurídica</label>
                            <input value={client.clientId} disabled />
                        </div>
                    ) : (
                        <div className="form-group full">
                            <label>Cédula jurídica</label>
                            <input
                                name="clientId"
                                value={client.clientId}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
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
                        <label>Teléfono</label>
                        <input
                            name="clientPhone"
                            value={client.clientPhone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Tipo</label>
                        <select
                            name="clientType"
                            value={client.clientType}
                            onChange={handleChange}
                        >
                            <option value="">Seleccione</option>
                            <option value="regular">Regular</option>
                            <option value="premium">Premium</option>
                            <option value="corporativo">Corporativo</option>
                        </select>
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

                    <div className="form-actions full">
                        <button type="submit" className="btn-primary">
                            Guardar
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate("/clientes")}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;
