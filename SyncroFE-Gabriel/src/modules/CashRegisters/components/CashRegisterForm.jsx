import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "../../../components/Button";
function CashRegisterForm({
    submitting,
    onSubmit,
    onCancel,
}) {

    //Formulario
    const [form, setForm] = useState(() => {
        return {
            cashRegisterOpeningAmount: null,
        };
    })

    //Guardar informacion
    const handleSubmit = async (e) => {
        e.preventDefault();

        //Condiciones

        const payload = {
            cashRegisterOpeningAmount: Number(form.cashRegisterOpeningAmount),
        }
        onSubmit(payload);
    };



    useEffect(() => {
    }, []);

    return createPortal(
        <div className="modal-backdrop">
            <div className="modal">

                <h3>
                    Nueva apertura de caja
                </h3>

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-group full-width">
                        <label>Monto de apertura</label>
                        <input
                            type="number"
                            min="10000"
                            value={form.cashRegisterOpeningAmount}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    cashRegisterOpeningAmount:
                                        e.target.value === null
                                            ? null
                                            : Number(e.target.value),
                                })
                            }
                            placeholder="Monto inicial."
                            required
                        />
                    </div>

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



export default CashRegisterForm;