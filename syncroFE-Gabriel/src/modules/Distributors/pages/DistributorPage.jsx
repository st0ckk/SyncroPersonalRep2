import "./distributor.css";
import { useEffect, useState } from "react";
import {
    getDistributors,
    getInactiveDistributors,
    createDistributor,
    updateDistributor,
} from "../../../api/distributors.api";

import DistributorTable from "../components/DistributorTable";
import DistributorToolbar from "../components/DistributorToolbar";
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

    useEffect(() => {
        loadData();
    }, [showInactive]);

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

    return (
        <div className="distributors-page">
            <div className="distributors-card">
                <DistributorToolbar
                    showInactive={showInactive}
                    onToggle={() => setShowInactive(!showInactive)}
                    onNew={() => {
                        setEditing(null);
                        setShowForm(true);
                    }}
                />

                <DistributorTable
                    data={data}
                    reload={loadData}
                    onEdit={(d) => {
                        setEditing(d);
                        setShowForm(true);
                    }}

                />
            </div>

            {showForm && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>
                            {editing
                                ? "Editar distribuidor"
                                : "Nuevo distribuidor"}
                        </h3>

                        <DistributorForm
                            initialValues={editing}
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
