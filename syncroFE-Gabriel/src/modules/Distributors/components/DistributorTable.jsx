import {
    deactivateDistributor,
    activateDistributor,
} from "../../../api/distributors.api";

export default function DistributorTable({ data, reload, onEdit }) {
    const handleDeactivate = async (id) => {
        await deactivateDistributor(id);
        reload();
    };

    const handleActivate = async (id) => {
        await activateDistributor(id);
        reload();
    };

    return (
        <table className="distributors-table">
            <thead>
                <tr>
                    <th>Cedula Juridica</th>
                    <th>Nombre</th>
                    <th>Correo Electronico</th>
                    <th>Numero de telefono</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {data.map((d) => (
                    <tr key={d.distributorId}>
                        <td>{d.distributorCode}</td>
                        <td className="name">{d.name}</td>
                        <td>{d.email}</td>
                        <td>{d.phone}</td>
                        <td style={{ display: "flex", gap: "8px" }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => onEdit(d)}
                            >
                                Editar
                            </button>

                            {d.isActive ? (
                                <button
                                    className="btn btn-danger"
                                    onClick={() =>
                                        handleDeactivate(d.distributorId)
                                    }
                                >
                                    Desactivar
                                </button>
                            ) : (
                                <button
                                    className="btn btn-success"
                                    onClick={() =>
                                        handleActivate(d.distributorId)
                                    }
                                >
                                    Activar
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
