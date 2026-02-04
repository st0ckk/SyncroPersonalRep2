import { Link } from "react-router-dom";

const ClientCard = ({ client, onDeactivate, onActivate }) => {
    return (
        <div className="client-card">
            <h3>{client.clientName}</h3>
            <p>{client.clientEmail}</p>
            <p>{client.clientPhone}</p>

            <div className="actions">
                <Link to={`/clients/${client.clientId}`}>
                    📍 Ver ubicación
                </Link>

                {client.isActive ? (
                    <button onClick={() => onDeactivate(client.clientId)}>
                        Desactivar
                    </button>
                ) : (
                    <button onClick={() => onActivate(client.clientId)}>
                        Reactivar
                    </button>
                )}
            </div>
        </div>
    );
};

export default ClientCard;
