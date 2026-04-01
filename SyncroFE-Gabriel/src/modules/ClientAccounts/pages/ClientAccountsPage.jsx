import "./ClientAccountsPage.css";
import { useEffect, useState } from "react";
import {
    getCreditAccounts,
    filterCreditAccounts,
    updateCreditAccount,
    createCreditAccount,
    closeCreditAccount,
} from "../../../api/clientAccount.api";

import ClientAccountTable from "../components/ClientAccountTable";
import ClientAccountToolbar from "../components/ClientAccountToolbar";
import ClientAccountFilters from "../components/ClientAccountFilters";
import ClientAccountForm from "../components/ClientAccountForm";
import ClientAccountMovementHistory from "../components/ClientAccountMovementHistory";
export default function ClientAccountsPage() {

    // Datos
    const [clientAccounts, setClientAccounts] = useState([]);

    // Interfaz
    const [loading, setLoading] = useState(false);

    // Filtros
    const [search, setSearch] = useState("");
    const [statusType, setStatusType] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Historial
    const [showHistory, setShowHistory] = useState(false);
    const [accountHistory, setAccountHistory] = useState(null);

    // CRUD cuentas de credito
    const [showForm, setShowForm] = useState(false);
    const [editingClientAccount, setEditingClientAccount] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    //Cargar datos de quotes
    const loadData = async () => {
        try {
            let response;
            if (search || statusType || (startDate && endDate)) {
                response = await filterCreditAccounts(startDate, endDate, search, statusType);
            }
            else {
                response = await getCreditAccounts();
            }
            setClientAccounts(response.data ?? []);
        } catch (err) {
            console.error("Error cargando cuentas de credito", err);
        } finally {
            setLoading(false);
        }
    };

    // Nueva cuenta
    const handleNewCreditAccount = () => {
        setEditingClientAccount(null);
        setShowForm(true);
    };

    // Editar cuenta
    const handleEdit = (clientAccount) => {
        setEditingClientAccount(clientAccount);
        setShowForm(true);
    };

    // Mostrar historial
    const handleHistory = (clientAccount) => {
        setAccountHistory(clientAccount);
        setShowHistory(true);
    };

    // Cerrar cuenta
    const handleAccountClosure = async (id) => {
        await closeCreditAccount(Number(id));
        loadData();
    };
    
    //Subir nueva cotizacion
    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);

            if (editingClientAccount) {
                await updateCreditAccount(editingClientAccount.clientAccountId, {
                    ...values,
                    clientAccountId: editingClientAccount.clientAccountId,
                });
            } else {
                await createCreditAccount(values);
            }

            setShowForm(false);
            setEditingClientAccount(null);

            const response = getCreditAccounts();

            setClientAccounts(response.data ?? []);
            loadData();
        } catch (err) {
            console.error("Error guardando cuenta de credito", err);
            alert("Error guardando cuenta de credito");
        } finally {
            setSubmitting(false);
        }
    };

    // Carga de cuentas
    useEffect(() => {
        loadData();
    }, [search, statusType,startDate,endDate]);

    return (
        <div className="caccount-page">
            <div className="caccount-card">

                <ClientAccountToolbar
                    onNewCreditAccount={handleNewCreditAccount}
                />
                
                <ClientAccountFilters
                    search={search}
                    statusType={statusType}
                    startDate={startDate}
                    endDate={endDate}
                    onSearchChange={setSearch}
                    onStatusTypeChange={setStatusType}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                />
                

                {/*Efecto de carga*/}
                {loading && (
                    <div className="loading">Cargando cuentas de credito...</div>
                )}

                {/*Tabla de registros*/}
                {!loading && (
                    <ClientAccountTable
                        clientAccounts={clientAccounts}
                        onEdit={handleEdit}
                        onHistory={handleHistory}
                        onClose={handleAccountClosure}
                    />
                )}

                {showForm && (
                            <ClientAccountForm
                                initialValues={editingClientAccount}
                                submitting={submitting}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingClientAccount(null);
                                }}
                            />
                )}

                {showHistory && (
                    <ClientAccountMovementHistory
                        account={accountHistory}
                        onCancel={() => {
                            setShowHistory(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
