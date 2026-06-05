import { useEffect, useState } from "react";
import {
    getDistributors,
    getInactiveDistributors,
    createDistributor,
    updateDistributor,
    activateDistributor,
    deactivateDistributor,
} from "../../../api/distributors.api";

import { PageCard, Toolbar, DataTable, Modal, Button } from "../../../components";
import DistributorForm from "../components/DistributorForm";

export default function DistributorPage() {
    const [data, setData] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        const res = showInactive
            ? await getInactiveDistributors()
            : await getDistributors();
        setData(res.data ?? []);
    };

    useEffect(() => { loadData(); }, [showInactive]);

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            if (editing) {
                await updateDistributor(editing.distributorId, values);
            } else {
                await createDistributor(values);
            }
            setShowForm(false);
            setEditing(null);
            loadData();
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { key: "distributorCode", header: "Cédula Jurídica" },
        { key: "name", header: "Nombre", render: (d) => <span className="cell-name">{d.name}</span> },
        { key: "email", header: "Correo Electrónico" },
        { key: "phone", header: "Número de teléfono" },
        {
            key: "actions", header: "Acciones", className: "actions",
            render: (d) => (
                <>
                    <Button variant="warning" onClick={() => { setEditing(d); setShowForm(true); }}>Editar</Button>
                    {d.isActive ? (
                        <Button variant="danger" onClick={async () => { await deactivateDistributor(d.distributorId); loadData(); }}>Desactivar</Button>
                    ) : (
                        <Button variant="success" onClick={async () => { await activateDistributor(d.distributorId); loadData(); }}>Activar</Button>
                    )}
                </>
            ),
        },
    ];

    return (
        <PageCard>
            <Toolbar title="Proveedores">
                <Button variant="outline" onClick={() => setShowInactive(!showInactive)}>
                    {showInactive ? "Ver Activos" : "Ver Inactivos"}
                </Button>
                <Button variant="primary" onClick={() => { setEditing(null); setShowForm(true); }}>
                    + Nuevo proveedor
                </Button>
            </Toolbar>

            <DataTable
                columns={columns}
                data={data}
                rowKey="distributorId"
                emptyMessage="No hay proveedores"
            />

            <Modal
                open={showForm}
                title={editing ? "Editar proveedor" : "Nuevo proveedor"}
                onClose={() => { setShowForm(false); setEditing(null); }}
            >
                <DistributorForm
                    initialValues={editing}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditing(null); }}
                />
            </Modal>
        </PageCard>
    );
}
