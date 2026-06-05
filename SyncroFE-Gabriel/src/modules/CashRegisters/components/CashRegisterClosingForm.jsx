import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getExpectedAmount } from "../../../api/cashRegisters";
import Swal from "sweetalert2";
import Button from "../../../components/Button";
function CashRegisterClosingForm({
    closingRegister,
    closing,
    onClose,
    onCancel,
}) {

    //Formulario
    const [form, setForm] = useState(() => {
        return {
            cashRegisterReportedAmount: closingRegister.cashRegisterReportedAmount ?? null,
            cashRegisterDifferenceReason: closingRegister.cashRegisterDifferenceReason ?? "",
            cashRegisterExpectedAmount: closingRegister.cashRegisterExpectedAmount ?? null,
        };
    })

    //Guardar informacion
    const handleClose = async (e) => {
        e.preventDefault();

        //Condiciones
        if (form.cashRegisterReportedAmount != form.cashRegisterExpectedAmount && form.cashRegisterDifferenceReason == "") {
            await Swal.fire({ icon: "warning", title: "Atención", text: "El monto fisico reportado es diferente al monto calculado por el sistema. Por favor justifique la discrepancia presente." });
            return;
        }

        const payload = {
            cashRegisterReportedAmount: Number(form.cashRegisterReportedAmount),
            cashRegisterExpectedAmount: Number(form.cashRegisterReportedAmount),
            cashRegisterDifferenceReason: form.cashRegisterDifferenceReason.trim(),
        }
        onClose(payload);
    };

    //Manejo de cambios
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };





    useEffect(() => {
        getExpectedAmount(closingRegister.cashRegisterId).then((res) => {
            setForm({
                ...form,
                cashRegisterExpectedAmount: res.data,
            });
        });
    }, []);

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal">

                <h3>
                    Cierre de caja - #{closingRegister.cashRegisterNumber}
                </h3>

                <form className="register-form" onSubmit={handleClose}>
                    <div className="form-group">
                        <label>Monto fisico a reporte</label>
                        <input
                            name="cashRegisterReportedAmount"
                            type="number"
                            min="0"
                            value={form.cashRegisterReportedAmount}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    cashRegisterReportedAmount:
                                        e.target.value === null
                                            ? null
                                            : Number(e.target.value),
                                })
                            }
                            placeholder="Monto inicial."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Monto calculado por el sistema</label>
                        <input
                            type="number"
                            value={form.cashRegisterExpectedAmount}
                            disabled
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Razon para discrepancia</label>
                        <textarea
                            name="cashRegisterDifferenceReason"
                            value={form.cashRegisterDifferenceReason}
                            onChange={handleChange}
                            disabled={form.cashRegisterReportedAmount == form.cashRegisterExpectedAmount}
                        />
                    </div>

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={onCancel}
                            disabled={closing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            disabled={closing}
                        >
                            {closing ? "Cerrando..." : "Cerrar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>,

        document.getElementById('modal-root')
    );
}



export default CashRegisterClosingForm;