import { Link } from "react-router-dom";
import Button from "../../../components/Button";

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
                    <Button variant="danger" onClick={() => onDeactivate(client.clientId)}>
                        Desactivar
                    </Button>
                ) : (
                    <Button variant="success" onClick={() => onActivate(client.clientId)}>
                        Reactivar
                    </Button>
                )}
            </div>
        </div>
    );
};


export default ClientCard;
