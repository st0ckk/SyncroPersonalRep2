import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    getRegisters,
    filterRegisters,
    closeRegister,
    createRegister,
    checkOpenRegisters,
} from "../../../api/cashRegisters";

import { PageCard, Toolbar, FilterBar, Button } from "../../../components";
import CashRegisterTable from "../components/CashRegisterTable";
import CashRegisterForm from "../components/CashRegisterForm";
import CashRegisterClosingForm from "../components/CashRegisterClosingForm";
import CashRegisterMovementHistory from "../components/CashRegisterMovementHistory";

export default function CashRegistersPage() {
    const [registers, setRegisters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusType, setStatusType] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [movementHistory, setMovementHistory] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showClosingForm, setShowClosingForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [closing, setClosing] = useState(false);
    const [closingRegister, setClosingRegister] = useState(null);

    const loadData = async () => {
        try {
            let response;
            if (search || statusType || (startDate && endDate)) {
                response = await filterRegisters(startDate, endDate, search, statusType);
            } else {
                response = await getRegisters();
            }
            setRegisters(response.data ?? []);
        } catch (err) {
            console.error("Error cargando las cajas", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [search, statusType, startDate, endDate]);

    const handleNewRegister = async () => {
        try {
            const openRegister = await checkOpenRegisters();
            openRegister.data === true
                ? Swal.fire({ icon: "error", title: "Error", text: "Ya existe una caja abierta. Debe cerrarla para poder abrir una nueva" })
                : setShowForm(true);
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: String(err) });
        }
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            await createRegister(values);
            setShowForm(false);
            loadData();
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "�Exito!",
                text: "Se ha guardado la caja",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            console.error("Error guardando caja", err);
            Swal.fire({ icon: "error", title: "Error...", text: "Error guardando caja" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = async (values) => {
        try {
            setClosing(true);
            await closeRegister(closingRegister.cashRegisterId, values);
            setShowClosingForm(false);
            setClosingRegister(null);
            loadData();
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "�Exito!",
                text: "Se ha hecho el cierre de la caja",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            console.error("Error cerrando de caja", err);
            Swal.fire({ icon: "error", title: "Error...", text: "Error cerrando de caja" });
        } finally {
            setClosing(false);
        }
    };

    return (
        <PageCard>
            <Toolbar title="Cajas">
                <Button variant="primary" onClick={handleNewRegister}>+ Nueva caja</Button>
            </Toolbar>

            <FilterBar>
                <input type="text" placeholder="Buscar caja..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <select value={statusType} onChange={(e) => setStatusType(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="open">Abierta</option>
                    <option value="closed">Cerrada</option>
                </select>
                <span className="filter-label">Desde:</span>
                <input type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value || null)} />
                <span className="filter-label">Hasta:</span>
                <input type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value || null)} />
            </FilterBar>

            {loading && <div className="loading">Cargando registros de cajas...</div>}

            {!loading && (
                <CashRegisterTable
                    registers={registers}
                    onHistory={(r) => { setMovementHistory(r); setShowHistory(true); }}
                    onClose={(r) => { setClosingRegister(r); setShowClosingForm(true); }}
                />
            )}

            {showForm && (
                <CashRegisterForm
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {showClosingForm && (
                <CashRegisterClosingForm
                    closingRegister={closingRegister}
                    closing={closing}
                    onClose={handleClose}
                    onCancel={() => setShowClosingForm(false)}
                />
            )}

            {showHistory && (
                <CashRegisterMovementHistory
                    register={movementHistory}
                    onCancel={() => setShowHistory(false)}
                />
            )}
        </PageCard>
    );
}
