import {
    deactivateDistributor,
    activateDistributor,
} from "../../../api/distributors.api";
import Button from "../../../components/Button";
import { usePagination } from "../../../hooks/usePagination";
import PaginationControls from "../../../components/PaginationControls";

export default function DistributorTable({ data, reload, onEdit }) {
    const handleDeactivate = async (id) => {
        await deactivateDistributor(id);
        reload();
    };

    const handleActivate = async (id) => {
        await activateDistributor(id);
        reload();
    };

    const pagination = usePagination(data);

    return (
        <>
        <div className="table-scroll">
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
                {pagination.paginatedData.map((d) => (
                    <tr key={d.distributorId}>
                        <td>{d.distributorCode}</td>
                        <td className="name">{d.name}</td>
                        <td>{d.email}</td>
                        <td>{d.phone}</td>
                        <td style={{ display: "flex", gap: "8px" }}>
                            <Button
                                variant="outline"
                                onClick={() => onEdit(d)}
                            >
                                Editar
                            </Button>

                            {d.isActive ? (
                                <Button
                                    variant="danger"
                                    onClick={() =>
                                        handleDeactivate(d.distributorId)
                                    }
                                >
                                    Desactivar
                                </Button>
                            ) : (
                                <Button
                                    variant="success"
                                    onClick={() =>
                                        handleActivate(d.distributorId)
                                    }
                                >
                                    Activar
                                </Button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
        <PaginationControls {...pagination} />
        </>
    );
}
