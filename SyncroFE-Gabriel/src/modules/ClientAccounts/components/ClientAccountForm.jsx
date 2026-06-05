import { useEffect, useState } from "react";
import Button from "../../../components/Button";
import { getAllClients } from "../../../api/clients.api";
import { getActiveCreditAccounts } from "../../../api/clientAccount.api";
import { createPortal } from "react-dom";

import Swal from 'sweetalert2';

const emptyAccount = {
    clientId: null,
    clientAccountCreditLimit: "",
    clientAccountInterestRate: null,
    clientAccountStatus: "",
    clientAccountConditions: "",
};

function ClientAccountForm({
    initialValues,
    submitting,
    onSubmit,
    onCancel,
}) {
    //Datos
    const [clients, setClients] = useState([]);
    const [creditAccounts, setCreditAccounts] = useState([]);

    //Formulario
    const [form, setForm] = useState(() => {
        if (!initialValues) return emptyAccount;
        return {
            clientId: initialValues.clientId ?? "",
            clientAccountCreditLimit: initialValues.clientAccountCreditLimit ?? null,
            clientAccountInterestRate: initialValues.clientAccountInterestRate ?? null,
            clientAccountStatus: initialValues.clientAccountStatus ?? "",
            clientAccountConditions: initialValues.clientAccountConditions ?? "",
        };
    })

    //Formateo para moneda
    const formatCurrency = (amount) => {
        var fixedAmount = parseFloat(amount);
        return `₡ ${fixedAmount.toFixed(2)}`;
    }

    //Manejo de cambios
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    //Guardar informacion
    const handleSubmit = async (e) => {
        e.preventDefault();

        var client = clients.find(c => c.clientId === form.clientId);
        var existingAccounts = creditAccounts.filter(ca => ca.clientId === form.clientId)

        console.log(existingAccounts);

        //Condiciones
        if (!form.clientId || Number.isNaN(form.clientId)) {
            Swal.fire({
                icon: "warning",
                title: "Advertencia...",
                text: "Debe seleccionar a un cliente válido"
            });
            return;
        }

        if (!client) {
            await Swal.fire({ icon: "warning", title: "Advertencia", text: "El cliente seleccionado no existe" });
            return;
        }

        if (!client.isActive) {
            await Swal.fire({ icon: "warning", title: "Advertencia", text: "El cliente seleccionado se encuentra actualmente deshabilitado" });
            return;
        }

        if (existingAccounts.length > 0 && !initialValues) {
            Swal.fire({
                icon: "warning",
                title: "Advertencia...",
                text: "Ya existe una cuenta de credito para este cliente. Por favor seleccione otro cliente."
            });
            return;
        }

        const payload = {
            clientId: form.clientId.trim(),
            clientAccountCreditLimit: Number(form.clientAccountCreditLimit),
            clientAccountInterestRate: Number(form.clientAccountInterestRate),
            clientAccountStatus: form.clientAccountStatus.trim(),
            clientAccountConditions: form.clientAccountConditions ? form.clientAccountConditions.trim() : "Sin codiciones aplicables.",
        }
        onSubmit(payload);
    };



    useEffect(() => {
        getAllClients().then((res) => {
            setClients(res.data ?? []);
        });

        getActiveCreditAccounts().then((res) => {
            setCreditAccounts(res.data ?? []);
        });
    }, []);

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal">

                <h3>
                    {initialValues
                        ? `Cuenta #${initialValues.clientAccountNumber}`
                        : "Nueva cuenta de crédito"}
                </h3>

                <form className="caccount-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Cliente</label>
                        <input
                            type="text"
                            name="clientId"
                            value={form.clientId}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    clientId:
                                        e.target.value === ""
                                            ? ""
                                            : e.target.value,
                                })
                                
                            }
                            required
                            list="caccount-client-list"
                            disabled={initialValues !== null}
                        />

                        <datalist id="caccount-client-list">
                            {[...clients]
                                .sort((a, b) => a.clientName.localeCompare(b.clientName))
                                .map((c) => (
                                    <option key={c.clientId} value={c.clientId}>
                                        {c.clientName}
                                    </option>
                                ))}
                        </datalist>
                    </div>

                    <div className="form-group">
                        <label>Límite de crédito</label>
                        <input
                            type="number"
                            min="1000"
                            value={form.clientAccountCreditLimit}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    clientAccountCreditLimit:
                                        e.target.value === null
                                            ? null
                                            : Number(e.target.value),
                                })
                            }
                            placeholder="Límite."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Tasa de interés</label>
                        <input
                            type="number"
                            min="1"
                            max="90"
                            value={form.clientAccountInterestRate}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    clientAccountInterestRate:
                                        e.target.value === null
                                            ? null
                                            : Number(e.target.value),
                                })
                            }
                            placeholder="Porcentaje."
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Condiciones</label>
                        <textarea
                            placeholder="Defina las condiciones para la creación de la cuenta."
                            name="clientAccountConditions"
                            onChange={handleChange}
                            value={form.clientAccountConditions}
                        >
                        </textarea>
                    </div>

                    {initialValues && (
                        <div className="form-group full-width">
                            <label>Estado de cuenta</label>
                            <select
                                value={form.clientAccountStatus}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        clientAccountStatus:
                                            e.target.value === ""
                                                ? ""
                                                : e.target.value,
                                    })
                                }
                                required
                                disabled={form.clientAccountStatus == "closed"}
                            >
                                <option value="active">Activa</option>
                                <option value="suspended">Suspendida</option>
                            </select>
                        </div>
                    )}

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            disabled={submitting}
                        >
                            {submitting ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,

        document.getElementById('modal-root')
    );
}



export default ClientAccountForm;