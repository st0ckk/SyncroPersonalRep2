import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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



export default CashRegisterForm;