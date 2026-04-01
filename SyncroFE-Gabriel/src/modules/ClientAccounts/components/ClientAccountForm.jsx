import { useEffect, useState } from "react";
import { getClientLookup } from "../../../api/clients.api";
import { getActiveCreditAccounts } from "../../../api/clientAccount.api";
import { createPortal } from "react-dom";

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
            alert("Debe seleccionar a un cliente válido");
            return;
        }

        if (!client) {
            alert("El cliente seleccionado no existe o no esta activado. Intente con otro cliente");
            return;
        }

        if (existingAccounts.length > 0 && !initialValues) {
            alert("Ya existe una cuenta de credito para este cliente. Por favor seleccione otro cliente.");
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
        getClientLookup().then((res) => {
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
                        : "Nueva cuenta de credito"}
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
                        <label>Limite de credito</label>
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
                            placeholder="Limite."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Tasa de interes</label>
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
                            placeholder="Defina condiciones para la creacion de la cuenta"
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
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,

        document.getElementById('modal-root')
    );
}



export default ClientAccountForm;