import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    getCreditAccounts,
    filterCreditAccounts,
    updateCreditAccount,
    createCreditAccount,
    closeCreditAccount,
} from "../../../api/clientAccount.api";

import { PageCard, Toolbar, FilterBar, Button } from "../../../components";
import ClientAccountTable from "../components/ClientAccountTable";
import ClientAccountForm from "../components/ClientAccountForm";
import ClientAccountMovementHistory from "../components/ClientAccountMovementHistory";

export default function ClientAccountsPage() {
    const [clientAccounts, setClientAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusType, setStatusType] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [accountHistory, setAccountHistory] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingClientAccount, setEditingClientAccount] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        try {
            let response;
            if (search || statusType || (startDate && endDate)) {
                response = await filterCreditAccounts(startDate, endDate, search, statusType);
            } else {
                response = await getCreditAccounts();
            }
            setClientAccounts(response.data ?? []);
        } catch (err) {
            console.error("Error cargando cuentas de crédito", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [search, statusType, startDate, endDate]);

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            if (editingClientAccount) {
                await updateCreditAccount(editingClientAccount.clientAccountId, { ...values, clientAccountId: editingClientAccount.clientAccountId });
            } else {
                await createCreditAccount(values);
            }
            setShowForm(false);
            setEditingClientAccount(null);
            loadData();
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "¡Exito!",
                text: "Se ha guardado la cuenta de crédito",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            console.error("Error guardando cuenta de credito", err);
            Swal.fire({ icon: "error", title: "Error...", text: "Error guardando cuenta de crédito" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageCard>
            <Toolbar title="Cuentas de Crédito">
                <Button variant="primary" onClick={() => { setEditingClientAccount(null); setShowForm(true); }}>
                    + Nueva cuenta
                </Button>
            </Toolbar>

            <FilterBar>
                <input type="text" placeholder="Buscar cuenta..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <select value={statusType} onChange={(e) => setStatusType(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="active">Activa</option>
                    <option value="suspended">Suspendida</option>
                    <option value="closed">Cerrada</option>
                </select>
                <span className="filter-label">Desde:</span>
                <input type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value || null)} />
                <span className="filter-label">Hasta:</span>
                <input type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value || null)} />
            </FilterBar>

            {loading && <div className="loading">Cargando cuentas de crédito...</div>}

            {!loading && (
                <ClientAccountTable
                    clientAccounts={clientAccounts}
                    onEdit={(a) => { setEditingClientAccount(a); setShowForm(true); }}
                    onHistory={(a) => { setAccountHistory(a); setShowHistory(true); }}
                    onClose={async (id) => { await closeCreditAccount(Number(id)); loadData(); }}
                />
            )}

            {showForm && (
                <ClientAccountForm
                    initialValues={editingClientAccount}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingClientAccount(null); }}
                />
            )}

            {showHistory && (
                <ClientAccountMovementHistory
                    account={accountHistory}
                    onCancel={() => setShowHistory(false)}
                />
            )}
        </PageCard>
    );
}
