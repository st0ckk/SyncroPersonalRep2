import "./CashRegistersPage.css";
import { useEffect, useState } from "react";
import {
    getRegisters,
    filterRegisters,
    closeRegister,
    createRegister,
    checkOpenRegisters,
} from "../../../api/cashRegisters";

import CashRegisterTable from "../components/CashRegisterTable";
import CashRegisterToolbar from "../components/CashRegisterToolbar";
import CashRegisterFilters from "../components/CashRegisterFilters";
import CashRegisterForm from "../components/CashRegisterForm";
import CashRegisterClosingForm from "../components/CashRegisterClosingForm";
import CashRegisterMovementHistory from "../components/CashRegisterMovementHistory";

import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';

export default function CashRegistersPage() {

    // Datos
    const [registers, setRegisters] = useState([]);

    // Interfaz
    const [loading, setLoading] = useState(false);

    // Filtros
    const [search, setSearch] = useState("");
    const [statusType, setStatusType] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Historial
    const [showHistory, setShowHistory] = useState(false);
    const [movementHistory, setMovementHistory] = useState(null);

    // CRUD cajas
    const [showForm, setShowForm] = useState(false);
    const [showClosingForm, setShowClosingForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [closing, setClosing] = useState(false);
    const [closingRegister, setClosingRegister] = useState(null);

    // Sweet alert
    const SwalAlert = withReactContent(Swal);


    //Cargar datos de cajas
    const loadData = async () => {
        try {
            let response;
            if (search || statusType || (startDate && endDate)) {
                response = await filterRegisters(startDate, endDate, search, statusType);
            }
            else {
                response = await getRegisters();
            }
            setRegisters(response.data ?? []);
        } catch (err) {
            console.error("Error cargando las cajas", err);
        } finally {
            setLoading(false);
        }
    };

    // Nueva cuenta
    const handleNewRegister = async () => {
        try {
            const openRegister = await checkOpenRegisters();
            openRegister.data == true
                ? Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Ya existe una caja abierta. Debe cerrarla para poder abrir una nueva"
                })
                : setShowForm(true);
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: String(err) });
        }
    };

    // Mostrar historial
    const handleHistory = (register) => {
        setMovementHistory(register);
        setShowHistory(true);
    };

    // Cerrar caja
    const handleRegisterClosure = async (register) => {
        setClosingRegister(register);
        setShowClosingForm(true);
    };

    //Subir nueva caja
    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            await createRegister(values);
            setShowForm(false);

            const response = getRegisters();

            setRegisters(response.data ?? []);
            loadData();
        } catch (err) {
            console.error("Error guardando caja", err);
            Swal.fire({ icon: "error", title: "Error", text: "Error guardando caja" });
        } finally {
            setSubmitting(false);
        }
    };

    //Cerrar la caja
    const handleClose = async (values) => {
        try {
            setClosing(true);
            await closeRegister(closingRegister.cashRegisterId, values);
            setShowClosingForm(false);

            const response = getRegisters();
            setClosingRegister(null);
            setRegisters(response.data ?? []);

            loadData();
        } catch (err) {
            console.error("Error cerrando de caja", err);
            Swal.fire({ icon: "error", title: "Error", text: "Error cerrando de caja" });
        } finally {
            setSubmitting(false);
        }
    };


    // Carga de cuentas
    useEffect(() => {
        loadData();
    }, [search, statusType, startDate, endDate]);

    return (
        <div className="register-page">
            <div className="register-card">

                {/*Toolbar*/}
                <CashRegisterToolbar
                    onNewRegister={handleNewRegister}
                />

                {/*Efecto de carga*/}
                <CashRegisterFilters
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
                    <div className="loading">Cargando registros de cajas...</div>
                )}


                {/*Tabla de registros*/}
                {!loading && (
                    <CashRegisterTable
                        registers={registers}
                        onHistory={handleHistory}
                        onClose={handleRegisterClosure}
                    />
                )}


                {/*Formulario de creacion*/}
                {showForm && (
                    <CashRegisterForm
                        submitting={submitting}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setShowForm(false);
                        }}
                    />
                )}

                {/*Formulario de cierre*/}
                {showClosingForm && (
                    <CashRegisterClosingForm
                        closingRegister={closingRegister}
                        closing={closing}
                        onClose={handleClose}
                        onCancel={() => {
                            setShowClosingForm(false);
                        }}
                    />
                )}


                {/*Formulario de historial*/}
                {showHistory && (
                    <CashRegisterMovementHistory
                        register={movementHistory}
                        onCancel={() => {
                            setShowHistory(false);
                        }}
                    />
                )}

            </div>
        </div>
    );
}