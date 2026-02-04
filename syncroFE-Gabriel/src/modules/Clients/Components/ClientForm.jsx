import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createClient,
    updateClient,
    getClientById
} from "../../../api/clients.api";
import "../Pages/clients.css";   



const ClientForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [client, setClient] = useState({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientType: ""
    });

    useEffect(() => {
        if (!isEdit) return;

        getClientById(id).then(res => {
            setClient(res.data);
        });
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setClient(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEdit) {
            await updateClient(id, client);
        } else {
            await createClient(client);
        }

        navigate("/clientes");
    };

    return (
        <div className="clients-page">
            <div className="clients-card">
                <h1>{isEdit ? "Editar cliente" : "Nuevo cliente"}</h1>

                <form onSubmit={handleSubmit} className="stock-form">
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
                        <input
                            name="clientType"
                            value={client.clientType}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group full-width">
                        <button type="submit" className="btn btn-primary">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;
