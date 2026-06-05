import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createClient,
    getClientById,
    updateClient
} from "../../../api/clients.api";

import "./clients.css";

const emptyClient = {
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientType: "",
    totalPurchases: 0,

    provinceCode: "",
    cantonCode: "",
    districtCode: "",
    exactAddress: ""
};

const ClientForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [client, setClient] = useState(emptyClient);
    const [showMore, setShowMore] = useState(false);
    const isEdit = Boolean(id);

    useEffect(() => {
        if (isEdit) {
            getClientById(id).then(res => {
                setClient({
                    ...res.data,
                    totalPurchases: res.data.totalPurchases ?? 0
                });
            });
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClient(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            clientName: client.clientName,
            clientEmail: client.clientEmail,
            clientPhone: client.clientPhone,
            clientType: client.clientType,
            provinceCode: client.provinceCode,
            cantonCode: client.cantonCode,
            districtCode: client.districtCode,
            exactAddress: client.exactAddress
        };

        if (isEdit) {
            await updateClient(id, payload);
        } else {
            await createClient(payload);
        }

        navigate("/clientes");
    };

    return (
        <div className="client-form">
            <h1>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</h1>

            <form onSubmit={handleSubmit}>
                {/* ======================
                    DATOS BÁSICOS
                ====================== */}
                <div className="form-section">
                    <label>
                        Nombre
                        <input
                            name="clientName"
                            value={client.clientName}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <label>
                        Correo
                        <input
                            name="clientEmail"
                            type="email"
                            value={client.clientEmail}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Teléfono
                        <input
                            name="clientPhone"
                            value={client.clientPhone}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Tipo de cliente
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
                    </label>

                    {/* SOLO VISUAL */}
                    <label>
                        Total de compras
                        <input
                            value={`₡ ${client.totalPurchases.toLocaleString()}`}
                            disabled
                        />
                    </label>
                </div>

                {/* ======================
                    MÁS INFORMACIÓN
                ====================== */}
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowMore(!showMore)}
                >
                    {showMore ? "Ocultar información" : "Más información"}
                </button>

                {showMore && (
                    <div className="form-section advanced">
                        <label>
                            Provincia
                            <input
                                name="provinceCode"
                                value={client.provinceCode}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Cantón
                            <input
                                name="cantonCode"
                                value={client.cantonCode}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Distrito
                            <input
                                name="districtCode"
                                value={client.districtCode}
                                onChange={handleChange}
                            />
                        </label>

                        <label>
                            Dirección exacta
                            <textarea
                                name="exactAddress"
                                value={client.exactAddress}
                                onChange={handleChange}
                            />
                        </label>

                        {/* 🔜 Aquí luego va el mapa */}
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="btn-primary">
                        Guardar
                    </button>

                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate("/clientes")}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;
