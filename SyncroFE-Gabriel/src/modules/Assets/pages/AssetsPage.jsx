import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    getAssets,
    getInactiveAssets,
    createAsset,
    updateAsset,
    activateAsset,
    deactivateAsset,
} from "../../../api/assets.api";
import { getUsers } from "../../../api/users.api";

import { PageCard, Toolbar, FilterBar, DataTable, Modal, StatusBadge, Button } from "../../../components";
import AssetsForm from "../components/AssetsForm";

export default function AssetsPage() {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");

    const loadData = async () => {
        const res = showInactive ? await getInactiveAssets() : await getAssets();
        setData(res.data ?? []);
    };

    useEffect(() => { loadData(); }, [showInactive]);
    useEffect(() => {
        getUsers().then(res => setUsers(res.data?.filter(u => u.isActive) ?? []));
    }, []);

    const filteredData = selectedUserId
        ? data.filter(a => a.userId === parseInt(selectedUserId))
        : data;

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            if (editing) {
                await updateAsset(editing.assetId, values);
            } else {
                await createAsset(values);
            }
            setShowForm(false);
            setEditing(null);
            loadData();
        } catch (err) {
            console.error("Error guardando activo", err);
            Swal.fire({ icon: "error", title: "Error", text: "Error guardando activo" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (asset) => {
        const action = asset.isActive ? "desactivar" : "activar";
        const result = await Swal.fire({
            title: "¿Está seguro?",
            text: `¿Deseas ${action} este activo?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "Cancelar",
        });
        if (!result.isConfirmed) return;
        try {
            if (asset.isActive) {
                await deactivateAsset(asset.assetId);
            } else {
                await activateAsset(asset.assetId);
            }
            loadData();
        } catch (err) {
            console.error("Error cambiando estado", err);
            Swal.fire({ icon: "error", title: "Error", text: "Error cambiando estado" });
        }
    };

    const columns = [
        { key: "assetName", header: "Nombre", render: (a) => <span className="cell-name">{a.assetName}</span> },
        { key: "assetDescription", header: "Descripción" },
        { key: "serialNumber", header: "Serie" },
        { key: "assignedTo", header: "Asignado a", render: (a) => a.assignedUserName || "-" },
        { key: "assignedDate", header: "Fecha asignación", render: (a) => a.assignedDate ? new Date(a.assignedDate).toLocaleDateString("es-CR") : "-" },
        { key: "status", header: "Estado", render: (a) => <StatusBadge status={a.isActive ? "Activo" : "Inactivo"} /> },
        {
            key: "actions", header: "Acciones", className: "actions",
            render: (a) => (
                <>
                    <Button variant="warning" onClick={() => { setEditing(a); setShowForm(true); }}>Editar</Button>
                    <Button variant={a.isActive ? "danger" : "success"} onClick={() => handleToggleStatus(a)}>
                        {a.isActive ? "Desactivar" : "Activar"}
                    </Button>
                </>
            ),
        },
    ];

    return (
        <PageCard>
            <Toolbar title="Activos">
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                    <option value="">Todos los usuarios</option>
                    {users.map(u => (
                        <option key={u.userId} value={u.userId}>{u.userName} {u.userLastname}</option>
                    ))}
                </select>
                <Button variant="outline" onClick={() => setShowInactive(!showInactive)}>
                    {showInactive ? "Ver Activos" : "Ver Inactivos"}
                </Button>
                <Button variant="primary" onClick={() => { setEditing(null); setShowForm(true); }}>
                    + Nuevo activo
                </Button>
            </Toolbar>

            <DataTable
                columns={columns}
                data={filteredData}
                rowKey="assetId"
                emptyMessage="No hay activos"
            />

            <Modal
                open={showForm}
                title={editing ? "Editar activo" : "Nuevo activo"}
                onClose={() => { setShowForm(false); setEditing(null); }}
            >
                <AssetsForm
                    initialValues={editing}
                    users={users}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditing(null); }}
                />
            </Modal>
        </PageCard>
    );
}
