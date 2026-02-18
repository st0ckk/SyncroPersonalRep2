import "./assets.css";
import { useEffect, useState } from "react";
import {
    getAssets,
    getInactiveAssets,
    createAsset,
    updateAsset,
    activateAsset,
    deactivateAsset,
} from "../../../api/assets.api";
import { getUsers } from "../../../api/users.api";

import AssetsToolbar from "../components/AssetsToolbar";
import AssetsTable from "../components/AssetsTable";
import AssetsForm from "../components/AssetsForm";

export default function AssetsPage() {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        const res = showInactive
            ? await getInactiveAssets()
            : await getAssets();
        setData(res.data ?? []);
    };

    const loadUsers = async () => {
        const res = await getUsers();
        setUsers(res.data?.filter((u) => u.isActive) ?? []);
    };

    useEffect(() => {
        loadData();
    }, [showInactive]);

    useEffect(() => {
        loadUsers();
    }, []);

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
            alert("Error guardando activo");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (asset) => {
        const action = asset.isActive ? "desactivar" : "activar";
        if (!window.confirm(`¿Deseas ${action} este activo?`)) return;

        try {
            if (asset.isActive) {
                await deactivateAsset(asset.assetId);
            } else {
                await activateAsset(asset.assetId);
            }
            loadData();
        } catch (err) {
            console.error("Error cambiando estado", err);
            alert("Error cambiando estado");
        }
    };

    return (
        <div className="assets-page">
            <div className="assets-container">
                <AssetsToolbar
                    showInactive={showInactive}
                    onToggle={() => setShowInactive(!showInactive)}
                    onNew={() => {
                        setEditing(null);
                        setShowForm(true);
                    }}
                />

                <AssetsTable
                    data={data}
                    onEdit={(asset) => {
                        setEditing(asset);
                        setShowForm(true);
                    }}
                    onToggleStatus={handleToggleStatus}
                />
            </div>

            {showForm && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>{editing ? "Editar activo" : "Nuevo activo"}</h3>

                        <AssetsForm
                            initialValues={editing}
                            users={users}
                            submitting={submitting}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setShowForm(false);
                                setEditing(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}